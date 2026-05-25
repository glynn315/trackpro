import { Section } from "@/components/ui/Section";
import { Icon } from "@/components/ui/Icon";
import { ContactInquiryButton } from "@/components/ui/ContactInquiryButton";
import { siteConfig } from "@/lib/site";

const contactItems = [
  {
    icon: "support" as const,
    label: "Phone",
    lines: [
      {
        text: siteConfig.contact.phonePrimary,
        href: `tel:${siteConfig.contact.phonePrimary.replace(/\D/g, "")}`,
      },
      {
        text: siteConfig.contact.phoneSecondary,
        href: `tel:${siteConfig.contact.phoneSecondary.replace(/\D/g, "")}`,
      },
    ],
  },
  {
    icon: "geo" as const,
    label: "Email",
    lines: [
      { text: siteConfig.contact.email, href: `mailto:${siteConfig.contact.email}` },
    ],
  },
  {
    icon: "map" as const,
    label: "Office",
    lines: [
      { text: siteConfig.location.address, href: undefined },
      {
        text: `${siteConfig.location.city}, ${siteConfig.location.region}`,
        href: undefined,
      },
    ],
  },
  {
    icon: "chart" as const,
    label: "Hours",
    lines: [{ text: siteConfig.contact.hours, href: undefined }],
  },
];

export function Contact() {
  return (
    <Section
      id="contact"
      eyebrow="Contact"
      title="Get in touch with TrackPro"
      description="Message us on Messenger or call directly for the fastest reply. Prefer email? Use the form button below."
      surface="soft"
    >
      {/* Fast-path channels */}
      <div className="grid gap-4 sm:grid-cols-2">
        <a
          href={siteConfig.contact.messenger}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center gap-4 overflow-hidden rounded-2xl bg-linear-to-br from-[#00B2FF] via-[#0084FF] to-[#0066FF] p-5 text-white shadow-[0_14px_36px_-14px_rgba(0,132,255,0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_44px_-14px_rgba(0,132,255,0.7)] sm:p-6"
        >
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/15 backdrop-blur-sm">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden>
              <path d="M12 2C6.486 2 2 6.145 2 11.243c0 2.903 1.453 5.493 3.725 7.19V22l3.405-1.869c.91.252 1.873.386 2.87.386 5.514 0 10-4.145 10-9.243C22 6.145 17.514 2 12 2zm1.005 12.453l-2.547-2.715-4.97 2.715 5.467-5.805 2.61 2.715 4.907-2.715-5.467 5.805z" />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-white/80">Fastest reply</p>
            <p className="mt-0.5 text-lg font-semibold">Message us on Messenger</p>
            <p className="mt-0.5 text-sm text-white/85">We reply within minutes during work hours</p>
          </div>
          <Icon name="arrow" className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
        </a>

        <a
          href={`tel:${siteConfig.contact.phonePrimary.replace(/\D/g, "")}`}
          className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-line bg-white p-5 text-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-[0_14px_36px_-14px_rgba(237,28,36,0.22)] sm:p-6"
        >
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand text-white">
            <Icon name="support" className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Call us directly</p>
            <p className="mt-0.5 text-lg font-semibold">{siteConfig.contact.phonePrimary}</p>
            <p className="mt-0.5 text-sm text-muted">or {siteConfig.contact.phoneSecondary}</p>
          </div>
          <Icon name="arrow" className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
        </a>
      </div>

      {/* Contact info grid */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {contactItems.map((c) => (
          <div
            key={c.label}
            className="flex items-start gap-4 rounded-2xl border border-line bg-white p-5 transition-colors hover:border-brand/40"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
              <Icon name={c.icon} className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                {c.label}
              </p>
              <div className="mt-1 space-y-0.5">
                {c.lines.map((ln) =>
                  ln.href ? (
                    <a
                      key={ln.text}
                      href={ln.href}
                      className="block wrap-break-word text-sm font-medium text-ink transition-colors hover:text-brand"
                    >
                      {ln.text}
                    </a>
                  ) : (
                    <p key={ln.text} className="wrap-break-word text-sm font-medium text-ink">
                      {ln.text}
                    </p>
                  )
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Email form CTA */}
      <div className="relative mt-8 overflow-hidden rounded-2xl bg-ink p-8 text-center text-white sm:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            background:
              "radial-gradient(60% 100% at 100% 50%, rgba(237,28,36,0.35) 0%, rgba(0,0,0,0) 60%)",
          }}
        />
        <div className="relative flex flex-col items-center gap-5 sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h3 className="text-xl font-semibold sm:text-2xl">Prefer email?</h3>
            <p className="mt-1 text-sm text-white/70 sm:text-base">
              Send us a detailed message and we&apos;ll reply within one business day.
            </p>
          </div>
          <ContactInquiryButton label="Send us a Message" />
        </div>
      </div>
    </Section>
  );
}
