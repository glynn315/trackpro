"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { AuthField, FormError, Spinner } from "@/components/auth/AuthShell";

/** `token` and `email` come from the emailed link, read server-side by the page. */
export function ResetPasswordForm({ token, email }: { token: string; email: string }) {
  const { resetPassword } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!token || !email) {
    return (
      <div>
        <FormError message="This reset link is incomplete or has expired. Request a new one." />
        <Link
          href="/forgot-password"
          className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Request a new link <Icon name="arrow" className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const password = String(data.get("password") ?? "");
    const confirmation = String(data.get("password_confirmation") ?? "");

    if (password !== confirmation) {
      setError("The two passwords don't match.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await resetPassword({ token, email, password, passwordConfirmation: confirmation });
      // The API returns a fresh token, so we land in the account area signed in.
      router.replace("/account?reset=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset your password.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <AuthField label="Email" name="email" type="email" defaultValue={email} readOnly />
        <AuthField
          label="New password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          minLength={6}
          hint="At least 6 characters"
        />
        <AuthField
          label="Confirm new password"
          name="password_confirmation"
          type="password"
          required
          autoComplete="new-password"
          minLength={6}
        />
      </div>

      {error && <FormError message={error} />}

      <Button type="submit" variant="primary" size="lg" className="mt-6 w-full" disabled={submitting}>
        {submitting ? (
          <>
            <Spinner /> Saving…
          </>
        ) : (
          <>
            Set New Password <Icon name="arrow" className="h-4 w-4" />
          </>
        )}
      </Button>

      <p className="mt-4 text-center text-[11px] text-subtle">
        Resetting your password signs out every other device.
      </p>
    </form>
  );
}
