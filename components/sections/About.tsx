import { Section } from "@/components/ui/Section";
import { Icon, type IconName } from "@/components/ui/Icon";
import { about } from "@/lib/site";
import { solutions } from "@/lib/solutions";

export function About() {
  return (
    <Section id="about" eyebrow="About Us" title={about.title} description={about.intro} surface="white">
      <article id="our-story" className="mx-auto max-w-3xl scroll-mt-28 text-center">
        <h3 className="text-2xl font-extrabold uppercase tracking-[0.12em] text-ink sm:text-3xl">Our Story</h3>
        <span aria-hidden className="mx-auto mt-3 block h-1 w-12 rounded-full bg-brand" />
        <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-muted sm:text-base">
          {about.story.map((para) => (
            <p key={para.slice(0, 24)}>{para}</p>
          ))}
        </div>
      </article>

      <div className="mx-auto mt-12 grid max-w-5xl gap-10 sm:grid-cols-2 sm:gap-12">
        {[
          { id: "mission", label: "Mission", body: about.mission, icon: "geo" as const },
          { id: "vision", label: "Vision", body: about.vision, icon: "chart" as const },
        ].map((b) => (
          <article key={b.id} id={b.id} className="scroll-mt-28 text-center">
            <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-brand/10 text-brand">
              <Icon name={b.icon} className="h-6 w-6" />
            </span>
            <h3 className="text-2xl font-extrabold uppercase tracking-[0.12em] text-ink sm:text-3xl">{b.label}</h3>
            <span aria-hidden className="mx-auto mt-3 block h-1 w-12 rounded-full bg-brand" />
            <p className="mt-5 text-[15px] leading-relaxed text-muted sm:text-base">{b.body}</p>
          </article>
        ))}
      </div>

      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {solutions.map((s) => (
          <a
            key={s.slug}
            href={`/solutions/${s.slug}`}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-[0_12px_36px_-12px_rgba(237,28,36,0.18)]"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-0.75 origin-left scale-x-0 bg-linear-to-r from-brand via-brand-light to-brand transition-transform duration-500 ease-out group-hover:scale-x-100"
            />
            <span className="mb-4 inline-grid h-11 w-11 place-items-center rounded-xl bg-brand/10 text-brand">
              <Icon name={s.icon as IconName} className="h-5 w-5" />
            </span>
            <h3 className="text-lg font-semibold text-ink">{s.name}</h3>
            <p className="mt-2 line-clamp-4 flex-1 text-sm leading-relaxed text-muted">{s.summary}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
              Learn more <Icon name="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </a>
        ))}
      </div>
    </Section>
  );
}
