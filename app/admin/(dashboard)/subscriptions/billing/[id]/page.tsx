import Link from "next/link";
import { InvoiceEditor } from "@/components/invoice/InvoiceEditor";
import { statusPill } from "@/components/invoice/RenewalInvoiceSheet";
import { PageHeader } from "@/components/admin/PageHeader";
import { adminGet } from "@/lib/admin/api";
import type { AdminSubscriptionInvoiceDetail } from "@/lib/admin/types";
import { resetRenewalPrintout, saveRenewalPrintout } from "../../../reports/actions";

export const dynamic = "force-dynamic";

/** Customizable printable copy of a subscription renewal invoice. */
export default async function RenewalInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: inv } = await adminGet<{ data: AdminSubscriptionInvoiceDetail }>(`/api/admin/subscription-invoices/${id}`);

  return (
    <>
      <PageHeader title={`Invoice ${inv.reference}`}>
        <Link
          href="/admin/subscriptions/billing"
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          ← Renewal Billing
        </Link>
      </PageHeader>

      <div className="p-5 lg:p-8">
        <InvoiceEditor
          initial={inv.printout}
          initiallyEdited={inv.printout_edited}
          onSave={saveRenewalPrintout.bind(null, inv.id)}
          onReset={resetRenewalPrintout.bind(null, inv.id)}
          status={statusPill[inv.status]}
          paid={inv.status === "paid"}
          billedAmount={inv.status === "void" ? undefined : inv.amount}
        />
      </div>
    </>
  );
}
