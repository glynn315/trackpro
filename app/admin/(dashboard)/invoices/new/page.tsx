import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { InvoiceEditor } from "@/components/invoice/InvoiceEditor";
import { adminGet } from "@/lib/admin/api";
import type { SalesInvoice } from "@/lib/admin/types";
import { createCustomInvoice } from "../actions";

export const dynamic = "force-dynamic";

/** A blank invoice, numbered and dated, ready to fill in. */
export default async function NewInvoicePage() {
  const { data } = await adminGet<{ data: SalesInvoice }>("/api/admin/custom-invoices/new");

  return (
    <>
      <PageHeader title="New Invoice">
        <Link
          href="/admin/invoices"
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          ← Invoices
        </Link>
      </PageHeader>
      <div className="p-5 lg:p-8">
        <InvoiceEditor
          initial={data}
          initiallyEdited={false}
          onSave={createCustomInvoice}
          hint="Fill in the customer and line items, then Save."
        />
      </div>
    </>
  );
}
