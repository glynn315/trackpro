/**
 * Base URL of the Laravel API (`trackpro-api`), normalized without a trailing
 * slash so callers can safely append `/api/...`.
 *
 * Resolution order:
 *   1. `NEXT_PUBLIC_API_URL` — set per environment (Vercel, `.env.local`)
 *   2. `DEFAULT_API_BASE` — the live production API
 *
 * Defaulting to production rather than an empty string means a deployment that
 * is missing its env vars (a Vercel preview, say) still talks to a real backend
 * instead of silently degrading. Point `NEXT_PUBLIC_API_URL` at
 * `http://127.0.0.1:8000` in `.env.local` when you want a local Laravel.
 *
 * Note this is read at BUILD time — it's inlined into the client bundle — so
 * changing the env var on the host requires a redeploy.
 */
export const DEFAULT_API_BASE = "https://api.trackprotracking.com";

/** Browser- and server-safe API base. Never empty. */
export const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_BASE
).replace(/\/$/, "");
