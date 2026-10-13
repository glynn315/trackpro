import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { footer, services, siteConfig } from "@/lib/site";

const headingClass = "text-sm font-semibold uppercase tracking-wider text-white";
const listClass = "mt-4 space-y-2.5 text-sm text-white/70";
const linkClass = "transition-colors hover:text-brand-light";

export function Footer() {
  const year = new Date().getFullYear();
  const { location, contact } = siteConfig;

  return (
    <footer className="relative overflow-hidden bg-ink text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-0 h-72 w-72 rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(237,28,36,0.35) 0%, transparent 70%)" }}
      />
      <div aria-hidden className="bg-noise pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay" />

      <Container className="relative py-12 sm:py-16">
        <div className="max-w-xl">
          <Logo variant="light" />
          <p className="mt-5 text-sm leading-relaxed text-white/70">{siteConfig.shortDescription}</p>
        </div>

        <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-6 lg:gap-8">
          <div>
            <h3 className={headingClass}>Office</h3>
            <address className={`${listClass} not-italic`}>
              <p>
                {location.address}, {location.city} {location.postalCode}, {location.region}
              </p>
              <p>
                <a className={`${linkClass} break-all`} href={`mailto:${contact.salesEmail}`}>
                  {contact.salesEmail}
                </a>
              </p>
              <p>
                <a className={linkClass} href={`tel:${contact.phonePrimary.replace(/\D/g, "")}`}>
                  {contact.phonePrimary}
                </a>
                {" / "}
                <a className={linkClass} href={`tel:${contact.phoneSecondary.replace(/\D/g, "")}`}>
                  {contact.phoneSecondary}
                </a>
              </p>
            </address>
          </div>

          <nav aria-label="Company">
            <h3 className={headingClass}>Company</h3>
            <ul className={listClass}>
              {footer.company.map((l) => (
                <li key={l.label}>
                  <Link className={linkClass} href={l.href}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Services" className="sm:col-span-2 lg:col-span-1">
            <h3 className={headingClass}>Services</h3>
            <ul className={`${listClass} grid grid-cols-2 gap-x-4 space-y-0 gap-y-2.5 lg:grid-cols-1`}>
              {services.map((s) => (
                <li key={s.title}>
                  <Link className={linkClass} href="/#services">
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Legal and compliance">
            <h3 className={headingClass}>Legal &amp; Compliance</h3>
            <ul className={listClass}>
              {footer.legal.map((l) => (
                <li key={l.label}>
                  {l.href ? (
                    <Link className={linkClass} href={l.href}>
                      {l.label}
                    </Link>
                  ) : (
                    <span>{l.label}</span>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className={headingClass}>Customer Support</h3>
            <ul className={listClass}>
              {footer.support.map((s) => (
                <li key={s.label}>
                  <span className="block text-white">{s.label}</span>
                  <a className={`${linkClass} break-all text-xs`} href={`mailto:${s.email}`}>
                    {s.email}
                  </a>
                </li>
              ))}
              <li>
                <Link className={linkClass} href="/faqs">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className={headingClass}>Payment Method</h3>
            <ul className={listClass}>
              {footer.payment.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </div>
        </div>
      </Container>

      <div className="relative border-t border-white/10">
        <Container className="flex flex-col items-start justify-between gap-4 py-6 text-sm text-white/60 sm:flex-row sm:items-center">
          <p>
            &copy; {year} {siteConfig.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <a
              href={siteConfig.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="transition-colors hover:text-brand-light"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M22 12a10 10 0 10-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99A10 10 0 0022 12z" />
              </svg>
            </a>
            <a className="hover:text-brand-light" href={`mailto:${contact.email}`}>
              {contact.email}
            </a>
          </div>
        </Container>
      </div>
    </footer>
  );
}
