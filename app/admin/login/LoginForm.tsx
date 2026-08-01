"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";

export function LoginForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  /**
   * Posts to our own Route Handler (`/api/admin/session`), which talks to
   * Laravel server-side and stores the token in an httpOnly cookie. Deliberately
   * not a Server Action — those reject requests whose Origin and Host disagree,
   * which silently breaks sign-in behind a proxy or custom domain in production.
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    const data = new FormData(event.currentTarget);

    try {
      const res = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(data.get("email") ?? "").trim(),
          password: String(data.get("password") ?? ""),
        }),
      });

      if (res.ok) {
        // The cookie is set — re-render the server components with it.
        router.replace("/admin");
        router.refresh();
        return;
      }

      const body = await res.json().catch(() => null);
      setError(body?.error ?? `Sign in failed (HTTP ${res.status}).`);
    } catch (err) {
      setError(
        err instanceof Error
          ? `Could not reach this site's API route: ${err.message}`
          : "Could not reach this site's API route."
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ink via-[#1a1a1a] to-ink p-4">
      <div className="mx-auto flex min-h-screen max-w-md items-center">
        <div className="w-full overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="bg-ink p-7 text-white">
            <div className="flex items-center gap-2">
              <Logo variant="light" priority />
              <span className="text-lg font-semibold tracking-tight text-white/90">Admin</span>
            </div>
            <p className="mt-4 text-sm text-white/70">
              Sign in to manage orders, inventory, subscriptions, and payments.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 p-7">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-900">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="username"
                className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-900">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                <p>{error}</p>
                <p className="mt-2 text-xs text-red-700">
                  Diagnosing a deployment?{" "}
                  <a
                    href="/api/health"
                    className="font-semibold underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open /api/health
                  </a>{" "}
                  to see which backend URL this site resolved.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-dark disabled:opacity-60"
            >
              {pending ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
