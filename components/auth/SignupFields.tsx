import type { SignUpInput } from "@/lib/auth";

/** Fleet size buckets — they line up with the Basic/Standard/Premium/Enterprise plans. */
export const FLEET_SIZES = ["1–2 vehicles", "3–10 vehicles", "11–30 vehicles", "31+ vehicles"] as const;

const inputClass =
  "w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

/** Company name (optional) — sits right after Full name on the signup forms. */
export function CompanyField() {
  return (
    <div>
      <label htmlFor="company" className="mb-1.5 block text-sm font-medium text-ink">
        Company name <span className="font-normal text-muted">(optional)</span>
      </label>
      <input id="company" name="company" type="text" autoComplete="organization" className={inputClass} />
    </div>
  );
}

/** Fleet size and vehicle information — after Email on the signup forms. */
export function FleetFields() {
  return (
    <>
      <div>
        <label htmlFor="fleet_size" className="mb-1.5 block text-sm font-medium text-ink">
          Fleet size
        </label>
        <select id="fleet_size" name="fleet_size" defaultValue="" className={inputClass}>
          <option value="" disabled>
            Select number of vehicles
          </option>
          {FLEET_SIZES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="vehicle_info" className="mb-1.5 block text-sm font-medium text-ink">
          Vehicle information
        </label>
        <textarea
          id="vehicle_info"
          name="vehicle_info"
          rows={2}
          maxLength={2000}
          className={inputClass}
          placeholder="e.g. 2 × Isuzu trucks, 1 × Toyota Hilux"
        />
      </div>
    </>
  );
}

/** Required agreement checkbox — links open in a new tab so the form isn't lost. */
export function TermsAgreement() {
  const link = "font-semibold text-brand hover:underline";
  return (
    <label className="flex items-start gap-2.5 text-xs leading-relaxed text-ink">
      <input type="checkbox" name="accept_terms" required className="mt-0.5 h-4 w-4 shrink-0 accent-brand" />
      <span>
        I agree to the{" "}
        <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className={link}>
          Privacy Policy
        </a>
        ,{" "}
        <a href="/terms-of-service" target="_blank" rel="noopener noreferrer" className={link}>
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="/service-agreement" target="_blank" rel="noopener noreferrer" className={link}>
          Service Agreement
        </a>
        .<span className="ml-0.5 text-brand">*</span>
      </span>
    </label>
  );
}

/** Builds the signUp payload from either signup form. */
export function readSignup(data: FormData): SignUpInput {
  const str = (k: string) => String(data.get(k) ?? "").trim();
  return {
    name: str("name"),
    email: str("email"),
    phone: str("phone"),
    company: str("company"),
    fleetSize: str("fleet_size"),
    vehicleInfo: str("vehicle_info"),
    password: String(data.get("password") ?? ""),
    acceptTerms: data.get("accept_terms") === "on",
  };
}
