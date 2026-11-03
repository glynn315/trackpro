import { PageHeader } from "@/components/admin/PageHeader";
import { adminGet } from "@/lib/admin/api";
import { addDays, manilaToday, mondayOf, type InstallOptions, type Installation, type Installer } from "@/lib/admin/installations";
import { InstallationTabs } from "../InstallationTabs";
import { WeekSchedule } from "./WeekSchedule";

export const dynamic = "force-dynamic";

export default async function SchedulePage({ searchParams }: { searchParams: Promise<{ week?: string }> }) {
  const { week } = await searchParams;
  const today = manilaToday();
  const monday = mondayOf(week && /^\d{4}-\d{2}-\d{2}$/.test(week) ? week : today);
  const sunday = addDays(monday, 6);

  const qs = new URLSearchParams({ from: monday, to: sunday, with_unscheduled: "1" });
  for (const s of ["pending", "scheduled", "in_progress", "completed"]) qs.append("status[]", s);

  const [jobs, installers, options] = await Promise.all([
    adminGet<{ data: Installation[] }>(`/api/admin/installations?${qs}`),
    adminGet<{ data: Installer[] }>("/api/admin/installers"),
    adminGet<InstallOptions>("/api/admin/installations/options"),
  ]);

  return (
    <>
      <PageHeader title="Installations" />
      <div className="p-5 lg:p-8">
        <InstallationTabs />
        <WeekSchedule key={monday} monday={monday} today={today} jobs={jobs.data} installers={installers.data} options={options} />
      </div>
    </>
  );
}
