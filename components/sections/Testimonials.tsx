import { Section } from "@/components/ui/Section";
import { Icon } from "@/components/ui/Icon";
import { testimonials } from "@/lib/site";

export function Testimonials() {
  return (
    <Section
      id="testimonials"
      eyebrow="Reviews"
      title="Trusted by truckers, fleets, and vehicle owners"
      description="Real feedback from customers across Mindanao and beyond — see why drivers choose TrackPro."
      surface="white"
    >
      <div className="grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {testimonials.map((t) => (
          <figure
            key={t.author}
            className="group relative flex flex-col rounded-2xl border border-line bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-[0_18px_44px_-14px_rgba(237,28,36,0.18)] sm:p-7"
          >
            {/* Top accent stripe */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-0.75 origin-left scale-x-0 bg-linear-to-r from-brand via-brand-light to-brand transition-transform duration-500 ease-out group-hover:scale-x-100"
            />

            {/* 5 stars */}
            <div className="mb-4 flex gap-0.5 text-brand">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden>
                  <path d="M10 1l2.6 5.27 5.82.85-4.21 4.1.99 5.78L10 14.27 4.8 17l.99-5.78L1.58 7.12l5.82-.85L10 1z" />
                </svg>
              ))}
            </div>

            <blockquote className="flex-1 text-[15px] leading-relaxed text-ink">
              <span className="text-brand">&ldquo;</span>
              {t.quote}
              <span className="text-brand">&rdquo;</span>
            </blockquote>

            <figcaption className="mt-5 flex items-center gap-3 border-t border-line pt-5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand/10 text-sm font-bold text-brand">
                {t.author.charAt(0)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{t.author}</p>
                <p className="truncate text-xs text-muted">
                  {t.role} · {t.location}
                </p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>

      {/* Trust strip */}
      <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl border border-line bg-cloud p-6 text-center sm:flex-row sm:justify-between sm:p-7 sm:text-left">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand text-white">
            <Icon name="shield" className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-ink sm:text-base">2,400+ followers on Facebook</p>
            <p className="text-xs text-muted sm:text-sm">
              Join the growing community of TrackPro customers
            </p>
          </div>
        </div>
        <a
          href="https://www.facebook.com/profile.php?id=61566098976013"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-[#0866FF] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0653cc]"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
            <path d="M22 12a10 10 0 10-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99A10 10 0 0022 12z" />
          </svg>
          See us on Facebook
        </a>
      </div>
    </Section>
  );
}
