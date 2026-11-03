import { PageHeader } from "@/components/admin/PageHeader";
import { adminGet } from "@/lib/admin/api";
import { manilaToday, type InstallOptions, type Installation } from "@/lib/admin/installations";
import { InstallationTabs } from "../InstallationTabs";
import { Board } from "./Board";

export const dynamic = "force-dynamic";

export default async function BoardPage() {
  const [jobs, options] = await Promise.all([
    adminGet<{ data: Installation[] }>("/api/admin/installations"),
    adminGet<InstallOptions>("/api/admin/installations/options"),
  ]);

  return (
    <>
      <PageHeader title="Installations" />
      <div className="p-5 lg:p-8">
        <InstallationTabs />
        <Board jobs={jobs.data} options={options} today={manilaToday()} />
      </div>
    </>
  );
}
