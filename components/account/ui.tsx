"use client";

import {
  INVOICE_STATUS_CLASS,
  INVOICE_STATUS_LABEL,
  SUBSCRIPTION_STATUS_CLASS,
  SUBSCRIPTION_STATUS_LABEL,
  type InvoiceStatus,
  type SubscriptionStatus,
} from "@/lib/account";

/** Section wrapper used by every account panel. */
export function Card({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`overflow-hidden rounded-2xl border border-line bg-white ${className}`}>
      {(title || action) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
          {title && <h2 className="font-bold text-ink">{title}</h2>}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function StatTile({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: string;
  sub?: React.ReactNode;
  tone?: "default" | "brand" | "good" | "warn" | "bad";
}) {
  const valueTone = {
    default: "text-ink",
    brand: "text-brand",
    good: "text-emerald-700",
    warn: "text-amber-700",
    bad: "text-red-600",
  }[tone];

  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-subtle">{label}</p>
      <p className={`mt-2 text-2xl font-extrabold tracking-tight sm:text-[28px] ${valueTone}`}>
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
    </div>
  );
}

export function SubscriptionBadge({ status }: { status: SubscriptionStatus }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${SUBSCRIPTION_STATUS_CLASS[status]}`}
    >
      {SUBSCRIPTION_STATUS_LABEL[status]}
    </span>
  );
}

export function InvoiceBadge({ status }: { status: InvoiceStatus }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${INVOICE_STATUS_CLASS[status]}`}
    >
      {INVOICE_STATUS_LABEL[status]}
    </span>
  );
}

export function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 py-2.5">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm font-semibold text-ink">{value}</span>
    </div>
  );
}

export function PanelSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-28 rounded-2xl border border-line bg-white" />
        ))}
      </div>
      <div className="h-56 rounded-2xl border border-line bg-white" />
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
      <p className="text-sm font-semibold text-red-900">We couldn&apos;t load this page</p>
      <p className="mt-1 text-sm text-red-800">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  message,
  action,
}: {
  title: string;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="px-5 py-12 text-center">
      <p className="font-semibold text-ink">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{message}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
