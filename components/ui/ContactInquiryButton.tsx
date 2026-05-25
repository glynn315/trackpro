"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { ButtonLink, Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { siteConfig } from "@/lib/site";

const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? "";

type Status = "idle" | "submitting" | "success" | "error";

export function ContactInquiryButton({
  label = "Send us a Message",
}: {
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setStatus("idle");
      setErrorMessage("");
    }
  }, [open]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const form = e.currentTarget;
    const data = new FormData(form);

    if (!WEB3FORMS_KEY) {
      const subject = encodeURIComponent("New inquiry from TrackPro website");
      const body = encodeURIComponent(
        [...data.entries()]
          .filter(([k]) => !k.startsWith("_") && k !== "access_key" && k !== "botcheck")
          .map(([k, v]) => `${k}: ${v}`)
          .join("\n")
      );
      window.location.href = `mailto:${siteConfig.contact.email}?subject=${subject}&body=${body}`;
      setStatus("idle");
      return;
    }

    data.append("access_key", WEB3FORMS_KEY);
    data.append("subject", "New inquiry from TrackPro website");
    data.append("from_name", "TrackPro Website");

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: data,
      });
      const json = await res.json();
      if (json.success) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
        setErrorMessage(json.message || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please try Messenger or call us instead.");
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="primary"
        size="lg"
        onClick={() => setOpen(true)}
      >
        {label} <Icon name="arrow" className="h-4 w-4" />
      </Button>

      {open && (
        <Modal onClose={() => setOpen(false)}>
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
              Contact TrackPro
            </p>
            <h3 className="relative mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Send us a message
            </h3>
            <p className="relative mt-1 text-sm text-white/70">
              We&apos;ll reply within one business day.
            </p>

            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M6 18L18 6" />
              </svg>
            </button>
          </div>

          {/* Body */}
          {status === "success" ? (
            <div className="p-7 text-center sm:p-8">
              <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-emerald-500 text-white">
                <Icon name="check" className="h-7 w-7" />
              </div>
              <h4 className="text-xl font-bold text-ink">Message sent — salamat!</h4>
              <p className="mt-2 text-sm text-muted">
                We&apos;ll get back to you within one business day. For an instant reply, message us on Messenger.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <ButtonLink
                  href={siteConfig.contact.messenger}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="primary"
                  size="md"
                >
                  Message on Messenger
                </ButtonLink>
                <Button type="button" variant="secondary" size="md" onClick={() => setOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="max-h-[70vh] overflow-y-auto p-6 sm:p-7">
              {/* Honeypot */}
              <input
                type="checkbox"
                name="botcheck"
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" name="name" type="text" required autoComplete="name" />
                <Field label="Company" name="company" type="text" autoComplete="organization" />
                <Field label="Email" name="email" type="email" required autoComplete="email" />
                <Field
                  label="Phone"
                  name="phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  placeholder="09XX XXX XXXX"
                />
              </div>
              <div className="mt-4">
                <label htmlFor="vehicles" className="mb-1.5 block text-sm font-medium text-ink">
                  Number of vehicles
                </label>
                <select
                  id="vehicles"
                  name="vehicles"
                  defaultValue="1 – 5"
                  className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                >
                  <option>1 – 5</option>
                  <option>6 – 20</option>
                  <option>21 – 100</option>
                  <option>100+</option>
                </select>
              </div>
              <div className="mt-4">
                <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-ink">
                  How can we help?
                  <span className="ml-0.5 text-brand">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  required
                  className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  placeholder="Tell us about your vehicle and what you need."
                />
              </div>

              {status === "error" && (
                <div
                  role="alert"
                  className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
                >
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-red-500 text-xs font-bold text-white">
                    !
                  </span>
                  <p>{errorMessage} Try Messenger or call us instead.</p>
                </div>
              )}

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button type="button" variant="secondary" size="md" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={status === "submitting"}
                >
                  {status === "submitting" ? (
                    <>
                      <Spinner /> Sending…
                    </>
                  ) : (
                    <>
                      Send Message <Icon name="arrow" className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  if (typeof document === "undefined") return null;
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="animate-fade-in fixed inset-0 z-100 flex items-center justify-center overflow-y-auto bg-ink/60 p-4 backdrop-blur-sm sm:p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-fade-up relative w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-[0_28px_80px_-20px_rgba(0,0,0,0.4)]"
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

function Field({
  label,
  name,
  type,
  required,
  autoComplete,
  placeholder,
}: {
  label: string;
  name: string;
  type: string;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
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
        className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
      />
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
