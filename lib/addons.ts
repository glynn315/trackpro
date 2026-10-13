import { addOns as staticAddOns } from "@/lib/site";
import { iconNames, type IconName } from "@/components/ui/Icon";
import { API_BASE } from "@/lib/api-base";
import type { StoreMedia } from "@/components/ui/MediaGallery";

/** An optional add-on as the homepage renders it. */
export type StoreAddOn = {
  slug: string;
  name: string;
  subtitle: string;
  price: number;
  icon: IconName;
  description: string;
  features: readonly string[];
  devices: readonly string[];
  media: readonly StoreMedia[];
  warranty: string;
};

type ApiAddOn = {
  slug: string;
  name: string;
  subtitle: string | null;
  price: number;
  icon: string | null;
  description: string | null;
  features: string[] | null;
  devices: string[] | null;
  media?: StoreMedia[] | null;
  warranty: string | null;
};

const KNOWN_ICONS = new Set<string>(iconNames);

/**
 * Active add-ons from the API (managed in Admin → Add-ons). The curated static
 * list in `lib/site.ts` is only used when the API can't be reached, so the
 * homepage never renders an empty section because the backend is down.
 */
export async function getAddOns(): Promise<StoreAddOn[]> {
  const live = await fetchLiveAddOns();
  if (!live) return staticAddOns.map((a) => ({ ...a, slug: a.name, icon: toIcon(a.icon), media: [], warranty: "1 Year Warranty" }));

  return live.map((a) => ({
    slug: a.slug,
    name: a.name,
    subtitle: a.subtitle ?? "",
    price: a.price,
    icon: toIcon(a.icon),
    description: a.description ?? "",
    features: a.features ?? [],
    devices: a.devices ?? [],
    media: a.media ?? [],
    warranty: a.warranty ?? "",
  }));
}

/** `icon` is free text in the admin form — fall back rather than render an empty tile. */
function toIcon(icon?: string | null): IconName {
  const key = (icon ?? "").trim().toLowerCase();
  return KNOWN_ICONS.has(key) ? (key as IconName) : "check";
}

async function fetchLiveAddOns(): Promise<ApiAddOn[] | null> {
  try {
    const res = await fetch(`${API_BASE}/api/add-ons`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: ApiAddOn[] };
    return Array.isArray(json.data) ? json.data : null;
  } catch {
    return null;
  }
}
