import { existsSync } from "node:fs";
import { join } from "node:path";
import Image from "next/image";
import { Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { products } from "@/lib/site";

export function Products() {
  const product = products[0];
  const hasImage = existsSync(join(process.cwd(), "public", product.image));

  return (
    <Section
      id="products"
      eyebrow="Our Product"
      title="The TrackPro 4G GPS Tracker"
      description="One device. Total control. Built to keep your vehicle visible and protected — even against signal jammers."
      surface="white"
    >
      <article className="relative overflow-hidden rounded-3xl border border-line bg-white shadow-[0_24px_60px_-30px_rgba(0,0,0,0.18)]">
        {/* Top accent stripe */}
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 z-20 h-1 bg-linear-to-r from-brand via-brand-light to-brand"
        />
        <div className="grid lg:grid-cols-2">
          {/* Image / placeholder */}
          <div className="relative aspect-4/5 sm:aspect-5/4 lg:aspect-auto lg:min-h-112">
            {hasImage ? (
              <Image
                src={product.image}
                alt={product.imageAlt}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            ) : (
              <ProductPlaceholder />
            )}
            <span className="absolute left-5 top-5 z-10 inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-md">
              <Icon name="shield" className="h-3.5 w-3.5" /> Flagship
            </span>
            <span className="absolute right-5 top-5 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-ink shadow-sm">
              {product.network}
            </span>
          </div>

          {/* Details */}
          <div className="relative flex flex-col p-7 sm:p-10 lg:p-12">
            {/* Soft red glow tucked behind the content for depth */}
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full opacity-40 blur-3xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(237,28,36,0.18) 0%, transparent 70%)",
              }}
            />
            <h3 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
              {product.name}
            </h3>
            <p className="mt-2 text-[15px] leading-relaxed text-muted sm:text-base">
              {product.tagline}
            </p>

            <div className="mt-5 inline-flex items-center gap-2 self-start rounded-full border border-line bg-soft px-3.5 py-1.5 text-xs font-medium text-ink">
              <Icon name="truck" className="h-4 w-4 text-brand" />
              {product.bestFor}
            </div>

            <ul className="mt-7 grid gap-x-6 gap-y-4 sm:grid-cols-2">
              {product.features.map((f) => (
                <li key={f.title} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand">
                    <Icon name="check" className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink">{f.title}</p>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-muted">{f.body}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="#contact" variant="primary" size="lg" className="w-full sm:w-auto">
                Inquire Now <Icon name="arrow" className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="#contact" variant="secondary" size="lg" className="w-full sm:w-auto">
                Request Installation
              </ButtonLink>
            </div>
          </div>
        </div>
      </article>
    </Section>
  );
}

function ProductPlaceholder() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-linear-to-br from-ink via-[#1a1a1a] to-ink">
      {/* Radial red glow */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 70% at 50% 50%, rgba(237,28,36,0.40) 0%, rgba(0,0,0,0) 65%)",
        }}
      />
      {/* Grid overlay */}
      <div
        aria-hidden
        className="bg-dots-light absolute inset-0 opacity-60"
      />
      {/* GPS pulse rings */}
      <div className="absolute inset-0 grid place-items-center">
        {[0, 0.8, 1.6].map((delay) => (
          <span
            key={delay}
            aria-hidden
            className="animate-pulse-ring absolute h-48 w-48 rounded-full border border-brand/40 sm:h-64 sm:w-64"
            style={{ animationDelay: `${delay}s` }}
          />
        ))}
      </div>
      {/* Centered pin icon */}
      <div className="absolute inset-0 grid place-items-center">
        <Image
          src="/icon.png"
          alt=""
          width={400}
          height={600}
          aria-hidden
          className="animate-floaty relative z-10 h-3/5 w-auto opacity-95 drop-shadow-[0_20px_40px_rgba(237,28,36,0.5)]"
        />
      </div>
      {/* Noise overlay */}
      <div
        aria-hidden
        className="bg-noise absolute inset-0 opacity-20 mix-blend-overlay"
      />
    </div>
  );
}
