import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { Icon, type IconName } from "@/components/ui/Icon";
import { ButtonLink } from "@/components/ui/Button";
import { MessengerButton } from "@/components/ui/MessengerButton";
import { QuoteForm } from "@/components/ui/QuoteForm";
import { getSolution, solutions, type Step } from "@/lib/solutions";

export const dynamicParams = false;

export function generateStaticParams() {
  return solutions.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const solution = getSolution((await params).slug);
  if (!solution) return {};
  return {
    title: solution.name,
    description: solution.summary,
    alternates: { canonical: `/solutions/${solution.slug}` },
  };
}

export default async function SolutionPage({ params }: { params: Promise<{ slug: string }> }) {
  const solution = getSolution((await params).slug);
  if (!solution) notFound();

  return (
    <>
      <Header />
      <main className="flex-1">
        <PageHero eyebrow="Solutions" title={solution.name} description={solution.summary}>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="#get-quote" variant="primary" size="lg">
              Get a Quote <Icon name="arrow" className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href="/products" variant="ghost" size="lg">
              View Products
            </ButtonLink>
          </div>
        </PageHero>

        {/* Other solutions */}
        <nav aria-label="Solutions" className="border-b border-line bg-white">
          <Container className="flex gap-2 overflow-x-auto py-3">
            {solutions.map((s) => (
              <a
                key={s.slug}
                href={`/solutions/${s.slug}`}
                aria-current={s.slug === solution.slug ? "page" : undefined}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  s.slug === solution.slug ? "bg-brand text-white" : "text-ink/75 hover:bg-soft hover:text-ink"
                }`}
              >
                {s.name}
              </a>
            ))}
          </Container>
        </nav>

        {/* About + benefits */}
        <section className="bg-white py-12 sm:py-16">
          <Container className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-14">
            <div>
              <SectionLabel>About {solution.name}</SectionLabel>
              <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-muted">
                {solution.about.map((para) => (
                  <p key={para.slice(0, 32)}>{para}</p>
                ))}
              </div>
            </div>
            <div>
              <SectionLabel>Benefits</SectionLabel>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {solution.benefits.map((col, i) => (
                  <ul key={i} className="space-y-2.5 rounded-2xl border border-line bg-cloud p-5">
                    {col.map((b) => (
                      <li key={b} className="flex items-start gap-2.5 text-sm font-medium text-ink">
                        <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                        {b}
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* How it works */}
        <section className="bg-cloud bg-dots py-12 sm:py-16">
          <Container>
            <SectionTitle eyebrow="How It Works" title={`How ${solution.name} works`} />
            <StepList steps={solution.steps} />
          </Container>
        </section>

        {/* Features */}
        <section className="bg-white py-12 sm:py-16">
          <Container>
            <SectionTitle eyebrow="Features" title={solution.featuresTitle} />
            <div
              className={`grid gap-5 sm:grid-cols-2 ${
                solution.features.length >= 4 ? "lg:grid-cols-3 xl:grid-cols-4" : "lg:grid-cols-2"
              }`}
            >
              {solution.features.map((g) => (
                <article key={g.title} className="flex flex-col rounded-2xl border border-line bg-white p-6">
                  <span className="mb-4 inline-grid h-10 w-10 place-items-center rounded-xl bg-brand/10 text-brand">
                    <Icon name={solution.icon as IconName} className="h-5 w-5" />
                  </span>
                  <h3 className="text-lg font-bold text-ink">{g.title}</h3>
                  {g.intro && <p className="mt-2 text-sm leading-relaxed text-muted">{g.intro}</p>}
                  <ul className="mt-4 space-y-2">
                    {g.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-ink">
                        <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  {g.outro && <p className="mt-4 text-sm leading-relaxed text-muted">{g.outro}</p>}
                </article>
              ))}
            </div>
          </Container>
        </section>

        {solution.extras && (
          <>
            <section className="bg-ink py-12 text-white sm:py-16">
              <Container>
                <SectionTitle eyebrow="Capabilities" title="Key Integration Capabilities" dark />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {solution.extras.capabilities.map((c) => (
                    <div key={c.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                      <h3 className="font-semibold text-white">{c.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-white/70">{c.body}</p>
                    </div>
                  ))}
                </div>
              </Container>
            </section>

            <section className="bg-cloud bg-dots py-12 sm:py-16">
              <Container>
                <SectionTitle eyebrow="Example" title="Automated Workflow" description={solution.extras.workflowIntro} />
                <StepList steps={solution.extras.workflow} />
                <p className="mt-8 text-center text-sm font-medium text-ink">{solution.extras.workflowOutro}</p>

                <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-line bg-white p-6 sm:p-8">
                  <h3 className="text-xl font-bold text-ink">{solution.extras.whyTitle}</h3>
                  <ul className="mt-4 space-y-3">
                    {solution.extras.why.map((w) => (
                      <li key={w.slice(0, 32)} className="flex items-start gap-2.5 text-sm leading-relaxed text-muted">
                        <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                        {w}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-5 font-semibold text-brand">TrackPro – Connecting Fleet Intelligence to your business</p>
                </div>
              </Container>
            </section>
          </>
        )}

        {/* Get a Quote */}
        <section id="get-quote" className="scroll-mt-20 bg-white py-12 sm:py-16">
          <Container className="grid items-start gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
            <div>
              <SectionLabel>Get a Quote</SectionLabel>
              <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                Get a {solution.name} quote for your fleet
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-muted">
                Tell us a little about your vehicles and our team will recommend the right devices, add-ons and
                subscription plan — with a quotation within one business day.
              </p>
            </div>
            <QuoteForm solution={solution.name} />
          </Container>
        </section>
      </main>
      <Footer />
      <MessengerButton />
    </>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand sm:text-sm">{children}</p>;
}

function SectionTitle({
  eyebrow,
  title,
  description,
  dark,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  dark?: boolean;
}) {
  return (
    <header className="mx-auto mb-8 max-w-2xl text-center">
      <SectionLabel>{eyebrow}</SectionLabel>
      <h2 className="mt-3 text-balance text-[1.75rem] font-extrabold leading-tight tracking-tight sm:text-4xl">{title}</h2>
      {description && <p className={`mt-3 text-[15px] ${dark ? "text-white/70" : "text-muted"}`}>{description}</p>}
    </header>
  );
}

function StepList({ steps }: { steps: readonly Step[] }) {
  return (
    <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {steps.map((step, i) => (
        <li key={step.title} className="relative rounded-2xl border border-line bg-white p-5 sm:p-6">
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Step {i + 1}</span>
          <h3 className="mt-1.5 text-base font-bold text-ink">{step.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
        </li>
      ))}
    </ol>
  );
}
