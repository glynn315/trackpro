"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { peso } from "@/lib/admin/format";
import type { Expense, ExpensesResponse } from "@/lib/admin/types";
import { deleteExpense, updateExpense } from "./actions";

const inputCls =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

// Expense dates are calendar days in Philippine time.
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-PH", { timeZone: "Asia/Manila", month: "short", day: "numeric", year: "numeric" });
}

/**
 * Rows come straight from the server props (not copied into state) so that a
 * new, edited or deleted expense always matches the cashflow totals above.
 */
export function ExpensesList({ items, options }: { items: Expense[]; options: ExpensesResponse["options"] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [error, setError] = useState("");

  function remove(e: Expense) {
    if (!window.confirm(`Delete "${e.title}" (${peso(e.amount)})?`)) return;
    setBusyId(e.id);
    setError("");
    startTransition(async () => {
      const ok = await deleteExpense(e.id);
      setBusyId(null);
      if (!ok) setError("Could not delete the expense.");
      else {
        if (editing?.id === e.id) setEditing(null);
        router.refresh(); // refresh cashflow totals
      }
    });
  }

  function save(e: Expense, formData: FormData) {
    setBusyId(e.id);
    setError("");
    startTransition(async () => {
      const r = await updateExpense(e.id, formData);
      setBusyId(null);
      if (!r.ok) setError(r.message ?? "Could not save the expense.");
      else {
        setEditing(null);
        router.refresh();
      }
    });
  }

  const actions = (e: Expense) => (
    <div className="flex justify-end gap-3">
      <button onClick={() => setEditing(editing?.id === e.id ? null : e)} className="text-xs font-semibold text-brand hover:underline">
        {editing?.id === e.id ? "Close" : "Edit"}
      </button>
      <button
        onClick={() => remove(e)}
        disabled={pending && busyId === e.id}
        className="text-xs font-semibold text-gray-400 hover:text-red-600 disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );

  if (items.length === 0) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white">
        <header className="border-b border-gray-200 px-5 py-4"><h2 className="font-bold">Recent Expenses</h2></header>
        <p className="px-5 py-10 text-center text-sm text-gray-500">No expenses recorded yet.</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white">
      <header className="border-b border-gray-200 px-5 py-4"><h2 className="font-bold">Recent Expenses</h2></header>

      {error && <div className="border-b border-red-200 bg-red-50 px-5 py-3 text-sm text-red-800">{error}</div>}

      {/* Desktop table */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Title</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Paid from</th>
              <th className="px-5 py-3">Invoice Ref.</th>
              <th className="px-5 py-3 text-right">Amount</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((e) =>
              editing?.id === e.id ? (
                <tr key={e.id}>
                  <td colSpan={7} className="bg-gray-50 px-5 py-4">
                    <EditForm expense={e} options={options} busy={pending && busyId === e.id} onSave={save} onCancel={() => setEditing(null)} />
                  </td>
                </tr>
              ) : (
                <tr key={e.id} className={pending && busyId === e.id ? "opacity-50" : "hover:bg-gray-50"}>
                  <td className="px-5 py-3 text-xs text-gray-500">{fmtDate(e.incurred_on)}</td>
                  <td className="px-5 py-3">
                    <p className="font-medium">{e.title}</p>
                    {e.notes && <p className="text-xs text-gray-500">{e.notes}</p>}
                  </td>
                  <td className="px-5 py-3"><span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold">{e.category}</span></td>
                  <td className="px-5 py-3 text-xs text-gray-600">{e.wallet_name ?? "—"}</td>
                  <td className="px-5 py-3 font-mono text-xs text-gray-600">{e.invoice_reference ?? "—"}</td>
                  <td className="px-5 py-3 text-right font-bold text-red-600">−{peso(e.amount)}</td>
                  <td className="px-5 py-3 text-right">{actions(e)}</td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="divide-y divide-gray-100 lg:hidden">
        {items.map((e) => (
          <div key={e.id} className={`px-4 py-3 ${pending && busyId === e.id ? "opacity-50" : ""}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium leading-snug">{e.title}</p>
                <p className="text-xs text-gray-500">
                  <span className="rounded-full bg-gray-100 px-1.5 py-0.5 font-semibold">{e.category}</span> · {fmtDate(e.incurred_on)}
                  {e.wallet_name && <> · {e.wallet_name}</>}
                  {e.invoice_reference && <> · <span className="font-mono">{e.invoice_reference}</span></>}
                </p>
                {e.notes && <p className="mt-0.5 truncate text-xs text-gray-400">{e.notes}</p>}
              </div>
              <div className="shrink-0 text-right">
                <p className="font-bold text-red-600">−{peso(e.amount)}</p>
                <div className="mt-1">{actions(e)}</div>
              </div>
            </div>
            {editing?.id === e.id && (
              <div className="mt-3 rounded-xl bg-gray-50 p-3">
                <EditForm expense={e} options={options} busy={pending && busyId === e.id} onSave={save} onCancel={() => setEditing(null)} />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function EditForm({
  expense,
  options,
  busy,
  onSave,
  onCancel,
}: {
  expense: Expense;
  options: ExpensesResponse["options"];
  busy: boolean;
  onSave: (e: Expense, formData: FormData) => void;
  onCancel: () => void;
}) {
  // Keep a since-deactivated wallet selectable so editing doesn't silently move the expense.
  const wallets =
    expense.wallet_id && !options.wallets.some((w) => w.id === expense.wallet_id)
      ? [...options.wallets, { id: expense.wallet_id, name: `${expense.wallet_name ?? "Wallet"} (inactive)` }]
      : options.wallets;
  const strict = options.categories.filter((c) => c.requires_reference).map((c) => c.name);

  return (
    <form
      onSubmit={(ev) => {
        ev.preventDefault();
        onSave(expense, new FormData(ev.currentTarget));
      }}
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
    >
      <div className="sm:col-span-2 lg:col-span-3">
        <Label>Title</Label>
        <input name="title" required defaultValue={expense.title} className={inputCls} />
      </div>
      <div>
        <Label>Category</Label>
        <select name="expense_category_id" required defaultValue={expense.expense_category_id ?? options.categories[0]?.id} className={inputCls}>
          {options.categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label>Paid from</Label>
        <select name="wallet_id" required defaultValue={expense.wallet_id ?? wallets[0]?.id} className={inputCls}>
          {wallets.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label>Amount (₱)</Label>
        <input name="amount" type="number" min={1} required defaultValue={expense.amount} className={inputCls} />
      </div>
      <div>
        <Label>Date</Label>
        <input name="incurred_on" type="date" required defaultValue={expense.incurred_on.slice(0, 10)} className={inputCls} />
      </div>
      <div>
        <Label>Invoice / OR ref.</Label>
        <input name="invoice_reference" maxLength={100} defaultValue={expense.invoice_reference ?? ""} className={inputCls} />
      </div>
      <div className="sm:col-span-2 lg:col-span-3">
        <Label>Description</Label>
        <textarea name="notes" rows={2} defaultValue={expense.notes ?? ""} className={inputCls} />
        {strict.length > 0 && (
          <p className="mt-1 text-[11px] text-gray-500">
            For <span className="font-semibold">{strict.join(", ")}</span> expenses, a description and the invoice / OR
            reference are required.
          </p>
        )}
      </div>
      <div className="flex gap-3 sm:col-span-2 lg:col-span-3">
        <button disabled={busy} className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50">
          Save Changes
        </button>
        <button type="button" onClick={onCancel} className="text-sm font-semibold text-gray-500 hover:text-gray-900">
          Cancel
        </button>
      </div>
    </form>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">{children}</label>;
}
