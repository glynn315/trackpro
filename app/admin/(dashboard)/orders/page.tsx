import { PageHeader } from "@/components/admin/PageHeader";
import { Pagination } from "@/components/admin/Pagination";
import { adminGet } from "@/lib/admin/api";
import type { AdminOrder, PageMeta } from "@/lib/admin/types";
import { OrdersList } from "./OrdersList";

export const dynamic = "force-dynamic";

const ORDER_STATUSES = ["pending", "paid", "preparing", "shipped", "completed", "cancelled"];
const PAYMENT_STATUSES = ["unpaid", "awaiting", "paid", "failed", "refunded"];

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; payment_status?: string; page?: string }>;
}) {
  const sp = await searchParams;

  const qs = new URLSearchParams();
  if (sp.q) qs.set("q", sp.q);
  if (sp.status) qs.set("status", sp.status);
  if (sp.payment_status) qs.set("payment_status", sp.payment_status);
  if (sp.page) qs.set("page", sp.page);

  const { data, meta } = await adminGet<{ data: AdminOrder[]; meta: PageMeta }>(
    `/api/admin/orders${qs.toString() ? `?${qs}` : ""}`
  );

  return (
    <>
      <PageHeader title="Orders" />
      <div className="p-5 lg:p-8">
        <form className="mb-5 grid gap-3 sm:grid-cols-4">
          <input name="q" defaultValue={sp.q ?? ""} placeholder="Search ref / name / email" className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20" />
          <select name="status" defaultValue={sp.status ?? ""} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm">
            <option value="">Any status</option>
            {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
          </select>
          <select name="payment_status" defaultValue={sp.payment_status ?? ""} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm">
            <option value="">Any payment</option>
            {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
          </select>
          <button className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white">Filter</button>
        </form>

        <OrdersList items={data} />
        <Pagination meta={meta} params={{ q: sp.q, status: sp.status, payment_status: sp.payment_status }} />
      </div>
    </>
  );
}
