import { redirect } from "next/navigation";
import { adminApi } from "@/lib/admin/api";
import { getAdminToken } from "@/lib/admin/session";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign in · TrackPro Admin" };

export default async function AdminLoginPage() {
  // If a valid token is already present, skip the form.
  if (await getAdminToken()) {
    const res = await adminApi("/api/admin/me");
    if (res.ok) redirect("/admin");
  }
  return <LoginForm />;
}
