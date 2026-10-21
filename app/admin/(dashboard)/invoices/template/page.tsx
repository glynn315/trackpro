import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { InvoiceEditor } from "@/components/invoice/InvoiceEditor";
import { adminGet } from "@/lib/admin/api";
import type { SalesInvoice } from "@/lib/admin/types";
import { saveInvoiceTemplate } from "../actions";

export const dynamic = "force-dynamic";

/**
 * The company invoice template, edited on a sample invoice so the admin sees
 * exactly what customers get. Only the template parts are saved.
 */
export default async function InvoiceTemplatePage() {
  const { data: template } = await adminGet<{ data: Partial<SalesInvoice> }>("/api/admin/invoice-template");
  const today = new Date().toISOString().slice(0, 10);

  const sample: SalesInvoice = {
    ...template,
    number: "INV-000123",
    date: today,
    due_date: today,
    bill_to: {
      name: "Juan Dela Cruz",
      company: "Sample Logistics Inc.",
      email: "juan@example.com",
      phone: "0917 123 4567",
      address: "123 Sample St., Makati City",
    },
    items: [
      { description: "GPS tracker — sample item", qty: 2, unit_price: 2500 },
      { description: "Monthly tracking subscription", qty: 2, unit_price: 599 },
    ],
    discount: 0,
    notes: template.notes ?? null,
  };

  return (
    <>
      <PageHeader title="Invoice Template">
        <Link
          href="/admin/invoices"
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          ← Invoices
        </Link>
      </PageHeader>
      <div className="p-5 lg:p-8">
        <div className="mx-auto mb-4 max-w-[816px] rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900 print:hidden">
          <p className="font-semibold">This is the invoice every customer receives.</p>
          <p className="mt-1">
            The letterhead, title, notes, footer, and any fields or sections you add are saved as the template and used
            for every new order, renewal and custom invoice, including the copy customers see in their account.
            Invoices already saved keep what they were saved with. The invoice number, dates, customer and line items
            below are sample data for preview and aren&apos;t saved. Values you type in added fields become their
            defaults (leave a value blank to fill it in per invoice).
          </p>
        </div>
        <InvoiceEditor initial={sample} initiallyEdited onSave={saveInvoiceTemplate} hint="Editing the template." />
      </div>
    </>
  );
}
