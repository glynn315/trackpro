"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { comparisonRows, perPeriod, type ComparisonValue, type StorePlan } from "@/lib/plans";
import { formatPrice } from "@/lib/site";

/**
 * Plan comparison table. Rows and columns come from the live plans (Admin →
 * Subscriptions → Plans), and visitors can narrow it to the plans they care
 * about or to just the features that differ between them.
 */
export function PlanComparison({ plans }: { plans: readonly StorePlan[] }) {
  const [selected, setSelected] = useState<string[]>(() => plans.map((p) => p.slug));
  const [diffOnly, setDiffOnly] = useState(false);

  const shown = plans.filter((p) => selected.includes(p.slug));
  const rows = comparisonRows(shown).filter((row) => !diffOnly || !allSame(row.values));

  function toggle(slug: string) {
    setSelected((cur) =>
      cur.includes(slug) ? (cur.length > 1 ? cur.filter((s) => s !== slug) : cur) : [...cur, slug]
    );
  }

  if (comparisonRows(plans).length === 0) return null;

  return (
    <div id="compare" className="mt-12 scroll-mt-28">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xl font-extrabold tracking-tight text-ink sm:text-2xl">Compare Plans</h3>
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-ink">
          <input
            type="checkbox"
            checked={diffOnly}
            onChange={(e) => setDiffOnly(e.target.checked)}
            className="h-4 w-4 rounded border-line accent-brand"
          />
          Show differences only
        </label>
      </div>

      <div role="group" aria-label="Plans to compare" className="mb-4 flex flex-wrap gap-2">
        {plans.map((p) => {
          const on = selected.includes(p.slug);
          return (
            <button
              key={p.slug}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(p.slug)}
              className={`rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                on ? "border-brand bg-brand text-white" : "border-line bg-white text-muted hover:border-brand/40 hover:text-ink"
              }`}
            >
              {p.name}
            </button>
          );
        })}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full text-sm" style={{ minWidth: `${240 + shown.length * 120}px` }}>
          <caption className="sr-only">Subscription plan comparison</caption>
          <thead>
            <tr className="border-b border-line bg-ink text-white">
              <th scope="col" className="sticky left-0 z-10 bg-ink px-4 py-4 text-left text-base font-bold sm:px-5">
                Features &amp; Service
              </th>
              {shown.map((p) => (
                <th key={p.slug} scope="col" className={`px-3 py-4 text-center ${p.is_popular ? "bg-brand" : ""}`}>
                  <span className="block font-bold">{p.name}</span>
                  <span className={`block text-xs font-normal ${p.is_popular ? "text-white/85" : "text-white/70"}`}>
                    {formatPrice(p.price)}
                    {perPeriod(p.billing_period)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.length === 0 && (
              <tr>
                <td colSpan={shown.length + 1} className="px-5 py-8 text-center text-sm text-muted">
                  These plans include the same features.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.feature} className="group hover:bg-soft/60">
                <th
                  scope="row"
                  className="sticky left-0 z-10 bg-white px-4 py-2.5 text-left font-medium text-ink group-hover:bg-soft sm:px-5"
                >
                  {row.feature}
                </th>
                {row.values.map((v, i) => (
                  <td
                    key={shown[i].slug}
                    className={`px-3 py-2.5 text-center ${shown[i].is_popular ? "bg-brand/[0.04]" : ""}`}
                  >
                    <Cell value={v} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Cell({ value }: { value: ComparisonValue }) {
  if (value === true) return <Icon name="check" className="mx-auto h-4 w-4 text-brand" />;
  if (value === false) return <span className="text-subtle" aria-label="Not included">—</span>;
  return <span className="text-xs font-medium text-ink">{value}</span>;
}

function allSame(values: ComparisonValue[]): boolean {
  return values.every((v) => v === values[0]);
}
