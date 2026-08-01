import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";

/**
 * Page frame shared by the customer sign-in / sign-up / password screens:
 * storefront header and footer around a single centred card.
 */
export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex flex-1 items-center bg-cloud bg-dots py-24 sm:py-28">
        <Container className="max-w-md">
          <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_24px_60px_-28px_rgba(0,0,0,0.28)]">
            <div className="relative overflow-hidden bg-linear-to-br from-ink via-[#141414] to-ink p-6 text-white sm:p-7">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full opacity-50 blur-3xl"
                style={{
                  background: "radial-gradient(circle, rgba(237,28,36,0.45) 0%, transparent 70%)",
                }}
              />
              <p className="relative text-[10px] font-bold uppercase tracking-widest text-brand-light">
                {eyebrow ?? "TrackPro Account"}
              </p>
              <h1 className="relative mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
                {title}
              </h1>
              {subtitle && <p className="relative mt-1.5 text-sm text-white/70">{subtitle}</p>}
            </div>

            <div className="p-6 sm:p-7">{children}</div>
          </div>

          {footer && <div className="mt-5 text-center text-sm text-muted">{footer}</div>}

          <p className="mt-6 text-center text-xs text-subtle">
            <Link href="/" className="font-semibold text-muted hover:text-brand">
              ← Back to trackprogps.com
            </Link>
          </p>
        </Container>
      </main>
      <Footer />
    </>
  );
}

/** Labelled input used across the auth forms. */
export function AuthField({
  label,
  name,
  type = "text",
  required,
  autoComplete,
  placeholder,
  hint,
  defaultValue,
  readOnly,
  minLength,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
  hint?: string;
  defaultValue?: string;
  readOnly?: boolean;
  minLength?: number;
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
        defaultValue={defaultValue}
        readOnly={readOnly}
        minLength={minLength}
        className={`w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 ${
          readOnly ? "bg-soft text-muted" : ""
        }`}
      />
      {hint && <p className="mt-1 text-[11px] text-muted">{hint}</p>}
    </div>
  );
}

export function FormError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
    >
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-red-500 text-xs font-bold text-white">
        !
      </span>
      <p>{message}</p>
    </div>
  );
}

export function FormNotice({ message }: { message: string }) {
  return (
    <div
      role="status"
      className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"
    >
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-600 text-xs font-bold text-white">
        ✓
      </span>
      <p>{message}</p>
    </div>
  );
}

export function Spinner() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 animate-spin" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
