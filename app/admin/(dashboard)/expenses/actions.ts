"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminApi } from "@/lib/admin/api";

function toInt(v: FormDataEntryValue | null): number {
  const n = parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

export async function createExpense(formData: FormData) {
  const res = await adminApi("/api/admin/expenses", {
    method: "POST",
    json: {
      title: String(formData.get("title") ?? "").trim(),
      category: String(formData.get("category") ?? "Other").trim() || "Other",
      amount: toInt(formData.get("amount")),
      incurred_on: String(formData.get("incurred_on") ?? "").trim(),
      notes: String(formData.get("notes") ?? "").trim() || null,
    },
  });
  if (res.status === 401 || res.status === 403) redirect("/admin/login");
  if (!res.ok) redirect("/admin/expenses?error=1");

  revalidatePath("/admin/expenses");
  redirect("/admin/expenses?saved=1");
}

export async function deleteExpense(id: number): Promise<boolean> {
  const res = await adminApi(`/api/admin/expenses/${id}`, { method: "DELETE" });
  if (res.status === 401 || res.status === 403) redirect("/admin/login");
  return res.ok;
}
