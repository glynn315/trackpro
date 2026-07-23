"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { formatPrice, siteConfig } from "@/lib/site";
import { CheckoutModal } from "@/components/ui/CheckoutModal";
import { AuthModal } from "@/components/ui/AuthModal";

export function CartDrawer() {
  const {
    drawerOpen,
    closeDrawer,
    lines,
    itemCount,
    subtotal,
    subscriptionTotal,
    setQty,
    removeItem,
    clearCart,
  } = useCart();
  const { user, signOut } = useAuth();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  function handleCheckoutClick() {
    if (!user) {
      setAuthOpen(true);
    } else {
      setCheckoutOpen(true);
    }
  }

  // Esc closes drawer; body scroll lock while open
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [drawerOpen, closeDrawer]);

  if (!drawerOpen || typeof document === "undefined") return null;

  return createPortal(
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className="fixed inset-0 z-100 flex justify-end"
      >
        {/* Backdrop */}
        <button
          type="button"
          aria-label="Close cart"
          onClick={closeDrawer}
          className="animate-fade-in absolute inset-0 bg-ink/60 backdrop-blur-sm"
        />

        {/* Drawer panel */}
        <aside className="animate-slide-in-right relative flex h-full w-full max-w-md flex-col bg-white shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.3)]">
          {/* Header */}
          <header className="relative border-b border-line bg-linear-to-br from-ink via-[#141414] to-ink p-5 text-white sm:p-6">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-50 blur-3xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(237,28,36,0.45) 0%, transparent 70%)",
              }}
            />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-light">
                  Your Cart
                </p>
                <h2 className="mt-0.5 text-xl font-extrabold tracking-tight sm:text-2xl">
                  {itemCount === 0
                    ? "Your cart is empty"
                    : `${itemCount} ${itemCount === 1 ? "item" : "items"}`}
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close cart"
                onClick={closeDrawer}
                className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M6 18L18 6" />
                </svg>
              </button>
            </div>
          </header>

          {/* Items list — scrollable */}
          {lines.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
              <span className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-soft text-muted">
                <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M6 7h12l-1.5 11a2 2 0 0 1-2 1.75H9.5a2 2 0 0 1-2-1.75L6 7z" />
                  <path d="M9 7V5a3 3 0 0 1 6 0v2" />
                </svg>
              </span>
              <h3 className="text-base font-semibold text-ink">No items yet</h3>
              <p className="mt-1 text-sm text-muted">
                Browse our trackers and add one to get started.
              </p>
              <Button
                type="button"
                variant="primary"
                size="md"
                className="mt-6"
                onClick={closeDrawer}
              >
                Continue shopping
              </Button>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
              <ul className="space-y-4">
                {lines.map((line) => (
                  <li
                    key={line.productId}
                    className="flex gap-3 rounded-xl border border-line bg-white p-3"
                  >
                    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand">
                      <Icon name="truck" className="h-7 w-7" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-ink">
                            {line.product.name}
                          </p>
                          <p className="text-xs text-muted">Model {line.product.model}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(line.productId)}
                          aria-label={`Remove ${line.product.name}`}
                          className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted transition-colors hover:bg-soft hover:text-brand"
                        >
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14" />
                          </svg>
                        </button>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <QtyControl
                          qty={line.qty}
                          onChange={(q) => setQty(line.productId, q)}
                          label={line.product.name}
                        />
                        <div className="text-right">
                          <p className="text-sm font-semibold text-ink">
                            {formatPrice(line.lineTotal)}
                          </p>
                          {line.subscriptionTotal > 0 && (
                            <p className="text-[11px] text-muted">
                              + {formatPrice(line.subscriptionTotal)}/mo
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={clearCart}
                className="mt-5 text-xs font-medium text-muted underline-offset-4 transition-colors hover:text-brand hover:underline"
              >
                Clear cart
              </button>
            </div>
          )}

          {/* Footer — totals + checkout */}
          {lines.length > 0 && (
            <footer className="border-t border-line bg-cloud p-5 sm:p-6">
              <dl className="space-y-1.5 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-muted">Hardware subtotal</dt>
                  <dd className="font-semibold text-ink">{formatPrice(subtotal)}</dd>
                </div>
                {subscriptionTotal > 0 && (
                  <div className="flex items-center justify-between">
                    <dt className="text-muted">Monthly subscription</dt>
                    <dd className="font-semibold text-ink">
                      {formatPrice(subscriptionTotal)}/mo
                    </dd>
                  </div>
                )}
              </dl>
              <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
                <span className="text-sm font-semibold uppercase tracking-wider text-muted">
                  Total today
                </span>
                <span className="text-2xl font-extrabold tracking-tight text-ink">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <Button
                type="button"
                variant="primary"
                size="lg"
                className="mt-5 w-full"
                onClick={handleCheckoutClick}
              >
                {user ? (
                  <>
                    Checkout <Icon name="arrow" className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <rect x="4" y="11" width="16" height="10" rx="2" />
                      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                    </svg>
                    Sign in to Checkout
                  </>
                )}
              </Button>
              {user ? (
                <p className="mt-3 text-center text-[11px] text-muted">
                  Signed in as <span className="font-semibold text-ink">{user.name}</span> ·{" "}
                  <button
                    type="button"
                    onClick={signOut}
                    className="font-semibold text-brand transition-colors hover:text-brand-dark"
                  >
                    Sign out
                  </button>
                </p>
              ) : (
                <p className="mt-3 text-center text-[11px] text-muted">
                  Prefer to chat?{" "}
                  <a
                    href={siteConfig.contact.messenger}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-brand hover:text-brand-dark"
                  >
                    Message us on Messenger
                  </a>
                </p>
              )}
            </footer>
          )}
        </aside>
      </div>

      {authOpen && (
        <AuthModal
          reason="Sign in to checkout"
          onClose={() => setAuthOpen(false)}
          onSuccess={() => {
            setAuthOpen(false);
            // Auto-advance to checkout after successful auth
            setCheckoutOpen(true);
          }}
        />
      )}

      {checkoutOpen && (
        <CheckoutModal
          onClose={() => setCheckoutOpen(false)}
          onSuccess={() => {
            setCheckoutOpen(false);
          }}
        />
      )}
    </>,
    document.body
  );
}

function QtyControl({
  qty,
  onChange,
  label,
}: {
  qty: number;
  onChange: (qty: number) => void;
  label: string;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-line bg-white">
      <button
        type="button"
        aria-label={`Decrease ${label} quantity`}
        onClick={() => onChange(qty - 1)}
        className="grid h-7 w-7 place-items-center rounded-l-lg text-ink transition-colors hover:bg-soft"
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
          <path d="M5 12h14" />
        </svg>
      </button>
      <span className="min-w-6 text-center text-sm font-semibold text-ink" aria-live="polite">
        {qty}
      </span>
      <button
        type="button"
        aria-label={`Increase ${label} quantity`}
        onClick={() => onChange(qty + 1)}
        className="grid h-7 w-7 place-items-center rounded-r-lg text-ink transition-colors hover:bg-soft"
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </div>
  );
}
