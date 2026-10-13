import { Section } from "@/components/ui/Section";
import { Icon } from "@/components/ui/Icon";
import { MediaGallery } from "@/components/ui/MediaGallery";
import { getAddOns } from "@/lib/addons";
import { addOnsIntro, formatPrice } from "@/lib/site";

export async function AddOns() {
  const addOns = await getAddOns();
  if (addOns.length === 0) return null;

  return (
    <Section id="add-ons" eyebrow="Add-ons" title="Optional Add-ons" description={addOnsIntro.join(" ")} surface="soft">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {addOns.map((a) => (
          <article
            key={a.slug}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-[0_18px_44px_-14px_rgba(237,28,36,0.18)]"
          >
            <MediaGallery media={a.media} alt={a.name} />
            <div className="flex items-start justify-between gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
                <Icon name={a.icon} className="h-5 w-5" />
              </span>
              <span className="text-xl font-extrabold tracking-tight text-ink">{formatPrice(a.price)}</span>
            </div>
            <h3 className="mt-4 text-base font-bold uppercase tracking-tight text-ink">{a.name}</h3>
            <p className="text-xs font-medium italic text-muted">{a.subtitle}</p>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">{a.description}</p>

            <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-ink">Key Features</p>
            <ul className="mt-1.5 space-y-1">
              {a.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-[13px] text-ink">
                  <Icon name="check" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                  {f}
                </li>
              ))}
            </ul>

            <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-ink">Applicable Devices</p>
            <ul className="mt-1.5 flex flex-1 flex-wrap content-start gap-1.5">
              {a.devices.map((d) => (
                <li key={d} className="rounded-md bg-soft px-2 py-0.5 text-[11px] font-medium text-ink">
                  {d.replace("TrackPro ", "")}
                </li>
              ))}
            </ul>

            {a.warranty && (
              <p className="mt-4 border-t border-line pt-3 text-xs font-semibold text-ink">{a.warranty}</p>
            )}
          </article>
        ))}
      </div>
      <p className="mt-8 text-center text-sm text-muted">
        Need an add-on installed?{" "}
        <a href="/contact" className="font-semibold text-brand hover:underline">
          Request a quote
        </a>{" "}
        and we&apos;ll confirm compatibility with your device.
      </p>
    </Section>
  );
}
