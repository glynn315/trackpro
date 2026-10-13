"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminApi } from "@/lib/admin/api";
import { parseMediaInput } from "@/lib/admin/media";

function toInt(value: FormDataEntryValue | null): number {
  const n = parseInt(String(value ?? ""), 10);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

function str(value: FormDataEntryValue | null): string {
  return String(value ?? "").trim();
}

function lines(value: FormDataEntryValue | null): string[] {
  return str(value)
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

/** Bail out to the login page when the admin token is no longer good. */
function guard(status: number) {
  if (status === 401 || status === 403) redirect("/admin/login");
}

/** The products page caches add-ons; refresh it along with the admin list. */
function refresh() {
  revalidatePath("/admin/add-ons");
  revalidatePath("/products");
}

export async function saveAddOn(formData: FormData) {
  const id = toInt(formData.get("id"));

  const json = {
    name: str(formData.get("name")),
    subtitle: str(formData.get("subtitle")) || null,
    price: toInt(formData.get("price")),
    icon: str(formData.get("icon")) || null,
    description: str(formData.get("description")) || null,
    features: lines(formData.get("features")),
    devices: lines(formData.get("devices")),
    media: parseMediaInput(formData.get("media")),
    warranty: str(formData.get("warranty")) || null,
    // Blank = keep the current position (or go last when creating).
    sort_order: str(formData.get("sort_order")) === "" ? null : toInt(formData.get("sort_order")),
    is_active: formData.get("is_active") === "on",
  };

  const res = id
    ? await adminApi(`/api/admin/add-ons/${id}`, { method: "PATCH", json })
    : await adminApi("/api/admin/add-ons", { method: "POST", json });
  guard(res.status);

  if (!res.ok) {
    const message = await res
      .json()
      .then((b) => b?.message ?? "Could not save the add-on.")
      .catch(() => "Could not save the add-on.");
    redirect(`/admin/add-ons?error=${encodeURIComponent(message)}`);
  }

  refresh();
  redirect(`/admin/add-ons?saved=${id ? "Add-on+updated" : "Add-on+created"}`);
}

export async function deleteAddOn(id: number): Promise<{ ok: boolean; message?: string }> {
  const res = await adminApi(`/api/admin/add-ons/${id}`, { method: "DELETE" });
  guard(res.status);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { ok: false, message: body?.message ?? `Could not delete the add-on (${res.status}).` };
  }
  refresh();
  return { ok: true, message: body?.message };
}
