"use client";

import { useState } from "react";
import { ImagePicker } from "@/components/admin/ImagePicker";

type BandwidthRow = { name: string; description: string; price: number };

export type CartOptionsValue = {
  hardware_options: { name: string; price: number; image?: string | null; image_url?: string | null }[];
  add_on_slugs: string[];
  offers_bandwidth: boolean;
  /** This product's own packages — empty = the defaults. */
  bandwidth_options: BandwidthRow[];
  requires_plan: boolean;
};

const inputCls =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

/**
 * What customers pick when adding this product to the cart. Posts
 * `hardware_options` and `bandwidth_options` (JSON), `add_on_slugs` (repeated),
 * `offers_bandwidth`, `requires_plan`, plus a `cart_options` marker so
 * unchecked boxes still save.
 */
export function CartOptionsField({
  initial,
  addOns,
  defaultBandwidth,
}: {
  initial: CartOptionsValue;
  addOns: { slug: string; name: string; price: number; is_active: boolean }[];
  /** Active default packages (Add-ons → Video Bandwidth), used when this product has none. */
  defaultBandwidth: BandwidthRow[];
}) {
  const [rows, setRows] = useState(initial.hardware_options);
  const update = (i: number, patch: Partial<(typeof rows)[number]>) =>
    setRows((r) => r.map((row, j) => (j === i ? { ...row, ...patch } : row)));
  const [offersBandwidth, setOffersBandwidth] = useState(initial.offers_bandwidth);
  const [bandwidth, setBandwidth] = useState(initial.bandwidth_options);
  const updateBandwidth = (i: number, patch: Partial<BandwidthRow>) =>
    setBandwidth((r) => r.map((row, j) => (j === i ? { ...row, ...patch } : row)));

  return (
    <div className="space-y-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
      <input type="hidden" name="cart_options" value="1" />
      <input type="hidden" name="hardware_options" value={JSON.stringify(rows)} />
      <input type="hidden" name="bandwidth_options" value={JSON.stringify(bandwidth)} />

      <div>
        <p className="text-sm font-bold text-gray-900">Hardware options</p>
        <p className="mb-2 text-xs text-gray-500">
          Customers must pick one; its price replaces the product price. Add a picture to show on its tile. Leave empty to use the store defaults
          (Products page → Default hardware options).
        </p>
        <div className="space-y-2">
          {rows.map((row, i) => (
            <div key={i} className="flex items-start gap-2">
              <ImagePicker
                label="option image"
                value={{ image: row.image ?? null, image_url: row.image_url ?? null }}
                onChange={(img) => update(i, img)}
              />
              <input
                value={row.name}
                onChange={(e) => update(i, { name: e.target.value })}
                placeholder="e.g. Device + IoT + Installation"
                aria-label="Option name"
                className={inputCls}
              />
              <input
                type="number"
                min={0}
                value={row.price}
                onChange={(e) => update(i, { price: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                aria-label="Option price"
                className={`${inputCls} w-32 shrink-0`}
              />
              <button
                type="button"
                onClick={() => setRows((r) => r.filter((_, j) => j !== i))}
                aria-label="Remove option"
                className="shrink-0 rounded-lg px-2 text-gray-400 hover:bg-white hover:text-red-600"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold">
          <button type="button" onClick={() => setRows((r) => [...r, { name: "", price: 0 }])} className="text-brand hover:underline">
            + Add option
          </button>
          {rows.length === 0 && (
            <button
              type="button"
              onClick={() =>
                setRows([
                  { name: "Device", price: 0 },
                  { name: "Device + IoT", price: 0 },
                  { name: "Device + IoT + Installation", price: 0 },
                ])
              }
              className="text-gray-600 hover:underline"
            >
              Use Device / IoT / Installation
            </button>
          )}
        </div>
      </div>

      <div>
        <p className="text-sm font-bold text-gray-900">Add-ons offered</p>
        <p className="mb-2 text-xs text-gray-500">Optional extras customers can tick. None ticked = section hidden.</p>
        {addOns.length === 0 ? (
          <p className="text-xs text-gray-500">No add-ons yet — create them under Add-ons.</p>
        ) : (
          <div className="grid gap-1.5 sm:grid-cols-2">
            {addOns.map((a) => (
              <label key={a.slug} className="flex items-center gap-2 text-sm text-gray-800">
                <input type="checkbox" name="add_on_slugs" value={a.slug} defaultChecked={initial.add_on_slugs.includes(a.slug)} />
                <span>
                  {a.name} <span className="text-xs text-gray-500">₱{a.price.toLocaleString("en-PH")}</span>
                  {!a.is_active && <span className="ml-1 text-xs text-amber-700">(inactive)</span>}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="flex items-start gap-2 text-sm text-gray-800">
          <input type="checkbox" name="requires_plan" value="1" defaultChecked={initial.requires_plan} className="mt-0.5" />
          <span>
            <span className="font-semibold">Platform subscription required</span>
            <span className="block text-xs text-gray-500">Customer picks a plan; its first period is paid at checkout.</span>
          </span>
        </label>
        <label className="flex items-start gap-2 text-sm text-gray-800">
          <input
            type="checkbox"
            name="offers_bandwidth"
            value="1"
            checked={offersBandwidth}
            onChange={(e) => setOffersBandwidth(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            <span className="font-semibold">Offer video bandwidth</span>
            <span className="block text-xs text-gray-500">
              Optional monthly packages, billed per device with the subscription. Needs the subscription above.
            </span>
          </span>
        </label>
      </div>

      {offersBandwidth && (
        <div>
          <p className="text-sm font-bold text-gray-900">Video bandwidth options</p>
          <p className="mb-2 text-xs text-gray-500">
            Packages for this product, priced per device per month. Leave empty to use the default packages
            {defaultBandwidth.length > 0 ? ` (${defaultBandwidth.map((p) => p.name).join(", ")})` : ""} from Add-ons → Video
            Bandwidth.
          </p>
          <div className="space-y-2">
            {bandwidth.map((row, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1.3fr_8rem_2rem] sm:items-center">
                <input
                  value={row.name}
                  onChange={(e) => updateBandwidth(i, { name: e.target.value })}
                  placeholder="e.g. 5 GB / month"
                  aria-label="Package name"
                  className={inputCls}
                />
                <input
                  value={row.description}
                  onChange={(e) => updateBandwidth(i, { description: e.target.value })}
                  placeholder="Description (optional)"
                  aria-label="Package description"
                  className={inputCls}
                />
                <input
                  type="number"
                  min={0}
                  value={row.price}
                  onChange={(e) => updateBandwidth(i, { price: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                  aria-label="Price per month"
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={() => setBandwidth((r) => r.filter((_, j) => j !== i))}
                  aria-label="Remove package"
                  className="rounded-lg px-2 text-gray-400 hover:bg-white hover:text-red-600"
                >
                  ✕
                </button>
              </div>
            ))}
            {bandwidth.length === 0 && (
              <p className="rounded-lg bg-white px-3 py-2 text-xs text-gray-600">
                {defaultBandwidth.length > 0
                  ? "Using the default packages."
                  : "No default packages yet — add some here or under Add-ons → Video Bandwidth, or the section stays hidden."}
              </p>
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setBandwidth((r) => [...r, { name: "", description: "", price: 0 }])}
              className="text-brand hover:underline"
            >
              + Add option
            </button>
            {bandwidth.length === 0 && defaultBandwidth.length > 0 && (
              <button
                type="button"
                onClick={() => setBandwidth(defaultBandwidth.map(({ name, description, price }) => ({ name, description, price })))}
                className="text-gray-600 hover:underline"
              >
                Copy default packages to edit
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
