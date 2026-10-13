import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { MessengerButton } from "@/components/ui/MessengerButton";
import { QuoteForm } from "@/components/ui/QuoteForm";
import { footer, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Request a quote or demo, or reach TrackPro sales, technical and admin support.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const { contact, location } = siteConfig;
  const tel = (n: string) => `tel:${n.replace(/\D/g, "")}`;

  return (
    <>
      <Header />
      <main className="flex-1">
        <PageHero
          eyebrow="Contact Us"
          title="Contact Us"
          description="Message us and our team will be glad to assist you."
        />

        <section className="bg-cloud bg-dots py-12 sm:py-16">
          <Container className="grid items-start gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-12">
            <QuoteForm withInquiryType defaultType={type === "demo" ? "Request Demo" : "Request Quote"} />

            <aside className="space-y-4">
              <InfoCard icon="map" title="Office">
                <p>
                  {location.address}, {location.city} {location.postalCode}
                </p>
                <p>{location.region}, {location.country}</p>
                <p className="mt-1 text-xs text-muted">{contact.hours}</p>
              </InfoCard>

              <InfoCard icon="support" title="Call us">
                <a className="block font-semibold text-ink hover:text-brand" href={tel(contact.phonePrimary)}>
                  {contact.phonePrimary}
                </a>
                <a className="block font-semibold text-ink hover:text-brand" href={tel(contact.phoneSecondary)}>
                  {contact.phoneSecondary}
                </a>
              </InfoCard>

              <InfoCard icon="geo" title="Customer Support">
                <ul className="space-y-2">
                  {footer.support.map((s) => (
                    <li key={s.label}>
                      <span className="block text-xs font-semibold uppercase tracking-wider text-muted">{s.label}</span>
                      <a className="break-all font-medium text-ink hover:text-brand" href={`mailto:${s.email}`}>
                        {s.email}
                      </a>
                    </li>
                  ))}
                </ul>
              </InfoCard>

              <a
                href={contact.messenger}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 rounded-2xl bg-linear-to-br from-[#00B2FF] via-[#0084FF] to-[#0066FF] p-5 text-white transition-transform hover:-translate-y-0.5"
              >
                <div className="flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-white/80">Fastest reply</p>
                  <p className="mt-0.5 font-semibold">Message us on Messenger</p>
                </div>
                <Icon name="arrow" className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </a>

              <p className="text-sm text-muted">
                Have a question first? See our{" "}
                <a href="/faqs" className="font-semibold text-brand hover:underline">
                  FAQs
                </a>
                .
              </p>
            </aside>
          </Container>
        </section>
      </main>
      <Footer />
      <MessengerButton />
    </>
  );
}

function InfoCard({ icon, title, children }: { icon: "map" | "support" | "geo"; title: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-line bg-white p-5">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <div className="min-w-0 text-sm text-ink">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">{title}</p>
        {children}
      </div>
    </div>
  );
}
