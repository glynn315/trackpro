import { PageHeader } from "@/components/admin/PageHeader";
import { adminGet } from "@/lib/admin/api";
import type { Installer } from "@/lib/admin/installations";
import { InstallationTabs } from "../InstallationTabs";
import { PersonnelManager } from "./PersonnelManager";

export const dynamic = "force-dynamic";

export default async function PersonnelPage() {
  const { data } = await adminGet<{ data: Installer[] }>("/api/admin/installers");

  return (
    <>
      <PageHeader title="Installations" />
      <div className="p-5 lg:p-8">
        <InstallationTabs />
        <PersonnelManager installers={data} />
      </div>
    </>
  );
}
