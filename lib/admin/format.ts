/** ₱ with thousands separators. */
export const peso = (n: number) => "₱" + Math.round(n).toLocaleString("en-PH");

/** Compact relative time, e.g. "3h ago"; falls back to a date for older values. */
export function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}
