import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { MessengerButton } from "@/components/ui/MessengerButton";
import { LegalBlocks } from "@/components/legal/LegalPage";
import { faqs } from "@/lib/legal";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQs",
  description: "Answers about TrackPro GPS installation, subscriptions, coverage, and devices.",
  alternates: { canonical: "/faqs" },
};

export default function FaqsPage() {
  const { contact } = siteConfig;
  return (
    <>
      <Header />
      <main className="flex-1">
        <PageHero eyebrow="Customer Support" title="Frequently Asked Questions" />
        <section className="bg-white py-12 sm:py-16">
          <Container className="max-w-3xl">
            <div className="divide-y divide-line rounded-2xl border border-line">
              {faqs.map((f) => (
                <details key={f.q} className="group p-5 sm:p-6">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-soft text-ink transition-transform group-open:rotate-45">
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </span>
                  </summary>
                  <div className="mt-3 space-y-3 text-[15px]">
                    <LegalBlocks blocks={f.a} />
                  </div>
                </details>
              ))}
            </div>

            <div className="mt-10 rounded-2xl bg-ink p-6 text-white sm:p-8">
              <h2 className="text-xl font-bold">Need More Information?</h2>
              <p className="mt-2 text-sm text-white/70">
                If you have additional questions or would like a customized quotation, our team is ready to assist you.
              </p>
              <p className="mt-4 text-sm">
                <span className="font-semibold">Phone:</span>{" "}
                <a className="hover:text-brand-light" href={`tel:${contact.phonePrimary.replace(/\D/g, "")}`}>
                  {contact.phonePrimary}
                </a>
                <br />
                <span className="font-semibold">Email:</span>{" "}
                <a className="hover:text-brand-light" href={`mailto:${contact.email}`}>
                  {contact.email}
                </a>
              </p>
              <ButtonLink href="/contact" variant="primary" size="md" className="mt-6">
                Request a Free Consultation or Quotation Today <Icon name="arrow" className="h-4 w-4" />
              </ButtonLink>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
      <MessengerButton />
    </>
  );
}
