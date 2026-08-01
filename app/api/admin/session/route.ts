import { NextResponse } from "next/server";
import { adminApi, BASE } from "@/lib/admin/api";
import { clearAdminToken, setAdminToken } from "@/lib/admin/session";

/**
 * Admin sign-in / sign-out.
 *
 * This is a Route Handler rather than a Server Action on purpose. Server Actions
 * compare the request Origin against the Host and reject the call when they
 * disagree — which is exactly what happens behind a proxy or a custom domain
 * that forwards a different host (the classic "login does nothing in
 * production"). A plain POST has no such check, so sign-in keeps working
 * wherever the app is deployed.
 *
 * The Laravel token still never reaches the browser: it goes straight into the
 * httpOnly `tp_admin_token` cookie.
 */

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let email = "";
  let password = "";

  try {
    const body = await request.json();
    email = String(body?.email ?? "").trim();
    password = String(body?.password ?? "");
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 422 });
  }

  const res = await adminApi("/api/admin/login", { method: "POST", json: { email, password } });

  if (res.status === 503) {
    // adminApi synthesizes 503 when the backend can't be reached at all — pass
    // the detail through so the reason is visible in production, not guessed.
    const detail = await res.json().catch(() => null);
    return NextResponse.json(
      { error: detail?.message ?? "Cannot reach the backend API." },
      { status: 503 }
    );
  }

  if (res.status === 401 || res.status === 422) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  // The login route is rate-limited (throttle:10,1). Repeated attempts hit this,
  // and it clears itself after a minute — say so instead of "sign in failed".
  if (res.status === 429) {
    const retryAfter = res.headers.get("retry-after");
    return NextResponse.json(
      {
        error: `Too many sign-in attempts. Wait ${
          retryAfter ? `${retryAfter} seconds` : "a minute"
        } and try again.`,
      },
      { status: 429 }
    );
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    // A JSON-expecting call that returns HTML almost always means the API base
    // URL points at something that isn't the Laravel app — most often the
    // frontend's own domain, or one with `/api` already on the end.
    const looksLikeHtml = text.trim().startsWith("<");
    return NextResponse.json(
      {
        error: looksLikeHtml
          ? `The backend returned an HTML page (HTTP ${res.status}) instead of JSON. API_URL is resolving to ${BASE}, which isn't the Laravel app — open /api/health for details.`
          : `Sign in failed: the backend at ${BASE} answered HTTP ${res.status}. ${text.slice(0, 200)}`.trim(),
      },
      { status: 502 }
    );
  }

  const token = await res
    .json()
    .then((body) => body?.token as string | undefined)
    .catch(() => undefined);

  if (!token) {
    return NextResponse.json(
      {
        error: `The backend at ${BASE} returned 200 but no token — check that it is the Laravel API and not a cache/proxy page. Open /api/health for details.`,
      },
      { status: 502 }
    );
  }

  await setAdminToken(token);

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  // Best-effort revocation on the API; the cookie always goes.
  try {
    await adminApi("/api/admin/logout", { method: "POST" });
  } catch {
    /* ignore */
  }
  await clearAdminToken();

  return NextResponse.json({ ok: true });
}
