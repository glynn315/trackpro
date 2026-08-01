import { PageHeader } from "@/components/admin/PageHeader";
import { Pagination } from "@/components/admin/Pagination";
import { peso } from "@/lib/admin/format";
import { adminGet } from "@/lib/admin/api";
import type { AdminCustomer, SubscriptionsResponse } from "@/lib/admin/types";
import { SubTabs } from "./SubTabs";
import { SubscriptionsList } from "./SubscriptionsList";
import { NewSubscriptionForm } from "./NewSubscriptionForm";

export const dynamic = "force-dynamic";

const STATUSES = ["active", "pending", "past_due", "expired", "cancelled"];

export default async function SubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    due?: string;
    search?: string;
    page?: string;
    saved?: string;
    error?: string;
  }>;
}) {
  const sp = await searchParams;

  const qs = new URLSearchParams();
  if (sp.status) qs.set("status", sp.status);
  if (sp.due) qs.set("due", sp.due);
  if (sp.search) qs.set("search", sp.search);
  if (sp.page) qs.set("page", sp.page);

  const [{ data, meta, stats, plans }, customers] = await Promise.all([
    adminGet<SubscriptionsResponse>(`/api/admin/subscriptions${qs.toString() ? `?${qs}` : ""}`),
    adminGet<{ data: AdminCustomer[] }>("/api/admin/customers").then((r) => r.data),
  ]);

  return (
    <>
      <PageHeader title="Subscriptions" />
      <div className="p-5 lg:p-8">
        <SubTabs />

        {sp.saved && (
          <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {sp.saved}
          </div>
        )}
        {sp.error && (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {sp.error}
          </div>
        )}

        {/* Headline numbers */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="Active Subscriptions"
            value={String(stats.active)}
            sub={`${stats.devices_covered} devices covered`}
          />
          <Stat
            label="Annual Recurring Revenue"
            value={peso(stats.arr)}
            sub="From active subscriptions"
            accent
          />
          <Stat
            label="Renewals Due (30 days)"
            value={String(stats.renewals_due_soon)}
            subNode={
              <>
                <span className="font-semibold text-red-600">{stats.past_due}</span> past due ·{" "}
                <span className="font-semibold text-gray-600">{stats.expired}</span> expired
              </>
            }
          />
          <Stat
            label="Outstanding"
            value={peso(stats.outstanding)}
            sub={`${peso(stats.collected_this_year)} collected this year`}
          />
        </div>

        {/* Filters */}
        <form className="mt-6 flex flex-wrap items-center gap-3">
          <input
            name="search"
            defaultValue={sp.search ?? ""}
            placeholder="Search customer or reference…"
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
                {s.replace("_", " ").replace(/^./, (c) => c.toUpperCase())}
              </option>
            ))}
          </select>
          <select
            name="due"
            defaultValue={sp.due ?? ""}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">Any renewal date</option>
            <option value="soon">Renewing in 30 days</option>
            <option value="overdue">Renewal overdue</option>
          </select>
          <button className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white">Filter</button>
        </form>

        <div className="mt-5">
          <SubscriptionsList key={meta.current_page} items={data} />
          <Pagination meta={meta} params={{ status: sp.status, due: sp.due, search: sp.search }} />
        </div>

        <div className="mt-8">
          <NewSubscriptionForm plans={plans} customers={customers} />
        </div>
      </div>
    </>
  );
}

function Stat({
  label,
  value,
  sub,
  subNode,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  subNode?: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
      <p className={`mt-2 text-2xl font-extrabold tracking-tight ${accent ? "text-brand" : ""}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-gray-500">{sub}</p>}
      {subNode && <p className="mt-1 text-xs text-gray-500">{subNode}</p>}
    </div>
  );
}
