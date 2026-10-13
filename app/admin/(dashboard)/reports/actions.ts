"use server";

import { redirect } from "next/navigation";
import { adminApi } from "@/lib/admin/api";
import type { SalesInvoice } from "@/lib/admin/types";

type Result = { ok: boolean; message?: string; invoice?: SalesInvoice; edited?: boolean };

async function handle(res: Response): Promise<Result> {
  if (res.status === 401 || res.status === 403) redirect("/admin/login");
  const body = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, message: body?.message ?? `Could not save the invoice (${res.status}).` };
  return { ok: true, invoice: body.data, edited: body.edited };
}

export async function saveInvoice(orderId: number, invoice: SalesInvoice): Promise<Result> {
  return handle(await adminApi(`/api/admin/orders/${orderId}/invoice`, { method: "PUT", json: invoice }));
}

/** Throw away the admin's edits and regenerate the invoice from the order. */
export async function resetInvoice(orderId: number): Promise<Result> {
  return handle(await adminApi(`/api/admin/orders/${orderId}/invoice`, { method: "DELETE" }));
}
