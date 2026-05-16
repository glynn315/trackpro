"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "@/lib/site";

export function MessengerButton() {
  const [visible, setVisible] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(true);

  // Only appear after the user has scrolled past the hero
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Auto-hide the tooltip after a few seconds so it doesn't linger
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setTooltipOpen(false), 4500);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <a
      href={siteConfig.contact.messenger}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Message us on Facebook Messenger"
      className={`group fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 transition-all duration-500 sm:bottom-7 sm:right-7 ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      {/* Tooltip bubble */}
      <span
        className={`hidden origin-right rounded-2xl border border-line bg-white px-4 py-2.5 text-sm font-medium text-ink shadow-[0_8px_24px_-8px_rgba(0,0,0,0.2)] transition-all duration-300 sm:inline-block ${
          tooltipOpen ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
        } group-hover:scale-100 group-hover:opacity-100`}
      >
        Chat with us
        <span className="absolute -right-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 border-r border-t border-line bg-white" />
      </span>

      {/* Button */}
      <span className="relative grid h-14 w-14 place-items-center rounded-full bg-linear-to-br from-[#00B2FF] via-[#0084FF] to-[#0066FF] text-white shadow-[0_10px_28px_-8px_rgba(0,132,255,0.55)] transition-transform duration-300 group-hover:scale-110 group-active:scale-95">
        {/* Pulse ring */}
        <span
          aria-hidden
          className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#0084FF] opacity-30"
        />
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden>
          <path d="M12 2C6.486 2 2 6.145 2 11.243c0 2.903 1.453 5.493 3.725 7.19V22l3.405-1.869c.91.252 1.873.386 2.87.386 5.514 0 10-4.145 10-9.243C22 6.145 17.514 2 12 2zm1.005 12.453l-2.547-2.715-4.97 2.715 5.467-5.805 2.61 2.715 4.907-2.715-5.467 5.805z" />
        </svg>
      </span>
    </a>
  );
}
