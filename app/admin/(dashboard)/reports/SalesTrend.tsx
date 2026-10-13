"use client";

import { useState } from "react";
import { peso } from "@/lib/admin/format";
import type { SalesReport, SeriesPoint } from "@/lib/admin/types";

const RANGES = [
  { key: "daily", label: "14 days", unit: "day" },
  { key: "monthly", label: "12 months", unit: "month" },
  { key: "yearly", label: "5 years", unit: "year" },
] as const;

type RangeKey = (typeof RANGES)[number]["key"];

/** ₱1.2k / ₱35k / ₱1.4M — short enough for an axis. */
function compact(n: number) {
  if (n >= 1_000_000) return `₱${+(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₱${+(n / 1_000).toFixed(1)}k`;
  return `₱${n}`;
}

/** A tidy axis top: 1, 2, 5 × 10ⁿ at or above the peak. */
function niceMax(peak: number) {
  if (peak <= 0) return 1;
  const pow = 10 ** Math.floor(Math.log10(peak));
  return ([1, 2, 5, 10].find((m) => m * pow >= peak) ?? 10) * pow;
}

/**
 * One compact sales-trend card: a range toggle (14 days / 12 months / 5 years)
 * above a single column chart, with the period's total, best and average.
 */
export function SalesTrend({ report }: { report: Pick<SalesReport, "daily" | "monthly" | "yearly"> }) {
  const [range, setRange] = useState<RangeKey>("daily");
  const [hover, setHover] = useState<number | null>(null);

  const meta = RANGES.find((r) => r.key === range)!;
  const points: SeriesPoint[] = report[range];
  const total = points.reduce((sum, p) => sum + p.total, 0);
  const peak = Math.max(0, ...points.map((p) => p.total));
  const bestIndex = peak > 0 ? points.findIndex((p) => p.total === peak) : -1;
  const max = niceMax(peak);
  const active = points.filter((p) => p.total > 0).length;
  const thin = points.length > 7; // label every other column on phones

  return (
    <section className="mt-8 rounded-2xl border border-gray-200 bg-white">
      <header className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4">
        <h2 className="font-bold">Sales Trend</h2>
        <div role="tablist" aria-label="Chart range" className="flex rounded-lg bg-gray-100 p-0.5 text-xs font-semibold">
          {RANGES.map((r) => (
            <button
              key={r.key}
              type="button"
              role="tab"
              aria-selected={range === r.key}
              onClick={() => {
                setRange(r.key);
                setHover(null);
              }}
              className={`rounded-md px-3 py-1.5 transition-colors ${
                range === r.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </header>

      {/* Period summary */}
      <dl className="grid grid-cols-3 gap-3 px-5 pt-3 text-xs">
        <div>
          <dt className="text-gray-500">Total</dt>
          <dd className="mt-0.5 text-lg font-extrabold tracking-tight text-gray-900">{peso(total)}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Best {meta.unit}</dt>
          <dd className="mt-0.5 truncate text-lg font-extrabold tracking-tight text-gray-900">
            {bestIndex >= 0 ? points[bestIndex].label : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-gray-500">Average / {meta.unit}</dt>
          <dd className="mt-0.5 text-lg font-extrabold tracking-tight text-gray-900">
            {peso(points.length ? total / points.length : 0)}
          </dd>
        </div>
      </dl>

      <div className="px-5 pb-4 pt-9">
        <div className="flex gap-2">
          {/* Y axis */}
          <div className="relative h-40 w-11 shrink-0 text-right text-[10px] tabular-nums text-gray-400">
            <span className="absolute right-0 top-0 -translate-y-1/2">{compact(max)}</span>
            {max >= 2 && <span className="absolute right-0 top-1/2 -translate-y-1/2">{compact(max / 2)}</span>}
            <span className="absolute bottom-0 right-0 translate-y-1/2">₱0</span>
          </div>

          {/* Plot */}
          <div className="relative h-40 min-w-0 flex-1">
            <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
              <div className="border-t border-dashed border-gray-100" />
              <div className="border-t border-dashed border-gray-100" />
              <div className="border-t border-gray-200" />
            </div>

            <div className="relative flex h-full items-end" onMouseLeave={() => setHover(null)}>
              {points.map((p, i) => {
                const pct = (p.total / max) * 100;
                const on = hover === i;
                return (
                  <div
                    key={p.label}
                    tabIndex={0}
                    aria-label={`${p.label}: ${peso(p.total)}`}
                    onMouseEnter={() => setHover(i)}
                    onFocus={() => setHover(i)}
                    onBlur={() => setHover(null)}
                    className="group relative flex h-full flex-1 cursor-default items-end justify-center px-[3px] outline-none"
                  >
                    {/* hover column wash */}
                    <div className={`absolute inset-x-0.5 inset-y-0 rounded-md transition-colors ${on ? "bg-gray-50" : ""}`} />

                    {/* value on the best bar only */}
                    {i === bestIndex && !on && (
                      <span
                        className="absolute z-10 -translate-y-full whitespace-nowrap pb-1 text-[10px] font-bold text-gray-700"
                        style={{ bottom: `${pct}%` }}
                      >
                        {compact(p.total)}
                      </span>
                    )}

                    <div
                      className={`relative w-full max-w-6 rounded-t transition-colors ${
                        p.total > 0 ? (on ? "bg-brand-dark" : "bg-brand") : "bg-gray-200"
                      }`}
                      style={{ height: p.total > 0 ? `max(${pct}%, 4px)` : "2px" }}
                    />

                    {on && (
                      <div
                        className="pointer-events-none absolute z-20 mb-2 -translate-y-full whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1.5 text-center shadow-lg"
                        style={{ bottom: `${Math.max(pct, 2)}%` }}
                      >
                        <p className="text-[10px] text-white/60">{p.label}</p>
                        <p className="text-xs font-bold text-white">{peso(p.total)}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* X axis */}
        <div className="flex gap-2 pt-2">
          <div className="w-11 shrink-0" />
          <div className="flex min-w-0 flex-1">
            {points.map((p, i) => (
              <span
                key={p.label}
                className={`min-w-0 flex-1 truncate text-center text-[10px] ${
                  hover === i ? "font-semibold text-gray-900" : "text-gray-400"
                } ${thin && (points.length - 1 - i) % 2 === 1 ? "invisible sm:visible" : ""}`}
              >
                <span className="hidden sm:inline">
                  {range === "monthly" ? p.label.replace(/ (\d{2})(\d{2})$/, " ’$2") : p.label}
                </span>
                {/* Phones: "13" for a day, "Oct" for a month */}
                <span className="sm:hidden">
                  {range === "daily" ? p.label.split(" ").pop() : range === "monthly" ? p.label.slice(0, 3) : p.label}
                </span>
              </span>
            ))}
          </div>
        </div>

        {active === 0 && <p className="pt-3 text-center text-xs text-gray-400">No paid sales in this period yet.</p>}
      </div>
    </section>
  );
}
