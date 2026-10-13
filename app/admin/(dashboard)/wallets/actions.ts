"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminApi } from "@/lib/admin/api";
import type { WalletType } from "@/lib/admin/types";

type Result = { ok: boolean; message?: string };

async function result(res: Response, fallback: string): Promise<Result> {
  if (res.status === 401 || res.status === 403) redirect("/admin/login");
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const first = body?.errors ? (Object.values(body.errors).flat()[0] as string | undefined) : undefined;
    return { ok: false, message: first ?? body?.message ?? fallback };
  }
  revalidatePath("/admin/wallets");
  revalidatePath("/admin/expenses");
  return { ok: true, message: body?.message };
}

export async function saveWallet(
  id: number | null,
  data: { name?: string; type?: WalletType; opening_balance?: number; is_default?: boolean; is_active?: boolean }
): Promise<Result> {
  const res = id
    ? await adminApi(`/api/admin/wallets/${id}`, { method: "PATCH", json: data })
    : await adminApi("/api/admin/wallets", { method: "POST", json: data });
  return result(res, "Could not save the wallet.");
}

/** Deletes an unused wallet; one with history is deactivated instead (the API says which). */
export async function removeWallet(id: number): Promise<Result> {
  return result(await adminApi(`/api/admin/wallets/${id}`, { method: "DELETE" }), "Could not remove the wallet.");
}

export async function transferMoney(data: {
  from_wallet_id: number;
  to_wallet_id: number;
  amount: number;
  transferred_on: string;
  notes: string | null;
}): Promise<Result> {
  return result(await adminApi("/api/admin/wallet-transfers", { method: "POST", json: data }), "Could not record the transfer.");
}

export async function deleteTransfer(id: number): Promise<Result> {
  return result(await adminApi(`/api/admin/wallet-transfers/${id}`, { method: "DELETE" }), "Could not remove the transfer.");
}
