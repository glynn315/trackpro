import { Section } from "@/components/ui/Section";
import { Icon } from "@/components/ui/Icon";
import { BundleInquiryButton } from "@/components/ui/BundleInquiryButton";
import { bundles } from "@/lib/site";

export function Pricing() {
  return (
    <Section
      id="pricing"
      eyebrow="Pricing"
      title="Pick the right TrackPro bundle"
      description="Hardware, installation, and local support — all in one package. No hidden fees."
      surface="soft"
    >
      <div className="grid gap-6 pt-4 lg:grid-cols-3">
        {bundles.map((b) => (
          <article
            key={b.name}
            className={`group relative flex flex-col rounded-2xl border p-6 transition-all duration-300 sm:p-7 ${
              b.highlighted
                ? "border-brand bg-ink text-white shadow-[0_24px_60px_-20px_rgba(237,28,36,0.45)] lg:-translate-y-2"
                : "border-line bg-white text-ink hover:-translate-y-1 hover:border-brand/40 hover:shadow-[0_18px_44px_-14px_rgba(237,28,36,0.18)]"
            }`}
          >
            {/* Clipped decorative layer — top stripe + glow live here so they don't escape card */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
              {b.highlighted && (
                <>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-brand via-brand-light to-brand"
                  />
                  <div
                    aria-hidden
                    className="absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-40 blur-3xl"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(237,28,36,0.45) 0%, transparent 70%)",
                    }}
                  />
                </>
              )}
            </div>

            {/* Badge — sits above the card, not clipped */}
            {b.badge && (
              <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-brand px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-[0_6px_16px_-4px_rgba(237,28,36,0.55)]">
                {b.badge}
              </span>
            )}

            {/* Header */}
            <div className="relative">
              <h3
                className={`text-xl font-extrabold tracking-tight sm:text-2xl ${
                  b.highlighted ? "text-white" : "text-ink"
                }`}
              >
                {b.name}
              </h3>
              <p className={`mt-1.5 text-sm ${b.highlighted ? "text-white/70" : "text-muted"}`}>
                {b.description}
              </p>
            </div>

            {/* Price block */}
            <div className="relative mt-6">
              {b.price ? (
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-3xl font-extrabold tracking-tight sm:text-4xl ${
                      b.highlighted ? "text-white" : "text-ink"
                    }`}
                  >
                    ₱{b.price}
                  </span>
                  <span
                    className={`text-xs font-medium uppercase tracking-wider ${
                      b.highlighted ? "text-white/60" : "text-muted"
                    }`}
                  >
                    {b.priceSuffix}
                  </span>
                </div>
              ) : (
                <div>
                  <p
                    className={`text-[10px] font-bold uppercase tracking-[0.18em] ${
                      b.highlighted ? "text-brand-light" : "text-brand"
                    }`}
                  >
                    {b.priceSuffix === "custom" ? "Custom pricing" : "Get a quote"}
                  </p>
                  <p
                    className={`mt-1 text-lg font-semibold ${
                      b.highlighted ? "text-white" : "text-ink"
                    }`}
                  >
                    Contact us for current rates
                  </p>
                </div>
              )}
            </div>

            {/* Features */}
            <ul
              className={`relative mt-6 flex-1 space-y-3 border-t pt-6 ${
                b.highlighted ? "border-white/10" : "border-line"
              }`}
            >
              {b.features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm">
                  <span
                    className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${
                      b.highlighted ? "bg-brand text-white" : "bg-brand/10 text-brand"
                    }`}
                  >
                    <Icon name="check" className="h-3 w-3" />
                  </span>
                  <span className={b.highlighted ? "text-white/85" : "text-ink"}>{f}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div className="relative mt-7">
              <BundleInquiryButton
                bundleName={b.name}
                bundlePrice={b.price}
                ctaLabel={b.ctaLabel}
                variant={b.highlighted ? "primary" : "secondary"}
              />
            </div>
          </article>
        ))}
      </div>

      <p className="mt-10 text-center text-sm text-muted">
        Not sure which bundle fits?{" "}
        <a href="#contact" className="font-semibold text-brand transition-colors hover:text-brand-dark">
          Message us
        </a>{" "}
        and we&apos;ll recommend the right one for your needs.
      </p>
    </Section>
  );
}
