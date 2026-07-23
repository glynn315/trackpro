import { PageHeader } from "@/components/admin/PageHeader";
import { Pagination } from "@/components/admin/Pagination";
import { peso } from "@/lib/admin/format";
import { adminGet } from "@/lib/admin/api";
import type { AdminPayment, PageMeta } from "@/lib/admin/types";
import { PaymentsList } from "./PaymentsList";

export const dynamic = "force-dynamic";

const STATUSES = ["pending", "paid", "failed", "refunded", "cancelled"];

type PaymentsResponse = {
  data: AdminPayment[];
  meta: PageMeta;
  totals: { paid: number; pending: number; failed_count: number };
};

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; provider?: string; page?: string }>;
}) {
  const sp = await searchParams;

  const qs = new URLSearchParams();
  if (sp.status) qs.set("status", sp.status);
  if (sp.provider) qs.set("provider", sp.provider);
  if (sp.page) qs.set("page", sp.page);

  const { data, meta, totals } = await adminGet<PaymentsResponse>(
    `/api/admin/payments${qs.toString() ? `?${qs}` : ""}`
  );

  return (
    <>
      <PageHeader title="Payments" />
      <div className="p-5 lg:p-8">
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Paid Revenue</p>
            <p className="mt-2 text-2xl font-extrabold text-emerald-700">{peso(totals.paid)}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Pending</p>
            <p className="mt-2 text-2xl font-extrabold text-amber-700">{peso(totals.pending)}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Failed</p>
            <p className="mt-2 text-2xl font-extrabold text-red-700">{totals.failed_count}</p>
          </div>
        </div>

        <form className="mb-5 flex flex-wrap gap-3">
          <select name="status" defaultValue={sp.status ?? ""} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm">
            <option value="">Any status</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
          </select>
          <select name="provider" defaultValue={sp.provider ?? ""} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm">
            <option value="">Any provider</option>
            <option value="paymongo">PayMongo</option>
            <option value="manual">Manual</option>
            <option value="temporary">Temporary</option>
          </select>
          <button className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white">Filter</button>
        </form>

        <PaymentsList items={data} />
        <Pagination meta={meta} params={{ status: sp.status, provider: sp.provider }} />
      </div>
    </>
  );
}
