import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { InvoiceEditor } from "@/components/invoice/InvoiceEditor";
import { adminGet } from "@/lib/admin/api";
import type { CustomInvoicePayment, SalesInvoice } from "@/lib/admin/types";
import { updateCustomInvoice } from "../actions";
import { DeleteInvoiceButton } from "../DeleteInvoiceButton";
import { MarkPaidButton } from "../MarkPaidButton";

export const dynamic = "force-dynamic";

export default async function CustomInvoicePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const { saved } = await searchParams;
  const { data, payment } = await adminGet<{ data: SalesInvoice; payment: CustomInvoicePayment }>(
    `/api/admin/custom-invoices/${id}`,
  );

  return (
    <>
      <PageHeader title={`Invoice ${data.number}`}>
        <Link
          href="/admin/invoices/new"
          className="rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          + New Invoice
        </Link>
        <Link
          href="/admin/invoices"
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          ← Invoices
        </Link>
      </PageHeader>
      <div className="p-5 lg:p-8">
        {saved && (
          <div className="mx-auto mb-4 max-w-[816px] rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800 print:hidden">
            Invoice saved.
          </div>
        )}
        <div className="mx-auto mb-4 flex max-w-[816px] flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 print:hidden">
          <p className="text-xs text-gray-500">
            {payment.paid
              ? "This invoice is paid and counted in Sales Reports."
              : "Not paid yet — mark it paid once the money comes in so the sale shows in Sales Reports."}
          </p>
          <MarkPaidButton id={Number(id)} payment={payment} />
        </div>
        <InvoiceEditor
          initial={data}
          initiallyEdited
          onSave={updateCustomInvoice.bind(null, Number(id))}
          hint="Saved invoice."
          actions={<DeleteInvoiceButton id={Number(id)} number={data.number} />}
        />
      </div>
    </>
  );
}
