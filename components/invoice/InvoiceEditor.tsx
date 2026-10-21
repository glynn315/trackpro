"use client";

import { useState, useTransition } from "react";
import type { InvoiceField, SalesInvoice } from "@/lib/admin/types";
import {
  invoiceDefaultFooter,
  invoiceDefaultFrom,
  InvoiceLabel,
  InvoiceLogo,
  invoicePaperClass,
  invoicePeso as peso,
  InvoicePrintStyles,
} from "@/components/invoice/InvoicePrint";
import { PrintButton } from "@/components/invoice/PrintButton";

export type InvoiceSaveResult = { ok: boolean; message?: string; invoice?: SalesInvoice; edited?: boolean };

/** Inputs look like plain text on the printed page. */
const cell =
  "w-full rounded border border-transparent bg-transparent px-1.5 py-0.5 hover:border-gray-200 focus:border-brand focus:bg-white focus:outline-none print:border-transparent print:px-0";

/** Small-caps caption, editable. */
const caption = "text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400";

/** Screen-only "+ Add …" link. */
const addLink = "text-xs font-semibold text-brand hover:underline print:hidden";

/** Screen-only remove button. */
const removeBtn = "shrink-0 px-1 text-gray-300 hover:text-red-600 print:hidden";

/** An optional field left blank prints nothing rather than an empty line. */
const optional = (value: string | null | undefined) => (value?.trim() ? "" : "print:hidden");

/** Textareas grow with their text so nothing is cut off on paper. */
const rowsFor = (text: string | null | undefined, min = 1) => Math.max(min, (text ?? "").split("\n").length);

/** Invoices saved before a field was editable lack it — start it from the default. */
const withDefaults = (inv: SalesInvoice): SalesInvoice => ({
  ...inv,
  title: inv.title || "Invoice",
  due_date: inv.due_date ?? null,
  notes_label: inv.notes_label || "Notes",
  bill_to_fields: inv.bill_to_fields ?? [],
  details: inv.details ?? [],
  sections: inv.sections ?? [],
  from: inv.from ?? invoiceDefaultFrom(),
  footer: inv.footer ?? invoiceDefaultFooter(),
});

/**
 * Customizable invoice. Everything on the page — letterhead, title, number,
 * dates, bill-to, lines, discount, notes and footer — is editable in place,
 * and the admin can add their own fields and sections. Save keeps the edits;
 * Print produces a clean short-bond (Letter) page with the admin chrome
 * hidden; Reset regenerates it from the source record.
 */
