import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pagination } from "@/components/admin/Pagination";
import { peso } from "@/lib/admin/format";
import { adminGet } from "@/lib/admin/api";
import type {
  SaleTransaction,
  SalesReport,
  TodaySalesResponse,
  TransactionsResponse,
} from "@/lib/admin/types";
import { serviceEndDate } from "@/components/invoice/InvoicePrint";
import { SalesTrend } from "./SalesTrend";

export const dynamic = "force-dynamic";

type Filters = { q?: string; from?: string; to?: string; page?: string };

export default async function ReportsPage({ searchParams }: { searchParams: Promise<Filters> }) {
  const filters = await searchParams;
  const qs = new URLSearchParams(Object.entries(filters).filter(([, v]) => v) as [string, string][]);
  const [report, sales, today] = await Promise.all([
    adminGet<SalesReport>("/api/admin/reports/sales"),
    adminGet<TransactionsResponse>(`/api/admin/reports/transactions?${qs}`),
    adminGet<TodaySalesResponse>("/api/admin/reports/today"),
  ]);

  return (
    <>
      <PageHeader title="Sales Reports" />
      <div className="p-5 lg:p-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <Total label="Today" value={report.totals.today} accent />
          <Total label="This Month" value={report.totals.month} />
          <Total label="This Year" value={report.totals.year} />
          <Total label="All-Time" value={report.totals.all_time} />
        </div>

        <SalesTrend report={report} />

        <TodayLog log={today} />

        <SalesTable sales={sales} filters={filters} />
      </div>
    </>
  );
}

function Total({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 sm:text-xs">{label}</p>
      <p className={`mt-1.5 truncate text-2xl font-extrabold tracking-tight sm:mt-2 sm:text-3xl ${accent ? "text-brand" : ""}`}>{peso(value)}</p>
    </div>
  );
}

const filterInput =
  "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

/** Report dates and times are Philippine time, wherever the page is rendered. */
const TZ = "Asia/Manila";

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-PH", { timeZone: TZ, month: "short", day: "numeric", year: "numeric" });

const fmtTime = (d: string) =>
  new Date(d).toLocaleTimeString("en-PH", { timeZone: TZ, hour: "numeric", minute: "2-digit" });

