"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { formatPrice, siteConfig } from "@/lib/site";
import { checkCartStock, describeStockIssue, type StockIssue } from "@/lib/stock";

const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? "";
const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

type Status = "idle" | "submitting" | "success" | "error";
type PlacedOrder = { reference: string; total: number };

export function CheckoutModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { lines, subtotal, subscriptionTotal, clearCart } = useCart();
  const { user, token, resendVerification, refresh } = useAuth();
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [stockIssues, setStockIssues] = useState<StockIssue[]>([]);
  const [resent, setResent] = useState(false);
  const [order, setOrder] = useState<PlacedOrder | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);
  const [paying, setPaying] = useState<"idle" | "paying" | "error">("idle");

  // Esc + body scroll lock
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && status !== "submitting") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, status]);

  function buildOrderSummary(): string {
    const lineDescriptions = lines.map(
      (l) =>
        `• ${l.qty} × ${l.product.name} (${l.product.model}) — ${formatPrice(l.lineTotal)}` +
        (l.subscriptionTotal > 0 ? ` + ${formatPrice(l.subscriptionTotal)}/mo` : "")
    );
    return [
      ...lineDescriptions,
      "",
      `Hardware subtotal: ${formatPrice(subtotal)}`,
      subscriptionTotal > 0 ? `Monthly subscription: ${formatPrice(subscriptionTotal)}/mo` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Capture the form before any await — React nulls e.currentTarget after.
    const form = e.currentTarget;
    setStatus("submitting");
    setErrorMessage("");
    setStockIssues([]);

    // Confirm stock is still available before placing the order.
    const issues = await checkCartStock(
      lines.map((l) => ({ productId: l.productId, name: l.product.name, qty: l.qty }))
    );
    if (issues.length > 0) {
      setStockIssues(issues);
      setStatus("idle");
      return;
    }

    if (!API_BASE) {
      setStatus("error");
      setErrorMessage("Online ordering is temporarily unavailable.");
      return;
    }

    const data = new FormData(form);
    const customer = {
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      phone: String(data.get("phone") ?? "").trim(),
      address: String(data.get("address") ?? "").trim(),
      notes: String(data.get("notes") ?? "").trim() || undefined,
    };
    const items = lines.map((l) => ({ slug: l.productId, qty: l.qty }));
    const orderedTotal = subtotal;
    const summary = buildOrderSummary();

    try {
      // Create the real order — the backend re-prices from the DB and
      // decrements stock inside a transaction (rejects if anything sold out).
      const res = await fetch(`${API_BASE}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ items, customer }),
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        // Email verification lapsed/needed — refresh state so the gate shows.
        if (res.status === 403 && json?.code === "email_unverified") {
          await refresh().catch(() => {});
          setStatus("idle");
          return;
        }
        setStatus("error");
        setErrorMessage(json?.message || "We couldn't place your order. Please try again.");
        return;
      }

      const reference: string = json.order?.reference ?? "";
      setOrder({ reference, total: json.order?.hardware_subtotal ?? orderedTotal });
      setCheckoutUrl(json.checkout_url ?? null);

      // Best-effort team notification by email — non-blocking.
      if (WEB3FORMS_KEY) {
        const notify = new FormData();
        notify.append("access_key", WEB3FORMS_KEY);
        notify.append("subject", `New Order ${reference} — ${formatPrice(orderedTotal)}`);
        notify.append("from_name", "TrackPro Website Orders");
        notify.append("order_reference", reference);
        notify.append("name", customer.name);
        notify.append("email", customer.email);
        notify.append("phone", customer.phone);
        notify.append("address", customer.address);
        if (customer.notes) notify.append("notes", customer.notes);
        notify.append("order_summary", summary);
        void fetch("https://api.web3forms.com/submit", { method: "POST", body: notify }).catch(() => {});
      }

      clearCart();
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please try Messenger or call us instead.");
    }
  }

  async function payTemporary() {
    if (!order || !API_BASE) return;
    setPaying("paying");
    try {
      const res = await fetch(
        `${API_BASE}/api/orders/${encodeURIComponent(order.reference)}/pay`,
        { method: "POST", headers: { Accept: "application/json" } }
      );
      if (!res.ok) throw new Error();
      setPaid(true);
      setPaying("idle");
    } catch {
      setPaying("error");
    }
  }

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Checkout"
      onClick={(e) => {
        if (e.target === e.currentTarget && status !== "submitting") onClose();
      }}
      className="animate-fade-in fixed inset-0 z-110 flex items-center justify-center overflow-y-auto bg-ink/70 p-4 backdrop-blur-sm sm:p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-fade-up relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-[0_28px_80px_-20px_rgba(0,0,0,0.4)]"
      >
        {/* Header */}
        <div className="relative border-b border-line bg-linear-to-br from-ink via-[#141414] to-ink p-6 text-white sm:p-7">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full opacity-50 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(237,28,36,0.45) 0%, transparent 70%)",
            }}
          />
          <p className="relative text-[10px] font-bold uppercase tracking-widest text-brand-light">
            Checkout
          </p>
          <h3 className="relative mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
            {status === "success" ? "Order received!" : "Place your order"}
          </h3>
          <p className="relative mt-1 text-sm text-white/70">
            {status === "success"
              ? "We'll contact you shortly to confirm delivery and installation."
              : "Send your details — we'll confirm via email or Messenger."}
          </p>
          <button
            type="button"
            aria-label="Close"
            onClick={() => status !== "submitting" && onClose()}
            disabled={status === "submitting"}
            className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M6 18L18 6" />
            </svg>
          </button>
        </div>

        {/* Body */}
        {status === "success" ? (
          <div className="p-7 text-center sm:p-8">
            <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-emerald-500 text-white shadow-[0_10px_30px_-8px_rgba(16,185,129,0.55)]">
              <Icon name="check" className="h-8 w-8" />
            </div>
            <h4 className="text-xl font-bold text-ink">Salamat! Order received.</h4>
            {order?.reference && (
              <p className="mt-1 text-sm text-muted">
                Reference <span className="font-bold text-ink">{order.reference}</span>
              </p>
            )}

            {/* Payment */}
            {paid ? (
              <div className="mx-auto mt-5 max-w-sm rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                <p className="font-semibold">Payment received (temporary)</p>
                <p className="mt-1">
                  Your order is marked as paid. We&apos;ll confirm delivery and installation shortly.
                </p>
              </div>
            ) : checkoutUrl ? (
              <div className="mx-auto mt-5 max-w-sm">
                <ButtonLink href={checkoutUrl} variant="primary" size="md" className="w-full">
                  Proceed to secure payment
                </ButtonLink>
              </div>
            ) : (
              <div className="mx-auto mt-5 max-w-sm rounded-xl border border-line bg-cloud p-4 text-left">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Amount due</span>
                  <span className="font-bold text-ink">{formatPrice(order?.total ?? 0)}</span>
                </div>
                <p className="mt-1 text-xs text-muted">
                  Temporary payment — a stand-in until the live payment gateway is connected.
                </p>
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  className="mt-3 w-full"
                  onClick={payTemporary}
                  disabled={paying === "paying"}
                >
                  {paying === "paying" ? (
                    <>
                      <Spinner /> Processing…
                    </>
                  ) : (
                    "Pay now (temporary)"
                  )}
                </Button>
                {paying === "error" && (
                  <p className="mt-2 text-center text-xs text-red-600">
                    Couldn&apos;t record payment — you can settle on delivery instead.
                  </p>
                )}
              </div>
            )}

            <p className="mt-5 text-sm text-muted">
              Our team will reach out within one business day to confirm payment, delivery,
              and installation schedule.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <ButtonLink
                href={siteConfig.contact.messenger}
                target="_blank"
                rel="noopener noreferrer"
                variant="primary"
                size="md"
              >
                Message on Messenger
              </ButtonLink>
              <Button type="button" variant="secondary" size="md" onClick={onSuccess}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="max-h-[70vh] overflow-y-auto">
            {user && !user.emailVerified && (
              <div className="mx-6 mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 sm:mx-7">
                <p className="font-semibold">Verify your email to place an order</p>
                <p className="mt-1">
                  We sent a verification link to <span className="font-semibold">{user.email}</span>.
                  Click it, then come back.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      await resendVerification();
                      setResent(true);
                    }}
                    className="rounded-full border border-amber-400 px-3 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-100"
                  >
                    {resent ? "Link sent ✓" : "Resend link"}
                  </button>
                  <button
                    type="button"
                    onClick={() => refresh()}
                    className="rounded-full border border-amber-400 px-3 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-100"
                  >
                    I&apos;ve verified — refresh
                  </button>
                </div>
              </div>
            )}
            <div className="grid gap-6 p-6 sm:p-7 lg:grid-cols-[1.2fr_1fr]">
              {/* Form fields */}
              <div>
                <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted">
                  Your details
                </h4>

                {/* Honeypot */}
                <input
                  type="checkbox"
                  name="botcheck"
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                />

                <div className="space-y-4">
                  <Field
                    label="Full name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    defaultValue={user?.name}
                  />
                  <Field
                    label="Email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    defaultValue={user?.email}
                  />
                  <Field
                    label="Contact number"
                    name="phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    placeholder="09XX XXX XXXX"
                    defaultValue={user?.phone}
                  />
                  <Field
                    label="Delivery address"
                    name="address"
                    type="text"
                    required
                    autoComplete="street-address"
                    placeholder="Street, Barangay, City, Province"
                  />
                  <div>
                    <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-ink">
                      Notes <span className="text-muted">(optional)</span>
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      rows={3}
                      className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                      placeholder="Vehicle type, preferred install date, anything else we should know."
                    />
                  </div>
                </div>
              </div>

              {/* Order summary */}
              <aside className="rounded-xl border border-line bg-cloud p-5">
                <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted">
                  Order summary
                </h4>
                <ul className="space-y-3 border-b border-line pb-4">
                  {lines.map((line) => (
                    <li key={line.productId} className="flex gap-3 text-sm">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-brand/10 text-[11px] font-bold text-brand">
                        ×{line.qty}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink">
                          {line.product.name}
                        </p>
                        <p className="text-xs text-muted">
                          {formatPrice(line.product.price)} each
                          {line.product.subscription > 0 &&
                            ` · ${formatPrice(line.product.subscription)}/mo`}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-ink">
                        {formatPrice(line.lineTotal)}
                      </span>
                    </li>
                  ))}
                </ul>
                <dl className="mt-4 space-y-1.5 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-muted">Hardware</dt>
                    <dd className="font-semibold text-ink">{formatPrice(subtotal)}</dd>
                  </div>
                  {subscriptionTotal > 0 && (
                    <div className="flex items-center justify-between">
                      <dt className="text-muted">Monthly</dt>
                      <dd className="font-semibold text-ink">
                        {formatPrice(subscriptionTotal)}/mo
                      </dd>
                    </div>
                  )}
                </dl>
                <div className="mt-3 flex items-baseline justify-between border-t border-line pt-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted">
                    Total today
                  </span>
                  <span className="text-xl font-extrabold tracking-tight text-ink">
                    {formatPrice(subtotal)}
                  </span>
                </div>
              </aside>
            </div>

            {stockIssues.length > 0 && (
              <div
                role="alert"
                className="mx-6 mb-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 sm:mx-7"
              >
                <div className="flex items-start gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-amber-500 text-xs font-bold text-white">
                    !
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold">Some items are no longer available</p>
                    <ul className="mt-1.5 list-disc space-y-0.5 pl-4">
                      {stockIssues.map((issue) => (
                        <li key={issue.productId}>{describeStockIssue(issue)}</li>
                      ))}
                    </ul>
                    <p className="mt-2">
                      Please{" "}
                      <button
                        type="button"
                        onClick={onClose}
                        className="font-semibold underline underline-offset-2 hover:text-amber-700"
                      >
                        review your cart
                      </button>{" "}
                      to adjust quantities before ordering.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {status === "error" && (
              <div
                role="alert"
                className="mx-6 mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:mx-7"
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-red-500 text-xs font-bold text-white">
                  !
                </span>
                <p>{errorMessage} Try Messenger or call us instead.</p>
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-line bg-cloud p-6 sm:flex-row sm:justify-end sm:p-7">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={onClose}
                disabled={status === "submitting"}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={status === "submitting" || (!!user && !user.emailVerified)}
              >
                {status === "submitting" ? (
                  <>
                    <Spinner /> Sending order…
                  </>
                ) : !!user && !user.emailVerified ? (
                  "Verify email to order"
                ) : (
                  <>
                    Place Order — {formatPrice(subtotal)} <Icon name="arrow" className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}

function Field({
  label,
  name,
  type,
  required,
  autoComplete,
  placeholder,
  defaultValue,
}: {
  label: string;
  name: string;
  type: string;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
        {required && <span className="ml-0.5 text-brand">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
      />
    </div>
  );
}

function Spinner() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 animate-spin" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
