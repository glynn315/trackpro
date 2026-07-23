import { PageHeader } from "@/components/admin/PageHeader";
import { peso } from "@/lib/admin/format";
import { adminGet } from "@/lib/admin/api";
import type { SalesReport, SeriesPoint } from "@/lib/admin/types";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const report = await adminGet<SalesReport>("/api/admin/reports/sales");

  return (
    <>
      <PageHeader title="Sales Reports" />
      <div className="p-5 lg:p-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Total label="Today" value={report.totals.today} accent />
          <Total label="This Month" value={report.totals.month} />
          <Total label="This Year" value={report.totals.year} />
          <Total label="All-Time" value={report.totals.all_time} />
        </div>

        <div className="mt-8 space-y-6">
          <BarChart title="Daily — last 14 days" points={report.daily} />
          <BarChart title="Monthly — last 12 months" points={report.monthly} />
          <BarChart title="Yearly — last 5 years" points={report.yearly} />
        </div>
      </div>
    </>
  );
}

function Total({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
      <p className={`mt-2 text-3xl font-extrabold tracking-tight ${accent ? "text-brand" : ""}`}>{peso(value)}</p>
    </div>
  );
}

/**
 * Vertical bar chart (pure CSS/SVG-free): bars scaled against the period peak,
 * a labelled Y axis, gridlines, and an exact value on hover. Reads top-to-bottom
 * left-to-right like a normal chart, so trends are obvious at a glance.
 */
function BarChart({ title, points }: { title: string; points: SeriesPoint[] }) {
  const peak = Math.max(0, ...points.map((p) => p.total));
  const max = Math.max(1, peak);
  const total = points.reduce((sum, p) => sum + p.total, 0);
  const best = points.reduce<SeriesPoint | null>((b, p) => (p.total > (b?.total ?? -1) ? p : b), null);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 px-5 py-4">
        <h2 className="font-bold">{title}</h2>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          {best && best.total > 0 && (
            <span>Best: <span className="font-semibold text-gray-700">{best.label}</span> · {peso(best.total)}</span>
          )}
          <span>Total <span className="font-semibold text-gray-700">{peso(total)}</span></span>
        </div>
      </header>

      <div className="px-3 py-6 sm:px-5">
        {peak === 0 ? (
          <p className="py-12 text-center text-sm text-gray-400">No paid sales in this period yet.</p>
        ) : (
          <>
            <div className="flex gap-3">
              {/* Y axis */}
              <div className="flex h-56 w-14 shrink-0 flex-col justify-between text-right text-[10px] tabular-nums text-gray-400">
                <span>{peso(max)}</span>
                <span>{peso(Math.round(max / 2))}</span>
                <span>₱0</span>
              </div>

              {/* Plot area */}
              <div className="relative flex-1">
                {/* horizontal gridlines (top / mid / bottom) */}
                <div className="absolute inset-0 flex flex-col justify-between">
                  <div className="border-t border-gray-100" />
                  <div className="border-t border-gray-100" />
                  <div className="border-t border-gray-200" />
                </div>
                {/* bars */}
                <div className="relative flex h-56 items-end gap-1.5 sm:gap-2">
                  {points.map((p, i) => {
                    const active = p.total > 0;
                    const pct = (p.total / max) * 100;
                    return (
                      <div key={i} className="group flex h-full flex-1 items-end justify-center">
                        <div
                          title={`${p.label}: ${peso(p.total)}`}
                          className={`relative w-full max-w-[3.5rem] rounded-t-md transition-colors ${
                            active ? "bg-brand hover:bg-brand-dark" : "bg-gray-100"
                          }`}
                          style={{ height: active ? `max(${pct}%, 6px)` : "6px" }}
                        >
                          <span className="pointer-events-none absolute -top-7 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-1.5 py-0.5 text-[10px] font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                            {peso(p.total)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* X axis labels — aligned under the bars (offset past the Y axis) */}
            <div className="flex gap-3">
              <div className="w-14 shrink-0" />
              <div className="flex flex-1 gap-1.5 pt-2 sm:gap-2">
                {points.map((p, i) => (
                  <span key={i} className="flex-1 text-center text-[10px] leading-tight text-gray-500">
                    {p.label}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
