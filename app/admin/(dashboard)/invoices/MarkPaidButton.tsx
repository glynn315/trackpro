"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { CustomInvoicePayment } from "@/lib/admin/types";
import { markCustomInvoicePaid, unmarkCustomInvoicePaid } from "./actions";

const METHODS = ["cash", "gcash", "bank transfer", "card", "cheque", "other"];

const fmt = (d: string) =>
  new Date(d).toLocaleString("en-PH", { timeZone: "Asia/Manila", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });

/**
 * "Mark as paid" for a hand-written invoice. Once paid it counts as a sale in
 * Sales Reports (and dashboard revenue / wallets) at the moment it was marked.
 */
export function MarkPaidButton({ id, payment }: { id: number; payment: CustomInvoicePayment }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [method, setMethod] = useState(METHODS[0]);
  const [error, setError] = useState("");

  const run = (action: () => Promise<{ ok: boolean; message?: string }>) => {
    setError("");
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.message ?? "Something went wrong.");
        return;
      }
      router.refresh();
    });
  };

  if (payment.paid) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
          Paid{payment.payment_method ? ` · ${payment.payment_method}` : ""}
        </span>
        {payment.paid_at && <span className="text-xs text-gray-500">{fmt(payment.paid_at)} · in Sales Reports</span>}
        <button
          type="button"
          onClick={() => {
            if (!window.confirm("Undo the payment? The invoice will be removed from the sales reports.")) return;
            run(() => unmarkCustomInvoicePaid(id));
          }}
          disabled={pending}
          className="text-xs font-semibold text-gray-500 underline hover:text-red-600 disabled:opacity-50"
        >
          {pending ? "Undoing…" : "Undo"}
        </button>
        {error && <span className="text-xs text-red-700">{error}</span>}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={method}
        onChange={(e) => setMethod(e.target.value)}
        aria-label="Payment method"
        className="rounded-full border border-gray-300 bg-white px-3 py-2 text-sm capitalize"
      >
        {METHODS.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => run(() => markCustomInvoicePaid(id, method))}
        disabled={pending}
        title="Records the money as received — the invoice then counts as a sale in Sales Reports."
        className="rounded-full border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
      >
        {pending ? "Saving…" : "Mark as Paid"}
      </button>
      {error && <span className="text-xs text-red-700">{error}</span>}
    </div>
  );
}
