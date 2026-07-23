import { Section } from "@/components/ui/Section";
import { ProductCard } from "@/components/ui/ProductCard";
import { getCatalog } from "@/lib/products";

export async function Products() {
  const catalog = await getCatalog();

  // Featured first, then the rest in catalog order
  const ordered = [...catalog].sort((a, b) => {
    const af = "featured" in a && a.featured === true ? 0 : 1;
    const bf = "featured" in b && b.featured === true ? 0 : 1;
    return af - bf;
  });

  return (
    <Section
      id="products"
      eyebrow="Our Products"
      title="The full TrackPro GPS lineup"
      description="Anti-theft, fleet, dashcam, OBD, and asset trackers — all built for Philippine roads and conditions."
      surface="white"
    >
      <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {ordered.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </Section>
  );
}
