import Link from "next/link";
import type { PageMeta } from "@/lib/admin/types";

/** Build a compact list of page numbers with gaps, e.g. 1 … 4 5 6 … 20. */
function pageWindow(current: number, last: number): (number | "gap")[] {
  const out: (number | "gap")[] = [];
  const span = 1; // pages shown on each side of the current page
  const start = Math.max(1, current - span);
  const end = Math.min(last, current + span);

  if (start > 1) {
    out.push(1);
    if (start > 2) out.push("gap");
  }
  for (let p = start; p <= end; p++) out.push(p);
  if (end < last) {
    if (end < last - 1) out.push("gap");
    out.push(last);
  }
  return out;
}

/**
 * URL-based pagination for the admin tables. Renders Prev / numbered / Next
 * links that preserve the current filter query params and set `page`.
 */
export function Pagination({
  meta,
  params = {},
  className = "",
}: {
  meta: PageMeta;
  params?: Record<string, string | undefined>;
  className?: string;
}) {
  const { current_page, last_page, total } = meta;

  const href = (page: number) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (k !== "page" && v) qs.set(k, v);
    }
    qs.set("page", String(page));
    return `?${qs.toString()}`;
  };

  // Single page (or empty) — show just a count so the footer never looks broken.
  if (last_page <= 1) {
    return total > 0 ? (
      <p className={`py-3 text-center text-xs text-gray-400 ${className}`}>{total} total</p>
    ) : null;
  }

  return (
    <nav className={`mt-4 flex flex-wrap items-center justify-between gap-3 ${className}`}>
      <p className="text-xs text-gray-500">
        Page <span className="font-semibold text-gray-700">{current_page}</span> of {last_page} · {total} total
      </p>
      <div className="flex items-center gap-1">
        <Step href={href(current_page - 1)} disabled={current_page <= 1}>‹ Prev</Step>
        {pageWindow(current_page, last_page).map((p, i) =>
          p === "gap" ? (
            <span key={`gap-${i}`} className="px-1.5 text-xs text-gray-400">…</span>
          ) : (
            <Num key={p} href={href(p)} active={p === current_page}>{p}</Num>
          )
        )}
        <Step href={href(current_page + 1)} disabled={current_page >= last_page}>Next ›</Step>
      </div>
    </nav>
  );
}

function Num({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  const cls =
    "grid h-8 min-w-8 place-items-center rounded-lg px-2 text-sm font-semibold tabular-nums";
  if (active) return <span className={`${cls} bg-brand text-white`}>{children}</span>;
  return (
    <Link href={href} className={`${cls} border border-gray-300 text-gray-700 hover:bg-gray-50`}>
      {children}
    </Link>
  );
}

function Step({ href, disabled, children }: { href: string; disabled: boolean; children: React.ReactNode }) {
  const cls = "grid h-8 place-items-center rounded-lg px-3 text-sm font-semibold";
  if (disabled) {
    return <span className={`${cls} border border-gray-200 text-gray-300`}>{children}</span>;
  }
  return (
    <Link href={href} className={`${cls} border border-gray-300 text-gray-700 hover:bg-gray-50`}>
      {children}
    </Link>
  );
}