/** "Tuesday, Oct 13, 2026" for a YYYY-MM-DD day. */
const fmtDay = (day: string) =>
  new Date(`${day}T12:00:00+08:00`).toLocaleDateString("en-PH", {
    timeZone: TZ,
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

/* ------------------------------------------------------------ sale rows */

function invoiceHref(s: SaleTransaction) {
  return s.type === "order" ? `/admin/reports/invoice/${s.order.id}` : `/admin/subscriptions/billing/${s.renewal.id}`;
}

function referenceHref(s: SaleTransaction) {
  return s.type === "order" ? `/admin/orders/${s.order.id}` : `/admin/subscriptions/billing/${s.renewal.id}`;
}

/** What was bought, as one product line plus a muted detail line. */
function productOf(s: SaleTransaction): { name: string; detail: string; qty: number } {
  if (s.type === "subscription") {
    return {
      name: `${s.renewal.plan_name ?? "Subscription"} plan`,
      detail: `Renewal · ${fmtDate(s.renewal.period_start)} – ${fmtDate(serviceEndDate(s.renewal.period_end))}`,
      qty: s.renewal.quantity ?? 1,
    };
  }
  const items = s.order.items;
  const extra = [
    items.length > 1 ? `+${items.length - 1} more item${items.length > 2 ? "s" : ""}` : null,
    s.order.subscription_total > 0 ? `incl. subscription ${peso(s.order.subscription_total)}` : null,
  ].filter(Boolean);
  return {
    name: items[0]?.name ?? "Order",
    detail: extra.length ? extra.join(" · ") : items[0] ? `${peso(items[0].unit_price)} each` : "",
    qty: items.reduce((n, i) => n + i.qty, 0) || 1,
  };
}

/** Name plus one contact line — the rest lives on the client page. */
function CustomerCell({ sale: s }: { sale: SaleTransaction }) {
  const sub = s.customer.company || s.customer.email || s.customer.phone;
  return (
    <div className="min-w-0">
      {s.customer.id ? (
        <Link href={`/admin/clients/${s.customer.id}`} className="block truncate font-semibold text-gray-900 hover:text-brand">
          {s.customer.name}
        </Link>
      ) : (
        <p className="truncate font-semibold text-gray-900">{s.customer.name}</p>
      )}
      {sub && <p className="truncate text-xs text-gray-500">{sub}</p>}
    </div>
  );
}

function ProductCell({ sale: s }: { sale: SaleTransaction }) {
  const p = productOf(s);
  return (
    <div className="min-w-0">
      <p className="truncate font-medium text-gray-900">{p.name}</p>
      {p.detail && <p className="truncate text-xs text-gray-500">{p.detail}</p>}
    </div>
  );
}

function ReferenceCell({ sale: s }: { sale: SaleTransaction }) {
  return (
    <div>
      <Link href={referenceHref(s)} className="font-mono text-xs font-semibold text-gray-900 hover:text-brand">
        {s.type === "order" ? s.order.reference : s.renewal.reference}
      </Link>
      <p className="text-xs text-gray-400">{s.type === "order" ? "Order" : "Subscription"}</p>
    </div>
  );
}

function AmountCell({ sale: s }: { sale: SaleTransaction }) {
  return (
    <div className="text-right">
      <p className="font-semibold tabular-nums text-gray-900">{peso(s.amount)}</p>
      {s.method && <p className="text-xs uppercase text-gray-400">{s.method}</p>}
    </div>
  );
}

function InvoiceLink({ sale: s }: { sale: SaleTransaction }) {
  return (
    <Link
      href={invoiceHref(s)}
      title="View / print invoice"
      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-gray-500 hover:bg-gray-100 hover:text-gray-900"
    >
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-3.5 w-3.5" aria-hidden>
        <path d="M5 2.5h7l3 3v12H5z" strokeLinejoin="round" />
        <path d="M8 9h5M8 12h5M8 15h3" strokeLinecap="round" />
      </svg>
      Invoice
    </Link>
  );
}

/**
 * The sales table shared by Today's Sales Log and Sales Details:
 * When · Reference · Customer · Product · Qty · Amount · Invoice.
 * Phones get one compact card per sale instead.
 */
function SalesRows({ sales, when }: { sales: SaleTransaction[]; when: "time" | "date" }) {
  const stamp = (s: SaleTransaction) => (when === "time" ? fmtTime(s.paid_at) : fmtDate(s.paid_at));

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[820px] table-fixed text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              <th className={`${when === "time" ? "w-24" : "w-32"} py-3 pl-5 pr-3 font-semibold`}>{when === "time" ? "Time" : "Date"}</th>
              <th className="w-32 px-3 py-3 font-semibold">Reference</th>
              <th className="w-[24%] px-3 py-3 font-semibold">Customer</th>
              <th className="px-3 py-3 font-semibold">Product</th>
              <th className="w-14 px-3 py-3 text-right font-semibold">Qty</th>
              <th className="w-28 px-3 py-3 text-right font-semibold">Amount</th>
              <th className="w-24 py-3 pl-3 pr-5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sales.map((s) => (
              <tr key={`${s.type}-${s.id}`} className="transition-colors hover:bg-gray-50/80">
                <td className="py-3 pl-5 pr-3 align-top">
                  <p className="tabular-nums text-gray-900">{stamp(s)}</p>
                  {when === "date" && <p className="text-xs tabular-nums text-gray-400">{fmtTime(s.paid_at)}</p>}
                </td>
                <td className="px-3 py-3 align-top">
                  <ReferenceCell sale={s} />
                </td>
                <td className="px-3 py-3 align-top">
                  <CustomerCell sale={s} />
                </td>
                <td className="px-3 py-3 align-top">
                  <ProductCell sale={s} />
                </td>
                <td className="px-3 py-3 text-right align-top tabular-nums text-gray-900">{productOf(s).qty}</td>
                <td className="px-3 py-3 align-top">
                  <AmountCell sale={s} />
                </td>
                <td className="py-2.5 pl-3 pr-5 text-right align-top">
                  <InvoiceLink sale={s} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phones */}
      <ul className="divide-y divide-gray-100 md:hidden">
        {sales.map((s) => {
          const p = productOf(s);
          return (
            <li key={`${s.type}-${s.id}`} className="flex items-start justify-between gap-3 px-4 py-3.5">
              <div className="min-w-0 space-y-0.5">
                <CustomerCell sale={s} />
                <p className="truncate text-sm text-gray-700">
                  {p.qty > 1 && <span className="text-gray-400">{p.qty}× </span>}
                  {p.name}
                </p>
                <p className="text-xs text-gray-400">
                  {stamp(s)} ·{" "}
                  <Link href={referenceHref(s)} className="font-mono hover:text-brand">
                    {s.type === "order" ? s.order.reference : s.renewal.reference}
                  </Link>
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <AmountCell sale={s} />
                <InvoiceLink sale={s} />
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}

/* ------------------------------------------------------- today's sales log */

/** Every sale made today (Philippine time): when, who bought, what, how much. */
function TodayLog({ log }: { log: TodaySalesResponse }) {
  const { totals } = log;

  return (
    <section className="mt-8 rounded-2xl border border-gray-200 bg-white">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-gray-200 px-5 py-4">
        <div>
          <h2 className="flex items-center gap-2 font-bold">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            Today&apos;s Sales Log
          </h2>
          <p className="text-xs text-gray-500">{fmtDay(log.date)}</p>
        </div>
        <dl className="flex flex-wrap gap-x-6 gap-y-1 text-right text-xs">
          <div>
            <dt className="text-gray-500">Sales</dt>
            <dd className="text-base font-extrabold text-gray-900">{totals.count}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Orders · Renewals</dt>
            <dd className="text-base font-extrabold text-gray-900">
              {totals.orders} · {totals.renewals}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Total today</dt>
            <dd className="text-base font-extrabold text-emerald-700">{peso(totals.amount)}</dd>
          </div>
        </dl>
      </header>

      {log.data.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <p className="text-sm font-semibold text-gray-700">No sales yet today</p>
          <p className="mt-1 text-xs text-gray-500">
            Paid orders and subscription payments show up here as soon as they come in.
          </p>
        </div>
      ) : (
        <div className="max-h-[32rem] overflow-y-auto">
          <SalesRows sales={log.data} when="time" />
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------ sales details */

/** Every paid sale: who bought, what they bought, how much — with a link to its invoice. */
function SalesTable({ sales, filters }: { sales: TransactionsResponse; filters: Filters }) {
  const filtered = Boolean(filters.q || filters.from || filters.to);

  return (
    <section className="mt-8 rounded-2xl border border-gray-200 bg-white">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-gray-200 px-5 py-4">
        <div>
          <h2 className="font-bold">Sales Details</h2>
          <p className="text-xs text-gray-500">
            {sales.totals.count} sale(s) · <span className="font-semibold text-gray-700">{peso(sales.totals.amount)}</span>
            {filtered ? " (filtered)" : ""}
          </p>
        </div>
        <form className="flex w-full flex-wrap items-end gap-2 text-xs sm:w-auto">
          <label className="flex w-full flex-col gap-1 font-medium text-gray-500 sm:w-64">
            Search
            <input
              type="search"
              name="q"
              defaultValue={filters.q ?? ""}
              placeholder="Name, email, phone or reference"
              className={`${filterInput} w-full`}
            />
          </label>
          <label className="flex flex-1 flex-col gap-1 font-medium text-gray-500 sm:flex-none">
            From
            <input type="date" name="from" defaultValue={filters.from ?? ""} className={`${filterInput} w-full sm:w-40`} />
          </label>
          <label className="flex flex-1 flex-col gap-1 font-medium text-gray-500 sm:flex-none">
            To
            <input type="date" name="to" defaultValue={filters.to ?? ""} className={`${filterInput} w-full sm:w-40`} />
          </label>
          <button className="h-[38px] rounded-lg bg-ink px-4 text-sm font-semibold text-white hover:bg-black">Filter</button>
          {filtered && (
            <Link href="/admin/reports" className="flex h-[38px] items-center px-2 text-sm font-semibold text-gray-500 hover:text-brand">
              Clear
            </Link>
          )}
        </form>
      </header>

      {sales.data.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-gray-500">No paid sales{filtered ? " match these filters" : " yet"}.</p>
      ) : (
        <SalesRows sales={sales.data} when="date" />
      )}
      <Pagination meta={sales.meta} params={filters} />
    </section>
  );
}
