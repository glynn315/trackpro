"use client";

import { useState } from "react";
import { ProductCard } from "@/components/ui/ProductCard";
import type { CatalogProduct } from "@/lib/products";
import type { StorePlan } from "@/lib/plans";

/** Hardware package grid with a category filter (Vehicle, Fleet, Dashcam…). */
export function ProductGrid({ products, plans }: { products: CatalogProduct[]; plans: readonly StorePlan[] }) {
  const categories = ["All", ...new Set(products.map((p) => p.category))];
  const [category, setCategory] = useState("All");
  const shown = category === "All" ? products : products.filter((p) => p.category === category);

  return (
    <>
      <div role="tablist" aria-label="Filter by category" className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            role="tab"
            aria-selected={category === c}
            onClick={() => setCategory(c)}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
              category === c ? "border-brand bg-brand text-white" : "border-line bg-white text-muted hover:border-brand/40 hover:text-ink"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {shown.map((p) => (
          <ProductCard key={p.id} product={p} plans={plans} />
        ))}
      </div>
    </>
  );
}
