import type { SalesInvoice } from "@/lib/admin/types";
import {
  invoiceDefaultFooter,
  invoiceDefaultFrom,
  InvoiceLabel,
  InvoiceLogo,
  invoicePaperClass,
  invoicePeso as peso,
} from "@/components/invoice/InvoicePrint";

function fmtDate(value: string | null | undefined) {
  if (!value) return "";
  const [y, m, d] = value.slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-PH", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const caption = "text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400";

/** Multi-line text as typed in the editor. */
function Lines({ text, className = "" }: { text: string; className?: string }) {
  return <p className={`whitespace-pre-line ${className}`}>{text}</p>;
}

/**
 * Read-only invoice on the company template — the same page the admin
 * edits in `InvoiceEditor`, as the customer receives it. Pair with
 * `<InvoicePrintStyles />`.
 */
export function InvoiceDocument({
  invoice: inv,
  status,
  paid = false,
}: {
  invoice: SalesInvoice;
  status?: { label: string; cls: string };
  paid?: boolean;
}) {
  const from = inv.from ?? invoiceDefaultFrom();
  const footer = inv.footer ?? invoiceDefaultFooter();
  const subtotal = inv.items.reduce((sum, i) => sum + i.qty * i.unit_price, 0);
  const total = Math.max(0, subtotal - (inv.discount || 0));
  const billToFields = (inv.bill_to_fields ?? []).filter((f) => f.value.trim());
  const details = (inv.details ?? []).filter((f) => f.value.trim());
  const sections = (inv.sections ?? []).filter((s) => s.body.trim());
  const bill = inv.bill_to;

  return (
    <article id="invoice-sheet" className={invoicePaperClass}>
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-6">
        <div className="max-w-xs space-y-2">
          <InvoiceLogo />
          <div className="text-[11.5px] leading-relaxed text-gray-500">
            <p className="font-semibold text-gray-800">{from.name}</p>
            <Lines text={from.lines} />
          </div>
        </div>
        <div className="text-right">
          <h1 className="text-[28px] font-extrabold uppercase leading-none tracking-[0.2em] text-gray-900">
            {inv.title || "Invoice"}
          </h1>
          <p className="mt-2 font-mono text-sm font-semibold text-gray-700">{inv.number}</p>
          {status && (
            <span
              className={`mt-2 inline-block rounded border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] ${status.cls}`}
            >
              {status.label}
            </span>
          )}
        </div>
      </header>

      <div className="mt-6 h-[3px] bg-brand" />

      {/* Bill to + invoice details */}
      <section className="invoice-keep mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <InvoiceLabel>Bill to</InvoiceLabel>
          <div className="mt-1.5 space-y-0.5">
            <p className="text-sm font-bold text-gray-900">{bill.name}</p>
            {bill.company && <p>{bill.company}</p>}
            {bill.address && <p className="text-gray-600">{bill.address}</p>}
            {bill.phone && <p className="text-gray-600">{bill.phone}</p>}
            {bill.email && <p className="text-gray-600">{bill.email}</p>}
            {billToFields.map((f, i) => (
              <p key={i} className="text-gray-600">
                {f.label && <span className="text-gray-500">{f.label}: </span>}
                {f.value}
              </p>
            ))}
          </div>
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 self-start rounded-md bg-gray-50 px-4 py-3 sm:ml-auto sm:min-w-[260px]">
          {[
            ["Invoice date", fmtDate(inv.date)],
            ...(inv.due_date ? [["Due date", fmtDate(inv.due_date)]] : []),
            ...details.map((f) => [f.label, f.value]),
            [paid ? "Amount paid" : "Amount due", peso(total)],
          ].map(([label, value], i) => (
            <div key={i} className="contents">
              <dt className={`${caption} leading-5`}>{label}</dt>
              <dd className="text-right font-semibold text-gray-900">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Line items */}
      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse">
          <thead>
            <tr className="bg-gray-900 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-white">
              <th className="w-10 px-3 py-2.5">#</th>
              <th className="px-3 py-2.5">Description</th>
              <th className="w-14 px-3 py-2.5 text-right">Qty</th>
              <th className="w-28 px-3 py-2.5 text-right">Unit price</th>
              <th className="w-32 px-3 py-2.5 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {inv.items.map((it, i) => (
              <tr key={i} className="border-b border-gray-200 align-top">
                <td className="px-3 py-2.5 text-gray-400">{i + 1}</td>
                <td className="px-3 py-2.5 font-semibold text-gray-900">{it.description}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">{it.qty}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">{peso(it.unit_price)}</td>
                <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-gray-900">{peso(it.qty * it.unit_price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Notes + totals */}
      <section className="invoice-keep mt-6 flex flex-col-reverse gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm text-[11.5px] text-gray-600">
          {inv.notes?.trim() && (
            <>
              <InvoiceLabel>{inv.notes_label || "Notes"}</InvoiceLabel>
              <Lines text={inv.notes} className="mt-1" />
            </>
          )}
        </div>

        <dl className="w-full space-y-1.5 sm:w-72">
          <div className="flex justify-between px-3">
            <dt className="text-gray-500">Subtotal</dt>
            <dd className="tabular-nums">{peso(subtotal)}</dd>
          </div>
          {inv.discount > 0 && (
            <div className="flex justify-between px-3">
              <dt className="text-gray-500">Discount</dt>
              <dd className="tabular-nums">({peso(inv.discount)})</dd>
            </div>
          )}
          {paid && (
            <div className="flex justify-between px-3">
              <dt className="text-gray-500">Amount paid</dt>
              <dd className="tabular-nums">({peso(total)})</dd>
            </div>
          )}
          <div className="flex items-baseline justify-between rounded-md bg-gray-900 px-3 py-2.5 text-white">
            <dt className="text-[10px] font-bold uppercase tracking-[0.12em]">{paid ? "Balance due" : "Total"}</dt>
            <dd className="text-lg font-extrabold tabular-nums">{peso(paid ? 0 : total)}</dd>
          </div>
        </dl>
      </section>

      {sections.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {sections.map((s, i) => (
            <div key={i} className="invoice-keep text-[11.5px] text-gray-600">
              {s.label && <InvoiceLabel>{s.label}</InvoiceLabel>}
              <Lines text={s.body} className="mt-1" />
            </div>
          ))}
        </div>
      )}

      <div className="min-h-10 flex-1" />
      {footer.trim() && (
        <footer className="invoice-keep mt-auto border-t border-gray-200 pt-4 text-center text-[11px] leading-relaxed text-gray-500">
          <Lines text={footer} />
        </footer>
      )}
    </article>
  );
}
