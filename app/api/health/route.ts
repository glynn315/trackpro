import { NextResponse } from "next/server";
import { DEFAULT_API_BASE } from "@/lib/api-base";

/**
 * Deployment diagnostics: what backend URL this deployment actually resolved,
 * and whether it can reach it. Open `/api/health` on the live site when
 * something "doesn't fetch from the backend" — it answers, in one request,
 * whether the env vars are right and whether the API is reachable from the
 * server side.
 *
 * No secrets are returned: only which variables are *set*, never their values.
 */

export const dynamic = "force-dynamic";

// Mirrors the normalisation in lib/admin/api.ts.
const normalize = (url: string) => url.replace(/\/+$/, "").replace(/\/api$/, "");

const rawServerBase = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_BASE;
const serverBase = normalize(rawServerBase);
const browserBase = normalize(process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_BASE);

export async function GET() {
  const started = Date.now();
  let reachable = false;
  let status: number | null = null;
  let contentType: string | null = null;
  let error: string | null = null;
  let productCount: number | null = null;

  try {
    // A public, cheap, always-present endpoint.
    const res = await fetch(`${serverBase}/api/products`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    status = res.status;
    contentType = res.headers.get("content-type");
    reachable = res.ok;

    if (res.ok && contentType?.includes("json")) {
      const body = await res.json().catch(() => null);
      const list = Array.isArray(body) ? body : body?.data;
      if (Array.isArray(list)) productCount = list.length;
    }
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }

  // Probe the admin login route itself — reaching /api/products doesn't prove
  // this path works (a proxy or bot filter can treat POSTs differently). Empty
  // credentials are expected to come back 422 from Laravel's validator; anything
  // else is the reason admin sign-in fails.
  let adminLogin: { status: number | null; content_type: string | null; verdict: string } = {
    status: null,
    content_type: null,
    verdict: "not checked",
  };

  try {
    const res = await fetch(`${serverBase}/api/admin/login`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ email: "", password: "" }),
      cache: "no-store",
    });
    const type = res.headers.get("content-type");
    adminLogin = {
      status: res.status,
      content_type: type,
      verdict:
        res.status === 422
          ? "OK — Laravel's validator answered, so admin sign-in can reach the API"
          : res.status === 429
            ? "Rate-limited (throttle:10,1). Wait a minute — this clears itself."
            : type?.includes("html")
              ? "WRONG TARGET — an HTML page came back, so this base URL is not the Laravel API"
              : `Unexpected HTTP ${res.status} — admin sign-in will fail with this base URL`,
    };
  } catch (err) {
    adminLogin.verdict = `Unreachable: ${err instanceof Error ? err.message : String(err)}`;
  }

  return NextResponse.json(
    {
      ok: reachable && adminLogin.status === 422,
      checked_at: new Date().toISOString(),
      latency_ms: Date.now() - started,
      admin_login: adminLogin,
      api: {
        // The URL server components and the admin UI use.
        server_side_base: serverBase,
        // The URL the browser bundle uses (storefront, customer account).
        browser_base: browserBase,
        reachable,
        status,
        content_type: contentType,
        product_count: productCount,
        error,
      },
      env: {
        API_URL_set: Boolean(process.env.API_URL),
        NEXT_PUBLIC_API_URL_set: Boolean(process.env.NEXT_PUBLIC_API_URL),
        using_fallback: serverBase === DEFAULT_API_BASE && !process.env.API_URL,
        // Set but needed normalising — i.e. it had a trailing slash or `/api`.
        server_base_was_normalized: rawServerBase.replace(/\/+$/, "") !== serverBase,
        server_and_browser_base_match: serverBase === browserBase,
        node_env: process.env.NODE_ENV,
        vercel_env: process.env.VERCEL_ENV ?? null,
      },
      hint: !reachable
        ? "Backend NOT reachable from the server. Check API_URL on the host (it must be the public https URL of the Laravel app, with no /api on the end) and redeploy."
        : adminLogin.status !== 422
          ? "Products load but POST /api/admin/login does not behave like Laravel — see admin_login.verdict above. That is why admin sign-in fails."
          : "Backend reachable and admin sign-in path healthy. If the browser still fails, it is CORS: add this site's origin to FRONTEND_URL in trackpro-api/.env, then run php artisan config:cache.",
    },
    { status: reachable && adminLogin.status === 422 ? 200 : 503 }
  );
}
