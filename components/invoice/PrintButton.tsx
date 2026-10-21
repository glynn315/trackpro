"use client";

/** Opens the browser print dialog — the page prints only `#invoice-sheet`. */
export function PrintButton({ label = "Print / PDF", onPrint }: { label?: string; onPrint?: () => void }) {
  return (
    <button
      type="button"
      onClick={onPrint ?? (() => window.print())}
      className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
    >
      {label}
    </button>
  );
}
