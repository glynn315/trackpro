import { redirect } from "next/navigation";
import { adminApi, UNREACHABLE } from "@/lib/admin/api";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata = { title: "TrackPro Admin" };

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const res = await adminApi("/api/admin/me");

  if (res.status === 401 || res.status === 403) redirect("/admin/login");

  // Backend unreachable — show a clear message instead of a 500.
  if (!res.ok) return <BackendDown />;

  const { admin } = (await res.json()) as { admin: { name: string; email: string } };

  return <AdminShell admin={admin}>{children}</AdminShell>;
}

function BackendDown() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-7 text-center">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-amber-100 text-xl text-amber-600">⚠</div>
        <h1 className="text-lg font-bold text-gray-900">Backend unavailable</h1>
        <p className="mt-2 text-sm text-gray-600">{UNREACHABLE}</p>
        <p className="mt-4 rounded-lg bg-gray-900 px-3 py-2 text-left font-mono text-xs text-gray-100">
          cd trackpro-api &amp;&amp; php artisan serve
        </p>
      </div>
    </div>
  );
}
