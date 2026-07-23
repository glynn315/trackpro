"use server";

import { redirect } from "next/navigation";
import { adminApi } from "@/lib/admin/api";
import { setAdminToken, clearAdminToken } from "@/lib/admin/session";

export async function loginAction(
  _prev: { error: string },
  formData: FormData
): Promise<{ error: string }> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Email and password are required." };

  const res = await adminApi("/api/admin/login", { method: "POST", json: { email, password } });
  if (res.status === 503) return { error: "Cannot reach the server. Make sure the API is running." };
  if (res.status === 422 || res.status === 401) return { error: "Invalid credentials." };
  if (!res.ok) return { error: "Sign in failed. Try again." };

  const token = (await res.json())?.token;
  if (!token) return { error: "Sign in failed. Try again." };
  await setAdminToken(token);
  redirect("/admin");
}

export async function logoutAction() {
  // Best-effort token revocation on the server; always clear the cookie.
  try {
    await adminApi("/api/admin/logout", { method: "POST" });
  } catch {
    /* ignore */
  }
  await clearAdminToken();
  redirect("/admin/login");
}
