"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminApi } from "@/lib/admin/api";
import { parseMediaInput } from "@/lib/admin/media";

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

/** Every editable product field, shared by the create and edit forms. */
function productJson(formData: FormData) {
  return {
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
    media: parseMediaInput(formData.get("media")),
    stock: toInt(formData.get("stock")),
    featured: formData.get("featured") === "1",
    is_active: formData.get("is_active") !== "0",
    ...cartOptionsJson(formData),
  };
}

/** Add-to-cart choices from `CartOptionsField` — omitted when the form doesn't include it. */
function cartOptionsJson(formData: FormData) {
  if (formData.get("cart_options") !== "1") return {};
  const list = (field: string): unknown[] => {
    try {
      const v = JSON.parse(String(formData.get(field) ?? "[]"));
      return Array.isArray(v) ? v : [];
    } catch {
      return [];
    }
  };
  return {
    hardware_options: list("hardware_options"),
    bandwidth_options: list("bandwidth_options"),
    add_on_slugs: formData.getAll("add_on_slugs").map(String),
    offers_bandwidth: formData.get("offers_bandwidth") === "1",
    requires_plan: formData.get("requires_plan") === "1",
  };
}

export type HardwareDefault = { name: string; extra: number; image?: string | null; image_url?: string | null };

/** Store-wide hardware options for products that don't set their own. */
export async function saveHardwareDefaults(options: HardwareDefault[]): Promise<{ ok: boolean; message?: string }> {
  const res = await adminApi("/api/admin/hardware-defaults", { method: "PUT", json: { options } });
  if (res.status === 401 || res.status === 403) redirect("/admin/login");
  if (!res.ok) {
    const message = await errorMessage(res);
    return { ok: false, message: message === "1" ? `Could not save (${res.status}).` : message };
  }
  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
  return { ok: true };
}

async function errorMessage(res: Response): Promise<string> {
  const body = await res.json().catch(() => ({}));
  const first = body?.errors ? (Object.values(body.errors).flat()[0] as string | undefined) : undefined;
  return first ?? body?.message ?? "1";
}

export async function createProduct(formData: FormData) {
  const res = await adminApi("/api/admin/products", { method: "POST", json: productJson(formData) });
  if (res.status === 401 || res.status === 403) redirect("/admin/login");
  if (!res.ok) redirect(`/admin/products/new?error=${encodeURIComponent(await errorMessage(res))}`);

  revalidatePath("/admin/products");
  revalidatePath("/products");
  redirect("/admin/products?saved=created");
}

export async function updateProduct(id: number, formData: FormData) {
  const res = await adminApi(`/api/admin/products/${id}`, { method: "PATCH", json: productJson(formData) });
  if (res.status === 401 || res.status === 403) redirect("/admin/login");
  if (!res.ok) redirect(`/admin/products/${id}/edit?error=${encodeURIComponent(await errorMessage(res))}`);

  revalidatePath("/admin/products");
  revalidatePath("/products");
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

/**
 * Products already on orders come back deactivated instead of deleted —
 * `deleted` tells the list whether to drop the row or mark it inactive.
 */
export async function deleteProduct(
  id: number
): Promise<{ ok: boolean; deleted?: boolean; message?: string }> {
  const res = await adminApi(`/api/admin/products/${id}`, { method: "DELETE" });
  if (res.status === 401 || res.status === 403) redirect("/admin/login");
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { ok: false, message: body?.message ?? `Could not delete the product (${res.status}).` };
  }
  revalidatePath("/admin/products");
  revalidatePath("/products");
  return { ok: true, deleted: !body?.data, message: body?.message };
}
