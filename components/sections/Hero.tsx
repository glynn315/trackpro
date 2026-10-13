import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { heroFeatures, siteConfig } from "@/lib/site";
import { solutions } from "@/lib/solutions";

export function Hero() {
  return (
    <section
      id="home"
      className="relative isolate overflow-hidden bg-black-pure pt-24 pb-16 text-white sm:pt-28 sm:pb-20 lg:pt-36 lg:pb-28"
    >
      {/* Aurora gradient wash */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-aurora" />

      {/* Static red glows (no animation — keeps the eye calm) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 right-[10%] -z-10 h-72 w-72 rounded-full opacity-60 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(237,28,36,0.45) 0%, transparent 70%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-10 left-[-5%] -z-10 h-80 w-80 rounded-full opacity-40 blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(237,28,36,0.35) 0%, transparent 70%)",
        }}
      />

      {/* Grid overlay with radial mask */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />

      {/* Fine noise grain on top of everything */}
      <div
        aria-hidden
        className="bg-noise pointer-events-none absolute inset-0 -z-10 opacity-[0.18] mix-blend-overlay"
      />
      {/* Giant decorative pin icon */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 top-1/2 -z-10 -translate-y-1/2 opacity-[0.07] sm:-right-20 lg:right-[-8%] lg:opacity-[0.08]"
      >
        <Image
          src="/icon.png"
          alt=""
          width={640}
          height={960}
          className="h-[420px] w-auto sm:h-[560px] lg:h-[720px]"
        />
      </div>

      <Container className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <div className="animate-fade-up">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/85 sm:text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            GPS Tracking &amp; Management Solutions
          </p>
          <h1 className="text-balance text-[2.25rem] font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.75rem]">
            Smarter Tracking. Better Decisions.{" "}
            <span className="bg-linear-to-br from-brand-light via-brand to-brand-dark bg-clip-text text-transparent">
              Optimize Operations.
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/75 sm:mt-6 sm:text-lg">
            {siteConfig.longDescription}
          </p>
          <ul className="mt-6 grid grid-cols-2 gap-x-5 gap-y-2 text-sm text-white/85 sm:grid-cols-3">
            {heroFeatures.map((f) => (
              <li key={f} className="inline-flex items-center gap-2">
                <Icon name="check" className="h-4 w-4 text-brand" />
                {f}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-3">
            <ButtonLink href="/contact?type=demo" variant="primary" size="lg" className="w-full sm:w-auto">
              Request Demo <Icon name="arrow" className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href="/contact" variant="ghost" size="lg" className="w-full sm:w-auto">
              Get a Quote
            </ButtonLink>
          </div>
        </div>

        <div className="relative animate-fade-up delay-200">
          <div
            aria-hidden
            className="absolute -inset-6 rounded-[28px] bg-brand/25 blur-3xl"
          />
          <div className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md sm:rounded-3xl sm:p-7">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/50 sm:text-xs">
                  Fleet Dashboard
                </p>
                <p className="mt-1 text-base font-semibold sm:text-lg">Live vehicle map</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-medium text-emerald-300 sm:text-xs">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                Online
              </span>
            </div>
            <div className="mt-5 grid gap-2.5 sm:gap-3">
              {[
                { plate: "CBP-4294", status: "Moving · 62 km/h", loc: "Cagayan de Oro" },
                { plate: "CCS-7542", status: "Idle · 5 min", loc: "Iligan City" },
                { plate: "CKK-6890", status: "Moving · 48 km/h", loc: "Butuan" },
              ].map((v, i) => (
                <div
                  key={v.plate}
                  className={`flex items-center justify-between rounded-xl border border-white/10 bg-black/40 p-3.5 sm:p-4 animate-fade-up delay-${300 + i * 100}`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand/15 text-brand">
                      <Icon name="truck" className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold sm:text-base">{v.plate}</p>
                      <p className="truncate text-[11px] text-white/60 sm:text-xs">{v.loc}</p>
                    </div>
                  </div>
                  <p className="ml-3 shrink-0 text-[11px] text-white/70 sm:text-xs">{v.status}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>

      <Container className="mt-14 sm:mt-16 lg:mt-24">
        <ul className="grid grid-cols-2 gap-3 border-t border-white/10 pt-8 sm:grid-cols-3 lg:grid-cols-6">
          {solutions.map((s, i) => (
            <li key={s.slug} className={`animate-fade-up delay-${100 + Math.min(i, 5) * 100}`}>
              <a
                href={`/solutions/${s.slug}`}
                className="group flex h-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3.5 text-sm font-semibold transition-colors hover:border-brand/60 hover:bg-brand/10"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand/15 text-brand">
                  <Icon name={s.icon as IconName} className="h-4 w-4" />
                </span>
                <span className="leading-tight">{s.name}</span>
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
