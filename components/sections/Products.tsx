import { Section } from "@/components/ui/Section";
import { ProductGrid } from "@/components/sections/ProductGrid";
import { getCatalog } from "@/lib/products";
import { getPlans } from "@/lib/plans";
import { hardwareIntro, products } from "@/lib/site";

export async function Products() {
  const [catalog, plans] = await Promise.all([getCatalog(), getPlans()]);

  // Curated lineup order (Core, Guard, Fleet…); admin-only products go last.
  const rank = (id: string) => {
    const i = products.findIndex((p) => p.id === id);
    return i === -1 ? products.length : i;
  };
  const ordered = [...catalog].sort((a, b) => rank(a.id) - rank(b.id));

  return (
    <Section
      id="products"
      eyebrow="Products"
      title="Hardware Packages"
      description={hardwareIntro.join(" ")}
      surface="white"
    >
      <ProductGrid products={ordered} plans={plans} />
    </Section>
  );
}
