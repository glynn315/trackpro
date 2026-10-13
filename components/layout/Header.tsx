"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { navigation, siteConfig, type NavItem } from "@/lib/site";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { Icon, type IconName } from "@/components/ui/Icon";
import { CartIcon } from "@/components/ui/CartIcon";
import { AccountLink } from "@/components/ui/AccountLink";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [active, setActive] = useState<string>("home");
  const pathname = usePathname();

  // Hash links point at homepage sections. Away from "/" a bare "#about"
  // would do nothing, so send those visitors home first.
  const onHome = pathname === "/";
  const resolve = (href: string) => (href.startsWith("#") && !onHome ? `/${href}` : href);

  const isActive = (item: NavItem) => {
    if (item.href.startsWith("#")) return onHome && active === item.href.slice(1);
    // Path items (Solutions, Contact) light up for any page under their section.
    const base = item.href.split("/").slice(0, 2).join("/");
    return pathname.startsWith(base) || Boolean(item.children?.some((c) => c.href === pathname));
  };

  // Scroll shadow / blur state
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Active section tracking via IntersectionObserver (homepage only)
  useEffect(() => {
    if (!onHome) return;
    const sections = navigation
      .filter((n) => n.href.startsWith("#"))
      .map((n) => document.getElementById(n.href.slice(1)))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [onHome]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  const closeMenu = () => {
    setOpen(false);
    setExpanded(null);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-line bg-white/95 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.12)] backdrop-blur-md"
          : "border-b border-transparent bg-white/70 backdrop-blur-md"
      }`}
    >
      <Container className="flex h-16 items-center justify-between gap-4 lg:h-20">
        <a href={resolve("#home")} aria-label={`${siteConfig.name} home`} className="shrink-0">
          <Logo priority />
        </a>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-5 xl:gap-7">
            {navigation.map((item) => {
              const current = isActive(item);
              return (
                <li key={item.label} className="group relative">
                  <a
                    href={resolve(item.href)}
                    aria-current={current ? "page" : undefined}
                    aria-haspopup={item.children ? "true" : undefined}
                    className={`relative inline-flex items-center gap-1 py-2 text-sm font-medium transition-colors duration-200 ${
                      current ? "text-brand" : "text-ink/75 hover:text-ink"
                    }`}
                  >
                    {item.label}
                    {item.children && <Chevron className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180" />}
                    <span
                      className={`pointer-events-none absolute -bottom-0.5 left-0 h-0.5 bg-brand transition-all duration-300 ${
                        current ? "w-full opacity-100" : "w-0 opacity-0"
                      }`}
                    />
                  </a>

                  {item.children && (
                    <div className="invisible absolute left-1/2 top-full z-10 -translate-x-1/2 pt-3 opacity-0 transition-all duration-200 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                      <ul className="min-w-56 overflow-hidden rounded-xl border border-line bg-white p-1.5 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.25)]">
                        {item.children.map((child) => (
                          <li key={child.href + child.label}>
                            <a
                              href={resolve(child.href)}
                              aria-current={pathname === child.href ? "page" : undefined}
                              className={`block whitespace-nowrap rounded-lg px-3.5 py-2.5 text-sm transition-colors ${
                                pathname === child.href ? "bg-brand/10 font-semibold text-brand" : "text-ink/80 hover:bg-soft hover:text-ink"
                              }`}
                            >
                              {child.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <CartIcon />
          <AccountLink />
          <ButtonLink href="/contact" variant="primary" size="md">
            Get a Quote
          </ButtonLink>
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <CartIcon />
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            className="grid h-10 w-10 place-items-center rounded-md text-ink"
            onClick={() => (open ? closeMenu() : setOpen(true))}
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? (
                <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </Container>

      {open && (
        <>
          {/* Backdrop */}
          <button
            aria-label="Close menu"
            onClick={closeMenu}
            className="animate-backdrop fixed inset-x-0 bottom-0 top-16 -z-10 bg-ink/40 backdrop-blur-sm lg:hidden"
          />
          {/* Dropdown panel */}
          <div className="animate-slide-down absolute inset-x-3 top-[calc(100%+0.5rem)] max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-2xl border border-line bg-white shadow-[0_24px_60px_-20px_rgba(0,0,0,0.25)] lg:hidden">
            <span aria-hidden className="block h-0.75 bg-linear-to-r from-brand via-brand-light to-brand" />
            <nav aria-label="Mobile" className="p-3">
              <ul className="flex flex-col gap-1">
                {navigation.map((item, i) => {
                  const current = isActive(item);
                  const isOpen = expanded === item.label;
                  return (
                    <li key={item.label} className="animate-slide-in-left" style={{ animationDelay: `${i * 40}ms` }}>
                      <div
                        className={`group relative flex items-center overflow-hidden rounded-xl transition-all duration-200 ${
                          current ? "bg-brand/10 text-brand" : "text-ink hover:bg-soft"
                        }`}
                      >
                        <span
                          aria-hidden
                          className={`absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-brand transition-all duration-300 ${
                            current ? "opacity-100" : "opacity-0 group-hover:opacity-40"
                          }`}
                        />
                        <a
                          href={resolve(item.href)}
                          onClick={closeMenu}
                          aria-current={current ? "page" : undefined}
                          className="flex flex-1 items-center gap-3 px-3.5 py-3 text-[15px] font-medium"
                        >
                          <span
                            className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg text-brand ${
                              current ? "bg-brand/15" : "bg-brand/10 group-hover:bg-brand/15"
                            }`}
                          >
                            <Icon name={item.icon as IconName} className="h-4 w-4" />
                          </span>
                          {item.label}
                        </a>
                        {item.children && (
                          <button
                            type="button"
                            aria-label={`${isOpen ? "Hide" : "Show"} ${item.label} links`}
                            aria-expanded={isOpen}
                            onClick={() => setExpanded(isOpen ? null : item.label)}
                            className="grid h-12 w-12 place-items-center text-muted hover:text-ink"
                          >
                            <Chevron className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                          </button>
                        )}
                      </div>
                      {item.children && isOpen && (
                        <ul className="mb-1 ml-[3.75rem] mt-1 space-y-0.5 border-l border-line pl-3">
                          {item.children.map((child) => (
                            <li key={child.href + child.label}>
                              <a
                                href={resolve(child.href)}
                                onClick={closeMenu}
                                className="block rounded-lg px-3 py-2 text-sm text-ink/80 hover:bg-soft hover:text-ink"
                              >
                                {child.label}
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
              <div className="my-3 h-px bg-line" />
              <div className="px-1 pb-1">
                <div className="mb-3">
                  <AccountLink onNavigate={closeMenu} />
                </div>
                <ButtonLink href="/contact" variant="primary" size="md" className="w-full" onClick={closeMenu}>
                  Get a Quote <Icon name="arrow" className="h-4 w-4" />
                </ButtonLink>
                <p className="mt-3 text-center text-xs text-muted">
                  Or call{" "}
                  <a
                    href={`tel:${siteConfig.contact.phonePrimary.replace(/\D/g, "")}`}
                    className="font-semibold text-ink hover:text-brand"
                  >
                    {siteConfig.contact.phonePrimary}
                  </a>
                </p>
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}

function Chevron({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
