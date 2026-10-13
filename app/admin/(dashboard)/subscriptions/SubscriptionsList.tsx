"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { peso } from "@/lib/admin/format";
import type { AdminSubscription, AdminSubscriptionStatus } from "@/lib/admin/types";
import { deleteSubscription, generateInvoice, updateSubscription } from "./actions";

const statusBadge: Record<AdminSubscriptionStatus, string> = {
  active: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  past_due: "bg-red-100 text-red-700",
  expired: "bg-gray-200 text-gray-600",
  cancelled: "bg-gray-200 text-gray-500",
};

const STATUS_OPTIONS: AdminSubscriptionStatus[] = [
  "active",
  "pending",
  "past_due",
  "expired",
  "cancelled",
];

function fmtDate(value: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}

function renewalNote(days: number): { text: string; className: string } {
  if (days < 0) return { text: `${Math.abs(days)}d overdue`, className: "font-semibold text-red-600" };
  if (days === 0) return { text: "renews today", className: "font-semibold text-amber-600" };
  if (days <= 30) return { text: `in ${days}d`, className: "font-semibold text-amber-600" };
  return { text: `in ${Math.round(days / 30)} months`, className: "text-gray-500" };
}

export function SubscriptionsList({ items }: { items: AdminSubscription[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  function run(id: number, action: () => Promise<{ ok: boolean; message?: string }>) {
    setBusyId(id);
    setError("");
    startTransition(async () => {
      const result = await action();
      setBusyId(null);
      if (!result.ok) setError(result.message ?? "Something went wrong.");
      else router.refresh();
    });
  }

  const changeStatus = (sub: AdminSubscription, status: string) =>
    run(sub.id, () => updateSubscription(sub.id, { status }));

  const invoice = (sub: AdminSubscription) => run(sub.id, () => generateInvoice(sub.id));

  const remove = (sub: AdminSubscription) => {
    const who = sub.customer?.name ? ` for ${sub.customer.name}` : "";
    if (!window.confirm(`Delete subscription ${sub.reference}${who}? Its unpaid invoices are deleted too. This cannot be undone.`)) return;
    run(sub.id, () => deleteSubscription(sub.id));
  };

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-12 text-center">
        <p className="font-semibold text-gray-900">No subscriptions found</p>
        <p className="mt-1 text-sm text-gray-500">
          Subscriptions are created automatically when an order is marked paid — or add one manually below.
        </p>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-2xl border border-gray-200 bg-white lg:block">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Plan</th>
              <th className="px-5 py-3">Devices</th>
              <th className="px-5 py-3 text-right">Per Year</th>
              <th className="px-5 py-3">Renews</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((sub) => {
              const note = renewalNote(sub.days_until_renewal);
              return (
                <tr key={sub.id} className={busyId === sub.id && pending ? "opacity-50" : "hover:bg-gray-50"}>
                  <td className="px-5 py-3">
                    <p className="font-semibold text-gray-900">{sub.customer?.name ?? "—"}</p>
                    <p className="text-xs text-gray-500">{sub.customer?.email}</p>
                    <p className="font-mono text-[11px] text-gray-400">{sub.reference}</p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-gray-900">{sub.plan_name}</p>
                    <p className="text-xs capitalize text-gray-500">
                      {sub.billing_period}
                      {sub.order_reference ? ` · from ${sub.order_reference}` : ""}
                    </p>
                  </td>
                  <td className="px-5 py-3 tabular-nums">{sub.quantity}</td>
                  <td className="px-5 py-3 text-right font-bold">{peso(sub.price)}</td>
                  <td className="px-5 py-3">
                    <p className="text-gray-900">{fmtDate(sub.renews_at)}</p>
                    <p className={`text-xs ${note.className}`}>{note.text}</p>
                  </td>
                  <td className="px-5 py-3">
                    <select
                      value={sub.status}
                      onChange={(e) => changeStatus(sub, e.target.value)}
                      disabled={pending}
                      aria-label={`Status for ${sub.reference}`}
                      className={`rounded-full px-2 py-1 text-xs font-semibold capitalize ${statusBadge[sub.status]}`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                    {sub.unpaid_invoices_count > 0 && (
                      <p className="mt-1 text-[11px] font-semibold text-amber-700">
                        {sub.unpaid_invoices_count} unpaid
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <button
                        type="button"
                        onClick={() => invoice(sub)}
                        disabled={pending}
                        className="text-xs font-semibold text-brand hover:underline disabled:opacity-50"
                      >
                        Raise invoice
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(sub)}
                        disabled={pending}
                        className="text-xs font-semibold text-gray-400 hover:text-red-600 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 lg:hidden">
        {items.map((sub) => {
          const note = renewalNote(sub.days_until_renewal);
          return (
            <div
              key={sub.id}
              className={`rounded-2xl border border-gray-200 bg-white p-4 ${
                busyId === sub.id && pending ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-gray-900">{sub.customer?.name ?? "—"}</p>
                  <p className="truncate text-xs text-gray-500">{sub.customer?.email}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${statusBadge[sub.status]}`}
                >
                  {sub.status.replace("_", " ")}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-900">{sub.plan_name}</p>
              <p className="text-xs text-gray-500">
                {sub.quantity} device{sub.quantity === 1 ? "" : "s"} · {peso(sub.price)}/yr
              </p>
              <p className="mt-2 text-xs">
                Renews {fmtDate(sub.renews_at)} <span className={note.className}>({note.text})</span>
              </p>
              <div className="mt-3 flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => invoice(sub)}
                  disabled={pending}
                  className="text-xs font-semibold text-brand hover:underline disabled:opacity-50"
                >
                  Raise invoice
                </button>
                <select
                  value={sub.status}
                  onChange={(e) => changeStatus(sub, e.target.value)}
                  disabled={pending}
                  aria-label={`Status for ${sub.reference}`}
                  className="rounded-lg border border-gray-300 px-2 py-1 text-xs capitalize"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s.replace("_", " ")}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => remove(sub)}
                  disabled={pending}
                  className="ml-auto text-xs font-semibold text-gray-400 hover:text-red-600 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
