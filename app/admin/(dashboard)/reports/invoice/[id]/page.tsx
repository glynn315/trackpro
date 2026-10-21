import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { InvoiceEditor } from "@/components/invoice/InvoiceEditor";
import { adminGet } from "@/lib/admin/api";
import type { SalesInvoice } from "@/lib/admin/types";
import { resetInvoice, saveInvoice } from "../../actions";

export const dynamic = "force-dynamic";

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data, edited } = await adminGet<{ data: SalesInvoice; edited: boolean }>(`/api/admin/orders/${id}/invoice`);

  return (
    <>
      <PageHeader title={`Invoice ${data.number}`}>
        <Link
          href="/admin/reports"
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          ← Sales Reports
        </Link>
      </PageHeader>
      <div className="p-5 lg:p-8">
        <InvoiceEditor
          initial={data}
          initiallyEdited={edited}
          onSave={saveInvoice.bind(null, Number(id))}
          onReset={resetInvoice.bind(null, Number(id))}
        />
      </div>
    </>
  );
}
