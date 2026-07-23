import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { peso, timeAgo } from "@/lib/admin/format";
import { adminApi } from "@/lib/admin/api";
import type { AdminOrder } from "@/lib/admin/types";
import { updateOrder, markPaid } from "../actions";

export const dynamic = "force-dynamic";

const ORDER_STATUSES = ["pending", "paid", "preparing", "shipped", "completed", "cancelled"];
const PAYMENT_STATUSES = ["unpaid", "awaiting", "paid", "failed", "refunded"];

const payBadge: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-700",
};

export default async function OrderShowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await adminApi(`/api/admin/orders/${id}`);
  if (res.status === 401 || res.status === 403) redirect("/admin/login");
  if (res.status === 404) notFound();
  if (!res.ok) throw new Error(`Failed to load order (${res.status})`);
  const { data: order } = (await res.json()) as { data: AdminOrder };
  const items = order.items ?? [];
  const payments = order.payments ?? [];

  return (
    <>
      <PageHeader title={`Order ${order.reference}`}>
        <Link href="/admin/orders" className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">← Back</Link>
      </PageHeader>

      <div className="p-5 lg:p-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-gray-200 bg-white">
              <header className="border-b border-gray-200 px-5 py-4"><h2 className="font-bold">Items</h2></header>
              <ul className="divide-y divide-gray-100">
                {items.map((it) => (
                  <li key={it.id} className="flex items-center justify-between px-5 py-3 text-sm">
                    <div>
                      <p className="font-semibold">{it.qty} × {it.product_name}</p>
                      <p className="text-xs text-gray-500">
                        Model {it.product_model} · {peso(it.unit_price)} each
                        {it.unit_subscription > 0 && ` · ${peso(it.unit_subscription)}/mo`}
                      </p>
                    </div>
                    <p className="font-bold">{peso(it.line_total)}</p>
                  </li>
                ))}
              </ul>
              <footer className="border-t border-gray-200 px-5 py-4 text-sm">
                <div className="flex justify-between"><span>Hardware subtotal</span><span className="font-semibold">{peso(order.hardware_subtotal)}</span></div>
                {order.subscription_total > 0 && (
                  <div className="flex justify-between"><span>Monthly subscription</span><span className="font-semibold">{peso(order.subscription_total)}/mo</span></div>
                )}
                <div className="mt-2 flex justify-between border-t border-gray-200 pt-2 text-base">
                  <span className="font-bold">Total today</span><span className="font-extrabold">{peso(order.hardware_subtotal)}</span>
                </div>
              </footer>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h2 className="font-bold">Customer</h2>
              <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                <div><dt className="text-xs text-gray-500">Name</dt><dd className="font-medium">{order.customer_name}</dd></div>
                <div><dt className="text-xs text-gray-500">Email</dt><dd className="font-medium">{order.customer_email}</dd></div>
                <div><dt className="text-xs text-gray-500">Phone</dt><dd className="font-medium">{order.customer_phone}</dd></div>
                <div className="sm:col-span-2"><dt className="text-xs text-gray-500">Delivery address</dt><dd>{order.delivery_address}</dd></div>
                {order.notes && (
                  <div className="sm:col-span-2"><dt className="text-xs text-gray-500">Notes</dt><dd className="whitespace-pre-line">{order.notes}</dd></div>
                )}
              </dl>
            </div>

            {payments.length > 0 && (
              <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
                <header className="border-b border-gray-200 px-5 py-4"><h2 className="font-bold">Payment Records</h2></header>
                <table className="min-w-full text-sm">
                  <tbody className="divide-y divide-gray-100">
                    {payments.map((p) => (
                      <tr key={p.id}>
                        <td className="px-5 py-3"><span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold uppercase">{p.provider}</span></td>
                        <td className="px-5 py-3 font-bold">{peso(p.amount)}</td>
                        <td className="px-5 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${payBadge[p.status] ?? "bg-gray-100 text-gray-700"}`}>{p.status}</span></td>
                        <td className="px-5 py-3 text-xs text-gray-500">{p.payment_method ?? "—"}</td>
                        <td className="px-5 py-3 text-xs text-gray-500">{timeAgo(p.paid_at ?? p.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h2 className="font-bold">Update Order</h2>
              <form action={updateOrder.bind(null, order.id)} className="mt-4 space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">Status</label>
                  <select name="status" defaultValue={order.status} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm">
                    {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">Payment</label>
                  <select name="payment_status" defaultValue={order.payment_status} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm">
                    {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
                <button className="w-full rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">Save Changes</button>
              </form>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h2 className="font-bold">Payment</h2>
              <p className="mt-1 text-xs text-gray-500">Mark this order as paid manually.</p>
              <form action={markPaid.bind(null, order.id)} className="mt-4">
                <button className="w-full rounded-full border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50">Mark as Paid (manual)</button>
              </form>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
