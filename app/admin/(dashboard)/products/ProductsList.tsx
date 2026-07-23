"use client";

import Link from "next/link";
import { useState } from "react";
import { peso } from "@/lib/admin/format";
import type { AdminProduct } from "@/lib/admin/types";
import { adjustStock } from "./actions";

function StatusPills({ p }: { p: AdminProduct }) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {p.is_active ? (
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Active</span>
      ) : (
        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-700">Inactive</span>
      )}
      {p.stock <= 0 ? (
        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">No Stock</span>
      ) : p.stock <= 5 ? (
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">Low</span>
      ) : null}
    </div>
  );
}

function stockColor(n: number) {
  return n <= 0 ? "text-red-600" : n <= 5 ? "text-amber-600" : "text-emerald-700";
}

export function ProductsList({ items }: { items: AdminProduct[] }) {
  const [rows, setRows] = useState<AdminProduct[]>(items);

  async function change(id: number, delta: number) {
    const r = await adjustStock(id, delta);
    if (r) setRows((rs) => rs.map((p) => (p.id === id ? { ...p, stock: r.stock } : p)));
  }

  function Stepper({ p }: { p: AdminProduct }) {
    return (
      <div className="flex items-center gap-2">
        <span className={`font-bold ${stockColor(p.stock)}`}>{p.stock}</span>
        <button onClick={() => change(p.id, -1)} className="grid h-6 w-6 place-items-center rounded border border-gray-300 text-xs text-gray-700 hover:bg-gray-100" title="Decrement stock">−</button>
        <button onClick={() => change(p.id, 1)} className="grid h-6 w-6 place-items-center rounded border border-gray-300 text-xs text-gray-700 hover:bg-gray-100" title="Increment stock">+</button>
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-2xl border border-gray-200 bg-white lg:block">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
              <th className="px-5 py-3">Product</th>
              <th className="px-5 py-3">Model</th>
              <th className="px-5 py-3">Price</th>
              <th className="px-5 py-3">Sub/mo</th>
              <th className="px-5 py-3">Stock</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((p) => (
              <tr key={p.id}>
                <td className="px-5 py-3">
                  <p className="font-semibold">
                    {p.name}
                    {p.featured && <span className="ml-1 rounded-full bg-brand px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">Flagship</span>}
                  </p>
                  <p className="text-xs text-gray-500">{p.category}</p>
                </td>
                <td className="px-5 py-3 font-mono text-xs">{p.model}</td>
                <td className="px-5 py-3 font-bold">{peso(p.price)}</td>
                <td className="px-5 py-3 text-gray-700">{p.subscription > 0 ? peso(p.subscription) : "—"}</td>
                <td className="px-5 py-3"><Stepper p={p} /></td>
                <td className="px-5 py-3"><StatusPills p={p} /></td>
                <td className="px-5 py-3 text-right">
                  <Link href={`/admin/products/${p.id}/edit`} className="rounded-lg border border-gray-300 px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50">Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 lg:hidden">
        {rows.map((p) => (
          <div key={p.id} className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold leading-snug">
                  {p.name}
                  {p.featured && <span className="ml-1 rounded-full bg-brand px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">Flagship</span>}
                </p>
                <p className="text-xs text-gray-500">{p.category} · <span className="font-mono">{p.model}</span></p>
              </div>
              <Link href={`/admin/products/${p.id}/edit`} className="shrink-0 rounded-lg border border-gray-300 px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50">Edit</Link>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="font-bold">{peso(p.price)}{p.subscription > 0 && <span className="text-xs font-normal text-gray-500"> + {peso(p.subscription)}/mo</span>}</p>
                <div className="mt-1"><StatusPills p={p} /></div>
              </div>
              <div className="text-right">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Stock</p>
                <Stepper p={p} />
              </div>
            </div>
          </div>
        ))}
      </div>

    </>
  );
}
