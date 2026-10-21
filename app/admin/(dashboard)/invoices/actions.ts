"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminApi } from "@/lib/admin/api";
import type { SalesInvoice } from "@/lib/admin/types";
import type { InvoiceSaveResult as Result } from "@/components/invoice/InvoiceEditor";

async function failure(res: Response, fallback: string): Promise<Result> {
  if (res.status === 401 || res.status === 403) redirect("/admin/login");
  const body = await res.json().catch(() => ({}));
  return { ok: false, message: body?.message ?? `${fallback} (${res.status}).` };
}

/** Save a new invoice, then open it at its own address. */
export async function createCustomInvoice(invoice: SalesInvoice): Promise<Result> {
  const res = await adminApi("/api/admin/custom-invoices", { method: "POST", json: invoice });
  if (!res.ok) return failure(res, "Could not save the invoice");

  const { id } = (await res.json()) as { id: number };
  revalidatePath("/admin/invoices");
  redirect(`/admin/invoices/${id}?saved=1`);
}

export async function updateCustomInvoice(id: number, invoice: SalesInvoice): Promise<Result> {
  const res = await adminApi(`/api/admin/custom-invoices/${id}`, { method: "PUT", json: invoice });
  if (!res.ok) return failure(res, "Could not save the invoice");

  const body = await res.json();
  revalidatePath("/admin/invoices");
  return { ok: true, invoice: body.data, edited: true };
}

/** Save the company invoice template; the API keeps only the template parts of what the editor sends. */
export async function saveInvoiceTemplate(invoice: SalesInvoice): Promise<Result> {
  const res = await adminApi("/api/admin/invoice-template", { method: "PUT", json: invoice });
  if (!res.ok) return failure(res, "Could not save the template");

  const body = await res.json();
  return { ok: true, invoice: body.data, edited: true };
}

export async function deleteCustomInvoice(id: number): Promise<Result> {
  const res = await adminApi(`/api/admin/custom-invoices/${id}`, { method: "DELETE" });
  if (!res.ok) return failure(res, "Could not delete the invoice");

  revalidatePath("/admin/invoices");
  redirect(`/admin/invoices?saved=${encodeURIComponent("Invoice deleted.")}`);
}
