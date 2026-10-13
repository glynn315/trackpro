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
      expense_category_id: toInt(formData.get("expense_category_id")) || null,
      wallet_id: toInt(formData.get("wallet_id")) || null,
      amount: toInt(formData.get("amount")),
      invoice_reference: String(formData.get("invoice_reference") ?? "").trim() || null,
      incurred_on: String(formData.get("incurred_on") ?? "").trim(),
      notes: String(formData.get("notes") ?? "").trim() || null,
    },
  });
  if (res.status === 401 || res.status === 403) redirect("/admin/login");
  if (!res.ok) {
    const message = await res
      .json()
      .then((b) => b?.message ?? "")
      .catch(() => "");
    redirect(`/admin/expenses?error=${encodeURIComponent(message || "1")}`);
  }

  revalidatePath("/admin/expenses");
  redirect("/admin/expenses?saved=1");
}

export async function deleteExpense(id: number): Promise<boolean> {
  const res = await adminApi(`/api/admin/expenses/${id}`, { method: "DELETE" });
  if (res.status === 401 || res.status === 403) redirect("/admin/login");
  return res.ok;
}

/* ------------------------------------------------------------ categories */

type Result = { ok: boolean; message?: string };

async function result(res: Response, fallback: string): Promise<Result> {
  if (res.status === 401 || res.status === 403) redirect("/admin/login");
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const first = body?.errors ? (Object.values(body.errors).flat()[0] as string | undefined) : undefined;
    return { ok: false, message: first ?? body?.message ?? fallback };
  }
  revalidatePath("/admin/expenses");
  revalidatePath("/admin/expenses/categories");
  return { ok: true, message: body?.message };
}

export async function saveCategory(
  id: number | null,
  data: { name?: string; requires_reference?: boolean }
): Promise<Result> {
  const res = id
    ? await adminApi(`/api/admin/expense-categories/${id}`, { method: "PATCH", json: data })
    : await adminApi("/api/admin/expense-categories", { method: "POST", json: data });
  return result(res, "Could not save the category.");
}

/** Delete a category; one with expenses moves them to `moveTo` first. */
export async function deleteCategory(id: number, moveTo: number | null): Promise<Result> {
  const qs = moveTo ? `?move_to=${moveTo}` : "";
  return result(
    await adminApi(`/api/admin/expense-categories/${id}${qs}`, { method: "DELETE" }),
    "Could not delete the category."
  );
}
