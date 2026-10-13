import Link from "next/link";
import { InvoicePrintStyles } from "@/components/invoice/InvoicePrint";
import { PrintButton } from "@/components/invoice/PrintButton";
import { RenewalInvoiceSheet } from "@/components/invoice/RenewalInvoiceSheet";
import { PageHeader } from "@/components/admin/PageHeader";
import { adminGet } from "@/lib/admin/api";
import type { AdminSubscriptionInvoiceDetail } from "@/lib/admin/types";

export const dynamic = "force-dynamic";

/** Printable copy of a subscription renewal invoice. */
export default async function RenewalInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: inv } = await adminGet<{ data: AdminSubscriptionInvoiceDetail }>(`/api/admin/subscription-invoices/${id}`);

  return (
    <>
      <InvoicePrintStyles />
      <PageHeader title={`Invoice ${inv.reference}`}>
        <Link
          href="/admin/subscriptions/billing"
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          ← Renewal Billing
        </Link>
      </PageHeader>

      <div className="p-5 lg:p-8">
        <div className="mx-auto mb-4 flex max-w-[816px] items-center justify-end gap-3 print:hidden">
          <PrintButton />
        </div>
        <RenewalInvoiceSheet
          invoice={{
            ...inv,
            subscription_reference: inv.subscription?.reference ?? null,
            bill_to: inv.bill_to ?? (inv.customer ? { ...inv.customer, company: null, phone: null } : null),
          }}
        />
      </div>
    </>
  );
}
