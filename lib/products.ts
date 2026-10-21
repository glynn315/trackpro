import { products as staticProducts } from "@/lib/site";
import { iconNames, type IconName } from "@/components/ui/Icon";
import { API_BASE } from "@/lib/api-base";
import type { StoreMedia } from "@/components/ui/MediaGallery";

/**
 * A catalog product as the storefront renders it.
 *
 * `stock` is the live count when known (from the API), or `null` when the API
 * is unreachable and we fall back to the static catalog.
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
  /** Photos / video clips uploaded in the admin (first = cover). */
  media: readonly StoreMedia[];
  featured?: boolean;
  stock: number | null;
  inStock: boolean;
  /** Add-to-cart choices set per product in the admin (empty / false = not offered). */
  hardwareOptions: readonly HardwareOption[];
  /** null = never configured: every active add-on is offered. */
  addOnSlugs: readonly string[] | null;
  offersBandwidth: boolean;
  /** Video bandwidth packages for this product — its own, or the defaults (resolved by the API). */
  bandwidthOptions: readonly BandwidthPackage[];
  requiresPlan: boolean;
};

/** A hardware variant, e.g. "Device + IoT + Installation" — its price replaces the base price. */
export type HardwareOption = { name: string; price: number; image_url?: string | null };

/** A video bandwidth package, priced per device per month. */
export type BandwidthPackage = { slug: string; name: string; description: string; price: number };

type StaticProduct = (typeof staticProducts)[number];

type ApiProduct = {
  slug: string;
  name: string | null;
  model: string | null;
  category: string | null;
  icon: string | null;
  price: number;
  subscription: number | null;
  tagline: string | null;
  description: string | null;
  highlights: string[] | null;
  media?: StoreMedia[] | null;
  featured: boolean;
  stock: number;
  is_active: boolean;
  hardware_options?: HardwareOption[] | null;
  add_on_slugs?: string[] | null;
  offers_bandwidth?: boolean | null;
  bandwidth_options?: BandwidthPackage[] | null;
  requires_plan?: boolean;
};

const KNOWN_ICONS = new Set<string>(iconNames);
const DEFAULT_ICON: IconName = "map";

/**
 * Build the storefront catalog.
 *
 * The API is the source of truth: every active product in the database shows
 * up, including ones created in the admin dashboard that have no entry in the
 * curated static catalog. The static catalog is used two ways — as a per-field
 * fallback for rows with blanks, and as the whole catalog when the API is
 * unreachable so the marketing site never renders an empty products grid.
 */
export async function getCatalog(): Promise<CatalogProduct[]> {
  const live = await fetchLiveProducts();

  if (!live) return staticProducts.map(fromStatic);

  const staticBySlug = new Map<string, StaticProduct>(
    staticProducts.map((p) => [p.id, p])
  );

  return live
    .filter((p) => p.is_active !== false)
    .map((p) => fromApi(p, staticBySlug.get(p.slug)));
}

/** Live DB row, with the curated static entry filling any blanks. */
function fromApi(live: ApiProduct, base?: StaticProduct): CatalogProduct {
  const highlights =
    Array.isArray(live.highlights) && live.highlights.length > 0
      ? live.highlights
      : base?.highlights ?? [];

  return {
    id: live.slug,
    name: live.name || base?.name || live.slug,
    model: live.model || base?.model || "—",
    category: live.category || base?.category || "GPS",
    icon: normalizeIcon(live.icon || base?.icon),
    price: live.price,
    subscription: live.subscription ?? 0,
    tagline: live.tagline || base?.tagline || "",
    description: live.description || base?.description,
    highlights,
    media: live.media ?? [],
    featured: Boolean(live.featured),
    stock: live.stock,
    inStock: live.stock > 0,
    hardwareOptions: live.hardware_options ?? [],
    addOnSlugs: live.add_on_slugs ?? null,
    offersBandwidth: live.offers_bandwidth !== false,
    bandwidthOptions: live.bandwidth_options ?? [],
    requiresPlan: Boolean(live.requires_plan),
  };
}

/** Static-only fallback used when the API can't be reached. */
function fromStatic(p: StaticProduct): CatalogProduct {
  return {
    ...p,
    icon: normalizeIcon(p.icon),
    media: [],
    featured: "featured" in p ? Boolean(p.featured) : false,
    stock: null,
    inStock: true,
    ...NO_CART_CHOICES,
  };
}

/** Static catalog (API down): no per-product choices are known. */
export const NO_CART_CHOICES = {
  hardwareOptions: [],
  addOnSlugs: [],
  offersBandwidth: false,
  bandwidthOptions: [],
  requiresPlan: false,
} as const;

/**
 * `icon` is a free-text field in the admin product form, so it can be blank or
 * a name we have no artwork for. Fall back rather than render an empty tile.
 */
function normalizeIcon(icon?: string | null): string {
  const key = (icon ?? "").trim().toLowerCase();
  return KNOWN_ICONS.has(key) ? key : DEFAULT_ICON;
}

async function fetchLiveProducts(): Promise<ApiProduct[] | null> {
  try {
    const res = await fetch(`${API_BASE}/api/products`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: ApiProduct[] };
    return Array.isArray(json.data) ? json.data : null;
  } catch {
    return null;
  }
}
