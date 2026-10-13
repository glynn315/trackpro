"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import {
  AccountError,
  formatDate,
  formatShortDate,
  getDashboard,
  peso,
  relativeDays,
  type DashboardData,
} from "@/lib/account";
import {
  Card,
  EmptyState,
  ErrorState,
  InvoiceBadge,
  PanelSkeleton,
  Row,
  StatTile,
  SubscriptionBadge,
} from "@/components/account/ui";
import { PayInvoiceButton } from "@/components/account/PayInvoiceButton";
import { FormNotice } from "@/components/auth/AuthShell";

/**
 * The account dashboard: subscription status, renewal date, and what's owed —
 * kept deliberately short, with details on the Subscription and Billing tabs.
 */
export function AccountOverview({ justReset = false }: { justReset?: boolean }) {
  const { token, signOut } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(justReset ? "Your password has been updated." : "");

  // Bumping this re-runs the fetch below — how the page refreshes after a payment.
  const [reloadKey, setReloadKey] = useState(0);
  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    void (async () => {
      try {
        const dashboard = await getDashboard(token);
        if (cancelled) return;
        setData(dashboard);
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

  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return <PanelSkeleton />;

  const { stats, subscription, open_invoices, recent_orders } = data;
  const dueInvoice = open_invoices[0] ?? null;

  return (
    <div className="space-y-6">
      {notice && <FormNotice message={notice} />}

      {/* Three numbers that matter */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile
          label="Subscription"
          value={subscription ? SUBSCRIPTION_VALUE[subscription.status] : "None"}
          sub={
            subscription
              ? `${subscription.quantity} device${subscription.quantity === 1 ? "" : "s"} · ${subscription.plan_name}`
              : "No active tracking plan"
          }
          tone={
            !subscription
              ? "default"
              : subscription.status === "active"
                ? "good"
                : subscription.status === "past_due" || subscription.status === "expired"
                  ? "bad"
                  : "warn"
          }
        />
        <StatTile
          label="Next renewal"
          value={stats.next_renewal_date ? formatShortDate(stats.next_renewal_date) : "—"}
          sub={
            stats.days_until_renewal === null || stats.days_until_renewal === undefined
              ? "Nothing scheduled"
              : `Renews ${relativeDays(stats.days_until_renewal)}`
          }
          tone={
            stats.days_until_renewal !== null && stats.days_until_renewal < 0
              ? "bad"
              : stats.days_until_renewal !== null && stats.days_until_renewal <= 30
                ? "warn"
                : "default"
          }
        />
        <StatTile
          label="Amount due"
          value={peso(stats.amount_due)}
          sub={
            stats.unpaid_invoices > 0
              ? `${stats.unpaid_invoices} unpaid invoice${stats.unpaid_invoices === 1 ? "" : "s"}`
              : "You're all paid up 👍"
          }
          tone={stats.amount_due > 0 ? "brand" : "good"}
        />
      </div>

      {/* Renewal call to action */}
      {dueInvoice && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand/25 bg-brand/5 p-5">
          <div>
            <p className="font-bold text-ink">
              {dueInvoice.is_overdue ? "Your renewal is overdue" : "Your yearly renewal is ready"}
            </p>
            <p className="mt-0.5 text-sm text-muted">
              {dueInvoice.description} — due {formatDate(dueInvoice.due_date)}.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xl font-extrabold text-ink">{peso(dueInvoice.amount)}</span>
            <PayInvoiceButton
              invoice={dueInvoice}
              onPaid={(message) => {
                setNotice(message);
                reload();
              }}
            />
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Subscription summary */}
        <Card
          title="My subscription"
          action={
            <Link
              href="/account/subscription"
              className="text-sm font-semibold text-brand hover:underline"
            >
              Details →
            </Link>
          }
        >
          {subscription ? (
            <div className="divide-y divide-line px-5 py-2">
              <Row label="Plan" value={subscription.plan_name} />
              <Row label="Status" value={<SubscriptionBadge status={subscription.status} />} />
              <Row
                label="Devices"
                value={`${subscription.quantity} × ${peso(subscription.unit_price)}/yr`}
              />
              <Row label="Renews on" value={formatDate(subscription.renews_at)} />
              <Row
                label="Yearly total"
                value={<span className="text-brand">{peso(subscription.price)}</span>}
              />
            </div>
          ) : (
            <EmptyState
              title="No subscription yet"
              message="Subscriptions start automatically when you buy a TrackPro device — or pick a plan yourself."
              action={
                <Link
                  href="/account/subscription"
                  className="inline-flex h-10 items-center rounded-full bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-dark"
                >
                  View plans
                </Link>
              }
            />
          )}
        </Card>

        {/* Billing snapshot */}
        <Card
          title="Billing"
          action={
            <Link href="/account/billing" className="text-sm font-semibold text-brand hover:underline">
              All invoices →
            </Link>
          }
        >
          {open_invoices.length === 0 ? (
            <EmptyState
              title="Nothing due"
              message="Your renewal invoice will appear here about a month before it's due."
            />
          ) : (
            <ul className="divide-y divide-line">
              {open_invoices.map((invoice) => (
                <li key={invoice.reference} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{invoice.reference}</p>
                    <p className="truncate text-xs text-muted">
                      Due {formatShortDate(invoice.due_date)}
                      {invoice.is_overdue && <span className="ml-1 font-semibold text-red-600">· overdue</span>}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-ink">{peso(invoice.amount)}</p>
                    <InvoiceBadge status={invoice.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Recent orders */}
      <Card
        title="Recent orders"
        action={
          <Link href="/account/orders" className="text-sm font-semibold text-brand hover:underline">
            All orders →
          </Link>
        }
      >
        {recent_orders.length === 0 ? (
          <EmptyState
            title="No orders yet"
            message="Devices you buy from the shop will show up here."
            action={
              <Link
                href="/products"
                className="inline-flex h-10 items-center rounded-full bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-dark"
              >
                Browse devices
              </Link>
            }
          />
        ) : (
          <ul className="divide-y divide-line">
            {recent_orders.map((order) => (
              <li key={order.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{order.reference}</p>
                  <p className="text-xs text-muted">{formatShortDate(order.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-ink">{peso(order.hardware_subtotal)}</p>
                  <p className="text-xs capitalize text-muted">{order.payment_status}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

const SUBSCRIPTION_VALUE: Record<string, string> = {
  active: "Active",
  pending: "Pending",
  past_due: "Past due",
  expired: "Expired",
  cancelled: "Cancelled",
};
