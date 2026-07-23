"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminApi } from "@/lib/admin/api";

export async function updateOrder(id: number, formData: FormData) {
  const res = await adminApi(`/api/admin/orders/${id}`, {
    method: "PATCH",
    json: {
      status: String(formData.get("status") ?? ""),
      payment_status: String(formData.get("payment_status") ?? ""),
    },
  });
  if (res.status === 401 || res.status === 403) redirect("/admin/login");
  revalidatePath(`/admin/orders/${id}`);
}

export async function markPaid(id: number) {
  const res = await adminApi(`/api/admin/orders/${id}/mark-paid`, { method: "POST" });
  if (res.status === 401 || res.status === 403) redirect("/admin/login");
  revalidatePath(`/admin/orders/${id}`);
}
