"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  AccountError,
  cancelSubscription,
  formatDate,
  formatShortDate,
  getPlans,
  getSubscriptions,
  peso,
  relativeDays,
  renewSubscription,
  subscribeToPlan,
  type Plan,
  type Subscription,
} from "@/lib/account";
import {
  Card,
  EmptyState,
  ErrorState,
  InvoiceBadge,
  PanelSkeleton,
  Row,
  SubscriptionBadge,
} from "@/components/account/ui";
import { PayInvoiceButton } from "@/components/account/PayInvoiceButton";
import { FormError, FormNotice, Spinner } from "@/components/auth/AuthShell";

/** Subscription tab: what's covered, when it renews, and how to pay for it. */
export function SubscriptionPanel() {
  const { token, signOut } = useAuth();
  const [subs, setSubs] = useState<Subscription[] | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState<string>("");

  // Bumping this re-runs the fetch below — how the panel refreshes after an action.
  const [reloadKey, setReloadKey] = useState(0);
  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    void (async () => {
      try {
        const [subscriptions, planList] = await Promise.all([getSubscriptions(token), getPlans()]);
        if (cancelled) return;
        setSubs(subscriptions);
        setPlans(planList);
        setError("");
      } catch (err) {
        if (cancelled) return;
        // A rejected token means the stored session is stale — start over.
        if (err instanceof AccountError && err.status === 401) {
          signOut();
          return;
        }
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, reloadKey, signOut]);

  async function renew(reference: string) {
    if (!token) return;
    setBusy(reference);
    setActionError("");
    try {
      const { checkout_url } = await renewSubscription(token, reference);
      if (checkout_url) {
        window.location.assign(checkout_url);
        return;
      }
      setNotice("Your renewal invoice is ready below — pay it to extend your subscription.");
      reload();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Could not start the renewal.");
    } finally {
      setBusy("");
    }
  }

  async function cancel(reference: string) {
    if (!token) return;
    if (!window.confirm("Cancel this subscription? Tracking stops at the end of the paid period.")) {
      return;
    }
    setBusy(reference);
    setActionError("");
    try {
      await cancelSubscription(token, reference);
      setNotice("Auto-renewal has been switched off and your subscription is cancelled.");
      reload();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Could not cancel the subscription.");
    } finally {
      setBusy("");
    }
  }

  async function subscribe(slug: string, quantity: number) {
    if (!token) return;
    setBusy(slug);
    setActionError("");
    try {
      const { checkout_url } = await subscribeToPlan(token, slug, quantity);
      if (checkout_url) {
        window.location.assign(checkout_url);
        return;
      }
      setNotice("Plan selected — pay the invoice below to activate your subscription.");
      reload();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Could not start the subscription.");
    } finally {
      setBusy("");
    }
  }

  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!subs) return <PanelSkeleton />;

  const live = subs.filter((s) => s.status !== "cancelled");
  const closed = subs.filter((s) => s.status === "cancelled");

  return (
    <div className="space-y-6">
      {notice && <FormNotice message={notice} />}
      {actionError && <FormError message={actionError} />}

      {live.length === 0 && (
        <Card title="No active subscription">
          <EmptyState
            title="You don't have a tracking plan yet"
            message="A yearly subscription starts automatically when you buy a TrackPro device. You can also pick a plan below."
          />
        </Card>
      )}

      {live.map((sub) => (
        <SubscriptionCard
          key={sub.reference}
          sub={sub}
          busy={busy === sub.reference}
          onRenew={() => void renew(sub.reference)}
          onCancel={() => void cancel(sub.reference)}
          onPaid={(message) => {
            setNotice(message);
            reload();
          }}
        />
      ))}

      {/* Plans — how a customer adds coverage without buying hardware. */}
      {plans.length > 0 && (
        <Card title={live.length === 0 ? "Choose a plan" : "Add another plan"}>
          <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <PlanCard
                key={plan.slug}
                plan={plan}
                busy={busy === plan.slug}
                onSubscribe={(qty) => void subscribe(plan.slug, qty)}
              />
            ))}
          </div>
        </Card>
      )}

      {closed.length > 0 && (
        <Card title="Cancelled subscriptions">
          <ul className="divide-y divide-line">
            {closed.map((sub) => (
              <li key={sub.reference} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
                <div>
                  <p className="text-sm font-semibold text-ink">{sub.plan_name}</p>
                  <p className="text-xs text-muted">
                    {sub.reference} · ended {formatShortDate(sub.renews_at)}
                  </p>
                </div>
                <SubscriptionBadge status={sub.status} />
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function SubscriptionCard({
  sub,
  busy,
  onRenew,
  onCancel,
  onPaid,
}: {
  sub: Subscription;
  busy: boolean;
  onRenew: () => void;
  onCancel: () => void;
  onPaid: (message: string) => void;
}) {
  const open = sub.open_invoice;
  const lapsed = sub.days_until_renewal < 0;

  return (
    <Card
      title={sub.plan_name}
      action={<SubscriptionBadge status={sub.status} />}
      className={lapsed ? "border-red-200" : ""}
    >
      <div className="grid gap-6 p-5 lg:grid-cols-[1.2fr_1fr]">
        <div className="divide-y divide-line">
          <Row label="Reference" value={<span className="font-mono text-xs">{sub.reference}</span>} />
          <Row label="Billing" value={sub.billing_period === "yearly" ? "Once a year" : "Monthly"} />
          <Row
            label="Devices covered"
            value={`${sub.quantity} × ${peso(sub.unit_price)} per ${sub.billing_period === "yearly" ? "year" : "month"}`}
          />
          <Row label="Started" value={formatDate(sub.starts_at)} />
          <Row
            label="Renewal date"
            value={
              <span className={lapsed ? "text-red-600" : ""}>
                {formatDate(sub.renews_at)} ({relativeDays(sub.days_until_renewal)})
              </span>
            }
          />
          <Row label="Last payment" value={formatShortDate(sub.last_paid_at)} />
          <Row
            label="Yearly total"
            value={<span className="text-base text-brand">{peso(sub.price)}</span>}
          />
        </div>

        <div className="rounded-xl border border-line bg-cloud p-4">
          {open ? (
            <>
              <p className="text-[11px] font-bold uppercase tracking-wider text-subtle">
                {open.is_overdue ? "Overdue invoice" : "Renewal invoice"}
              </p>
              <p className="mt-2 text-2xl font-extrabold text-ink">{peso(open.amount)}</p>
              <p className="mt-1 text-xs text-muted">
                {open.reference} · due {formatShortDate(open.due_date)}
              </p>
              <div className="mt-2">
                <InvoiceBadge status={open.status} />
              </div>
              <p className="mt-3 text-xs text-muted">
                Covers {formatShortDate(open.period_start)} → {formatShortDate(open.period_end)}
              </p>
              <PayInvoiceButton
                invoice={open}
                onPaid={onPaid}
                className="mt-4"
                label={`Pay ${peso(open.amount)}`}
              />
            </>
          ) : (
            <>
              <p className="text-[11px] font-bold uppercase tracking-wider text-subtle">
                Nothing to pay
              </p>
              <p className="mt-2 text-sm text-muted">
                Your next invoice is raised about a month before{" "}
                {formatShortDate(sub.renews_at)}. You can also renew early.
              </p>
              <button
                type="button"
                onClick={onRenew}
                disabled={busy}
                className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white transition-colors hover:bg-black disabled:opacity-60"
              >
                {busy ? (
                  <>
                    <Spinner /> Preparing…
                  </>
                ) : (
                  "Renew early"
                )}
              </button>
            </>
          )}

          {sub.notes && <p className="mt-4 text-[11px] leading-relaxed text-subtle">{sub.notes}</p>}

          {sub.status !== "cancelled" && (
            <button
              type="button"
              onClick={onCancel}
              disabled={busy}
              className="mt-4 block text-xs font-semibold text-muted underline hover:text-red-600 disabled:opacity-60"
            >
              Cancel subscription
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}

function PlanCard({
  plan,
  busy,
  onSubscribe,
}: {
  plan: Plan;
  busy: boolean;
  onSubscribe: (quantity: number) => void;
}) {
  const [qty, setQty] = useState(1);

  return (
    <div className="flex flex-col rounded-xl border border-line bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold text-ink">{plan.name}</h3>
        {plan.is_popular && (
          <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand">
            Popular
          </span>
        )}
      </div>
      <p className="mt-2">
        <span className="text-2xl font-extrabold text-ink">{peso(plan.price)}</span>
        <span className="text-xs text-muted">
          {" "}
          / {plan.billing_period === "yearly" ? "year" : "month"} per device
        </span>
      </p>
      {plan.description && <p className="mt-2 text-xs text-muted">{plan.description}</p>}
      {plan.features && plan.features.length > 0 && (
        <ul className="mt-3 space-y-1.5 text-xs text-muted">
          {plan.features.map((feature) => (
            <li key={feature} className="flex gap-2">
              <span className="text-brand">✓</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex items-center gap-2 pt-2">
        <label htmlFor={`qty-${plan.slug}`} className="text-xs text-muted">
          Devices
        </label>
        <input
          id={`qty-${plan.slug}`}
          type="number"
          min={1}
          max={100}
          value={qty}
          onChange={(e) => setQty(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
          className="w-16 rounded-lg border border-line px-2 py-1 text-sm"
        />
      </div>
      <button
        type="button"
        onClick={() => onSubscribe(qty)}
        disabled={busy}
        className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
      >
        {busy ? (
          <>
            <Spinner /> Starting…
          </>
        ) : (
          `Subscribe — ${peso(plan.price * qty)}/yr`
        )}
      </button>
    </div>
  );
}
