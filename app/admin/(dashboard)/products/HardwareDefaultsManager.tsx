"use client";

import { useState, useTransition } from "react";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { saveHardwareDefaults, type HardwareDefault } from "./actions";

const inputCls =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

/**
 * Default hardware options — offered on every product that doesn't set its own
 * under Edit → Add to cart options. Each is the product's price plus an extra.
 */
export function HardwareDefaultsManager({ initial }: { initial: HardwareDefault[] }) {
  const [rows, setRows] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function change(next: HardwareDefault[]) {
    setRows(next);
    setDirty(true);
  }

  function save() {
    setNotice(null);
    startTransition(async () => {
      const r = await saveHardwareDefaults(rows.filter((row) => row.name.trim()));
      if (r.ok) setDirty(false);
      setNotice({ ok: r.ok, text: r.ok ? "Default hardware options saved." : r.message ?? "Could not save." });
    });
  }

  return (
    <section className="mt-10 rounded-2xl border border-gray-200 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold">Default hardware options</h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-600">
            Shown in the add-to-cart options of every product that doesn&apos;t have its own. Each option costs the
            product&apos;s price <strong>plus</strong> the extra below. A product&apos;s own list (Edit → Add to cart
            options) always wins.
          </p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={pending || !dirty}
          className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-40"
        >
          {pending ? "Saving…" : "Save defaults"}
        </button>
      </div>

      {notice && (
        <p className={`mt-3 rounded-lg border px-3 py-2 text-sm ${notice.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}>
          {notice.text}
        </p>
      )}

      <div className="mt-4 max-w-xl space-y-2">
        {rows.map((row, i) => (
          <div key={i} className="flex items-start gap-2">
            <ImagePicker
              label="option image"
              value={{ image: row.image ?? null, image_url: row.image_url ?? null }}
              onChange={(img) => change(rows.map((r, j) => (j === i ? { ...r, ...img } : r)))}
            />
            <input
              value={row.name}
              onChange={(e) => change(rows.map((r, j) => (j === i ? { ...r, name: e.target.value } : r)))}
              placeholder="e.g. Device + IoT"
              aria-label="Option name"
              className={inputCls}
            />
            <span className="shrink-0 text-sm text-gray-500">+ ₱</span>
            <input
              type="number"
              min={0}
              value={row.extra}
              onChange={(e) =>
                change(rows.map((r, j) => (j === i ? { ...r, extra: Math.max(0, parseInt(e.target.value, 10) || 0) } : r)))
              }
              aria-label="Extra charge"
              className={`${inputCls} w-32 shrink-0`}
            />
            <button
              type="button"
              onClick={() => change(rows.filter((_, j) => j !== i))}
              aria-label="Remove option"
              className="shrink-0 px-1 text-gray-400 hover:text-red-600"
            >
              ✕
            </button>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="text-sm text-gray-500">None yet — products without their own options sell as a single &quot;Device&quot;.</p>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-sm font-semibold">
        <button type="button" onClick={() => change([...rows, { name: "", extra: 0 }])} className="text-brand hover:underline">
          + Add option
        </button>
        {rows.length === 0 && (
          <button
            type="button"
            onClick={() =>
              change([
                { name: "Device", extra: 0 },
                { name: "Device + IoT", extra: 0 },
                { name: "Device + IoT + Installation", extra: 0 },
              ])
            }
            className="text-gray-600 hover:underline"
          >
            Use Device / IoT / Installation
          </button>
        )}
      </div>
    </section>
  );
}
