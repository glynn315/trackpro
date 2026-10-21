"use client";

import { useState, useTransition } from "react";
import { saveBandwidthPackages, type BandwidthPackageInput } from "./actions";

const inputCls =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

/**
 * Video bandwidth packages — monthly, per device, added to the platform
 * subscription of products that offer bandwidth (set on each product).
 */
export function BandwidthManager({ initial }: { initial: BandwidthPackageInput[] }) {
  const [rows, setRows] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function update(i: number, patch: Partial<BandwidthPackageInput>) {
    setRows((r) => r.map((row, j) => (j === i ? { ...row, ...patch } : row)));
    setDirty(true);
  }

  function save() {
    setNotice(null);
    startTransition(async () => {
      const r = await saveBandwidthPackages(rows.filter((row) => row.name.trim()));
      if (r.ok) setDirty(false);
      setNotice({ ok: r.ok, text: r.ok ? "Bandwidth packages saved." : r.message ?? "Could not save." });
    });
  }

  return (
    <section className="mt-10 rounded-2xl border border-gray-200 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold">Video Bandwidth</h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-600">
            Monthly data packages for video devices, priced <strong>per device per month</strong>. Customers can add one
            when they pick a platform subscription; it&apos;s paid with the first period and on every renewal. Turn it on
            per product under Products → Edit → Add to cart options.
          </p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={pending || !dirty}
          className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-40"
        >
          {pending ? "Saving…" : "Save packages"}
        </button>
      </div>

      {notice && (
        <p className={`mt-3 rounded-lg border px-3 py-2 text-sm ${notice.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}>
          {notice.text}
        </p>
      )}

      <div className="mt-4 space-y-2">
        {rows.length > 0 && (
          <div className="hidden grid-cols-[1.2fr_1.5fr_8rem_6rem_2rem] gap-2 px-1 text-[11px] font-bold uppercase tracking-wider text-gray-500 sm:grid">
            <span>Name</span>
            <span>Description</span>
            <span>₱ / month</span>
            <span>Active</span>
            <span />
          </div>
        )}
        {rows.map((row, i) => (
          <div key={i} className="grid gap-2 rounded-lg border border-gray-100 p-2 sm:grid-cols-[1.2fr_1.5fr_8rem_6rem_2rem] sm:items-center sm:border-0 sm:p-0">
            <input value={row.name} onChange={(e) => update(i, { name: e.target.value })} placeholder="e.g. 5 GB / month" aria-label="Package name" className={inputCls} />
            <input value={row.description} onChange={(e) => update(i, { description: e.target.value })} placeholder="e.g. About 10 hours of live video" aria-label="Description" className={inputCls} />
            <input
              type="number"
              min={0}
              value={row.price}
              onChange={(e) => update(i, { price: Math.max(0, parseInt(e.target.value, 10) || 0) })}
              aria-label="Price per month"
              className={inputCls}
            />
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={row.is_active} onChange={(e) => update(i, { is_active: e.target.checked })} />
              Active
            </label>
            <button
              type="button"
              onClick={() => {
                setRows((r) => r.filter((_, j) => j !== i));
                setDirty(true);
              }}
              aria-label="Remove package"
              className="text-gray-400 hover:text-red-600"
            >
              ✕
            </button>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="text-sm text-gray-500">
            No packages yet — the Video Bandwidth option stays hidden on products until there is at least one.
          </p>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-sm font-semibold">
        <button
          type="button"
          onClick={() => {
            setRows((r) => [...r, { name: "", description: "", price: 0, is_active: true }]);
            setDirty(true);
          }}
          className="text-brand hover:underline"
        >
          + Add package
        </button>
        {rows.length === 0 && (
          <button
            type="button"
            onClick={() => {
              // Names only — set each price before saving.
              setRows(
                ["2 GB / month", "5 GB / month", "10 GB / month"].map((name) => ({ name, description: "", price: 0, is_active: true }))
              );
              setDirty(true);
            }}
            className="text-gray-600 hover:underline"
          >
            Start with 2 / 5 / 10 GB packages
          </button>
        )}
      </div>
    </section>
  );
}
