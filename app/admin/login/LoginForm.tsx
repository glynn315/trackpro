"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/admin/actions";
import { Logo } from "@/components/ui/Logo";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, { error: "" });

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
              Sign in to manage orders, inventory, and payments.
            </p>
          </div>

          <form action={action} className="space-y-4 p-7">
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

            {state.error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                {state.error}
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
