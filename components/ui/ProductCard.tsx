"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { formatPrice } from "@/lib/site";
import type { CatalogProduct } from "@/lib/products";

export function ProductCard({ product }: { product: CatalogProduct }) {
  const { addItem, openDrawer } = useCart();
  const [added, setAdded] = useState(false);
  const isFeatured = "featured" in product && product.featured === true;
  const outOfStock = !product.inStock;
  // Nudge urgency when only a handful remain (live stock only).
  const lowStock =
    product.inStock && product.stock !== null && product.stock <= 5;

  function handleAdd() {
    if (outOfStock) return;
    addItem(product.id, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  function handleBuyNow() {
    if (outOfStock) return;
    addItem(product.id, 1);
    openDrawer();
  }

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white p-5 transition-all duration-300 sm:p-6 ${
        outOfStock
          ? "border-line"
          : isFeatured
          ? "border-brand/40 shadow-[0_18px_44px_-14px_rgba(237,28,36,0.25)]"
          : "border-line hover:-translate-y-1 hover:border-brand/40 hover:shadow-[0_18px_44px_-14px_rgba(237,28,36,0.18)]"
      }`}
    >
      {/* Top accent stripe — always visible on featured, animates on hover for others */}
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 top-0 h-0.75 origin-left bg-linear-to-r from-brand via-brand-light to-brand transition-transform duration-500 ease-out ${
          isFeatured ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
        }`}
      />

      {/* Header — icon + badges */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-linear-to-br from-brand-light via-brand to-brand-dark text-white transition-transform duration-300 group-hover:scale-110">
          <Icon name={product.icon as IconName} className="h-6 w-6" />
        </span>
        <div className="flex flex-col items-end gap-1.5">
          {outOfStock ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-ink/85 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              Out of Stock
            </span>
          ) : (
            isFeatured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                <Icon name="shield" className="h-3 w-3" /> Flagship
              </span>
            )
          )}
          {lowStock && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
              Only {product.stock} left
            </span>
          )}
          <span className="rounded-md bg-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted">
            {product.category}
          </span>
        </div>
      </div>

      {/* Name + model + tagline */}
      <h3 className="text-base font-bold leading-snug text-ink sm:text-lg">{product.name}</h3>
      <p className="mt-0.5 text-xs font-medium text-muted">Model {product.model}</p>
      <p className="mt-2 text-[13px] leading-relaxed text-muted">{product.tagline}</p>

      {/* Features */}
      <ul className="mt-4 flex-1 space-y-1.5">
        {product.highlights.slice(0, 4).map((h) => (
          <li key={h} className="flex items-start gap-2 text-[13px] text-ink">
            <Icon name="check" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
            <span>{h}</span>
          </li>
        ))}
      </ul>

      {/* Price */}
      <div className="mt-5 flex items-baseline gap-2 border-t border-line pt-4">
        <span className="text-2xl font-extrabold tracking-tight text-ink">
          {formatPrice(product.price)}
        </span>
        {product.subscription > 0 && (
          <span className="text-xs text-muted">
            + {formatPrice(product.subscription)}/mo
          </span>
        )}
      </div>

      {/* Actions */}
      {outOfStock ? (
        <div className="mt-4">
          <Button
            type="button"
            variant="secondary"
            size="md"
            className="w-full cursor-not-allowed opacity-60"
            disabled
            aria-disabled
            aria-label={`${product.name} is out of stock`}
          >
            Out of Stock
          </Button>
          <p className="mt-2 text-center text-[11px] text-muted">
            Currently unavailable — message us to be notified when restocked.
          </p>
        </div>
      ) : (
        <div className="mt-4 flex gap-2">
          <Button
            type="button"
            variant="secondary"
            size="md"
            className="flex-1"
            onClick={handleAdd}
            aria-label={`Add ${product.name} to cart`}
          >
            {added ? (
              <>
                <Icon name="check" className="h-4 w-4 text-brand" /> Added
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M6 7h12l-1.5 11a2 2 0 0 1-2 1.75H9.5a2 2 0 0 1-2-1.75L6 7z" />
                  <path d="M9 7V5a3 3 0 0 1 6 0v2" />
                </svg>
                Add
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            className="flex-1"
            onClick={handleBuyNow}
            aria-label={`Buy ${product.name} now`}
          >
            Buy Now
          </Button>
        </div>
      )}
    </article>
  );
}
