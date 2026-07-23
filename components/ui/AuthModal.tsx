"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

type Mode = "signin" | "signup";

export function AuthModal({
  onClose,
  onSuccess,
  reason,
  initialMode = "signin",
}: {
  onClose: () => void;
  onSuccess: () => void;
  reason?: string;
  initialMode?: Mode;
}) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose, submitting]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const formData = new FormData(e.currentTarget);

    try {
      if (mode === "signup") {
        await signUp({
          name: String(formData.get("name") ?? ""),
          email: String(formData.get("email") ?? ""),
          phone: String(formData.get("phone") ?? ""),
          password: String(formData.get("password") ?? ""),
        });
      } else {
        await signIn({
          email: String(formData.get("email") ?? ""),
          password: String(formData.get("password") ?? ""),
        });
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={mode === "signin" ? "Sign in" : "Create account"}
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
      className="animate-fade-in fixed inset-0 z-110 flex items-center justify-center overflow-y-auto bg-ink/70 p-4 backdrop-blur-sm sm:p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-fade-up relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-[0_28px_80px_-20px_rgba(0,0,0,0.4)]"
      >
        {/* Header */}
        <div className="relative border-b border-line bg-linear-to-br from-ink via-[#141414] to-ink p-6 text-white sm:p-7">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full opacity-50 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(237,28,36,0.45) 0%, transparent 70%)",
            }}
          />
          <p className="relative text-[10px] font-bold uppercase tracking-widest text-brand-light">
            {reason ?? "TrackPro Account"}
          </p>
          <h3 className="relative mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h3>
          <p className="relative mt-1 text-sm text-white/70">
            {mode === "signin"
              ? "Sign in to continue with your purchase."
              : "We need a few details before we can process your order."}
          </p>
          <button
            type="button"
            aria-label="Close"
            onClick={() => !submitting && onClose()}
            disabled={submitting}
            className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M6 18L18 6" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-line bg-cloud">
          <TabButton
            active={mode === "signin"}
            onClick={() => {
              setMode("signin");
              setError("");
            }}
          >
            Sign In
          </TabButton>
          <TabButton
            active={mode === "signup"}
            onClick={() => {
              setMode("signup");
              setError("");
            }}
          >
            Sign Up
          </TabButton>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7" key={mode}>
          <div className="space-y-4">
            {mode === "signup" && (
              <>
                <Field label="Full name" name="name" type="text" required autoComplete="name" />
                <Field
                  label="Contact number"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="09XX XXX XXXX"
                />
              </>
            )}
            <Field
              label="Email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@email.com"
            />
            <Field
              label="Password"
              name="password"
              type="password"
              required
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              hint={mode === "signup" ? "At least 6 characters" : undefined}
            />
          </div>

          {error && (
            <div
              role="alert"
              className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
            >
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-red-500 text-xs font-bold text-white">
                !
              </span>
              <p>{error}</p>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="mt-6 w-full"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Spinner /> {mode === "signin" ? "Signing in…" : "Creating account…"}
              </>
            ) : (
              <>
                {mode === "signin" ? "Sign In" : "Create Account"}{" "}
                <Icon name="arrow" className="h-4 w-4" />
              </>
            )}
          </Button>

          <p className="mt-4 text-center text-xs text-muted">
            {mode === "signin" ? (
              <>
                New to TrackPro?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setError("");
                  }}
                  className="font-semibold text-brand hover:text-brand-dark"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setError("");
                  }}
                  className="font-semibold text-brand hover:text-brand-dark"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </form>
      </div>
    </div>,
    document.body
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
        active ? "text-brand" : "text-muted hover:text-ink"
      }`}
    >
      {children}
      <span
        aria-hidden
        className={`absolute inset-x-4 bottom-0 h-0.5 bg-brand transition-all ${
          active ? "opacity-100" : "opacity-0"
        }`}
      />
    </button>
  );
}

function Field({
  label,
  name,
  type,
  required,
  autoComplete,
  placeholder,
  hint,
}: {
  label: string;
  name: string;
  type: string;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
        {required && <span className="ml-0.5 text-brand">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        minLength={name === "password" ? 6 : undefined}
        className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
      />
      {hint && <p className="mt-1 text-[11px] text-muted">{hint}</p>}
    </div>
  );
}

function Spinner() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 animate-spin" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
