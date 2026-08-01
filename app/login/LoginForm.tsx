"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { AuthField, FormError, Spinner } from "@/components/auth/AuthShell";

export function LoginForm({ next: nextRaw = "/account" }: { next?: string }) {
  const { signIn, user, hydrated } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Only same-site paths — an open `next` would be a redirect gadget.
  const next = nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/account";

  // Already signed in (or just finished signing in) — go straight through.
  useEffect(() => {
    if (hydrated && user) router.replace(next);
  }, [hydrated, user, next, router]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const data = new FormData(e.currentTarget);

    try {
      await signIn({
        email: String(data.get("email") ?? "").trim(),
        password: String(data.get("password") ?? ""),
      });
      router.replace(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Incorrect email or password.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate={false}>
      <div className="space-y-4">
        <AuthField
          label="Email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@email.com"
        />
        <div>
          <AuthField
            label="Password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
          <p className="mt-1.5 text-right">
            <Link href="/forgot-password" className="text-xs font-semibold text-brand hover:text-brand-dark">
              Forgot your password?
            </Link>
          </p>
        </div>
      </div>

      {error && <FormError message={error} />}

      <Button type="submit" variant="primary" size="lg" className="mt-6 w-full" disabled={submitting}>
        {submitting ? (
          <>
            <Spinner /> Signing in…
          </>
        ) : (
          <>
            Sign In <Icon name="arrow" className="h-4 w-4" />
          </>
        )}
      </Button>

      <p className="mt-5 text-center text-xs text-muted">
        New to TrackPro?{" "}
        <Link href="/register" className="font-semibold text-brand hover:text-brand-dark">
          Create an account
        </Link>
      </p>
    </form>
  );
}
