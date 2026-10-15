"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminApi } from "@/lib/admin/api";

function str(value: FormDataEntryValue | null): string {
  return String(value ?? "").trim();
}

/** Bail out to the login page when the admin token is no longer good. */
function guard(status: number) {
  if (status === 401 || status === 403) redirect("/admin/login");
}

/** Pull the first validation message (e.g. "email has already been taken") out of a Laravel error body. */
async function errorMessage(res: Response, fallback: string): Promise<string> {
  return res
    .json()
    .then((b) => {
      const first = b?.errors ? Object.values(b.errors as Record<string, string[]>)[0]?.[0] : undefined;
      return first ?? b?.message ?? fallback;
    })
    .catch(() => fallback);
}

export async function createClient(formData: FormData) {
  const res = await adminApi("/api/admin/clients", {
    method: "POST",
    json: {
      name: str(formData.get("name")),
      email: str(formData.get("email")),
      phone: str(formData.get("phone")) || null,
      company: str(formData.get("company")) || null,
      fleet_size: str(formData.get("fleet_size")) || null,
      vehicle_info: str(formData.get("vehicle_info")) || null,
      password: str(formData.get("password")) || null,
      send_invite: formData.get("send_invite") === "on",
    },
  });
  guard(res.status);

  if (!res.ok) {
    const message = await errorMessage(res, "Could not add the client.");
    redirect(`/admin/clients?error=${encodeURIComponent(message)}`);
  }

  const body = (await res.json()) as { data: { name: string }; invite_sent: boolean };
  const saved = `${body.data.name} added${body.invite_sent ? " — invite email sent" : ""}`;

  revalidatePath("/admin/clients");
  revalidatePath("/admin/subscriptions");
  redirect(`/admin/clients?saved=${encodeURIComponent(saved)}`);
}

export async function updateClient(id: number, formData: FormData) {
  const res = await adminApi(`/api/admin/clients/${id}`, {
    method: "PUT",
    json: {
      name: str(formData.get("name")),
      email: str(formData.get("email")),
      phone: str(formData.get("phone")) || null,
      company: str(formData.get("company")) || null,
      fleet_size: str(formData.get("fleet_size")) || null,
      vehicle_info: str(formData.get("vehicle_info")) || null,
      password: str(formData.get("password")) || null,
    },
  });
  guard(res.status);

  if (!res.ok) {
    const message = await errorMessage(res, "Could not save the client.");
    redirect(`/admin/clients/${id}?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${id}`);
  redirect(`/admin/clients/${id}?saved=${encodeURIComponent("Client details saved.")}`);
}

export async function deleteClient(id: number): Promise<{ ok: boolean; message?: string }> {
  const res = await adminApi(`/api/admin/clients/${id}`, { method: "DELETE" });
  guard(res.status);
  if (!res.ok) {
    return { ok: false, message: await errorMessage(res, `Could not delete the client (${res.status}).`) };
  }

  const body = (await res.json().catch(() => ({}))) as { message?: string };
  revalidatePath("/admin/clients");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/subscriptions");
  redirect(`/admin/clients?saved=${encodeURIComponent(body.message ?? "Client deleted.")}`);
}
