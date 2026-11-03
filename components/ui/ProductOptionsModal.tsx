"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { formatPrice } from "@/lib/site";
import {
  periodWord,
  priceSelection,
  productChoices,
  type CartOptions,
} from "@/lib/cart-options";
import type { CatalogProduct } from "@/lib/products";
import type { StoreAddOn } from "@/lib/addons";

/**
 * Add-to-cart options for one product: Hardware (required), Add-ons,
 * Video Bandwidth, Platform Subscription (required) — only the sections the
 * product offers — then a total checkpoint before it goes in the cart.
 */
export function ProductOptionsModal({
  product,
  buyNow = false,
  onClose,
  onAdded,
}: {
  product: CatalogProduct;
  /** Open the cart after adding (the card's "Buy Now"). */
  buyNow?: boolean;
  onClose: () => void;
  onAdded?: () => void;
}) {
  const { store, addItem, openDrawer } = useCart();
  const choices = useMemo(() => productChoices(product, store), [product, store]);
  const popular = choices.plans.find((p) => p.is_popular) ?? null;
  // Pictures on hardware options show large, above the name (like a product variant picker).
  const hardwareHasImages = choices.hardware.some((h) => h.image_url);

  const [options, setOptions] = useState<CartOptions>(() => ({
    hardware: choices.hardware[0]?.name,
    addOns: [],
    plan: popular?.slug,
  }));
  const [qty, setQty] = useState(1);
  const [tried, setTried] = useState(false);
  // An add-on that offers installation was ticked — ask whether to include it before it goes in.
  const [askInstall, setAskInstall] = useState<StoreAddOn | null>(null);

  const picked = priceSelection(product, options, store);
  const maxQty = product.stock ?? 100;
  const dueToday = (picked.unitPrice + picked.planUnit) * qty;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      // Esc closes the installation prompt first, then the options popup.
      if (askInstall) setAskInstall(null);
      else onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, askInstall]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  function toggleAddOn(addOn: StoreAddOn) {
    const slug = addOn.slug;
    if (options.addOns?.includes(slug)) {
      // Un-tick: drop it and any installation picked for it.
      setOptions((o) => ({
        ...o,
        addOns: (o.addOns ?? []).filter((s) => s !== slug),
        installation: (o.installation ?? []).filter((s) => s !== slug),
      }));
      return;
    }
    // Every add-on asks whether to include installation before it goes in.
    setAskInstall(addOn);
  }

  function selectAddOn(slug: string, withInstallation: boolean) {
    setOptions((o) => ({
      ...o,
      addOns: [...(o.addOns ?? []).filter((s) => s !== slug), slug],
      installation: withInstallation
        ? [...(o.installation ?? []).filter((s) => s !== slug), slug]
        : (o.installation ?? []).filter((s) => s !== slug),
    }));
    setAskInstall(null);
  }

  function add() {
    setTried(true);
    if (picked.missing.length > 0) return;
    addItem(product.id, qty, options);
    onAdded?.();
    onClose();
    if (buyNow) openDrawer();
  }

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Options for ${product.name}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="animate-fade-in fixed inset-0 z-110 flex items-end justify-center bg-ink/70 backdrop-blur-sm sm:items-center sm:p-6"
    >
      <div className="animate-fade-up relative flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-[0_28px_80px_-20px_rgba(0,0,0,0.4)] sm:rounded-2xl">
        {/* Header */}
        <header className="flex items-start justify-between gap-4 border-b border-line p-5 sm:p-6">
          <div className="flex min-w-0 items-center gap-3">
            {product.media[0]?.type === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.media[0].url} alt="" className="h-14 w-14 shrink-0 rounded-lg bg-soft object-cover" />
            ) : (
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand">
                <Icon name={product.icon as IconName} className="h-7 w-7" />
              </span>
            )}
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand">Choose your options</p>
              <h2 className="truncate text-lg font-extrabold tracking-tight text-ink">{product.name}</h2>
              <p className="text-xs text-muted">{product.model}</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-soft hover:text-ink"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M6 18L18 6" />
            </svg>
          </button>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto p-5 sm:p-6">
          {choices.hardware.length > 0 && (
            <Section title="Hardware" required error={tried && picked.missing.includes("hardware") ? "Choose a hardware option." : ""}>
              <div className="grid gap-2 sm:grid-cols-3">
                {choices.hardware.map((h) => (
                  <Choice
                    key={h.name}
                    selected={options.hardware === h.name}
                    onClick={() => setOptions((o) => ({ ...o, hardware: h.name }))}
                    title={h.name}
                    price={formatPrice(h.price)}
                    image={h.image_url ?? undefined}
                    stacked={hardwareHasImages}
                    radio
                  />
                ))}
              </div>
            </Section>
          )}

          {choices.addOns.length > 0 && (
            <Section title="Add-ons" hint="Optional · one-time">
              <div className="grid gap-2 sm:grid-cols-2">
                {choices.addOns.map((a) => {
                  const chosen = picked.addOns.find((p) => p.slug === a.slug);
                  return (
                    <Choice
                      key={a.slug}
                      selected={Boolean(chosen)}
                      onClick={() => toggleAddOn(a)}
                      title={a.name}
                      subtitle={chosen ? (chosen.withInstallation ? "With installation" : "Without installation") : a.subtitle}
                      price={
                        chosen
                          ? `+${formatPrice(chosen.total)}`
                          : a.installationPrice > 0
                            ? `+${formatPrice(a.price)} · install +${formatPrice(a.installationPrice)}`
                            : `+${formatPrice(a.price)}`
                      }
                      image={a.media.find((m) => m.type === "image")?.url}
                      icon={a.icon}
                    />
                  );
                })}
              </div>
              {picked.addOns.length > 0 && (
                <p className="mt-2 text-[11px] text-muted">
                  To change an add-on&apos;s installation choice, un-tick it and tick it again.
                </p>
              )}
            </Section>
          )}

          {choices.plans.length > 0 && (
            <Section title="Platform Subscription" required error={tried && picked.missing.includes("plan") ? "Choose a platform subscription." : ""}>
              <div className="grid gap-2 sm:grid-cols-2">
                {choices.plans.map((p) => (
                  <Choice
                    key={p.slug}
                    selected={options.plan === p.slug}
                    onClick={() => setOptions((o) => ({ ...o, plan: p.slug }))}
                    title={p.name}
                    subtitle={p.fleet_size ?? p.description}
                    price={`${formatPrice(p.price)}/${p.billing_period === "yearly" ? "yr" : "mo"}`}
                    badge={p.is_popular ? "Popular" : undefined}
                    radio
                  />
                ))}
              </div>
              <p className="mt-2 text-[11px] text-muted">
                Per device. The first {picked.plan ? periodWord(picked.months) : "period"} is paid now; it then renews
                automatically and is billed to your account.
              </p>
            </Section>
          )}

          {choices.bandwidth.length > 0 && (
            <Section title="Video Bandwidth" hint="Optional · monthly, billed with your subscription">
              {!picked.plan ? (
                <p className="rounded-lg bg-soft px-3 py-2 text-xs text-muted">Choose a platform subscription first.</p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-3">
                  <Choice
                    selected={!options.bandwidth}
                    onClick={() => setOptions((o) => ({ ...o, bandwidth: undefined }))}
                    title="No video bandwidth"
                    price={formatPrice(0)}
                    radio
                  />
                  {choices.bandwidth.map((b) => (
                    <Choice
                      key={b.slug}
                      selected={options.bandwidth === b.slug}
                      onClick={() => setOptions((o) => ({ ...o, bandwidth: b.slug }))}
                      title={b.name}
                      subtitle={b.description}
                      price={`+${formatPrice(b.price)}/mo`}
                      radio
                    />
                  ))}
                </div>
              )}
            </Section>
          )}

          {/* Total checkpoint */}
          <section className="rounded-xl border border-line bg-cloud p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-ink">Total checkpoint</h3>
              <Stepper qty={qty} max={maxQty} onChange={setQty} />
            </div>
            <dl className="space-y-1.5 text-sm">
              <Row label={picked.hardware ? `Hardware — ${picked.hardware.name}` : "Hardware"} value={picked.hardware?.price ?? product.price} qty={qty} />
              {picked.addOns.map((a) => (
                <Row
                  key={a.slug}
                  label={`Add-on — ${a.name}${a.withInstallation ? " (with installation)" : ""}`}
                  value={a.total}
                  qty={qty}
                />
              ))}
              {picked.plan && (
                <Row label={`${picked.plan.name} — first ${periodWord(picked.months)}`} value={picked.plan.price} qty={qty} />
              )}
              {picked.bandwidth && (
                <Row
                  label={`${picked.bandwidth.name} — ${picked.months} ${picked.months === 1 ? "month" : "months"}`}
                  value={picked.bandwidth.price * picked.months}
                  qty={qty}
                />
              )}
            </dl>
            <div className="mt-3 flex items-baseline justify-between border-t border-line pt-3">
              <span className="text-sm font-semibold uppercase tracking-wider text-muted">Due today</span>
              <span className="text-2xl font-extrabold tracking-tight text-ink">{formatPrice(dueToday)}</span>
            </div>
            {picked.plan && (
              <p className="mt-1 text-right text-[11px] text-muted">
                Then {formatPrice(picked.planUnit * qty)} per {periodWord(picked.months)} for the subscription
                {picked.bandwidth ? " and video bandwidth" : ""}.
              </p>
            )}
          </section>
        </div>

        {/* Actions */}
        <footer className="flex gap-2 border-t border-line p-4 sm:p-5">
          <Button type="button" variant="secondary" size="md" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="primary" size="md" className="flex-[2]" onClick={add}>
            {buyNow ? "Buy Now" : "Add to Cart"} — {formatPrice(dueToday)}
          </Button>
        </footer>
      </div>

      {askInstall && (
        <InstallationPrompt
          addOn={askInstall}
          onPick={(withInstallation) => selectAddOn(askInstall.slug, withInstallation)}
          onCancel={() => setAskInstall(null)}
        />
      )}
    </div>,
    document.body
  );
}

