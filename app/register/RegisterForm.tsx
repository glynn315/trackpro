"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { AuthField, FormError, Spinner } from "@/components/auth/AuthShell";

export function RegisterForm() {
  const { signUp, user, hydrated } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (hydrated && user) router.replace("/account");
  }, [hydrated, user, router]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const data = new FormData(e.currentTarget);

    try {
      await signUp({
        name: String(data.get("name") ?? "").trim(),
        email: String(data.get("email") ?? "").trim(),
        phone: String(data.get("phone") ?? "").trim(),
        password: String(data.get("password") ?? ""),
      });
      router.replace("/account");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create your account.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <AuthField label="Full name" name="name" required autoComplete="name" />
        <AuthField
          label="Contact number"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="09XX XXX XXXX"
        />
        <AuthField
          label="Email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@email.com"
        />
        <AuthField
          label="Password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          minLength={6}
          hint="At least 6 characters"
        />
      </div>

      {error && <FormError message={error} />}

      <Button type="submit" variant="primary" size="lg" className="mt-6 w-full" disabled={submitting}>
        {submitting ? (
          <>
            <Spinner /> Creating account…
          </>
        ) : (
          <>
            Create Account <Icon name="arrow" className="h-4 w-4" />
          </>
        )}
      </Button>

      <p className="mt-4 text-center text-[11px] leading-relaxed text-subtle">
        We&apos;ll email you a verification link — confirm it before placing an order.
      </p>

      <p className="mt-4 text-center text-xs text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand hover:text-brand-dark">
          Sign in
        </Link>
      </p>
    </form>
  );
}
