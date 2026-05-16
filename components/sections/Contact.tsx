"use client";

import { useState, type FormEvent } from "react";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { siteConfig } from "@/lib/site";

type FormStatus = "idle" | "submitting" | "success" | "error";

const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;

const contactItems = [
  {
    icon: "support" as const,
    label: "Phone",
    lines: [
      { text: siteConfig.contact.phonePrimary, href: `tel:${siteConfig.contact.phonePrimary.replace(/\D/g, "")}` },
      { text: siteConfig.contact.phoneSecondary, href: `tel:${siteConfig.contact.phoneSecondary.replace(/\D/g, "")}` },
    ],
  },
  {
    icon: "geo" as const,
    label: "Email",
    lines: [{ text: siteConfig.contact.email, href: `mailto:${siteConfig.contact.email}` }],
  },
  {
    icon: "map" as const,
    label: "Office Location",
    lines: [
      { text: siteConfig.location.address, href: undefined },
      { text: `${siteConfig.location.city}, ${siteConfig.location.region}`, href: undefined },
    ],
  },
  {
    icon: "chart" as const,
    label: "Working Hours",
    lines: [{ text: siteConfig.contact.hours, href: undefined }],
  },
];

export function Contact() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const form = e.currentTarget;
    const data = new FormData(form);

    // No access key configured — fall back to mailto so submissions aren't silently dropped.
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
    <Section
      id="contact"
      eyebrow="Contact"
      title="Get in touch with TrackPro"
      description="For the fastest reply, message us on Messenger or call directly. We'll get back within one business day."
      surface="soft"
    >
      {/* Primary contact channels — the fast paths */}
      <div className="mb-10 grid gap-4 sm:grid-cols-2">
        <a
          href={siteConfig.contact.messenger}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center gap-4 overflow-hidden rounded-2xl bg-linear-to-br from-[#00B2FF] via-[#0084FF] to-[#0066FF] p-5 text-white shadow-[0_14px_36px_-14px_rgba(0,132,255,0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_44px_-14px_rgba(0,132,255,0.7)] sm:p-6"
        >
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/15 backdrop-blur-sm">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden>
              <path d="M12 2C6.486 2 2 6.145 2 11.243c0 2.903 1.453 5.493 3.725 7.19V22l3.405-1.869c.91.252 1.873.386 2.87.386 5.514 0 10-4.145 10-9.243C22 6.145 17.514 2 12 2zm1.005 12.453l-2.547-2.715-4.97 2.715 5.467-5.805 2.61 2.715 4.907-2.715-5.467 5.805z" />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-white/80">Fastest reply</p>
            <p className="mt-0.5 text-lg font-semibold">Message us on Messenger</p>
            <p className="mt-0.5 text-sm text-white/85">We reply within minutes during work hours</p>
          </div>
          <Icon name="arrow" className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
        </a>

        <a
          href={`tel:${siteConfig.contact.phonePrimary.replace(/\D/g, "")}`}
          className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-line bg-white p-5 text-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-[0_14px_36px_-14px_rgba(237,28,36,0.22)] sm:p-6"
        >
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand text-white">
            <Icon name="support" className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Call us directly</p>
            <p className="mt-0.5 text-lg font-semibold">{siteConfig.contact.phonePrimary}</p>
            <p className="mt-0.5 text-sm text-muted">or {siteConfig.contact.phoneSecondary}</p>
          </div>
          <Icon name="arrow" className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
        </a>
      </div>

      <div className="grid gap-8 sm:gap-10 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {contactItems.map((c) => (
              <div
                key={c.label}
                className="flex items-start gap-4 rounded-2xl border border-line bg-white p-5 transition-colors hover:border-brand/40"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
                  <Icon name={c.icon} className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                    {c.label}
                  </p>
                  <div className="mt-1 space-y-0.5">
                    {c.lines.map((ln) =>
                      ln.href ? (
                        <a
                          key={ln.text}
                          href={ln.href}
                          className="block wrap-break-word font-medium text-ink transition-colors hover:text-brand"
                        >
                          {ln.text}
                        </a>
                      ) : (
                        <p key={ln.text} className="wrap-break-word font-medium text-ink">
                          {ln.text}
                        </p>
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-line bg-white p-6 shadow-sm sm:p-8 lg:col-span-3"
        >
          <p className="mb-5 text-sm text-muted">
            Prefer email? Fill out the form and we&apos;ll get back to you.
          </p>

          {/* Honeypot for spam */}
          <input type="checkbox" name="botcheck" className="hidden" tabIndex={-1} autoComplete="off" />

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full name" name="name" type="text" required autoComplete="name" />
            <Field label="Company" name="company" type="text" autoComplete="organization" />
            <Field label="Email" name="email" type="email" required autoComplete="email" />
            <Field label="Phone" name="phone" type="tel" autoComplete="tel" />
          </div>
          <div className="mt-5">
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
          <div className="mt-5">
            <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-ink">
              How can we help?
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

          {status === "success" && (
            <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              <p className="font-semibold">Thanks — message sent!</p>
              <p className="mt-1">We&apos;ll get back to you within one business day. For an instant reply, message us on Messenger.</p>
            </div>
          )}
          {status === "error" && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              <p className="font-semibold">Could not send message</p>
              <p className="mt-1">{errorMessage} Please try Messenger or call us.</p>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="mt-7 w-full sm:w-auto"
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
        </form>
      </div>
    </Section>
  );
}

function Field({
  label,
  name,
  type,
  required,
  autoComplete,
}: {
  label: string;
  name: string;
  type: string;
  required?: boolean;
  autoComplete?: string;
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
