import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Thanks — we got your message",
  description: "Your message has been sent to the TrackPro team.",
  robots: { index: false, follow: false },
};

export default function Thanks() {
  return (
    <>
      <Header />
      <main className="flex flex-1 items-center justify-center bg-cloud bg-dots py-24 sm:py-32">
        <Container className="max-w-2xl text-center">
          {/* Success icon with red glow */}
          <div className="relative mx-auto mb-8 grid h-20 w-20 place-items-center">
            <span
              aria-hidden
              className="absolute inset-0 animate-ping rounded-full bg-brand/30"
            />
            <span className="relative grid h-20 w-20 place-items-center rounded-full bg-linear-to-br from-brand-light via-brand to-brand-dark text-white shadow-[0_14px_36px_-10px_rgba(237,28,36,0.55)]">
              <Icon name="check" className="h-10 w-10" />
            </span>
          </div>

          <h1 className="text-balance text-3xl font-extrabold tracking-tight text-ink sm:text-4xl lg:text-5xl">
            Message received — salamat!
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">
            Our team will get back to you within one business day. For an instant reply,
            you can also message us on Messenger or call directly.
          </p>

          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <ButtonLink href="/" variant="secondary" size="lg" className="w-full sm:w-auto">
              <Icon name="arrow" className="h-4 w-4 rotate-180" />
              Back to home
            </ButtonLink>
            <ButtonLink
              href={siteConfig.contact.messenger}
              variant="primary"
              size="lg"
              className="w-full sm:w-auto"
              target="_blank"
              rel="noopener noreferrer"
            >
              Message on Messenger
            </ButtonLink>
          </div>

          <div className="mt-10 grid gap-3 rounded-2xl border border-line bg-white p-5 text-left sm:grid-cols-2 sm:p-6">
            <a
              href={`tel:${siteConfig.contact.phonePrimary.replace(/\D/g, "")}`}
              className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-soft"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand">
                <Icon name="support" className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Call us</p>
                <p className="truncate text-sm font-semibold text-ink">{siteConfig.contact.phonePrimary}</p>
              </div>
            </a>
            <a
              href={`mailto:${siteConfig.contact.email}`}
              className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-soft"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand">
                <Icon name="geo" className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Email</p>
                <p className="truncate text-sm font-semibold text-ink">{siteConfig.contact.email}</p>
              </div>
            </a>
          </div>

          <p className="mt-8 text-xs text-muted">
            <Link href="/" className="hover:text-brand">
              ← Return to TrackPro home
            </Link>
          </p>
        </Container>
      </main>
      <Footer />
    </>
  );
}
