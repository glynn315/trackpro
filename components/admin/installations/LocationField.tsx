"use client";

import { useEffect, useState } from "react";
import { inputCls } from "@/lib/admin/installations";
import { InstallMap } from "./InstallMap";

export type Place = { address: string; lat: number | null; lng: number | null };

type Hit = { place_id: number; display_name: string; lat: string; lon: string };

/**
 * An address with an optional map pin. The pin is what distances are measured
 * from: search OpenStreetMap for the place, or click the map to drop it.
 */
export function LocationField({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: Place;
  onChange: (next: Place) => void;
  placeholder?: string;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [searching, setSearching] = useState(false);
  const pinned = value.lat !== null && value.lng !== null;

  const searchable = term.trim().length >= 3;
  const shownHits = searchable ? hits : [];

  useEffect(() => {
    if (term.trim().length < 3) return;
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=5&countrycodes=ph&q=${encodeURIComponent(term)}`,
          { headers: { Accept: "application/json" } }
        );
        setHits(res.ok ? await res.json() : []);
      } catch {
        setHits([]);
      } finally {
        setSearching(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [term]);

  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
        {label}
        {required && <span className="text-brand"> *</span>}
      </label>
      <div className="flex gap-2">
        <input
          value={value.address}
          onChange={(e) => onChange({ ...value, address: e.target.value })}
          placeholder={placeholder}
          required={required}
          className={inputCls}
        />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={`shrink-0 rounded-lg border px-3 text-xs font-semibold ${
            pinned ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-gray-300 text-gray-600 hover:bg-gray-50"
          }`}
        >
          {pinned ? "📍 Pinned" : "📍 Pin on map"}
        </button>
      </div>
      {pinned && !open && (
        <p className="mt-1 font-mono text-[11px] text-gray-400">
          {value.lat!.toFixed(5)}, {value.lng!.toFixed(5)}
        </p>
      )}

      {open && (
        <div className="mt-2 rounded-xl border border-gray-200 bg-gray-50 p-3">
          <div className="relative">
            <input
              type="search"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
              placeholder="Search a barangay, street or landmark…"
              className={inputCls}
            />
            {(shownHits.length > 0 || (searchable && searching)) && (
              <ul className="absolute inset-x-0 top-full z-[500] mt-1 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                {searching && <li className="px-3 py-2 text-xs text-gray-400">Searching…</li>}
                {shownHits.map((h) => (
                  <li key={h.place_id}>
                    <button
                      type="button"
                      className="block w-full px-3 py-2 text-left text-xs hover:bg-gray-50"
                      onClick={() => {
                        onChange({
                          address: value.address.trim() || h.display_name,
                          lat: parseFloat(h.lat),
                          lng: parseFloat(h.lon),
                        });
                        setHits([]);
                        setTerm("");
                      }}
                    >
                      {h.display_name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="mt-2">
            <InstallMap
              height={240}
              focus={pinned ? { lat: value.lat!, lng: value.lng! } : null}
              onPick={(lat, lng) => onChange({ ...value, lat, lng })}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500">
            <span>Click the map to drop or move the pin.</span>
            <span className="flex gap-3">
              {pinned && (
                <button type="button" className="font-semibold text-gray-500 hover:text-red-600" onClick={() => onChange({ ...value, lat: null, lng: null })}>
                  Remove pin
                </button>
              )}
              <button type="button" className="font-semibold text-brand hover:underline" onClick={() => setOpen(false)}>
                Done
              </button>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
