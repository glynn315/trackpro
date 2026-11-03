"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminApi } from "@/lib/admin/api";
import type { InstallStatus, Installation, Installer, Suggestion } from "@/lib/admin/installations";

export type Result<T = undefined> = { ok: boolean; message?: string; data?: T };

async function result<T>(res: Response, fallback: string): Promise<Result<T>> {
  if (res.status === 401 || res.status === 403) redirect("/admin/login");
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const first = body?.errors ? (Object.values(body.errors).flat()[0] as string | undefined) : undefined;
    return { ok: false, message: first ?? body?.message ?? fallback };
  }
  revalidatePath("/admin/installations", "layout");
  return { ok: true, data: body?.data as T };
}

export async function saveInstallation(id: number | null, data: Record<string, unknown>): Promise<Result<Installation>> {
  const res = id
    ? await adminApi(`/api/admin/installations/${id}`, { method: "PATCH", json: data })
    : await adminApi("/api/admin/installations", { method: "POST", json: data });
  return result(res, "Could not save the installation.");
}

export async function fetchInstallation(id: number): Promise<Installation | null> {
  const res = await adminApi(`/api/admin/installations/${id}`);
  if (res.status === 401 || res.status === 403) redirect("/admin/login");
  if (!res.ok) return null;
  return ((await res.json()) as { data: Installation }).data;
}

export async function deleteInstallation(id: number): Promise<Result> {
  return result(await adminApi(`/api/admin/installations/${id}`, { method: "DELETE" }), "Could not delete the installation.");
}

/** Week schedule drag: new person and/or day. */
export async function scheduleInstallation(
  id: number,
  data: { installer_id?: number | null; scheduled_on?: string | null }
): Promise<Result<Installation>> {
  return result(
    await adminApi(`/api/admin/installations/${id}/schedule`, { method: "POST", json: data }),
    "Could not reschedule the installation."
  );
}

/** Kanban drag: into a column at an index. */
export async function moveInstallation(id: number, status: InstallStatus, index?: number): Promise<Result<Installation>> {
  return result(
    await adminApi(`/api/admin/installations/${id}/move`, { method: "POST", json: { status, index } }),
    "Could not move the installation."
  );
}

/** Installers ranked nearest-and-free first for a pinned site. */
export async function suggestInstallers(query: {
  lat: number;
  lng: number;
  date?: string | null;
  start_time?: string | null;
  duration_minutes?: number;
  installation_id?: number | null;
}): Promise<Suggestion[]> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== null && value !== undefined && value !== "") params.set(key, String(value));
  }
  const res = await adminApi(`/api/admin/installations/suggest?${params}`);
  if (res.status === 401 || res.status === 403) redirect("/admin/login");
  if (!res.ok) return [];
  return ((await res.json()) as { data: Suggestion[] }).data;
}

export async function saveInstaller(id: number | null, data: Record<string, unknown>): Promise<Result<Installer>> {
  const res = id
    ? await adminApi(`/api/admin/installers/${id}`, { method: "PATCH", json: data })
    : await adminApi("/api/admin/installers", { method: "POST", json: data });
  return result(res, "Could not save the installer.");
}

export async function deleteInstaller(id: number): Promise<Result> {
  return result(await adminApi(`/api/admin/installers/${id}`, { method: "DELETE" }), "Could not remove the installer.");
}
