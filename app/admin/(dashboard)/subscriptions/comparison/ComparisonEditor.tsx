"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { peso } from "@/lib/admin/format";
import type { AdminSubscriptionPlan } from "@/lib/admin/types";
import { saveComparison } from "../actions";

type Value = boolean | string;
type Row = { key: number; feature: string; text: boolean; values: Value[] };

const inputCls =
  "w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

let nextKey = 0;

/** Rows from the plans' stored comparison: every feature any plan lists, in first-seen order. */
function initialRows(plans: AdminSubscriptionPlan[]): Row[] {
  const features: string[] = [];
  for (const plan of plans) {
    for (const r of plan.comparison ?? []) {
      if (!features.includes(r.feature)) features.push(r.feature);
    }
  }
  return features.map((feature) => {
    const values = plans.map((p) => p.comparison?.find((r) => r.feature === feature)?.value ?? false);
    return { key: nextKey++, feature, text: values.some((v) => typeof v === "string"), values };
  });
}

/**
 * Grid editor for the homepage comparison table: features down the side,
 * plans across the top, a checkbox (or a short label) in each cell.
 */
export function ComparisonEditor({ plans }: { plans: AdminSubscriptionPlan[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [rows, setRows] = useState<Row[]>(() => initialRows(plans));
  const [dirty, setDirty] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  function change(fn: (rows: Row[]) => Row[]) {
    setRows(fn);
    setDirty(true);
    setNotice(null);
  }

  function patchRow(key: number, patch: Partial<Row>) {
    change((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function setCell(key: number, col: number, value: Value) {
    change((rs) => rs.map((r) => (r.key === key ? { ...r, values: r.values.map((v, i) => (i === col ? value : v)) } : r)));
  }

  function move(index: number, by: -1 | 1) {
    change((rs) => {
      const to = index + by;
      if (to < 0 || to >= rs.length) return rs;
      const copy = [...rs];
      [copy[index], copy[to]] = [copy[to], copy[index]];
      return copy;
    });
  }

  function toggleText(row: Row) {
    // Checkboxes → text starts every cell blank; text → checkboxes ticks any cell that had a label.
    const values = row.text
      ? row.values.map((v) => v !== false && v !== "")
      : row.values.map((v) => (v === true ? "" : v === false ? "" : v));
    patchRow(row.key, { text: !row.text, values });
  }

  function addRow() {
    change((rs) => [...rs, { key: nextKey++, feature: "", text: false, values: plans.map(() => false) }]);
  }

  /** Tick every plan from this column rightwards — handy for tiered plans. */
  function fillFrom(key: number, col: number) {
    change((rs) => rs.map((r) => (r.key === key ? { ...r, values: r.values.map((_, i) => i >= col) } : r)));
  }

  function save() {
    const named = rows.map((r) => ({ ...r, feature: r.feature.trim() })).filter((r) => r.feature);
    const lower = named.map((r) => r.feature.toLowerCase());
    const dupe = lower.find((f, i) => lower.indexOf(f) !== i);
    if (dupe) {
      setNotice({ ok: false, text: `"${named[lower.indexOf(dupe)].feature}" is listed twice — rename or remove one.` });
      return;
    }

    startTransition(async () => {
      const result = await saveComparison({
        features: named.map((r) => r.feature),
        plans: plans.map((p, col) => ({
          id: p.id,
          values: named.map((r) => (typeof r.values[col] === "string" ? (r.values[col] as string).trim() : r.values[col])),
        })),
      });
      setNotice({ ok: result.ok, text: result.message ?? (result.ok ? "Saved." : "Could not save.") });
      if (result.ok) {
        setRows(named);
        setDirty(false);
        router.refresh();
      }
    });
  }

  if (plans.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-12 text-center">
        <p className="font-semibold text-gray-900">No plans yet</p>
        <p className="mt-1 text-sm text-gray-500">Create a plan under the Plans tab first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
        <table className="w-full text-sm" style={{ minWidth: `${360 + plans.length * 130}px` }}>
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th scope="col" className="sticky left-0 z-10 bg-gray-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Feature
              </th>
              {plans.map((p) => (
                <th key={p.id} scope="col" className="px-3 py-3 text-center">
                  <span className={`block font-bold ${p.is_active ? "text-gray-900" : "text-gray-400"}`}>{p.name}</span>
                  <span className="block text-[11px] font-normal text-gray-500">
                    {peso(p.price)}/{p.billing_period === "yearly" ? "yr" : "mo"}
                    {!p.is_active && " · inactive"}
                  </span>
                </th>
              ))}
              <th scope="col" className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                Row
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.length === 0 && (
              <tr>
                <td colSpan={plans.length + 2} className="px-5 py-10 text-center text-sm text-gray-500">
                  No rows yet — add the first feature below.
                </td>
              </tr>
            )}
            {rows.map((row, index) => (
              <tr key={row.key} className="group hover:bg-gray-50/70">
                <td className="sticky left-0 z-10 bg-white px-4 py-2 group-hover:bg-gray-50">
                  <input
                    aria-label="Feature name"
                    value={row.feature}
                    onChange={(e) => patchRow(row.key, { feature: e.target.value })}
                    placeholder="e.g. Real-Time Tracking"
                    className={inputCls}
                  />
                </td>
                {plans.map((p, col) => {
                  const v = row.values[col];
                  return (
                    <td key={p.id} className="px-3 py-2 text-center">
                      {row.text ? (
                        <input
                          aria-label={`${row.feature || "Feature"} — ${p.name}`}
                          value={typeof v === "string" ? v : ""}
                          onChange={(e) => setCell(row.key, col, e.target.value)}
                          placeholder="—"
                          maxLength={60}
                          className={`${inputCls} text-center text-xs`}
                        />
                      ) : (
                        <input
                          type="checkbox"
                          aria-label={`${row.feature || "Feature"} — ${p.name}`}
                          checked={v === true}
                          onChange={(e) => setCell(row.key, col, e.target.checked)}
                          onDoubleClick={() => fillFrom(row.key, col)}
                          title="Double-click to tick this plan and every plan to its right"
                          className="h-4 w-4 cursor-pointer rounded border-gray-300 accent-brand"
                        />
                      )}
                    </td>
                  );
                })}
                <td className="whitespace-nowrap px-3 py-2 text-right text-xs">
                  <button
                    type="button"
                    onClick={() => toggleText(row)}
                    className={`mr-2 rounded-full border px-2 py-0.5 font-semibold ${
                      row.text ? "border-brand bg-brand/10 text-brand" : "border-gray-300 text-gray-500 hover:text-gray-900"
                    }`}
                    title={row.text ? "Switch to checkboxes" : "Switch to text labels"}
                  >
                    {row.text ? "Text" : "✓ / —"}
                  </button>
                  <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move up" className="px-1 text-gray-400 hover:text-gray-900 disabled:opacity-30">
                    ↑
                  </button>
                  <button type="button" onClick={() => move(index, 1)} disabled={index === rows.length - 1} aria-label="Move down" className="px-1 text-gray-400 hover:text-gray-900 disabled:opacity-30">
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => change((rs) => rs.filter((r) => r.key !== row.key))}
                    aria-label="Remove row"
                    className="ml-1 px-1 text-gray-400 hover:text-red-600"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={addRow}
          className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-brand hover:text-brand"
        >
          + Add feature
        </button>
        <div className="flex items-center gap-3">
          {notice && (
            <span className={`text-sm ${notice.ok ? "text-emerald-700" : "text-red-700"}`}>{notice.text}</span>
          )}
          {dirty && !notice && <span className="text-sm text-amber-700">Unsaved changes</span>}
          <button
            type="button"
            onClick={save}
            disabled={pending || !dirty}
            className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save Comparison"}
          </button>
        </div>
      </div>
    </div>
  );
}
