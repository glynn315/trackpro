import { planComparison, plans as staticPlans } from "@/lib/site";
import { API_BASE } from "@/lib/api-base";

/** A comparison-table cell: `true` = ✓, `false` = —, a string is shown as-is. */
export type ComparisonValue = boolean | string;

/** A subscription plan as the homepage and product cards render it. */
export type StorePlan = {
  slug: string;
  name: string;
  price: number;
  billing_period: "yearly" | "monthly";
  fleet_size: string | null;
  description: string;
  features: readonly string[];
  recommended_for: readonly string[];
  comparison: readonly { feature: string; value: ComparisonValue }[];
  is_popular: boolean;
};

/**
 * Plans on sale, from the API — the same rows customers subscribe to from their
 * account and are billed by, managed in Admin → Subscriptions → Plans. The
 * static copy in `lib/site.ts` is only used when the API can't be reached.
 */
export async function getPlans(): Promise<StorePlan[]> {
  try {
    const res = await fetch(`${API_BASE}/api/subscription-plans`, { next: { revalidate: 60 } });
    if (res.ok) {
      const json = (await res.json()) as { data?: StorePlan[] };
      if (Array.isArray(json.data)) {
        return json.data.map((p) => ({
          ...p,
          description: p.description ?? "",
          features: p.features ?? [],
          recommended_for: p.recommended_for ?? [],
          comparison: p.comparison ?? [],
        }));
      }
    }
  } catch {
    // fall through to the static copy
  }

  return staticPlans.map((p, i) => ({
    slug: p.key,
    name: p.name,
    price: p.price,
    billing_period: "monthly",
    fleet_size: p.fleetSize,
    description: p.description,
    features: p.includes,
    recommended_for: p.recommendedFor,
    comparison: planComparison.map((row) => ({ feature: row.feature, value: row.values[i] })),
    is_popular: Boolean(p.highlighted),
  }));
}

/** "/month" or "/year" suffix for a price. */
export function perPeriod(period: StorePlan["billing_period"]): string {
  return period === "yearly" ? "/year" : "/month";
}

/**
 * Comparison table rows across plans: every feature any plan lists, in first-
 * seen order; a plan that doesn't list a feature shows "—".
 */
export function comparisonRows(plans: readonly StorePlan[]): { feature: string; values: ComparisonValue[] }[] {
  const features: string[] = [];
  const seen = new Set<string>();
  for (const plan of plans) {
    for (const row of plan.comparison) {
      if (!seen.has(row.feature)) {
        seen.add(row.feature);
        features.push(row.feature);
      }
    }
  }

  return features.map((feature) => ({
    feature,
    values: plans.map((p) => p.comparison.find((r) => r.feature === feature)?.value ?? false),
  }));
}
