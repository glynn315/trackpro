import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pagination } from "@/components/admin/Pagination";
import { peso } from "@/lib/admin/format";
import { adminGet } from "@/lib/admin/api";
import type { CustomInvoiceSummary, PageMeta } from "@/lib/admin/types";

export const dynamic = "force-dynamic";

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}

/** Paid invoices are in Sales Reports; unpaid ones are not sales yet. */
function PaidBadge({ paidAt, method }: { paidAt: string | null; method: string | null }) {
  return paidAt ? (
    <span
      title={`Paid ${new Date(paidAt).toLocaleDateString("en-PH", { timeZone: "Asia/Manila", month: "short", day: "numeric", year: "numeric" })} · in Sales Reports`}
      className="inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-emerald-800"
    >
      Paid{method ? ` · ${method}` : ""}
    </span>
  ) : (
    <span className="inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-800">
      Unpaid
    </span>
  );
}

/** Invoices written from scratch in the invoice editor. */
export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string; saved?: string }>;
}) {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  if (sp.search) qs.set("search", sp.search);
  if (sp.page) qs.set("page", sp.page);

  const { data, meta } = await adminGet<{ data: CustomInvoiceSummary[]; meta: PageMeta }>(
    `/api/admin/custom-invoices${qs.toString() ? `?${qs}` : ""}`,
  );

  return (
    <>
      <PageHeader title="Invoices">
        <Link
          href="/admin/invoices/template"
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Edit Template
        </Link>
        <Link
          href="/admin/invoices/new"
          className="rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          + New Invoice
        </Link>
      </PageHeader>
      <div className="p-5 lg:p-8">
        {sp.saved && (
          <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {sp.saved}
          </div>
        )}

        <p className="mb-4 max-w-2xl text-sm text-gray-500">
          Write, save and print invoices for sales and services outside the online store. Open an invoice and{" "}
          <strong>Mark as Paid</strong> once the money comes in — it then counts as a sale in Sales Reports. Every invoice, including
          order and renewal invoices, starts from your <Link href="/admin/invoices/template" className="font-semibold text-brand hover:underline">invoice template</Link>.
          Order and renewal invoices are edited from their own pages (Orders → Invoice / Print, Subscriptions →
          Renewal Billing).
        </p>

        <form className="mb-5 flex flex-wrap gap-3">
          <input
            name="search"
            defaultValue={sp.search ?? ""}
            placeholder="Search invoice number or customer…"
            className="w-full max-w-sm rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          />
          <button className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white">Search</button>
          {sp.search && (
            <Link href="/admin/invoices" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              Clear
            </Link>
          )}
        </form>

        {/* Desktop table */}
        <div className="hidden overflow-x-auto rounded-2xl border border-gray-200 bg-white lg:block">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <th className="px-5 py-3">Number</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-500">
                    {sp.search ? "No invoices found." : "No invoices yet — create one with New Invoice."}
                  </td>
                </tr>
              )}
              {data.map((i) => (
                <tr key={i.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <Link href={`/admin/invoices/${i.id}`} className="font-mono font-semibold text-brand hover:underline">{i.number}</Link>
                    {i.title.toLowerCase() !== "invoice" && <p className="text-xs text-gray-500">{i.title}</p>}
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-semibold text-gray-900">{i.customer_name}</p>
                    {i.company && <p className="text-xs text-gray-500">{i.company}</p>}
                  </td>
                  <td className="px-5 py-3 text-gray-700">{fmtDate(i.date)}</td>
                  <td className="px-5 py-3">
                    <PaidBadge paidAt={i.paid_at} method={i.payment_method} />
                  </td>
                  <td className="px-5 py-3 text-right font-semibold">{peso(i.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="space-y-3 lg:hidden">
          {data.length === 0 && (
            <p className="rounded-2xl border border-gray-200 bg-white px-5 py-10 text-center text-sm text-gray-500">
              {sp.search ? "No invoices found." : "No invoices yet — create one with New Invoice."}
            </p>
          )}
          {data.map((i) => (
            <Link key={i.id} href={`/admin/invoices/${i.id}`} className="block rounded-2xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="truncate font-mono font-semibold text-brand">{i.number}</span>
                <span className="text-sm font-bold">{peso(i.total)}</span>
              </div>
              <p className="mt-0.5 truncate text-xs text-gray-500">
                {i.customer_name}
                {i.company && ` · ${i.company}`} · {fmtDate(i.date)}
              </p>
              <div className="mt-1.5">
                <PaidBadge paidAt={i.paid_at} method={i.payment_method} />
              </div>
            </Link>
          ))}
        </div>

        <Pagination meta={meta} params={{ search: sp.search }} />
      </div>
    </>
  );
}
