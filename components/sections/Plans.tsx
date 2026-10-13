import { Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { getPlans, perPeriod } from "@/lib/plans";
import { PlanComparison } from "@/components/sections/PlanComparison";
import { formatPrice, plansIntro } from "@/lib/site";

export async function Plans() {
  const plans = await getPlans();
  if (plans.length === 0) return null;

  return (
    <Section id="plans" eyebrow="Products" title="Choose Your Plan" description={plansIntro} surface="soft">
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => (
          <article
            key={plan.slug}
            className={`relative flex flex-col overflow-hidden rounded-2xl border bg-white p-6 ${
              plan.is_popular ? "border-brand/50 shadow-[0_18px_44px_-14px_rgba(237,28,36,0.28)]" : "border-line"
            }`}
          >
            {plan.is_popular && (
              <span className="absolute right-4 top-4 rounded-full bg-brand px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                Popular
              </span>
            )}
            <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-ink">{plan.name} Plan</h3>
            <p className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl font-extrabold tracking-tight text-ink">{formatPrice(plan.price)}</span>
              <span className="text-sm text-muted">{perPeriod(plan.billing_period)}</span>
            </p>
            {plan.fleet_size && (
              <p className="mt-1 text-xs font-medium italic text-muted">Fleet Size: {plan.fleet_size}</p>
            )}
            <p className="mt-4 text-sm leading-relaxed text-muted">{plan.description}</p>

            <p className="mt-5 text-[11px] font-bold uppercase tracking-wider text-ink">Includes</p>
            <ul className="mt-2 flex-1 space-y-1.5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-[13px] text-ink">
                  <Icon name="check" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                  {f}
                </li>
              ))}
            </ul>

            {plan.recommended_for.length > 0 && (
              <p className="mt-5 border-t border-line pt-4 text-xs leading-relaxed text-muted">
                <span className="font-semibold text-ink">Recommended for: </span>
                {plan.recommended_for.join(" • ")}
              </p>
            )}
            <ButtonLink
              href="/contact"
              variant={plan.is_popular ? "primary" : "secondary"}
              size="md"
              className="mt-5 w-full"
            >
              Get Started
            </ButtonLink>
          </article>
        ))}
      </div>

      <PlanComparison plans={plans} />
    </Section>
  );
}