export function InvoiceEditor({
  initial,
  initiallyEdited,
  onSave,
  onReset,
  status,
  paid = false,
  billedAmount,
  hint,
  actions,
}: {
  initial: SalesInvoice;
  initiallyEdited: boolean;
  onSave: (invoice: SalesInvoice) => Promise<InvoiceSaveResult>;
  /** Regenerate from the source record — omitted for invoices that have none. */
  onReset?: () => Promise<InvoiceSaveResult>;
  /** Status stamp under the invoice number (e.g. Paid / Unpaid). */
  status?: { label: string; cls: string };
  /** Settled: show the total as paid with nothing left due. */
  paid?: boolean;
  /** What is actually owed — flags a printout whose total no longer matches it. */
  billedAmount?: number;
  /** Replaces the "generated / saved edits" line above the page. */
  hint?: string;
  /** Extra toolbar buttons, shown before Save. */
  actions?: React.ReactNode;
}) {
  const [inv, setInv] = useState<SalesInvoice>(() => withDefaults(initial));
  const [edited, setEdited] = useState(initiallyEdited);
  const [dirty, setDirty] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const [action, setAction] = useState<"save" | "reset" | null>(null);

  const subtotal = inv.items.reduce((sum, i) => sum + i.qty * i.unit_price, 0);
  const total = Math.max(0, subtotal - (inv.discount || 0));
  const balance = paid ? 0 : total;
  const from = inv.from ?? invoiceDefaultFrom();
  const billToFields = inv.bill_to_fields ?? [];
  const details = inv.details ?? [];
  const sections = inv.sections ?? [];

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
  /** Edit one row of a list the admin can add to and remove from. */
  function patchAt<T>(list: T[], index: number, patch: Partial<T>): T[] {
    return list.map((row, i) => (i === index ? { ...row, ...patch } : row));
  }

  function save() {
    setNotice(null);
    setAction("save");
    startTransition(async () => {
      const r = await onSave(inv);
      if (r.ok) {
        // The template endpoint returns only the template parts — keep the rest on screen.
        if (r.invoice) setInv((cur) => withDefaults({ ...cur, ...r.invoice }));
        setEdited(true);
        setDirty(false);
      }
      setNotice({ ok: r.ok, text: r.ok ? "Invoice saved." : r.message ?? "Could not save." });
    });
  }

  function reset() {
    if (!onReset || !window.confirm("Discard your edits and regenerate this invoice?")) return;
    setNotice(null);
    setAction("reset");
    startTransition(async () => {
      const r = await onReset();
      if (r.ok && r.invoice) {
        setInv(withDefaults(r.invoice));
        setEdited(false);
        setDirty(false);
      }
      setNotice({ ok: r.ok, text: r.ok ? "Invoice regenerated." : r.message ?? "Could not reset." });
    });
  }

  function print() {
    if (dirty && !window.confirm("You have unsaved changes. Print anyway? (They will still be on screen to save after.)")) return;
    window.print();
  }

  const int = (v: string) => Math.max(0, parseInt(v, 10) || 0);
  const mismatch = billedAmount !== undefined && total !== billedAmount;

  return (
    <>
      <InvoicePrintStyles />

      <div className="mx-auto mb-4 flex max-w-[816px] flex-wrap items-center justify-between gap-3 print:hidden">
        <p className="text-xs text-gray-500">
          Click any text to edit it. {hint ?? (edited ? "Showing your saved edits." : "Generated automatically.")}
          {dirty && <span className="ml-1 font-semibold text-amber-700">Unsaved changes.</span>}
        </p>
        <div className="flex gap-2">
          {actions}
          {edited && onReset && (
            <button
              type="button"
              onClick={reset}
              disabled={pending}
              className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              {pending && action === "reset" ? "Resetting…" : "Reset"}
            </button>
          )}
          <button
            type="button"
            onClick={save}
            disabled={pending || !dirty}
            className="rounded-full border border-brand px-4 py-2 text-sm font-semibold text-brand hover:bg-brand/5 disabled:opacity-40"
          >
            {pending && action === "save" ? "Saving…" : "Save"}
          </button>
          <PrintButton label="Print" onPrint={print} />
        </div>
      </div>
      {mismatch && (
        <div className="mx-auto mb-4 max-w-[816px] rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800 print:hidden">
          The printed total ({peso(total)}) differs from the {peso(billedAmount)} billed. Editing the printout does not
          change what the customer owes.
        </div>
      )}
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
          <div className="w-full max-w-xs space-y-2">
            <InvoiceLogo />
            <div className="-ml-1.5 text-[11.5px] leading-relaxed text-gray-500 print:ml-0">
              <input
                aria-label="Company name"
                value={from.name}
                onChange={(e) => update({ from: { ...from, name: e.target.value } })}
                placeholder="Company name"
                className={`${cell} py-0 font-semibold text-gray-800`}
              />
              <textarea
                aria-label="Company address and contact"
                value={from.lines}
                onChange={(e) => update({ from: { ...from, lines: e.target.value } })}
                rows={rowsFor(from.lines)}
                placeholder="Address, phone, email…"
                className={`${cell} block resize-none py-0 leading-relaxed`}
              />
            </div>
          </div>
          <div className="flex flex-col items-end text-right">
            <input
              aria-label="Document title"
              value={inv.title}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="Invoice"
              className={`${cell} w-72 text-right text-[28px] font-extrabold uppercase leading-none tracking-[0.2em] text-gray-900`}
            />
            <input
              aria-label="Invoice number"
              value={inv.number}
              onChange={(e) => update({ number: e.target.value })}
              className={`${cell} mt-2 w-44 text-right font-mono text-sm font-semibold text-gray-700`}
            />
            {status && (
              <span
                className={`mt-2 inline-block rounded border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] ${status.cls}`}
              >
                {status.label}
              </span>
            )}
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
              {billToFields.map((f, i) => (
                <div key={i} className={`flex items-center ${optional(f.value)}`}>
                  <input
                    aria-label="Field name"
                    value={f.label}
                    onChange={(e) => update({ bill_to_fields: patchAt(billToFields, i, { label: e.target.value }) })}
                    placeholder="Field"
                    className={`${cell} w-28 shrink-0 text-gray-500`}
                  />
                  <span className="text-gray-400">:</span>
                  <input
                    aria-label={f.label || "Field value"}
                    value={f.value}
                    onChange={(e) => update({ bill_to_fields: patchAt(billToFields, i, { value: e.target.value }) })}
                    placeholder="Value"
                    className={`${cell} text-gray-600`}
                  />
                  <button type="button" onClick={() => update({ bill_to_fields: billToFields.filter((_, j) => j !== i) })} aria-label="Remove field" className={removeBtn}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => update({ bill_to_fields: [...billToFields, { label: "", value: "" }] })}
              className={`${addLink} mt-1`}
            >
              + Add field
            </button>
          </div>
          <dl className="grid grid-cols-[auto_1fr] items-center gap-x-6 gap-y-1.5 self-start rounded-md bg-gray-50 px-4 py-3 sm:ml-auto sm:min-w-[260px]">
            <dt className={caption}>Invoice date</dt>
            <dd>
              <input
                type="date"
                aria-label="Invoice date"
                value={inv.date}
                onChange={(e) => update({ date: e.target.value })}
                className={`${cell} text-right font-semibold text-gray-900`}
              />
            </dd>
            <dt className={`${caption} ${optional(inv.due_date)}`}>Due date</dt>
            <dd className={`flex items-center ${optional(inv.due_date)}`}>
              <input
                type="date"
                aria-label="Due date"
                value={inv.due_date ?? ""}
                onChange={(e) => update({ due_date: e.target.value || null })}
                className={`${cell} text-right font-semibold text-gray-900 ${inv.due_date ? "" : "text-gray-400"}`}
              />
              {inv.due_date && (
                <button type="button" onClick={() => update({ due_date: null })} aria-label="Remove due date" className={removeBtn}>
                  ✕
                </button>
              )}
            </dd>
            {details.map((f, i) => (
              <DetailRow
                key={i}
                field={f}
                onChange={(patch) => update({ details: patchAt(details, i, patch) })}
                onRemove={() => update({ details: details.filter((_, j) => j !== i) })}
              />
            ))}
            <dt className={caption}>{paid ? "Amount paid" : "Amount due"}</dt>
            <dd className="px-1.5 text-right font-semibold text-gray-900 print:px-0">{peso(total)}</dd>
            <dd className="col-span-2 print:hidden">
              <button type="button" onClick={() => update({ details: [...details, { label: "", value: "" }] })} className={addLink}>
                + Add field
              </button>
            </dd>
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
          className={`${addLink} mt-2 self-start`}
        >
          + Add line
        </button>

        {/* Notes + totals */}
        <section className="invoice-keep mt-6 flex flex-col-reverse gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className={`w-full max-w-sm ${optional(inv.notes)}`}>
            <input
              aria-label="Notes caption"
              value={inv.notes_label ?? ""}
              onChange={(e) => update({ notes_label: e.target.value })}
              placeholder="Notes"
              className={`${cell} ${caption} -ml-1.5 w-48 print:ml-0`}
            />
            <textarea
              value={inv.notes ?? ""}
              onChange={(e) => update({ notes: e.target.value })}
              rows={rowsFor(inv.notes, 3)}
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
            {paid && (
              <div className="flex justify-between px-3">
                <dt className="text-gray-500">Amount paid</dt>
                <dd className="tabular-nums">({peso(total)})</dd>
              </div>
            )}
            <div className="flex items-baseline justify-between rounded-md bg-gray-900 px-3 py-2.5 text-white">
              <dt className="text-[10px] font-bold uppercase tracking-[0.12em]">{paid ? "Balance due" : "Total"}</dt>
              <dd className="text-lg font-extrabold tabular-nums">{peso(balance)}</dd>
            </div>
          </dl>
        </section>

        {/* Admin-added sections, e.g. bank details or warranty */}
        {sections.length > 0 && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {sections.map((s, i) => (
              <div key={i} className={`invoice-keep ${optional(s.body)}`}>
                <div className="-ml-1.5 flex items-center print:ml-0">
                  <input
                    aria-label="Section heading"
                    value={s.label}
                    onChange={(e) => update({ sections: patchAt(sections, i, { label: e.target.value }) })}
                    placeholder="Section heading"
                    className={`${cell} ${caption}`}
                  />
                  <button type="button" onClick={() => update({ sections: sections.filter((_, j) => j !== i) })} aria-label="Remove section" className={removeBtn}>
                    ✕
                  </button>
                </div>
                <textarea
                  aria-label={s.label || "Section text"}
                  value={s.body}
                  onChange={(e) => update({ sections: patchAt(sections, i, { body: e.target.value }) })}
                  rows={rowsFor(s.body, 2)}
                  placeholder="Text…"
                  className={`${cell} -ml-1.5 mt-1 resize-none text-[11.5px] text-gray-600 print:ml-0`}
                />
              </div>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={() => update({ sections: [...sections, { label: "", body: "" }] })}
          className={`${addLink} mt-4 self-start`}
        >
          + Add section
        </button>

        <div className="min-h-10 flex-1" />
        <footer className={`invoice-keep mt-auto border-t border-gray-200 pt-4 ${optional(inv.footer)}`}>
          <textarea
            aria-label="Footer"
            value={inv.footer ?? ""}
            onChange={(e) => update({ footer: e.target.value })}
            rows={rowsFor(inv.footer)}
            placeholder="Footer text…"
            className={`${cell} resize-none text-center text-[11px] leading-relaxed text-gray-500`}
          />
        </footer>
      </article>
    </>
  );
}

/** One admin-added row in the details box: editable caption + value. */
function DetailRow({
  field,
  onChange,
  onRemove,
}: {
  field: InvoiceField;
  onChange: (patch: Partial<InvoiceField>) => void;
  onRemove: () => void;
}) {
  return (
    <>
      <dt className={optional(field.value)}>
        <input
          aria-label="Field name"
          value={field.label}
          onChange={(e) => onChange({ label: e.target.value })}
          placeholder="Field"
          className={`${cell} ${caption} -ml-1.5 w-28 print:ml-0`}
        />
      </dt>
      <dd className={`flex items-center ${optional(field.value)}`}>
        <input
          aria-label={field.label || "Field value"}
          value={field.value}
          onChange={(e) => onChange({ value: e.target.value })}
          placeholder="Value"
          className={`${cell} text-right font-semibold text-gray-900`}
        />
        <button type="button" onClick={onRemove} aria-label="Remove field" className={removeBtn}>
          ✕
        </button>
      </dd>
    </>
  );
}
