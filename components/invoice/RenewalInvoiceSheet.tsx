import {
  InvoiceFooter,
  InvoiceLabel,
  InvoiceLetterhead,
  invoicePaperClass,
  invoicePeso,
  serviceEndDate,
} from "@/components/invoice/InvoicePrint";

export type RenewalInvoiceStatus = "unpaid" | "awaiting" | "paid" | "void";

/** What a printed renewal invoice shows — the admin and customer copies are the same sheet. */
export type RenewalInvoice = {
  reference: string;
  issued_at: string | null;
  subscription_reference: string | null;
  bill_to: { name: string; company: string | null; email: string | null; phone: string | null } | null;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  period_start: string;
  period_end: string;
  due_date: string;
  status: RenewalInvoiceStatus;
  payment_method: string | null;
  paid_at: string | null;
  checkout_url: string | null;
};

const peso = invoicePeso;

function fmtDate(value: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-PH", { timeZone: "Asia/Manila", month: "short", day: "numeric", year: "numeric" });
}

const statusPill: Record<RenewalInvoiceStatus, { label: string; cls: string }> = {
  paid: { label: "Paid", cls: "border-emerald-600 bg-emerald-50 text-emerald-700" },
  unpaid: { label: "Unpaid", cls: "border-brand bg-brand/5 text-brand" },
  awaiting: { label: "Unpaid", cls: "border-brand bg-brand/5 text-brand" },
  void: { label: "Void", cls: "border-gray-400 bg-gray-50 text-gray-500" },
};

/** A subscription renewal invoice on a Letter-size page — pair with `<InvoicePrintStyles />`. */
export function RenewalInvoiceSheet({ invoice: inv }: { invoice: RenewalInvoice }) {
  // Plan prices can change after an invoice is raised — the invoice amount is what's owed.
  const qty = inv.quantity > 0 && inv.quantity * inv.unit_price === inv.amount ? inv.quantity : 1;
  const unit = qty === 1 ? inv.amount : inv.unit_price;
  const bill = inv.bill_to;
  const paid = inv.status === "paid" ? inv.amount : 0;
  const balance = inv.status === "void" ? 0 : inv.amount - paid;
  const pill = statusPill[inv.status];

  const meta: [string, string][] = [
    ["Invoice date", fmtDate(inv.issued_at)],
    ["Due date", fmtDate(inv.due_date)],
    ...(inv.subscription_reference ? [["Subscription", inv.subscription_reference] as [string, string]] : []),
  ];

  return (
    <article id="invoice-sheet" className={invoicePaperClass}>
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-6">
        <InvoiceLetterhead />
        <div className="text-right">
          <h1 className="text-[28px] font-extrabold uppercase leading-none tracking-[0.2em] text-gray-900">Invoice</h1>
          <p className="mt-2 font-mono text-sm font-semibold text-gray-700">{inv.reference}</p>
          <span
            className={`mt-2 inline-block rounded border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] ${pill.cls}`}
          >
            {pill.label}
          </span>
        </div>
      </header>

      <div className="mt-6 h-[3px] bg-brand" />

      {/* Bill to + invoice details */}
      <section className="invoice-keep mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <InvoiceLabel>Bill to</InvoiceLabel>
          {bill ? (
            <div className="mt-1.5 space-y-0.5">
              <p className="text-sm font-bold text-gray-900">{bill.name}</p>
              {bill.company && <p>{bill.company}</p>}
              {bill.phone && <p className="text-gray-600">{bill.phone}</p>}
              {bill.email && <p className="text-gray-600">{bill.email}</p>}
            </div>
          ) : (
            <p className="mt-1.5 text-gray-400">—</p>
          )}
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 self-start rounded-md bg-gray-50 px-4 py-3 sm:ml-auto sm:min-w-[260px]">
          {meta.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 leading-5">{label}</dt>
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
            <tr className="border-b border-gray-200 align-top">
              <td className="px-3 py-3 text-gray-400">1</td>
              <td className="px-3 py-3">
                {/* The stored description ends with its own "(date to date)" — the period line below says it once. */}
                <p className="font-semibold text-gray-900">{inv.description.replace(/\s*\([^)]*\)\s*$/, "")}</p>
                <p className="mt-0.5 text-[11.5px] text-gray-500">
                  GPS tracking subscription · Service period {fmtDate(inv.period_start)} –{" "}
                  {fmtDate(serviceEndDate(inv.period_end))}
                </p>
              </td>
              <td className="px-3 py-3 text-right tabular-nums">{qty}</td>
              <td className="px-3 py-3 text-right tabular-nums">{peso(unit)}</td>
              <td className="px-3 py-3 text-right font-semibold tabular-nums text-gray-900">{peso(inv.amount)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Notes + totals */}
      <section className="invoice-keep mt-6 flex flex-col-reverse gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm space-y-3 text-[11.5px] text-gray-600">
          {inv.status === "paid" && (
            <div>
              <InvoiceLabel>Payment received</InvoiceLabel>
              <p className="mt-1">
                Paid on {fmtDate(inv.paid_at)}
                {inv.payment_method ? ` via ${inv.payment_method.toUpperCase()}` : ""}. Thank you!
              </p>
            </div>
          )}
          {(inv.status === "unpaid" || inv.status === "awaiting") && (
            <div>
              <InvoiceLabel>Payment terms</InvoiceLabel>
              <p className="mt-1">
                Please pay on or before <strong className="text-gray-900">{fmtDate(inv.due_date)}</strong> to keep
                your GPS tracking service active. Pay online from your TrackPro account under Billing.
              </p>
            </div>
          )}
          {inv.status === "void" && (
            <div>
              <InvoiceLabel>Note</InvoiceLabel>
              <p className="mt-1">This invoice has been voided and no payment is due.</p>
            </div>
          )}
        </div>

        <dl className="w-full space-y-1.5 sm:w-72">
          <div className="flex justify-between px-3">
            <dt className="text-gray-500">Subtotal</dt>
            <dd className="tabular-nums">{peso(inv.amount)}</dd>
          </div>
          <div className="flex justify-between px-3">
            <dt className="text-gray-500">Amount paid</dt>
            <dd className="tabular-nums">{paid ? `(${peso(paid)})` : peso(0)}</dd>
          </div>
          <div className="flex items-baseline justify-between rounded-md bg-gray-900 px-3 py-2.5 text-white">
            <dt className="text-[10px] font-bold uppercase tracking-[0.12em]">Balance due</dt>
            <dd className="text-lg font-extrabold tabular-nums">{peso(balance)}</dd>
          </div>
        </dl>
      </section>

      <div className="min-h-10 flex-1" />
      <InvoiceFooter />
    </article>
  );
}
