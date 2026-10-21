import type { StoreAddOn } from "@/lib/addons";
import type { StorePlan } from "@/lib/plans";
import type { BandwidthPackage, CatalogProduct, HardwareOption } from "@/lib/products";

/**
 * Add-to-cart options: what a customer picks for a product (hardware option,
 * add-ons, video bandwidth, platform subscription) and what it costs. Mirrors
 * the API's `CartPricing`, which re-prices every order — this is only what the
 * popup and cart show.
 */

/** What the customer picked, by name / slug — sent to the API as each order item's `options`. */
export type CartOptions = {
  hardware?: string;
  addOns?: string[];
  bandwidth?: string;
  plan?: string;
};

/** Everything a product's options are chosen from. */
export type StoreOptions = {
  addOns: readonly StoreAddOn[];
  plans: readonly StorePlan[];
};

export const EMPTY_STORE_OPTIONS: StoreOptions = { addOns: [], plans: [] };

/** The choices one product offers — an empty list means that section doesn't apply. */
export type ProductChoices = {
  hardware: readonly HardwareOption[];
  addOns: readonly StoreAddOn[];
  bandwidth: readonly BandwidthPackage[];
  plans: readonly StorePlan[];
};

export function productChoices(product: CatalogProduct, store: StoreOptions): ProductChoices {
  const offered = product.addOnSlugs;
  return {
    // No options set up: one "Device" choice at the product price, so the section still shows.
    hardware: product.hardwareOptions.length ? product.hardwareOptions : [{ name: "Device", price: product.price }],
    addOns: offered === null ? store.addOns : store.addOns.filter((a) => offered.includes(a.slug)),
    plans: product.requiresPlan ? store.plans : [],
    // Bandwidth is billed with the plan, so it needs one.
    bandwidth: product.offersBandwidth && product.requiresPlan ? product.bandwidthOptions : [],
  };
}

/** True when adding the product should open the options popup. */
export function hasChoices(c: ProductChoices): boolean {
  // The fallback "Device" choice alone is not a reason to open the popup.
  const realHardware = c.hardware.length > 1 || c.hardware[0]?.name !== "Device";
  return realHardware || c.addOns.length > 0 || c.bandwidth.length > 0 || c.plans.length > 0;
}

export type PricedSelection = {
  hardware: HardwareOption | null;
  addOns: StoreAddOn[];
  plan: StorePlan | null;
  bandwidth: BandwidthPackage | null;
  /** Hardware (or base price) + add-ons, per unit — one-time. */
  unitPrice: number;
  /** Months in one plan period (1 or 12). */
  months: number;
  /** Plan + bandwidth for one period, per unit — paid now, then on every renewal. */
  planUnit: number;
  /** Required sections still to choose. */
  missing: ("hardware" | "plan")[];
};

export function priceSelection(product: CatalogProduct, options: CartOptions, store: StoreOptions): PricedSelection {
  const c = productChoices(product, store);
  const missing: PricedSelection["missing"] = [];

  const hardware = c.hardware.find((h) => h.name === options.hardware) ?? null;
  if (c.hardware.length > 0 && !hardware) missing.push("hardware");

  const addOns = c.addOns.filter((a) => options.addOns?.includes(a.slug));

  const plan = c.plans.find((p) => p.slug === options.plan) ?? null;
  if (c.plans.length > 0 && !plan) missing.push("plan");

  const bandwidth = plan ? c.bandwidth.find((b) => b.slug === options.bandwidth) ?? null : null;
  const months = plan?.billing_period === "yearly" ? 12 : 1;

  return {
    hardware,
    addOns,
    plan,
    bandwidth,
    unitPrice: (hardware?.price ?? product.price) + addOns.reduce((sum, a) => sum + a.price, 0),
    months,
    planUnit: plan ? plan.price + (bandwidth?.price ?? 0) * months : 0,
    missing,
  };
}

/** Only the parts that apply — so identical picks always make the same cart line. */
export function cleanOptions(o: CartOptions): CartOptions | undefined {
  const out: CartOptions = {};
  if (o.hardware) out.hardware = o.hardware;
  if (o.addOns?.length) out.addOns = [...o.addOns].sort();
  if (o.plan) out.plan = o.plan;
  if (o.plan && o.bandwidth) out.bandwidth = o.bandwidth;
  return Object.keys(out).length ? out : undefined;
}

/** Cart line identity: the same product with different picks is a separate line. */
export function lineKey(productId: string, options?: CartOptions): string {
  return options ? `${productId}|${JSON.stringify(options)}` : productId;
}

/** "from ₱x" price for a card — the cheapest hardware option, or the base price. */
export function startingPrice(product: CatalogProduct): number {
  return product.hardwareOptions.length
    ? Math.min(...product.hardwareOptions.map((h) => h.price))
    : product.price;
}

/** "month" / "year". */
export const periodWord = (months: number) => (months === 12 ? "year" : "month");
