const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

export type StockIssue = {
  productId: string;
  name: string;
  requested: number;
  available: number;
  // "out": active but 0 left · "insufficient": fewer left than requested
  // "unavailable": no longer in the catalog (deactivated/removed)
  reason: "out" | "insufficient" | "unavailable";
};

export type CartLineLike = {
  productId: string;
  name: string;
  qty: number;
};

type ApiProduct = { slug: string; stock: number; is_active: boolean };

/**
 * Confirm cart items are still purchasable against live inventory.
 *
 * Returns one issue per problem line; an empty array means everything is
 * available. Runs in the browser at checkout time and reads fresh (uncached)
 * stock so the customer can't place an order for something just sold out.
 *
 * Fail-open: if the backend is unset or unreachable we return no issues
 * rather than block the order — the website order is email-based and the
 * team confirms manually, so a backend outage must not stop sales.
 */
export async function checkCartStock(
  items: CartLineLike[]
): Promise<StockIssue[]> {
  if (!API_BASE || items.length === 0) return [];

  let products: ApiProduct[];
  try {
    const res = await fetch(`${API_BASE}/api/products`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: ApiProduct[] };
    if (!Array.isArray(json.data)) return [];
    products = json.data;
  } catch {
    return [];
  }

  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const issues: StockIssue[] = [];

  for (const item of items) {
    const p = bySlug.get(item.productId);
    if (!p || p.is_active === false) {
      issues.push({ ...base(item), available: 0, reason: "unavailable" });
    } else if (p.stock <= 0) {
      issues.push({ ...base(item), available: 0, reason: "out" });
    } else if (p.stock < item.qty) {
      issues.push({ ...base(item), available: p.stock, reason: "insufficient" });
    }
  }

  return issues;
}

function base(item: CartLineLike) {
  return { productId: item.productId, name: item.name, requested: item.qty };
}

/** Human-readable explanation for a single stock issue. */
export function describeStockIssue(issue: StockIssue): string {
  switch (issue.reason) {
    case "unavailable":
      return `${issue.name} is no longer available.`;
    case "out":
      return `${issue.name} is out of stock.`;
    case "insufficient":
      return `Only ${issue.available} left of ${issue.name} — you requested ${issue.requested}.`;
  }
}
