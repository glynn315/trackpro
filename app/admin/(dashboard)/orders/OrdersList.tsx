"use client";

import Link from "next/link";
import { peso, timeAgo } from "@/lib/admin/format";
import type { AdminOrder } from "@/lib/admin/types";

const paymentBadge: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-700",
  awaiting: "bg-amber-100 text-amber-700",
  failed: "bg-red-100 text-red-700",
};

export function OrdersList({ items }: { items: AdminOrder[] }) {
  const PayBadge = ({ s }: { s: string }) => (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${paymentBadge[s] ?? "bg-gray-100 text-gray-700"}`}>{s}</span>
  );

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-2xl border border-gray-200 bg-white lg:block">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
              <th className="px-5 py-3">Ref</th>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Items</th>
              <th className="px-5 py-3">Total</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Payment</th>
              <th className="px-5 py-3">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-500">No orders found.</td></tr>
            )}
            {items.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-mono text-xs">
                  <Link href={`/admin/orders/${o.id}`} className="font-semibold text-brand hover:underline">{o.reference}</Link>
                </td>
                <td className="px-5 py-3">
                  <p className="font-medium">{o.customer_name}</p>
                  <p className="text-xs text-gray-500">{o.customer_email}</p>
                </td>
                <td className="px-5 py-3 text-gray-700">{o.items_count ?? 0}</td>
                <td className="px-5 py-3 font-bold">{peso(o.hardware_subtotal)}</td>
                <td className="px-5 py-3"><span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold">{o.status}</span></td>
                <td className="px-5 py-3"><PayBadge s={o.payment_status} /></td>
                <td className="px-5 py-3 text-xs text-gray-500">{timeAgo(o.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 lg:hidden">
        {items.length === 0 && (
          <p className="rounded-2xl border border-gray-200 bg-white px-5 py-10 text-center text-sm text-gray-500">No orders found.</p>
        )}
        {items.map((o) => (
          <Link key={o.id} href={`/admin/orders/${o.id}`} className="block rounded-2xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-sm font-semibold text-brand">{o.reference}</span>
              <span className="text-sm font-bold">{peso(o.hardware_subtotal)}</span>
            </div>
            <p className="mt-1 truncate text-sm font-medium">{o.customer_name}</p>
            <p className="truncate text-xs text-gray-500">{o.customer_email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-gray-100 px-2 py-0.5 font-semibold">{o.status}</span>
              <PayBadge s={o.payment_status} />
              <span className="text-gray-400">{o.items_count ?? 0} items · {timeAgo(o.created_at)}</span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
