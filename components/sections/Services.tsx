import { Section } from "@/components/ui/Section";
import { Icon, type IconName } from "@/components/ui/Icon";
import { services } from "@/lib/site";

export function Services() {
  return (
    <Section
      id="services"
      eyebrow="Services"
      title="Total control over your vehicle"
      description="From a single car to a full fleet — TrackPro keeps every vehicle visible, protected, and under your control."
      surface="soft"
    >
      <div className="grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <article
            key={s.title}
            className="group relative overflow-hidden rounded-2xl border border-line bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-[0_18px_44px_-14px_rgba(237,28,36,0.22)] sm:p-7"
          >
            {/* Top accent line that draws in on hover */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-0.75 origin-left scale-x-0 bg-linear-to-r from-brand via-brand-light to-brand transition-transform duration-500 ease-out group-hover:scale-x-100"
            />
            <span className="mb-5 inline-grid h-12 w-12 place-items-center rounded-xl bg-ink text-white transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-brand sm:mb-6">
              <Icon name={s.icon as IconName} className="h-6 w-6" />
            </span>
            <h3 className="text-lg font-semibold text-ink sm:text-xl">{s.title}</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-muted sm:text-sm">{s.description}</p>
            <span
              aria-hidden
              className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-brand/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
            />
          </article>
        ))}
      </div>
    </Section>
  );
}
