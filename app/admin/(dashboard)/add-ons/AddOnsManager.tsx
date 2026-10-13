"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { iconNames } from "@/components/ui/Icon";
import { MediaField } from "@/components/admin/MediaField";
import { peso } from "@/lib/admin/format";
import type { AdminAddOn } from "@/lib/admin/types";
import { deleteAddOn, saveAddOn } from "./actions";

const inputCls =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

export function AddOnsManager({ addOns }: { addOns: AdminAddOn[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState<AdminAddOn | null>(null);

  function remove(addOn: AdminAddOn) {
    if (!window.confirm(`Delete "${addOn.name}"? It will disappear from the website.`)) return;

    setNotice("");
    startTransition(async () => {
      const result = await deleteAddOn(addOn.id);
      setNotice(result.message ?? (result.ok ? "Add-on removed." : "Could not remove the add-on."));
      if (result.ok) {
        if (editing?.id === addOn.id) setEditing(null);
        router.refresh();
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <div className="space-y-3">
        {notice && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
            {notice}
          </div>
        )}

        {addOns.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white px-5 py-12 text-center">
            <p className="font-semibold text-gray-900">No add-ons yet</p>
            <p className="mt-1 text-sm text-gray-500">
              Create one on the right. The homepage section stays hidden until there is an active add-on.
            </p>
          </div>
        )}

        {addOns.map((a) => (
          <div
            key={a.id}
            className={`rounded-2xl border bg-white p-5 ${
              a.is_active ? "border-gray-200" : "border-dashed border-gray-300 opacity-70"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-gray-900">{a.name}</h3>
                  {!a.is_active && (
                    <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-600">
                      Hidden
                    </span>
                  )}
                </div>
                {a.subtitle && <p className="text-xs italic text-gray-500">{a.subtitle}</p>}
                <p className="mt-1 font-mono text-[11px] text-gray-400">
                  #{a.sort_order} · {a.slug}
                </p>
              </div>
              <p className="text-xl font-extrabold text-gray-900">{peso(a.price)}</p>
            </div>

            {a.media && a.media.length > 0 && (
              <p className="mt-2 text-[11px] font-semibold text-gray-500">
                {a.media.filter((m) => m.type === "image").length} photo(s) · {a.media.filter((m) => m.type === "video").length} video(s)
              </p>
            )}

            {a.description && <p className="mt-3 text-sm text-gray-600">{a.description}</p>}

            {a.features && a.features.length > 0 && (
              <ul className="mt-3 grid gap-1 text-xs text-gray-600 sm:grid-cols-2">
                {a.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-brand">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            )}

            {a.devices && a.devices.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {a.devices.map((d) => (
                  <span key={d} className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700">
                    {d}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-4 flex justify-end gap-4 border-t border-gray-100 pt-3 text-xs">
              <button type="button" onClick={() => setEditing(a)} className="font-semibold text-brand hover:underline">
                Edit
              </button>
              <button
                type="button"
                onClick={() => remove(a)}
                disabled={pending}
                className="font-semibold text-gray-400 hover:text-red-600 disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create / edit form — `key` remounts it so defaults follow the selection. */}
      <AddOnForm key={editing?.id ?? "new"} addOn={editing} onCancel={() => setEditing(null)} />
    </div>
  );
}

function AddOnForm({ addOn, onCancel }: { addOn: AdminAddOn | null; onCancel: () => void }) {
  return (
    <section className="h-fit rounded-2xl border border-gray-200 bg-white p-5 lg:sticky lg:top-20">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-bold">{addOn ? `Edit ${addOn.name}` : "New add-on"}</h2>
        {addOn && (
          <button type="button" onClick={onCancel} className="text-xs font-semibold text-gray-500 hover:text-brand">
            Cancel
          </button>
        )}
      </div>

      <form action={saveAddOn} className="mt-4 space-y-3">
        {addOn && <input type="hidden" name="id" value={addOn.id} />}

        <div>
          <Label htmlFor="name">Name</Label>
          <input id="name" name="name" required defaultValue={addOn?.name ?? ""} placeholder="e.g. Fuel Sensor" className={inputCls} />
        </div>

        <div>
          <Label htmlFor="subtitle">Subtitle</Label>
          <input
            id="subtitle"
            name="subtitle"
            defaultValue={addOn?.subtitle ?? ""}
            placeholder="e.g. Capacitive Fuel Sensor"
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label htmlFor="price">Price (₱)</Label>
            <input id="price" name="price" type="number" min={0} required defaultValue={addOn?.price ?? 0} className={inputCls} />
          </div>
          <div>
            <Label htmlFor="icon">Icon</Label>
            <select id="icon" name="icon" defaultValue={addOn?.icon ?? "check"} className={inputCls}>
              {iconNames.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="sort_order">Order</Label>
            <input
              id="sort_order"
              name="sort_order"
              type="number"
              min={0}
              defaultValue={addOn?.sort_order ?? ""}
              placeholder="Last"
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <textarea id="description" name="description" rows={3} defaultValue={addOn?.description ?? ""} className={inputCls} />
        </div>

        <div>
          <Label htmlFor="features">Key features (one per line)</Label>
          <textarea
            id="features"
            name="features"
            rows={4}
            defaultValue={(addOn?.features ?? []).join("\n")}
            placeholder={"Real-Time Fuel Level Monitoring\nFuel Theft Detection"}
            className={inputCls}
          />
        </div>

        <div>
          <Label htmlFor="devices">Applicable devices (one per line)</Label>
          <textarea
            id="devices"
            name="devices"
            rows={4}
            defaultValue={(addOn?.devices ?? []).join("\n")}
            placeholder={"TrackPro Fleet\nTrackPro Solar"}
            className={inputCls}
          />
        </div>

        <div>
          <p className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">Photos &amp; video clips</p>
          <MediaField initial={addOn?.media ?? []} />
        </div>

        <div>
          <Label htmlFor="warranty">Warranty</Label>
          <input
            id="warranty"
            name="warranty"
            defaultValue={addOn ? addOn.warranty ?? "" : "1 Year Warranty"}
            className={inputCls}
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={addOn ? addOn.is_active : true}
            className="h-4 w-4 rounded border-gray-300"
          />
          Show on the website
        </label>

        <button className="w-full rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">
          {addOn ? "Save Changes" : "Create Add-on"}
        </button>
      </form>
    </section>
  );
}

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
      {children}
    </label>
  );
}
