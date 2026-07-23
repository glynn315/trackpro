import "server-only";
import { redirect } from "next/navigation";
import { getAdminToken } from "./session";

const BASE = (
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:8000"
).replace(/\/$/, "");

type ApiInit = Omit<RequestInit, "body"> & { json?: unknown };

const UNREACHABLE =
  `Cannot reach the backend API at ${BASE}. Make sure the Laravel server is running ` +
  `(cd trackpro-api && php artisan serve).`;

/** Server-side fetch to the Laravel admin API with the admin Bearer token attached. */
export async function adminApi(path: string, init: ApiInit = {}): Promise<Response> {
  const token = await getAdminToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  let body: BodyInit | undefined;
  if (init.json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(init.json);
  }

  try {
    return await fetch(`${BASE}${path}`, { ...init, headers, body, cache: "no-store" });
  } catch {
    // Backend down / unreachable — synthesize a 503 so callers handle it
    // uniformly instead of an unhandled "fetch failed" 500.
    return new Response(JSON.stringify({ message: UNREACHABLE }), {
      status: 503,
      headers: { "content-type": "application/json" },
    });
  }
}

/** GET helper for admin pages — redirects to login on auth failure, throws a clear error if unreachable. */
export async function adminGet<T>(path: string): Promise<T> {
  const res = await adminApi(path);
  if (res.status === 401 || res.status === 403) redirect("/admin/login");
  if (res.status === 503) throw new Error(UNREACHABLE);
  if (!res.ok) throw new Error(`Admin API ${path} failed (${res.status})`);
  return res.json() as Promise<T>;
}

export { UNREACHABLE };
