"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { payInvoice, type Invoice } from "@/lib/account";
import { Spinner } from "@/components/auth/AuthShell";

/**
 * Pays one subscription invoice.
 *
 * When PayMongo is configured the API answers with a hosted checkout URL and we
 * hand the browser over to it — the invoice is only settled later by the
 * webhook. Without a gateway the API records the payment directly (the same
 * temporary stand-in the order flow uses) and we refresh in place.
 */
export function PayInvoiceButton({
  invoice,
  onPaid,
  className = "",
  label = "Pay now",
}: {
  invoice: Invoice;
  onPaid?: (message: string) => void;
  className?: string;
  label?: string;
}) {
  const { token } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function pay() {
    if (!token) return;
    setBusy(true);
    setError("");

    try {
      // Always ask the API first, even when a checkout link was raised earlier.
      // It re-checks the gateway, so a customer who already paid is told so
      // instead of being sent back to a settled checkout page. The API returns
      // the still-valid link when payment really is outstanding.
      const res = await payInvoice(token, invoice.reference);
      if (res.checkout_url) {
        window.location.assign(res.checkout_url);
        return;
      }
      onPaid?.(res.message ?? "Payment recorded. Your subscription has been renewed.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment could not be processed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={pay}
        disabled={busy}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? (
          <>
            <Spinner /> Processing…
          </>
        ) : (
          label
        )}
      </button>
      {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
