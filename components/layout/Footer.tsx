import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { navigation, services, siteConfig } from "@/lib/site";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden bg-ink text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-0 h-72 w-72 rounded-full opacity-30 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(237,28,36,0.35) 0%, transparent 70%)",
        }}
      />
      <div aria-hidden className="bg-noise pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay" />
      <Container className="grid gap-10 py-12 sm:gap-12 sm:py-16 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Logo variant="light" />
          <p className="mt-5 max-w-md text-sm leading-relaxed text-white/70">
            {siteConfig.shortDescription}
          </p>
          <div className="mt-6 space-y-1 text-sm text-white/70">
            <p className="font-semibold text-white">Office</p>
            <p>{siteConfig.location.address}</p>
            <p>
              {siteConfig.location.city}, {siteConfig.location.region}
            </p>
            <p className="pt-2">
              <a
                href={`tel:${siteConfig.contact.phonePrimary.replace(/\D/g, "")}`}
                className="hover:text-brand-light"
              >
                {siteConfig.contact.phonePrimary}
              </a>
              {" · "}
              <a
                href={`tel:${siteConfig.contact.phoneSecondary.replace(/\D/g, "")}`}
                className="hover:text-brand-light"
              >
                {siteConfig.contact.phoneSecondary}
              </a>
            </p>
          </div>
        </div>

        <nav aria-label="Footer navigation">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
            Company
          </h3>
          <ul className="mt-5 space-y-3 text-sm text-white/70">
            {navigation.map((item) => (
              <li key={item.href}>
                <a className="transition-colors hover:text-brand-light" href={item.href}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
            Services
          </h3>
          <ul className="mt-5 space-y-3 text-sm text-white/70">
            {services.slice(0, 5).map((s) => (
              <li key={s.title}>
                <a className="transition-colors hover:text-brand-light" href="#services">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Container>

      <div className="border-t border-white/10">
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
            <a className="hover:text-brand-light" href={`mailto:${siteConfig.contact.email}`}>
              {siteConfig.contact.email}
            </a>
          </div>
        </Container>
      </div>
    </footer>
  );
}
