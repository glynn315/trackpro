import type { NextConfig } from "next";

/**
 * Server Actions verify that a request's Origin matches the Host, which fails
 * when the app is served through a proxy or a custom domain that forwards a
 * different host — the admin mutations (products, orders, expenses,
 * subscriptions) then error out. List those extra hostnames in
 * `SERVER_ACTIONS_ALLOWED_ORIGINS` (comma-separated, host only, no scheme), e.g.
 *
 *   SERVER_ACTIONS_ALLOWED_ORIGINS="trackprogps.com,www.trackprogps.com"
 *
 * Sign-in itself doesn't need this — it goes through /api/admin/session.
 */
const allowedOrigins = (process.env.SERVER_ACTIONS_ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  /* Admin now lives in this app at /admin — no external redirect needed. */
  ...(allowedOrigins.length > 0
    ? { experimental: { serverActions: { allowedOrigins } } }
    : {}),
};

export default nextConfig;
