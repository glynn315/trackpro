import Image from "next/image";
import { siteConfig } from "@/lib/site";

/**
 * Print only `#invoice-sheet` on short bond paper (US Letter, 8.5 × 11 in):
 * the site / admin chrome is hidden, and form fields print as plain text
 * (no borders, spinners or date pickers).
 */
export function InvoicePrintStyles() {
  return (
    <style>{`@media print {
      @page { size: letter portrait; margin: 0.5in; }
      html, body { background: #fff !important; }
      body * { visibility: hidden; }
      #invoice-sheet, #invoice-sheet * { visibility: visible; }
      #invoice-sheet { position: absolute; inset: 0 auto auto 0; width: 100%; max-width: none; min-height: 9.8in; margin: 0; border: 0; border-radius: 0; box-shadow: none; padding: 0; }
      #invoice-sheet input, #invoice-sheet textarea { appearance: none; -webkit-appearance: none; -moz-appearance: textfield; background: transparent; }
      #invoice-sheet input::-webkit-inner-spin-button, #invoice-sheet input::-webkit-outer-spin-button,
      #invoice-sheet input::-webkit-calendar-picker-indicator { display: none; -webkit-appearance: none; }
      #invoice-sheet input::placeholder, #invoice-sheet textarea::placeholder { color: transparent; }
      #invoice-sheet * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      #invoice-sheet tr, #invoice-sheet .invoice-keep { break-inside: avoid; }
    }`}</style>
  );
}

/**
 * The paper: on screen it previews a Letter page (8.5 in wide at 96 dpi,
 * 0.5 in padding) so what you see is what prints.
 */
export const invoicePaperClass =
  "mx-auto flex w-full max-w-[816px] flex-col bg-white p-6 text-[13px] leading-snug text-gray-800 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-gray-200 sm:min-h-[1056px] sm:p-12";

/** Company letterhead (left side of every invoice header). */
export function InvoiceLetterhead() {
  const { location, contact } = siteConfig;
  return (
    <div className="space-y-2">
      <Image src="/logo.png" alt={siteConfig.name} width={1640} height={240} priority className="h-7 w-auto" />
      <div className="text-[11.5px] leading-relaxed text-gray-500">
        <p className="font-semibold text-gray-800">{siteConfig.name}</p>
        <p>
          {location.address}, {location.city}
        </p>
        <p>
          {location.region} {location.postalCode}, Philippines
        </p>
        <p>
          {contact.phonePrimary} · {contact.salesEmail}
        </p>
      </div>
    </div>
  );
}

/** Invoice money: ₱1,299.00 */
export const invoicePeso = (n: number) =>
  "₱" + n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * Last day of a service period. A period's stored end is the next renewal date
 * (Oct 8 → Nov 8), so the service itself runs through the day before (Nov 7).
 */
export function serviceEndDate(periodEnd: string): string {
  const [y, m, d] = periodEnd.slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d - 1)).toISOString().slice(0, 10);
}

/** Small-caps label used for every field caption on the invoice. */
export function InvoiceLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">{children}</p>;
}

/** Closing lines at the foot of the page. */
export function InvoiceFooter() {
  const { contact, url } = siteConfig;
  return (
    <footer className="invoice-keep mt-auto border-t border-gray-200 pt-4 text-center text-[11px] leading-relaxed text-gray-500">
      <p className="font-semibold text-gray-700">Thank you for choosing {siteConfig.name}.</p>
      <p>
        Questions about this invoice? Call {contact.phonePrimary} or email {contact.salesEmail}.
      </p>
      <p className="mt-1 text-[10px] text-gray-400">
        This is a system-generated invoice and is valid without a signature · {url.replace(/^https?:\/\//, "")}
      </p>
    </footer>
  );
}
