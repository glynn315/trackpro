"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminApi } from "@/lib/admin/api";

function toInt(v: FormDataEntryValue | null): number {
  const n = parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

function parseHighlights(v: FormDataEntryValue | null): string[] {
  return String(v ?? "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

export async function createProduct(formData: FormData) {
  const res = await adminApi("/api/admin/products", {
    method: "POST",
    json: {
      name: String(formData.get("name") ?? "").trim(),
      slug: String(formData.get("slug") ?? "").trim() || null,
      model: String(formData.get("model") ?? "").trim(),
      category: String(formData.get("category") ?? "").trim(),
      icon: String(formData.get("icon") ?? "").trim() || null,
      price: toInt(formData.get("price")),
      subscription: toInt(formData.get("subscription")),
      tagline: String(formData.get("tagline") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim() || null,
      highlights: parseHighlights(formData.get("highlights")),
      stock: toInt(formData.get("stock")),
      featured: formData.get("featured") === "1",
      is_active: formData.get("is_active") !== "0",
    },
  });
  if (res.status === 401 || res.status === 403) redirect("/admin/login");
  if (!res.ok) redirect("/admin/products/new?error=1");

  revalidatePath("/admin/products");
  redirect("/admin/products?saved=created");
}

export async function updateProduct(id: number, formData: FormData) {
  const res = await adminApi(`/api/admin/products/${id}`, {
    method: "PATCH",
    json: {
      price: toInt(formData.get("price")),
      subscription: toInt(formData.get("subscription")),
      stock: toInt(formData.get("stock")),
      featured: formData.get("featured") === "1",
      is_active: formData.get("is_active") !== "0",
    },
  });
  if (res.status === 401 || res.status === 403) redirect("/admin/login");
  if (!res.ok) redirect(`/admin/products/${id}/edit?error=1`);

  revalidatePath("/admin/products");
  redirect("/admin/products?saved=updated");
}

export async function adjustStock(id: number, delta: number): Promise<{ stock: number } | null> {
  const res = await adminApi(`/api/admin/products/${id}/stock`, {
    method: "POST",
    json: { delta },
  });
  if (res.status === 401 || res.status === 403) redirect("/admin/login");
  if (!res.ok) return null;
  const json = await res.json();
  return { stock: json.data?.stock ?? 0 };
}
