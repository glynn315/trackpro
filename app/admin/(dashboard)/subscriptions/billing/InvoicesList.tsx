"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { peso } from "@/lib/admin/format";
import type { AdminSubscriptionInvoice } from "@/lib/admin/types";
import { markInvoicePaid, voidInvoice } from "../actions";

const statusBadge: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-700",
  unpaid: "bg-amber-100 text-amber-700",
  awaiting: "bg-blue-100 text-blue-700",
  void: "bg-gray-200 text-gray-500",
};

const METHODS = ["cash", "gcash", "bank_transfer", "manual"];

function fmtDate(value: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}

/**
 * Renewal invoices with manual settlement — customers who pay in cash or GCash
 * are recorded here, which also rolls their renewal date forward a year.
 */
export function InvoicesList({ items }: { items: AdminSubscriptionInvoice[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [method, setMethod] = useState("cash");
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

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-12 text-center">
        <p className="font-semibold text-gray-900">No invoices found</p>
        <p className="mt-1 text-sm text-gray-500">
          Renewal invoices are raised automatically 30 days before a subscription&apos;s renewal date.
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

      <div className="mb-4 flex items-center gap-2 text-sm">
        <label htmlFor="method" className="font-semibold text-gray-700">
          Record payments as
        </label>
        <select
          id="method"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm"
        >
          {METHODS.map((m) => (
            <option key={m} value={m}>
              {m.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-2xl border border-gray-200 bg-white lg:block">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
              <th className="px-5 py-3">Invoice</th>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Period</th>
              <th className="px-5 py-3">Due</th>
              <th className="px-5 py-3 text-right">Amount</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((invoice) => (
              <tr
                key={invoice.id}
                className={busyId === invoice.id && pending ? "opacity-50" : "hover:bg-gray-50"}
              >
                <td className="px-5 py-3">
                  <p className="font-mono text-xs font-semibold text-gray-900">{invoice.reference}</p>
                  <p className="max-w-xs truncate text-xs text-gray-500">{invoice.description}</p>
                </td>
                <td className="px-5 py-3">
                  <p className="text-gray-900">{invoice.customer?.name ?? "—"}</p>
                  <p className="font-mono text-[11px] text-gray-400">
                    {invoice.subscription?.reference}
                  </p>
                </td>
                <td className="px-5 py-3 text-xs text-gray-500">
                  {fmtDate(invoice.period_start)} → {fmtDate(invoice.period_end)}
                </td>
                <td className="px-5 py-3 text-xs">
                  <span className={invoice.is_overdue ? "font-semibold text-red-600" : "text-gray-500"}>
                    {fmtDate(invoice.due_date)}
                  </span>
                </td>
                <td className="px-5 py-3 text-right font-bold">{peso(invoice.amount)}</td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusBadge[invoice.status]}`}
                  >
                    {invoice.status}
                  </span>
                  {invoice.paid_at && (
                    <p className="mt-1 text-[11px] text-gray-500">
                      {fmtDate(invoice.paid_at)}
                      {invoice.payment_method ? ` · ${invoice.payment_method}` : ""}
                    </p>
                  )}
                </td>
                <td className="px-5 py-3 text-right">
                  {invoice.status !== "paid" && invoice.status !== "void" && (
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => run(invoice.id, () => markInvoicePaid(invoice.id, method))}
                        disabled={pending}
                        className="text-xs font-semibold text-emerald-700 hover:underline disabled:opacity-50"
                      >
                        Mark paid
                      </button>
                      <button
                        type="button"
                        onClick={() => run(invoice.id, () => voidInvoice(invoice.id))}
                        disabled={pending}
                        className="text-xs font-semibold text-gray-400 hover:text-red-600 disabled:opacity-50"
                      >
                        Void
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 lg:hidden">
        {items.map((invoice) => (
          <div
            key={invoice.id}
            className={`rounded-2xl border border-gray-200 bg-white p-4 ${
              busyId === invoice.id && pending ? "opacity-50" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-xs font-semibold text-gray-900">{invoice.reference}</p>
                <p className="truncate text-sm text-gray-900">{invoice.customer?.name ?? "—"}</p>
              </div>
              <p className="shrink-0 font-bold">{peso(invoice.amount)}</p>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className={`rounded-full px-2 py-0.5 font-semibold ${statusBadge[invoice.status]}`}>
                {invoice.status}
              </span>
              <span className={invoice.is_overdue ? "font-semibold text-red-600" : "text-gray-500"}>
                due {fmtDate(invoice.due_date)}
              </span>
            </div>
            {invoice.status !== "paid" && invoice.status !== "void" && (
              <div className="mt-3 flex gap-4">
                <button
                  type="button"
                  onClick={() => run(invoice.id, () => markInvoicePaid(invoice.id, method))}
                  disabled={pending}
                  className="text-xs font-semibold text-emerald-700 hover:underline disabled:opacity-50"
                >
                  Mark paid
                </button>
                <button
                  type="button"
                  onClick={() => run(invoice.id, () => voidInvoice(invoice.id))}
                  disabled={pending}
                  className="text-xs font-semibold text-gray-400 hover:text-red-600 disabled:opacity-50"
                >
                  Void
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
