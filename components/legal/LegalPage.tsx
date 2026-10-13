import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { legalDocs, type LegalBlock, type LegalDoc } from "@/lib/legal";

export function legalMetadata(doc: LegalDoc): Metadata {
  return { title: doc.title, description: doc.description, alternates: { canonical: `/${doc.slug}` } };
}

export function LegalBlocks({ blocks }: { blocks: readonly LegalBlock[] }) {
  return (
    <>
      {blocks.map((b, i) =>
        b.type === "p" ? (
          <p key={i} className="leading-relaxed text-muted">
            {b.text}
          </p>
        ) : b.type === "h3" ? (
          <h3 key={i} className="pt-2 font-semibold italic text-ink">
            {b.text}
          </h3>
        ) : (
          <ul key={i} className="list-disc space-y-1 pl-6 text-muted marker:text-brand">
            {b.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )
      )}
    </>
  );
}

export function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <>
      <Header />
      <main className="flex-1">
        <PageHero eyebrow="Legal & Compliance" title={doc.title} description={doc.description} />
        <section className="bg-white py-12 sm:py-16">
          <Container className="grid gap-10 lg:grid-cols-[220px_1fr]">
            <nav aria-label="Legal documents" className="lg:sticky lg:top-28 lg:self-start">
              <ul className="flex gap-2 overflow-x-auto lg:flex-col lg:gap-1">
                {legalDocs.map((d) => (
                  <li key={d.slug} className="shrink-0">
                    <a
                      href={`/${d.slug}`}
                      aria-current={d.slug === doc.slug ? "page" : undefined}
                      className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        d.slug === doc.slug ? "bg-brand/10 text-brand" : "text-ink/75 hover:bg-soft hover:text-ink"
                      }`}
                    >
                      {d.title}
                    </a>
                  </li>
                ))}
                <li className="shrink-0">
                  <a href="/faqs" className="block rounded-lg px-3 py-2 text-sm font-medium text-ink/75 hover:bg-soft hover:text-ink">
                    FAQs
                  </a>
                </li>
              </ul>
            </nav>

            <article className="max-w-3xl space-y-8 text-[15px]">
              {doc.lastUpdated && <p className="text-sm font-medium text-ink">Last Updated: {doc.lastUpdated}</p>}
              {doc.sections.map((s, i) => (
                <section key={s.heading ?? i} className="space-y-3">
                  {s.heading && <h2 className="text-xl font-bold text-ink">{s.heading}</h2>}
                  <LegalBlocks blocks={s.blocks} />
                </section>
              ))}
            </article>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
