"use client";

import Link from "next/link";
import { peso } from "@/lib/admin/format";
import type { AdminPayment } from "@/lib/admin/types";

const statusBadge: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-purple-100 text-purple-700",
};

function fmtDate(d: string | null) {
  return d ? new Date(d).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }) : "—";
}

export function PaymentsList({ items }: { items: AdminPayment[] }) {
  const Badge = ({ s }: { s: string }) => (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusBadge[s] ?? "bg-gray-100 text-gray-700"}`}>{s}</span>
  );

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-2xl border border-gray-200 bg-white lg:block">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
              <th className="px-5 py-3">Order</th>
              <th className="px-5 py-3">Provider</th>
              <th className="px-5 py-3">Method</th>
              <th className="px-5 py-3">Amount</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Paid At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-500">No payments yet.</td></tr>
            )}
            {items.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-5 py-3">
                  {p.order && <Link href={`/admin/orders/${p.order.id}`} className="font-mono text-xs font-semibold text-brand hover:underline">{p.order.reference}</Link>}
                  <p className="text-xs text-gray-500">{p.order?.customer_name}</p>
                </td>
                <td className="px-5 py-3"><span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold uppercase">{p.provider}</span></td>
                <td className="px-5 py-3 text-xs text-gray-700">{p.payment_method ?? "—"}</td>
                <td className="px-5 py-3 font-bold">{peso(p.amount)}</td>
                <td className="px-5 py-3"><Badge s={p.status} /></td>
                <td className="px-5 py-3 text-xs text-gray-500">{fmtDate(p.paid_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 lg:hidden">
        {items.length === 0 && (
          <p className="rounded-2xl border border-gray-200 bg-white px-5 py-10 text-center text-sm text-gray-500">No payments yet.</p>
        )}
        {items.map((p) => (
          <div key={p.id} className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              {p.order ? (
                <Link href={`/admin/orders/${p.order.id}`} className="font-mono text-sm font-semibold text-brand">{p.order.reference}</Link>
              ) : <span className="text-sm text-gray-400">—</span>}
              <span className="text-sm font-bold">{peso(p.amount)}</span>
            </div>
            <p className="mt-0.5 truncate text-xs text-gray-500">{p.order?.customer_name}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-gray-100 px-2 py-0.5 font-semibold uppercase">{p.provider}</span>
              <Badge s={p.status} />
              <span className="text-gray-400">{p.payment_method ?? "—"} · {fmtDate(p.paid_at)}</span>
            </div>
          </div>
        ))}
      </div>

    </>
  );
}
