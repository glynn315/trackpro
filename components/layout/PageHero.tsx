import { Container } from "@/components/ui/Container";

/** Dark title band used at the top of inner pages (solutions, contact, legal). */
export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-black-pure pb-14 pt-28 text-white sm:pb-16 sm:pt-32 lg:pt-40">
      <div aria-hidden className="absolute inset-0 -z-10 bg-aurora" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 right-[10%] -z-10 h-72 w-72 rounded-full opacity-60 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(237,28,36,0.45) 0%, transparent 70%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />
      <Container>
        {eyebrow && (
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/85 sm:text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            {eyebrow}
          </p>
        )}
        <h1 className="max-w-3xl text-balance text-[2.1rem] font-extrabold leading-[1.08] tracking-tight sm:text-5xl">{title}</h1>
        {description && <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-white/75 sm:text-lg">{description}</p>}
        {children}
      </Container>
    </section>
  );
}
