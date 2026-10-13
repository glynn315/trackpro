import type { Metadata } from "next";
import { InvoiceView } from "./InvoiceView";

export const metadata: Metadata = {
  title: "Invoice",
  robots: { index: false, follow: false },
};

export default async function AccountInvoicePage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  return <InvoiceView reference={decodeURIComponent(reference)} />;
}
