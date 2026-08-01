"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { AuthField, FormError, FormNotice, Spinner } from "@/components/auth/AuthShell";

export function ForgotPasswordForm() {
  const { requestPasswordReset } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();

    try {
      setSent(await requestPasswordReset(email));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the reset link.");
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div>
        <FormNotice message={sent} />
        <p className="mt-4 text-sm text-muted">
          Check your inbox (and spam folder) for a message from TrackPro. The link is valid for
          60 minutes.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Link
            href="/login"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Back to sign in <Icon name="arrow" className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => setSent("")}
            className="text-xs font-semibold text-muted hover:text-brand"
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <p className="mb-4 text-sm text-muted">
        Enter the email on your TrackPro account and we&apos;ll send you a link to set a new
        password.
      </p>

      <AuthField
        label="Email"
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="you@email.com"
      />

      {error && <FormError message={error} />}

      <Button type="submit" variant="primary" size="lg" className="mt-6 w-full" disabled={submitting}>
        {submitting ? (
          <>
            <Spinner /> Sending link…
          </>
        ) : (
          <>
            Send Reset Link <Icon name="arrow" className="h-4 w-4" />
          </>
        )}
      </Button>

      <p className="mt-5 text-center text-xs text-muted">
        Remembered it?{" "}
        <Link href="/login" className="font-semibold text-brand hover:text-brand-dark">
          Sign in
        </Link>
      </p>
    </form>
  );
}
