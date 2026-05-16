"use client";

import { useEffect, useState } from "react";
import { navigation, siteConfig } from "@/lib/site";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { Icon, type IconName } from "@/components/ui/Icon";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("home");

  // Scroll shadow / blur state
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Active section tracking via IntersectionObserver
  useEffect(() => {
    const ids = navigation.map((n) => n.href.replace("#", ""));
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the entry closest to the top that's currently intersecting.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      {
        // Top of section enters trigger zone just below the header.
        rootMargin: "-20% 0px -70% 0px",
        threshold: 0,
      }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

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

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-line bg-white/95 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.12)] backdrop-blur-md"
          : "border-b border-transparent bg-white/70 backdrop-blur-md"
      }`}
    >
      <Container className="flex h-16 items-center justify-between lg:h-20">
        <a href="#home" aria-label={`${siteConfig.name} home`} className="shrink-0">
          <Logo priority />
        </a>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-7 lg:gap-9">
            {navigation.map((item) => {
              const id = item.href.replace("#", "");
              const isActive = active === id;
              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`relative py-2 text-sm font-medium transition-colors duration-200 ${
                      isActive ? "text-brand" : "text-ink/75 hover:text-ink"
                    }`}
                  >
                    {item.label}
                    <span
                      className={`pointer-events-none absolute -bottom-0.5 left-0 h-0.5 bg-brand transition-all duration-300 ${
                        isActive ? "w-full opacity-100" : "w-0 opacity-0"
                      }`}
                    />
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="hidden md:block">
          <ButtonLink href="#contact" variant="primary" size="md">
            Get a Quote
          </ButtonLink>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          className="grid h-10 w-10 place-items-center rounded-md text-ink md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </Container>

      {open && (
        <>
          {/* Backdrop */}
          <button
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="animate-backdrop fixed inset-x-0 bottom-0 top-16 -z-10 bg-ink/40 backdrop-blur-sm md:hidden"
          />
          {/* Dropdown panel */}
          <div className="animate-slide-down absolute inset-x-3 top-[calc(100%+0.5rem)] overflow-hidden rounded-2xl border border-line bg-white shadow-[0_24px_60px_-20px_rgba(0,0,0,0.25)] md:hidden">
            {/* Top accent stripe */}
            <span
              aria-hidden
              className="block h-0.75 bg-linear-to-r from-brand via-brand-light to-brand"
            />
            <nav aria-label="Mobile" className="p-3">
              <ul className="flex flex-col gap-1">
                {navigation.map((item, i) => {
                  const id = item.href.replace("#", "");
                  const isActive = active === id;
                  return (
                    <li
                      key={item.href}
                      className="animate-slide-in-left"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <a
                        href={item.href}
                        onClick={() => setOpen(false)}
                        aria-current={isActive ? "page" : undefined}
                        className={`group relative flex items-center gap-3 overflow-hidden rounded-xl px-3.5 py-3 text-[15px] font-medium transition-all duration-200 ${
                          isActive
                            ? "bg-brand/10 text-brand"
                            : "text-ink hover:bg-soft"
                        }`}
                      >
                        {/* Active left accent bar */}
                        <span
                          aria-hidden
                          className={`absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-brand transition-all duration-300 ${
                            isActive ? "opacity-100" : "opacity-0 group-hover:opacity-40"
                          }`}
                        />
                        <span
                          className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg transition-all duration-200 ${
                            isActive
                              ? "bg-brand text-white shadow-[0_6px_16px_-6px_rgba(237,28,36,0.55)]"
                              : "bg-soft text-ink/70 group-hover:bg-ink group-hover:text-white"
                          }`}
                        >
                          <Icon name={item.icon as IconName} className="h-4 w-4" />
                        </span>
                        <span className="flex-1">{item.label}</span>
                        <Icon
                          name="arrow"
                          className={`h-4 w-4 transition-all duration-300 ${
                            isActive
                              ? "text-brand translate-x-0 opacity-100"
                              : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                          }`}
                        />
                      </a>
                    </li>
                  );
                })}
              </ul>
              <div className="my-3 h-px bg-line" />
              <div className="animate-slide-in-left px-1 pb-1" style={{ animationDelay: `${navigation.length * 50}ms` }}>
                <ButtonLink
                  href="#contact"
                  variant="primary"
                  size="md"
                  className="w-full"
                  onClick={() => setOpen(false)}
                >
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
