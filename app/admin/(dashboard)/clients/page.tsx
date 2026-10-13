import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pagination } from "@/components/admin/Pagination";
import { peso } from "@/lib/admin/format";
import { adminGet } from "@/lib/admin/api";
import type { AdminClient, PageMeta } from "@/lib/admin/types";
import { NewClientForm } from "./NewClientForm";

export const dynamic = "force-dynamic";

type ClientsResponse = {
  data: AdminClient[];
  meta: PageMeta;
  totals: { clients: number; with_active_plan: number; new_this_month: number };
};

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string; saved?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  if (sp.search) qs.set("search", sp.search);
  if (sp.page) qs.set("page", sp.page);

  const { data, meta, totals } = await adminGet<ClientsResponse>(`/api/admin/clients${qs.toString() ? `?${qs}` : ""}`);

  return (
    <>
      <PageHeader title="Clients" />
      <div className="p-5 lg:p-8">
        {sp.saved && (
          <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {sp.saved}
          </div>
        )}
        {sp.error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {sp.error}
          </div>
        )}

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Stat label="Total Clients" value={totals.clients} />
          <Stat label="With Active Plan" value={totals.with_active_plan} tone="text-emerald-700" />
          <Stat label="New This Month" value={totals.new_this_month} tone="text-brand" />
        </div>

        <NewClientForm />

        <form className="mb-5 flex flex-wrap gap-3">
          <input
            name="search"
            defaultValue={sp.search ?? ""}
            placeholder="Search name, email, phone, company…"
            className="w-full max-w-sm rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          />
          <button className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white">Search</button>
          {sp.search && (
            <Link href="/admin/clients" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              Clear
            </Link>
          )}
        </form>

        {/* Desktop table */}
        <div className="hidden overflow-x-auto rounded-2xl border border-gray-200 bg-white lg:block">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Company</th>
                <th className="px-5 py-3">Fleet</th>
                <th className="px-5 py-3">Orders</th>
                <th className="px-5 py-3">Plans</th>
                <th className="px-5 py-3">Billing</th>
                <th className="px-5 py-3">Spent</th>
                <th className="px-5 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm text-gray-500">No clients found.</td>
                </tr>
              )}
              {data.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <Link href={`/admin/clients/${c.id}`} className="font-semibold text-brand hover:underline">{c.name}</Link>
                    <p className="text-xs text-gray-500">{c.email}{c.phone && ` · ${c.phone}`}</p>
                  </td>
                  <td className="px-5 py-3 text-gray-700">{c.company ?? "—"}</td>
                  <td className="px-5 py-3 text-xs text-gray-700">{c.fleet_size ?? "—"}</td>
                  <td className="px-5 py-3">{c.orders_count}</td>
                  <td className="px-5 py-3">
                    {c.active_subscriptions_count > 0 ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">{c.active_subscriptions_count} active</span>
                    ) : (
                      <span className="text-xs text-gray-400">None</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {c.unpaid_invoices_count > 0 ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">{c.unpaid_invoices_count} unpaid</span>
                    ) : (
                      <span className="text-xs text-gray-400">Up to date</span>
                    )}
                  </td>
                  <td className="px-5 py-3 font-semibold">{peso(c.total_spent)}</td>
                  <td className="px-5 py-3 text-xs text-gray-500">{fmtDate(c.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="space-y-3 lg:hidden">
          {data.length === 0 && (
            <p className="rounded-2xl border border-gray-200 bg-white px-5 py-10 text-center text-sm text-gray-500">No clients found.</p>
          )}
          {data.map((c) => (
            <Link key={c.id} href={`/admin/clients/${c.id}`} className="block rounded-2xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="truncate font-semibold text-brand">{c.name}</span>
                <span className="text-sm font-bold">{peso(c.total_spent)}</span>
              </div>
              <p className="mt-0.5 truncate text-xs text-gray-500">{c.company ?? c.email}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-gray-100 px-2 py-0.5 font-semibold">{c.orders_count} orders</span>
                {c.active_subscriptions_count > 0 && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-700">{c.active_subscriptions_count} active plan</span>
                )}
                {c.unpaid_invoices_count > 0 && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-700">{c.unpaid_invoices_count} unpaid</span>
                )}
              </div>
            </Link>
          ))}
        </div>

        <Pagination meta={meta} params={{ search: sp.search }} />
      </div>
    </>
  );
}

function Stat({ label, value, tone = "text-ink" }: { label: string; value: number; tone?: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
      <p className={`mt-2 text-2xl font-extrabold ${tone}`}>{value}</p>
    </div>
  );
}
