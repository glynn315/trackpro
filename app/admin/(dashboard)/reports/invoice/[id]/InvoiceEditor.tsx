"use client";

import { useState, useTransition } from "react";
import type { SalesInvoice } from "@/lib/admin/types";
import {
  InvoiceFooter,
  InvoiceLabel,
  InvoiceLetterhead,
  invoicePaperClass,
  invoicePeso as peso,
  InvoicePrintStyles,
} from "@/components/invoice/InvoicePrint";
import { PrintButton } from "@/components/invoice/PrintButton";
import { resetInvoice, saveInvoice } from "../../actions";

/** Inputs look like plain text on the printed page. */
const cell =
  "w-full rounded border border-transparent bg-transparent px-1.5 py-0.5 hover:border-gray-200 focus:border-brand focus:bg-white focus:outline-none print:border-transparent print:px-0";

/** An optional field left blank prints nothing rather than an empty line. */
const optional = (value: string | null | undefined) => (value?.trim() ? "" : "print:hidden");

/**
 * Basic sales invoice. Every field is editable in place; Save keeps the edits
 * on the order, Print produces a clean short-bond (Letter) page with the
 * admin chrome hidden.
 */
export function InvoiceEditor({
  orderId,
  initial,
  initiallyEdited,
}: {
  orderId: number;
  initial: SalesInvoice;
  initiallyEdited: boolean;
}) {
  const [inv, setInv] = useState<SalesInvoice>(initial);
  const [edited, setEdited] = useState(initiallyEdited);
  const [dirty, setDirty] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const subtotal = inv.items.reduce((sum, i) => sum + i.qty * i.unit_price, 0);
  const total = Math.max(0, subtotal - (inv.discount || 0));

  function update(patch: Partial<SalesInvoice>) {
    setInv((cur) => ({ ...cur, ...patch }));
    setDirty(true);
  }
  function updateBillTo(patch: Partial<SalesInvoice["bill_to"]>) {
    update({ bill_to: { ...inv.bill_to, ...patch } });
  }
  function updateItem(index: number, patch: Partial<SalesInvoice["items"][number]>) {
    update({ items: inv.items.map((it, i) => (i === index ? { ...it, ...patch } : it)) });
  }

  function save() {
    setNotice(null);
    startTransition(async () => {
      const r = await saveInvoice(orderId, inv);
      if (r.ok) {
        setEdited(true);
        setDirty(false);
      }
      setNotice({ ok: r.ok, text: r.ok ? "Invoice saved." : r.message ?? "Could not save." });
    });
  }

  function reset() {
    if (!window.confirm("Discard your edits and regenerate this invoice from the order?")) return;
    setNotice(null);
    startTransition(async () => {
      const r = await resetInvoice(orderId);
      if (r.ok && r.invoice) {
        setInv(r.invoice);
        setEdited(false);
        setDirty(false);
      }
      setNotice({ ok: r.ok, text: r.ok ? "Invoice regenerated from the order." : r.message ?? "Could not reset." });
    });
  }

  const int = (v: string) => Math.max(0, parseInt(v, 10) || 0);

  return (
    <>
      <InvoicePrintStyles />

      <div className="mx-auto mb-4 flex max-w-[816px] flex-wrap items-center justify-between gap-3 print:hidden">
        <p className="text-xs text-gray-500">
          Click any field to edit it. {edited ? "Showing your saved edits." : "Generated from the order."}
          {dirty && <span className="ml-1 font-semibold text-amber-700">Unsaved changes.</span>}
        </p>
        <div className="flex gap-2">
          {edited && (
            <button
              type="button"
              onClick={reset}
              disabled={pending}
              className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              Reset
            </button>
          )}
          <button
            type="button"
            onClick={save}
            disabled={pending || !dirty}
            className="rounded-full border border-brand px-4 py-2 text-sm font-semibold text-brand hover:bg-brand/5 disabled:opacity-40"
          >
            {pending ? "Saving…" : "Save"}
          </button>
          <PrintButton />
        </div>
      </div>
      {notice && (
        <div
          className={`mx-auto mb-4 max-w-[816px] rounded-lg border px-4 py-2 text-sm print:hidden ${
            notice.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {notice.text}
        </div>
      )}

      <article id="invoice-sheet" className={invoicePaperClass}>
        {/* Header */}
        <header className="flex flex-wrap items-start justify-between gap-6">
          <InvoiceLetterhead />
          <div className="text-right">
            <h1 className="text-[28px] font-extrabold uppercase leading-none tracking-[0.2em] text-gray-900">Invoice</h1>
            <input
              aria-label="Invoice number"
              value={inv.number}
              onChange={(e) => update({ number: e.target.value })}
              className={`${cell} mt-2 w-44 text-right font-mono text-sm font-semibold text-gray-700`}
            />
          </div>
        </header>

        <div className="mt-6 h-[3px] bg-brand" />

        {/* Bill to + invoice details */}
        <section className="invoice-keep mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <InvoiceLabel>Bill to</InvoiceLabel>
            <div className="mt-1 grid max-w-sm -ml-1.5 print:ml-0">
              <input value={inv.bill_to.name} onChange={(e) => updateBillTo({ name: e.target.value })} placeholder="Customer name" className={`${cell} text-sm font-bold text-gray-900`} />
              <input value={inv.bill_to.company ?? ""} onChange={(e) => updateBillTo({ company: e.target.value })} placeholder="Company (optional)" className={`${cell} ${optional(inv.bill_to.company)}`} />
              <input value={inv.bill_to.address ?? ""} onChange={(e) => updateBillTo({ address: e.target.value })} placeholder="Address" className={`${cell} text-gray-600 ${optional(inv.bill_to.address)}`} />
              <input value={inv.bill_to.phone ?? ""} onChange={(e) => updateBillTo({ phone: e.target.value })} placeholder="Phone" className={`${cell} text-gray-600 ${optional(inv.bill_to.phone)}`} />
              <input value={inv.bill_to.email ?? ""} onChange={(e) => updateBillTo({ email: e.target.value })} placeholder="Email" className={`${cell} text-gray-600 ${optional(inv.bill_to.email)}`} />
            </div>
          </div>
          <dl className="grid grid-cols-[auto_1fr] items-center gap-x-6 gap-y-1.5 self-start rounded-md bg-gray-50 px-4 py-3 sm:ml-auto sm:min-w-[260px]">
            <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">Invoice date</dt>
            <dd>
              <input
                type="date"
                aria-label="Invoice date"
                value={inv.date}
                onChange={(e) => update({ date: e.target.value })}
                className={`${cell} text-right font-semibold text-gray-900`}
              />
            </dd>
            <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">Amount due</dt>
            <dd className="px-1.5 text-right font-semibold text-gray-900 print:px-0">{peso(total)}</dd>
          </dl>
        </section>

        {/* Line items */}
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse">
            <thead>
              <tr className="bg-gray-900 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                <th className="w-10 px-3 py-2.5">#</th>
                <th className="px-3 py-2.5">Description</th>
                <th className="w-20 px-3 py-2.5 text-right">Qty</th>
                <th className="w-32 px-3 py-2.5 text-right">Unit price</th>
                <th className="w-32 px-3 py-2.5 text-right">Amount</th>
                <th className="w-8 print:hidden" />
              </tr>
            </thead>
            <tbody>
              {inv.items.map((it, i) => (
                <tr key={i} className="border-b border-gray-200">
                  <td className="px-3 py-1.5 text-gray-400">{i + 1}</td>
                  <td className="px-1.5 py-1.5 print:px-3">
                    <input value={it.description} onChange={(e) => updateItem(i, { description: e.target.value })} placeholder="Item description" className={`${cell} font-semibold text-gray-900`} />
                  </td>
                  <td className="px-1.5 py-1.5 print:px-3">
                    <input type="number" min={0} value={it.qty} onChange={(e) => updateItem(i, { qty: int(e.target.value) })} className={`${cell} text-right tabular-nums`} />
                  </td>
                  <td className="px-1.5 py-1.5 print:px-3">
                    <input type="number" min={0} value={it.unit_price} onChange={(e) => updateItem(i, { unit_price: int(e.target.value) })} className={`${cell} text-right tabular-nums`} />
                  </td>
                  <td className="px-3 py-1.5 text-right font-semibold tabular-nums text-gray-900">{peso(it.qty * it.unit_price)}</td>
                  <td className="text-center print:hidden">
                    <button
                      type="button"
                      onClick={() => update({ items: inv.items.filter((_, j) => j !== i) })}
                      disabled={inv.items.length === 1}
                      aria-label="Remove line"
                      className="text-gray-300 hover:text-red-600 disabled:opacity-0"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          type="button"
          onClick={() => update({ items: [...inv.items, { description: "", qty: 1, unit_price: 0 }] })}
          className="mt-2 self-start text-xs font-semibold text-brand hover:underline print:hidden"
        >
          + Add line
        </button>

        {/* Notes + totals */}
        <section className="invoice-keep mt-6 flex flex-col-reverse gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className={`w-full max-w-sm ${optional(inv.notes)}`}>
            <InvoiceLabel>Notes</InvoiceLabel>
            <textarea
              value={inv.notes ?? ""}
              onChange={(e) => update({ notes: e.target.value })}
              rows={3}
              placeholder="Payment terms, warranty, delivery notes…"
              className={`${cell} -ml-1.5 mt-1 resize-none text-[11.5px] text-gray-600 print:ml-0`}
            />
          </div>

          <dl className="w-full space-y-1 sm:ml-auto sm:w-72">
            <div className="flex justify-between px-3">
              <dt className="text-gray-500">Subtotal</dt>
              <dd className="tabular-nums">{peso(subtotal)}</dd>
            </div>
            <div className={`flex items-center justify-between gap-2 pl-3 ${inv.discount ? "" : "print:hidden"}`}>
              <dt className="text-gray-500">Discount</dt>
              <dd className="flex items-center justify-end">
                <span className="text-gray-400">(</span>
                <input
                  type="number"
                  min={0}
                  aria-label="Discount"
                  value={inv.discount}
                  onChange={(e) => update({ discount: int(e.target.value) })}
                  className={`${cell} w-24 text-right tabular-nums`}
                />
                <span className="pr-3 text-gray-400">)</span>
              </dd>
            </div>
            <div className="flex items-baseline justify-between rounded-md bg-gray-900 px-3 py-2.5 text-white">
              <dt className="text-[10px] font-bold uppercase tracking-[0.12em]">Total</dt>
              <dd className="text-lg font-extrabold tabular-nums">{peso(total)}</dd>
            </div>
          </dl>
        </section>

        <div className="min-h-10 flex-1" />
        <InvoiceFooter />
      </article>
    </>
  );
}
