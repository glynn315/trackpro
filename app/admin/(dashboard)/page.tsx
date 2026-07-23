import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { peso, timeAgo } from "@/lib/admin/format";
import { adminGet } from "@/lib/admin/api";
import type { DashboardData } from "@/lib/admin/types";

export const dynamic = "force-dynamic";

const paymentBadge: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-700",
  awaiting: "bg-amber-100 text-amber-700",
  failed: "bg-red-100 text-red-700",
};

export default async function DashboardPage() {
  const { stats, recent_orders, low_stock } = await adminGet<DashboardData>("/api/admin/dashboard");

  return (
    <>
      <PageHeader title="Dashboard" />
      <div className="p-5 lg:p-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Total Orders" value={String(stats.orders_total)} sub={`${stats.orders_pending} pending`} />
          <Stat label="Revenue (All-Time)" value={peso(stats.revenue_total)} sub={`${stats.orders_paid} paid orders`} />
          <Stat label="Revenue Today" value={peso(stats.revenue_today)} accent />
          <Stat
            label="Inventory"
            value={String(stats.products_total)}
            subNode={
              <>
                <span className="font-semibold text-red-600">{stats.products_out_of_stock}</span> out,{" "}
                <span className="font-semibold text-amber-600">{stats.products_low_stock}</span> low
              </>
            }
          />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-gray-200 bg-white lg:col-span-2">
            <header className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <h2 className="font-bold">Recent Orders</h2>
              <Link href="/admin/orders" className="text-sm font-semibold text-brand hover:underline">View all →</Link>
            </header>
            <div className="divide-y divide-gray-100">
              {recent_orders.length === 0 && (
                <p className="px-5 py-8 text-center text-sm text-gray-500">No orders yet.</p>
              )}
              {recent_orders.map((o) => (
                <Link key={o.id} href={`/admin/orders/${o.id}`} className="block px-5 py-3 transition-colors hover:bg-gray-50">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{o.reference} — {o.customer_name}</p>
                      <p className="truncate text-xs text-gray-500">{o.items_count} items · {timeAgo(o.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{peso(o.hardware_subtotal)}</p>
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${paymentBadge[o.payment_status] ?? "bg-gray-100 text-gray-700"}`}>
                        {o.payment_status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white">
            <header className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <h2 className="font-bold">Low Stock</h2>
              <Link href="/admin/products" className="text-sm font-semibold text-brand hover:underline">Manage →</Link>
            </header>
            <div className="divide-y divide-gray-100">
              {low_stock.length === 0 && (
                <p className="px-5 py-8 text-center text-sm text-gray-500">All products in stock 👍</p>
              )}
              {low_stock.map((p) => (
                <div key={p.id} className="px-5 py-3">
                  <p className="truncate text-sm font-semibold">{p.model} — {p.name}</p>
                  <p className={`text-xs ${p.stock <= 0 ? "font-bold text-red-600" : "text-amber-600"}`}>Stock: {p.stock}</p>
                </div>
              ))}
            </div>
          </section>
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
      <p className={`mt-2 text-3xl font-extrabold tracking-tight ${accent ? "text-brand" : ""}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-gray-500">{sub}</p>}
      {subNode && <p className="mt-1 text-xs text-gray-500">{subNode}</p>}
    </div>
  );
}
