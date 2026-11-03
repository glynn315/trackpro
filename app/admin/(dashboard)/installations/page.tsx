import { PageHeader } from "@/components/admin/PageHeader";
import { adminGet } from "@/lib/admin/api";
import type { InstallDashboard, InstallOptions } from "@/lib/admin/installations";
import { DashboardView } from "./DashboardView";
import { InstallationTabs } from "./InstallationTabs";

export const dynamic = "force-dynamic";

export default async function InstallationDashboardPage() {
  const [data, options] = await Promise.all([
    adminGet<InstallDashboard>("/api/admin/installations/dashboard"),
    adminGet<InstallOptions>("/api/admin/installations/options"),
  ]);

  return (
    <>
      <PageHeader title="Installations" />
      <div className="p-5 lg:p-8">
        <InstallationTabs />
        <DashboardView data={data} options={options} />
      </div>
    </>
  );
}
