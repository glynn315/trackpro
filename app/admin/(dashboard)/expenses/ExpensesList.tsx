"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { peso } from "@/lib/admin/format";
import type { Expense } from "@/lib/admin/types";
import { deleteExpense } from "./actions";

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}

export function ExpensesList({ items }: { items: Expense[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<Expense[]>(items);

  async function remove(id: number) {
    const ok = await deleteExpense(id);
    if (ok) {
      setRows((rs) => rs.filter((e) => e.id !== id));
      router.refresh(); // refresh cashflow totals
    }
  }

  if (rows.length === 0) {
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

      {/* Desktop table */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Title</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3 text-right">Amount</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((e) => (
              <tr key={e.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 text-xs text-gray-500">{fmtDate(e.incurred_on)}</td>
                <td className="px-5 py-3">
                  <p className="font-medium">{e.title}</p>
                  {e.notes && <p className="text-xs text-gray-500">{e.notes}</p>}
                </td>
                <td className="px-5 py-3"><span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold">{e.category}</span></td>
                <td className="px-5 py-3 text-right font-bold text-red-600">−{peso(e.amount)}</td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => remove(e.id)} className="text-xs font-semibold text-gray-400 hover:text-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="divide-y divide-gray-100 lg:hidden">
        {rows.map((e) => (
          <div key={e.id} className="flex items-start justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="font-medium leading-snug">{e.title}</p>
              <p className="text-xs text-gray-500">
                <span className="rounded-full bg-gray-100 px-1.5 py-0.5 font-semibold">{e.category}</span> · {fmtDate(e.incurred_on)}
              </p>
              {e.notes && <p className="mt-0.5 truncate text-xs text-gray-400">{e.notes}</p>}
            </div>
            <div className="shrink-0 text-right">
              <p className="font-bold text-red-600">−{peso(e.amount)}</p>
              <button onClick={() => remove(e.id)} className="mt-1 text-xs font-semibold text-gray-400 hover:text-red-600">Delete</button>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
}
