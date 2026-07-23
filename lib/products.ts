import { products as staticProducts } from "@/lib/site";

/**
 * A catalog product enriched with live inventory state from the Laravel API.
 *
 * `stock` is the live count when known (overlaid from the API), or `null`
 * when the API is unreachable and we fall back to the static catalog.
 * `inStock` is what the UI gates on — products with 0 stock render an
 * "Out of Stock" badge and disabled buy buttons.
 */
export type CatalogProduct = {
  id: string;
  name: string;
  model: string;
  category: string;
  icon: string;
  price: number;
  subscription: number;
  tagline: string;
  description?: string;
  highlights: readonly string[];
  featured?: boolean;
  stock: number | null;
  inStock: boolean;
};

type ApiProduct = {
  slug: string;
  stock: number;
  price: number;
  subscription: number;
  is_active: boolean;
};

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

/**
 * Build the storefront catalog by overlaying live inventory (stock/price from
 * the Laravel API) onto the curated static catalog, matched by slug.
 *
 * - API reachable: only products still active are shown, with live stock/price.
 * - API unreachable (or NEXT_PUBLIC_API_URL unset): the full static catalog
 *   renders, all in stock — the marketing site never breaks.
 */
export async function getCatalog(): Promise<CatalogProduct[]> {
  const live = await fetchLiveProducts();

  if (!live) {
    return staticProducts.map((p) => ({
      ...p,
      featured: "featured" in p ? Boolean(p.featured) : false,
      stock: null,
      inStock: true,
    }));
  }

  const bySlug = new Map(live.map((p) => [p.slug, p]));

  return staticProducts
    .filter((p) => bySlug.has(p.id))
    .map((p) => {
      const l = bySlug.get(p.id)!;
      return {
        ...p,
        featured: "featured" in p ? Boolean(p.featured) : false,
        price: l.price,
        subscription: l.subscription,
        stock: l.stock,
        inStock: l.stock > 0,
      };
    });
}

async function fetchLiveProducts(): Promise<ApiProduct[] | null> {
  if (!API_BASE) return null;
  try {
    const res = await fetch(`${API_BASE}/api/products`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: ApiProduct[] };
    return Array.isArray(json.data) ? json.data : null;
  } catch {
    return null;
  }
}
