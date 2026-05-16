import { Section } from "@/components/ui/Section";
import { Icon } from "@/components/ui/Icon";
import { aboutHighlights, siteConfig } from "@/lib/site";

export function About() {
  return (
    <Section
      id="about"
      eyebrow="About Us"
      title="GPS tracking built for Philippine fleets"
      description={`Based in ${siteConfig.location.city}, ${siteConfig.location.region}, TrackPro combines anti-jammer hardware, remote control from your phone, and hands-on local support — so you stay one step ahead of theft.`}
      surface="white"
    >
      <div className="grid gap-5 sm:gap-6 md:grid-cols-3">
        {aboutHighlights.map((h) => (
          <article
            key={h.title}
            className="group relative overflow-hidden rounded-2xl border border-line bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-[0_12px_36px_-12px_rgba(237,28,36,0.18)] sm:p-7"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-0.75 origin-left scale-x-0 bg-linear-to-r from-brand via-brand-light to-brand transition-transform duration-500 ease-out group-hover:scale-x-100"
            />
            <span className="mb-5 inline-grid h-11 w-11 place-items-center rounded-xl bg-brand/10 text-brand transition-transform duration-300 group-hover:scale-110">
              <Icon name="check" className="h-5 w-5" />
            </span>
            <h3 className="text-lg font-semibold text-ink">{h.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{h.body}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}