/** "Include installation?" — asked when an add-on that offers installation is ticked. */
function InstallationPrompt({
  addOn,
  onPick,
  onCancel,
}: {
  addOn: StoreAddOn;
  onPick: (withInstallation: boolean) => void;
  onCancel: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Installation for ${addOn.name}`}
      onClick={(e) => {
        e.stopPropagation();
        if (e.target === e.currentTarget) onCancel();
      }}
      className="animate-fade-in absolute inset-0 z-10 flex items-end justify-center bg-ink/60 p-4 sm:items-center"
    >
      <div className="animate-fade-up w-full max-w-xl rounded-2xl bg-white p-5 shadow-[0_28px_80px_-20px_rgba(0,0,0,0.4)] sm:p-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-brand">Add-on</p>
        <h3 className="mt-0.5 text-lg font-extrabold tracking-tight text-ink">{addOn.name}</h3>
        <p className="mt-1 text-sm text-muted">Would you like us to install it for you?</p>

        <div className="mt-4 grid gap-2">
          <button
            type="button"
            onClick={() => onPick(true)}
            className="flex items-center justify-between gap-3 rounded-xl border border-brand bg-brand/5 p-3 text-left ring-1 ring-brand transition-colors hover:bg-brand/10"
          >
            <span>
              <span className="block text-[13px] font-semibold text-ink">With installation</span>
              <span className="block text-[11px] text-muted">
                {addOn.installationPrice > 0
                  ? `Add-on ${formatPrice(addOn.price)} + installation ${formatPrice(addOn.installationPrice)}`
                  : "Our team installs it — no installation fee"}
              </span>
            </span>
            <span className="shrink-0 whitespace-nowrap text-sm font-bold text-brand">+{formatPrice(addOn.price + addOn.installationPrice)}</span>
          </button>
          <button
            type="button"
            onClick={() => onPick(false)}
            className="flex items-center justify-between gap-3 rounded-xl border border-line bg-white p-3 text-left transition-colors hover:border-brand/40"
          >
            <span>
              <span className="block text-[13px] font-semibold text-ink">Without installation</span>
              <span className="block text-[11px] text-muted">Add-on only — you install it yourself</span>
            </span>
            <span className="shrink-0 whitespace-nowrap text-sm font-bold text-brand">+{formatPrice(addOn.price)}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="mt-3 w-full rounded-full px-4 py-2 text-xs font-semibold text-muted transition-colors hover:bg-soft hover:text-ink"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function Section({
  title,
  required = false,
  hint,
  error,
  children,
}: {
  title: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-2 flex flex-wrap items-baseline gap-x-2">
        <h3 className="text-sm font-bold text-ink">{title}</h3>
        {required ? (
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand">Required</span>
        ) : (
          hint && <span className="text-[11px] text-muted">{hint}</span>
        )}
      </div>
      {children}
      {error && <p className="mt-1.5 text-xs font-semibold text-brand">{error}</p>}
    </section>
  );
}

/** A selectable tile — radio (one of) or checkbox (any of). */
function Choice({
  selected,
  onClick,
  title,
  subtitle,
  price,
  image,
  icon,
  badge,
  radio = false,
  stacked = false,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  subtitle?: string | null;
  price: string;
  image?: string;
  icon?: IconName;
  badge?: string;
  radio?: boolean;
  /** Large picture above the text instead of a small thumbnail beside it. */
  stacked?: boolean;
}) {
  if (stacked) {
    return (
      <button
        type="button"
        role={radio ? "radio" : "checkbox"}
        aria-checked={selected}
        onClick={onClick}
        className={`relative flex w-full flex-col overflow-hidden rounded-xl border text-left transition-colors ${
          selected ? "border-brand bg-brand/5 ring-1 ring-brand" : "border-line bg-white hover:border-brand/40"
        }`}
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="aspect-[4/3] w-full bg-soft object-contain p-2" />
        ) : (
          <span className="grid aspect-[4/3] w-full place-items-center bg-soft text-muted">
            <Icon name="truck" className="h-8 w-8" />
          </span>
        )}
        <span className="flex items-start gap-2 p-3">
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-semibold leading-snug text-ink">{title}</span>
            {subtitle && <span className="mt-0.5 block truncate text-[11px] text-muted">{subtitle}</span>}
            <span className="mt-0.5 block text-xs font-bold text-brand">{price}</span>
          </span>
          <span
            aria-hidden
            className={`grid h-5 w-5 shrink-0 place-items-center border ${radio ? "rounded-full" : "rounded"} ${
              selected ? "border-brand bg-brand text-white" : "border-line bg-white"
            }`}
          >
            {selected && <Icon name="check" className="h-3 w-3" />}
          </span>
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      role={radio ? "radio" : "checkbox"}
      aria-checked={selected}
      onClick={onClick}
      className={`relative flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
        selected ? "border-brand bg-brand/5 ring-1 ring-brand" : "border-line bg-white hover:border-brand/40"
      }`}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="h-11 w-11 shrink-0 rounded-lg bg-soft object-cover" />
      ) : (
        icon && (
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-soft text-brand">
            <Icon name={icon} className="h-5 w-5" />
          </span>
        )
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-semibold leading-snug text-ink">{title}</span>
        {subtitle && <span className="mt-0.5 block truncate text-[11px] text-muted">{subtitle}</span>}
        <span className="mt-0.5 block text-xs font-bold text-brand">{price}</span>
      </span>
      <span
        aria-hidden
        className={`grid h-5 w-5 shrink-0 place-items-center border ${radio ? "rounded-full" : "rounded"} ${
          selected ? "border-brand bg-brand text-white" : "border-line bg-white"
        }`}
      >
        {selected && <Icon name="check" className="h-3 w-3" />}
      </span>
      {badge && (
        <span className="absolute -top-2 right-3 rounded-full bg-brand px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
          {badge}
        </span>
      )}
    </button>
  );
}

function Row({ label, value, qty }: { label: string; value: number; qty: number }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-muted">
        {label}
        {qty > 1 && <span className="text-[11px]"> × {qty}</span>}
      </dt>
      <dd className="shrink-0 font-semibold text-ink">{formatPrice(value * qty)}</dd>
    </div>
  );
}

function Stepper({ qty, max, onChange }: { qty: number; max: number; onChange: (qty: number) => void }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-line bg-white">
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={qty <= 1}
        onClick={() => onChange(qty - 1)}
        className="grid h-7 w-7 place-items-center rounded-l-lg text-ink transition-colors hover:bg-soft disabled:opacity-30"
      >
        −
      </button>
      <span className="min-w-6 text-center text-sm font-semibold text-ink" aria-live="polite">
        {qty}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={qty >= max}
        onClick={() => onChange(qty + 1)}
        className="grid h-7 w-7 place-items-center rounded-r-lg text-ink transition-colors hover:bg-soft disabled:opacity-30"
      >
        +
      </button>
    </div>
  );
}
