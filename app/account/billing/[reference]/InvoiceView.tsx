"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { AccountError, getInvoice } from "@/lib/account";
import { ErrorState, PanelSkeleton } from "@/components/account/ui";
import { InvoicePrintStyles } from "@/components/invoice/InvoicePrint";
import { PrintButton } from "@/components/invoice/PrintButton";
import { RenewalInvoiceSheet, type RenewalInvoice } from "@/components/invoice/RenewalInvoiceSheet";

/** The customer's printable copy of one renewal invoice. */
export function InvoiceView({ reference }: { reference: string }) {
  const { token, signOut } = useAuth();
  const [invoice, setInvoice] = useState<RenewalInvoice | null>(null);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    void (async () => {
      try {
        const data = await getInvoice(token, reference);
        if (cancelled) return;
        setInvoice(data);
        setError("");
      } catch (err) {
        if (cancelled) return;
        if (err instanceof AccountError && err.status === 401) {
          signOut();
          return;
        }
        setError(
          err instanceof AccountError && err.status === 404
            ? "We couldn't find that invoice on your account."
            : err instanceof Error
              ? err.message
              : "Something went wrong."
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, reference, reloadKey, signOut]);

  return (
    <div className="space-y-4">
      <InvoicePrintStyles />
      <div className="mx-auto flex max-w-[816px] flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href="/account/billing" className="text-sm font-semibold text-muted hover:text-brand">
          ← Back to Billing
        </Link>
        {invoice && <PrintButton label="Print / Save PDF" />}
      </div>

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : invoice ? (
        <RenewalInvoiceSheet invoice={invoice} />
      ) : (
        <PanelSkeleton />
      )}
    </div>
  );
}
