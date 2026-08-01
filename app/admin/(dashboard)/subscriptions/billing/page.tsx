import { PageHeader } from "@/components/admin/PageHeader";
import { Pagination } from "@/components/admin/Pagination";
import { peso } from "@/lib/admin/format";
import { adminGet } from "@/lib/admin/api";
import type { SubscriptionInvoicesResponse } from "@/lib/admin/types";
import { SubTabs } from "../SubTabs";
import { InvoicesList } from "./InvoicesList";

export const dynamic = "force-dynamic";

const STATUSES = ["unpaid", "awaiting", "paid", "void"];

export default async function SubscriptionBillingPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; overdue?: string; page?: string }>;
}) {
  const sp = await searchParams;

  const qs = new URLSearchParams();
  if (sp.status) qs.set("status", sp.status);
  if (sp.search) qs.set("search", sp.search);
  if (sp.overdue) qs.set("overdue", "1");
  if (sp.page) qs.set("page", sp.page);

  const { data, meta, totals } = await adminGet<SubscriptionInvoicesResponse>(
    `/api/admin/subscription-invoices${qs.toString() ? `?${qs}` : ""}`
  );

  return (
    <>
      <PageHeader title="Subscriptions" />
      <div className="p-5 lg:p-8">
        <SubTabs />

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Outstanding</p>
            <p className="mt-2 text-2xl font-extrabold text-amber-700">{peso(totals.outstanding)}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Overdue</p>
            <p className="mt-2 text-2xl font-extrabold text-red-600">{peso(totals.overdue)}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Collected This Year
            </p>
            <p className="mt-2 text-2xl font-extrabold text-emerald-700">
              {peso(totals.collected_this_year)}
            </p>
          </div>
        </div>

        <form className="mt-6 flex flex-wrap items-center gap-3">
          <input
            name="search"
            defaultValue={sp.search ?? ""}
            placeholder="Search invoice, customer…"
            className="min-w-48 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          />
          <select
            name="status"
            defaultValue={sp.status ?? ""}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">Any status</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s[0].toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              name="overdue"
              value="1"
              defaultChecked={Boolean(sp.overdue)}
              className="h-4 w-4 rounded border-gray-300"
            />
            Overdue only
          </label>
          <button className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white">Filter</button>
        </form>

        <div className="mt-5">
          <InvoicesList key={meta.current_page} items={data} />
          <Pagination
            meta={meta}
            params={{ status: sp.status, search: sp.search, overdue: sp.overdue }}
          />
        </div>
      </div>
    </>
  );
}
