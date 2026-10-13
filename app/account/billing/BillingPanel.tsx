"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  AccountError,
  formatShortDate,
  getInvoices,
  peso,
  type Invoice,
} from "@/lib/account";
import {
  Card,
  EmptyState,
  ErrorState,
  InvoiceBadge,
  PanelSkeleton,
  StatTile,
} from "@/components/account/ui";
import { PayInvoiceButton } from "@/components/account/PayInvoiceButton";
import { FormNotice } from "@/components/auth/AuthShell";

/** Billing tab: every subscription invoice, newest period first. */
export function BillingPanel() {
  const { token, signOut } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[] | null>(null);
  const [totals, setTotals] = useState({ outstanding: 0, paid_all_time: 0 });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Bumping this re-runs the fetch below — how the panel refreshes after a payment.
  const [reloadKey, setReloadKey] = useState(0);
  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    void (async () => {
      try {
        const res = await getInvoices(token);
        if (cancelled) return;
        setInvoices(res.data);
        setTotals(res.totals);
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
  if (!invoices) return <PanelSkeleton />;

  const onPaid = (message: string) => {
    setNotice(message);
    reload();
  };

  return (
    <div className="space-y-6">
      {notice && <FormNotice message={notice} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <StatTile
          label="Outstanding balance"
          value={peso(totals.outstanding)}
          sub={totals.outstanding > 0 ? "Pay to keep tracking active" : "Nothing due right now"}
          tone={totals.outstanding > 0 ? "brand" : "good"}
        />
        <StatTile
          label="Paid to date"
          value={peso(totals.paid_all_time)}
          sub="Across all subscription renewals"
        />
      </div>

      <Card title="Invoices">
        {invoices.length === 0 ? (
          <EmptyState
            title="No invoices yet"
            message="Renewal invoices appear here about a month before your subscription's renewal date."
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-full divide-y divide-line text-sm">
                <thead className="bg-cloud">
                  <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-subtle">
                    <th className="px-5 py-3">Invoice</th>
                    <th className="px-5 py-3">Period</th>
                    <th className="px-5 py-3">Due</th>
                    <th className="px-5 py-3 text-right">Amount</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {invoices.map((invoice) => (
                    <tr key={invoice.reference} className="hover:bg-cloud/60">
                      <td className="px-5 py-3">
                        <InvoiceLink reference={invoice.reference} />
                        <p className="max-w-xs truncate text-xs text-muted">{invoice.description}</p>
                      </td>
                      <td className="px-5 py-3 text-xs text-muted">
                        {formatShortDate(invoice.period_start)} → {formatShortDate(invoice.period_end)}
                      </td>
                      <td className="px-5 py-3 text-xs">
                        <span className={invoice.is_overdue ? "font-semibold text-red-600" : "text-muted"}>
                          {formatShortDate(invoice.due_date)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-ink">{peso(invoice.amount)}</td>
                      <td className="px-5 py-3">
                        <InvoiceBadge status={invoice.status} />
                        {invoice.paid_at && (
                          <p className="mt-1 text-[11px] text-muted">
                            {formatShortDate(invoice.paid_at)}
                            {invoice.payment_method ? ` · ${invoice.payment_method}` : ""}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            href={invoiceHref(invoice.reference)}
                            className="whitespace-nowrap text-xs font-semibold text-muted hover:text-brand"
                          >
                            View / Print
                          </Link>
                          {(invoice.status === "unpaid" || invoice.status === "awaiting") && (
                            <PayInvoiceButton invoice={invoice} onPaid={onPaid} label="Pay" />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul className="divide-y divide-line lg:hidden">
              {invoices.map((invoice) => (
                <li key={invoice.reference} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <InvoiceLink reference={invoice.reference} />
                      <p className="mt-0.5 text-xs text-muted">{invoice.description}</p>
                    </div>
                    <p className="shrink-0 text-sm font-bold text-ink">{peso(invoice.amount)}</p>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <InvoiceBadge status={invoice.status} />
                    <span className={`text-xs ${invoice.is_overdue ? "font-semibold text-red-600" : "text-muted"}`}>
                      due {formatShortDate(invoice.due_date)}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-4">
                    {(invoice.status === "unpaid" || invoice.status === "awaiting") && (
                      <PayInvoiceButton invoice={invoice} onPaid={onPaid} label="Pay now" />
                    )}
                    <Link href={invoiceHref(invoice.reference)} className="text-xs font-semibold text-muted hover:text-brand">
                      View / Print invoice
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>

      <p className="text-center text-xs text-subtle">
        Open any invoice to print it or save it as a PDF. Billing question? Email{" "}
        <a href="mailto:trackproph@gmail.com" className="font-semibold text-muted hover:text-brand">
          trackproph@gmail.com
        </a>
        .
      </p>
    </div>
  );
}

const invoiceHref = (reference: string) => `/account/billing/${encodeURIComponent(reference)}`;

function InvoiceLink({ reference }: { reference: string }) {
  return (
    <Link
      href={invoiceHref(reference)}
      className="font-mono text-xs font-semibold text-ink hover:text-brand hover:underline"
    >
      {reference}
    </Link>
  );
}
