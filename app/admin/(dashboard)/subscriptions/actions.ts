"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminApi } from "@/lib/admin/api";

function toInt(value: FormDataEntryValue | null, fallback = 0): number {
  const n = parseInt(String(value ?? ""), 10);
  return Number.isFinite(n) ? Math.max(0, n) : fallback;
}

function str(value: FormDataEntryValue | null): string {
  return String(value ?? "").trim();
}

/** Bail out to the login page when the admin token is no longer good. */
function guard(status: number) {
  if (status === 401 || status === 403) redirect("/admin/login");
}

/* --------------------------------------------------------- subscriptions */

export async function createSubscription(formData: FormData) {
  const planId = toInt(formData.get("subscription_plan_id"));

  const res = await adminApi("/api/admin/subscriptions", {
    method: "POST",
    json: {
      customer_id: toInt(formData.get("customer_id")),
      subscription_plan_id: planId > 0 ? planId : null,
      plan_name: str(formData.get("plan_name")) || null,
      quantity: Math.max(1, toInt(formData.get("quantity"), 1)),
      unit_price: toInt(formData.get("unit_price")),
      billing_period: str(formData.get("billing_period")) || "yearly",
      starts_at: str(formData.get("starts_at")),
      renews_at: str(formData.get("renews_at")) || null,
      status: str(formData.get("status")) || "active",
      notes: str(formData.get("notes")) || null,
    },
  });
  guard(res.status);

  if (!res.ok) {
    const message = await res
      .json()
      .then((b) => b?.message ?? "Could not create the subscription.")
      .catch(() => "Could not create the subscription.");
    redirect(`/admin/subscriptions?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/admin/subscriptions");
  redirect("/admin/subscriptions?saved=Subscription+created");
}

export async function updateSubscription(
  id: number,
  patch: Record<string, string | number | boolean | null>
): Promise<{ ok: boolean; message?: string }> {
  const res = await adminApi(`/api/admin/subscriptions/${id}`, { method: "PATCH", json: patch });
  guard(res.status);
  if (!res.ok) {
    const message = await res.json().then((b) => b?.message).catch(() => undefined);
    return { ok: false, message: message ?? `Update failed (${res.status}).` };
  }
  revalidatePath("/admin/subscriptions");
  return { ok: true };
}

/** Raise the next renewal invoice for a subscription immediately. */
export async function generateInvoice(id: number): Promise<{ ok: boolean; message?: string }> {
  const res = await adminApi(`/api/admin/subscriptions/${id}/invoice`, { method: "POST" });
  guard(res.status);
  if (!res.ok) {
    const message = await res.json().then((b) => b?.message).catch(() => undefined);
    return { ok: false, message: message ?? `Could not raise an invoice (${res.status}).` };
  }
  revalidatePath("/admin/subscriptions");
  revalidatePath("/admin/subscriptions/billing");
  return { ok: true };
}

export async function deleteSubscription(id: number): Promise<{ ok: boolean; message?: string }> {
  const res = await adminApi(`/api/admin/subscriptions/${id}`, { method: "DELETE" });
  guard(res.status);
  if (!res.ok) {
    const message = await res.json().then((b) => b?.message).catch(() => undefined);
    return { ok: false, message: message ?? `Could not delete the subscription (${res.status}).` };
  }
  revalidatePath("/admin/subscriptions");
  revalidatePath("/admin/subscriptions/billing");
  return { ok: true };
}

/* --------------------------------------------------------------- billing */

export async function markInvoicePaid(
  id: number,
  paymentMethod: string
): Promise<{ ok: boolean; message?: string }> {
  const res = await adminApi(`/api/admin/subscription-invoices/${id}/mark-paid`, {
    method: "POST",
    json: { payment_method: paymentMethod || "manual" },
  });
  guard(res.status);
  if (!res.ok) {
    const message = await res.json().then((b) => b?.message).catch(() => undefined);
    return { ok: false, message: message ?? `Could not mark it paid (${res.status}).` };
  }
  revalidatePath("/admin/subscriptions/billing");
  revalidatePath("/admin/subscriptions");
  return { ok: true };
}

export async function voidInvoice(id: number): Promise<{ ok: boolean; message?: string }> {
  const res = await adminApi(`/api/admin/subscription-invoices/${id}/void`, { method: "POST" });
  guard(res.status);
  if (!res.ok) {
    const message = await res.json().then((b) => b?.message).catch(() => undefined);
    return { ok: false, message: message ?? `Could not void the invoice (${res.status}).` };
  }
  revalidatePath("/admin/subscriptions/billing");
  return { ok: true };
}

/* ----------------------------------------------------------------- plans */

export async function savePlan(formData: FormData) {
  const id = toInt(formData.get("id"));
  const lines = (field: string) =>
    str(formData.get(field))
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

  const json = {
    name: str(formData.get("name")),
    description: str(formData.get("description")) || null,
    fleet_size: str(formData.get("fleet_size")) || null,
    price: toInt(formData.get("price")),
    billing_period: str(formData.get("billing_period")) || "monthly",
    features: lines("features"),
    recommended_for: lines("recommended_for"),
    is_popular: formData.get("is_popular") === "on",
    // Blank = keep the current position (or go last when creating).
    sort_order: str(formData.get("sort_order")) === "" ? null : toInt(formData.get("sort_order")),
    is_default: formData.get("is_default") === "on",
    is_active: formData.get("is_active") === "on",
  };

  const res = id
    ? await adminApi(`/api/admin/subscription-plans/${id}`, { method: "PATCH", json })
    : await adminApi("/api/admin/subscription-plans", { method: "POST", json });
  guard(res.status);

  if (!res.ok) {
    const message = await res
      .json()
      .then((b) => b?.message ?? "Could not save the plan.")
      .catch(() => "Could not save the plan.");
    redirect(`/admin/subscriptions/plans?error=${encodeURIComponent(message)}`);
  }

  // The API reports how many live subscribers picked up the new terms.
  const body = await res.json().catch(() => ({}));
  const saved = body?.message ?? (id ? "Plan updated" : "Plan created");

  revalidatePath("/admin/subscriptions/plans");
  revalidatePath("/admin/subscriptions");
  revalidatePath("/plans");
  revalidatePath("/products"); // product cards show plan prices
  redirect(`/admin/subscriptions/plans?saved=${encodeURIComponent(saved)}`);
}

/**
 * Save the whole homepage comparison grid: `features` is the row order and
 * each plan's `values` line up with it (true = ✓, false = —, text as-is).
 */
export async function saveComparison(payload: {
  features: string[];
  plans: { id: number; values: (boolean | string)[] }[];
}): Promise<{ ok: boolean; message?: string }> {
  const res = await adminApi("/api/admin/subscription-plans/comparison", { method: "PUT", json: payload });
  guard(res.status);
  const message = await res.json().then((b) => b?.message).catch(() => undefined);
  if (!res.ok) return { ok: false, message: message ?? `Could not save the comparison table (${res.status}).` };

  revalidatePath("/admin/subscriptions/comparison");
  revalidatePath("/admin/subscriptions/plans");
  revalidatePath("/");
  revalidatePath("/plans");
  return { ok: true, message };
}

export async function deletePlan(id: number): Promise<{ ok: boolean; message?: string }> {
  const res = await adminApi(`/api/admin/subscription-plans/${id}`, { method: "DELETE" });
  guard(res.status);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { ok: false, message: body?.message ?? `Could not delete the plan (${res.status}).` };
  }
  revalidatePath("/admin/subscriptions/plans");
  revalidatePath("/plans");
  revalidatePath("/products");
  // The API deactivates plans that are still in use rather than deleting them.
  return { ok: true, message: body?.message };
}
