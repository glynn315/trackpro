"use client";

import { useState, type FormEvent } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { submitInquiry } from "@/lib/inquiry";
import { siteConfig } from "@/lib/site";

type Status = "idle" | "submitting" | "success" | "error";

export const INQUIRY_TYPES = ["Request Quote", "Request Demo", "Technical Support", "Billing / Account", "General Inquiry"] as const;

/**
 * Inline "Get a Quote" form: Name, Number of Vehicles, Contact Number,
 * Company Name, Email. `solution` tags the request with the page it came from;
 * `withInquiryType` adds the request-type dropdown and a message box (Contact page).
 */
export function QuoteForm({
  solution,
  withInquiryType = false,
  defaultType = "Request Quote",
}: {
  solution?: string;
  withInquiryType?: boolean;
  defaultType?: (typeof INQUIRY_TYPES)[number];
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError("");
    const form = e.currentTarget;
    const data = new FormData(form);
    const type = String(data.get("inquiry_type") ?? "Request Quote");
    const subject = solution ? `Quote request: ${solution}` : `${type} from TrackPro website`;

    const result = await submitInquiry(data, subject);
    if (result.ok === true) {
      setStatus("success");
      form.reset();
    } else if (result.ok === "mailto") {
      setStatus("idle");
    } else {
      setStatus("error");
      setError(result.message);
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-line bg-white p-7 text-center sm:p-8">
        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-emerald-500 text-white">
          <Icon name="check" className="h-7 w-7" />
        </div>
        <h3 className="text-xl font-bold text-ink">Request sent — salamat!</h3>
        <p className="mt-2 text-sm text-muted">
          Our team will get back to you within one business day. For an instant reply, message us on Messenger.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <ButtonLink href={siteConfig.contact.messenger} target="_blank" rel="noopener noreferrer" variant="primary" size="md">
            Message on Messenger
          </ButtonLink>
          <Button type="button" variant="secondary" size="md" onClick={() => setStatus("idle")}>
            Send another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-line bg-white p-6 shadow-[0_18px_44px_-24px_rgba(0,0,0,0.25)] sm:p-7">
      <input type="checkbox" name="botcheck" className="hidden" tabIndex={-1} autoComplete="off" />
      {solution && <input type="hidden" name="solution" value={solution} />}

      {withInquiryType && (
        <div className="mb-4">
          <Label htmlFor="inquiry_type">Inquiry type</Label>
          <select id="inquiry_type" name="inquiry_type" defaultValue={defaultType} className={inputClass}>
            {INQUIRY_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" name="name" required autoComplete="name" />
        <div>
          <Label htmlFor="vehicles" required>
            Number of vehicles
          </Label>
          <input id="vehicles" name="vehicles" type="number" min={1} required inputMode="numeric" className={inputClass} placeholder="e.g. 5" />
        </div>
        <Field label="Contact number" name="phone" type="tel" required autoComplete="tel" placeholder="09XX XXX XXXX" />
        <Field label="Company name" name="company" autoComplete="organization" />
        <div className="sm:col-span-2">
          <Field label="Email" name="email" type="email" required autoComplete="email" placeholder="you@email.com" />
        </div>
        {withInquiryType && (
          <div className="sm:col-span-2">
            <Label htmlFor="message">Message</Label>
            <textarea id="message" name="message" rows={4} className={inputClass} placeholder="Tell us about your vehicles and what you need." />
          </div>
        )}
      </div>

      {status === "error" && (
        <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error} Try Messenger or call {siteConfig.contact.phonePrimary} instead.
        </p>
      )}

      <Button type="submit" variant="primary" size="lg" className="mt-6 w-full" disabled={status === "submitting"}>
        {status === "submitting" ? "Sending…" : withInquiryType ? "Submit" : "Get a Quote"}
        <Icon name="arrow" className="h-4 w-4" />
      </Button>
    </form>
  );
}

const inputClass =
  "w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

function Label({ htmlFor, required, children }: { htmlFor: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-ink">
      {children}
      {required && <span className="ml-0.5 text-brand">*</span>}
    </label>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  autoComplete,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <Label htmlFor={name} required={required}>
        {label}
      </Label>
      <input id={name} name={name} type={type} required={required} autoComplete={autoComplete} placeholder={placeholder} className={inputClass} />
    </div>
  );
}
