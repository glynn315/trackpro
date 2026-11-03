"use client";

import Link from "next/link";
import { useState } from "react";
import { InstallMap } from "@/components/admin/installations/InstallMap";
import { useJobModals } from "@/components/admin/installations/useJobModals";
import { fetchInstallation } from "./actions";
import {
  STAGE,
  STAGES,
  dayLabel,
  endTime,
  timeLabel,
  type InstallDashboard,
  type InstallOptions,
  type Installation,
} from "@/lib/admin/installations";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function DashboardView({ data, options }: { data: InstallDashboard; options: InstallOptions }) {
  const { view, edit, create, modals } = useJobModals(options);
  const [radius, setRadius] = useState(false);
  const k = data.kpis;
  const todayIndex = (new Date(`${data.today}T00:00:00`).getDay() + 6) % 7;
  const top = Math.max(1, ...data.by_status.map((s) => s.count));

  async function openPin(id: number) {
    const job = await fetchInstallation(id);
    if (job) view(job);
  }

  return (
    <>
      <div className="mb-5 flex justify-end">
        <button type="button" onClick={() => create()} className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
          + New installation
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
        <Stat href="/admin/installations/schedule" label="Today" value={k.today} sub="installations" tone="text-sky-700" />
        <Stat href="/admin/installations/schedule" label="This week" value={k.week} sub="booked Mon–Sun" />
        <Stat href="/admin/installations/board" label="To schedule" value={k.backlog} sub="need person / date" tone={k.backlog ? "text-amber-600" : ""} />
        <Stat href="/admin/installations/board" label="In progress" value={k.in_progress} sub="on site now" tone="text-indigo-600" />
        <Stat href="/admin/installations/board" label="Overdue" value={k.overdue} sub="past date, not done" tone={k.overdue ? "text-red-600" : ""} />
        <Stat href="/admin/installations/board" label="Done this month" value={k.completed_month} sub="jobs installed" tone="text-emerald-700" />
        <Stat href="/admin/installations/board" label="Units fitted" value={k.units_month} sub="devices this month" tone="text-emerald-700" />
        <Stat href="/admin/installations/personnel" label="Installers" value={k.personnel} sub="active" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card title="Job sites & installer bases" hint="Open jobs over the next 14 days, plus undated ones" className="xl:col-span-2">
          <div className="p-4">
            <InstallMap
              height={400}
              jobs={data.map.jobs}
              bases={data.map.installers}
              showRadius={radius}
              onJobClick={openPin}
            />
            <label className="mt-2 flex items-center gap-2 text-xs text-gray-500">
              <input type="checkbox" checked={radius} onChange={(e) => setRadius(e.target.checked)} />
              Show each installer’s usual area
            </label>
          </div>
        </Card>

        <Card title="Pipeline" action={<Link href="/admin/installations/board" className="text-sm font-semibold text-brand hover:underline">Board →</Link>}>
          <ul className="space-y-3 p-5">
            {STAGES.map((s) => {
              const count = data.by_status.find((b) => b.status === s.key)?.count ?? 0;
              return (
                <li key={s.key}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-semibold"><span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />{s.label}</span>
                    <span className="font-bold">{count}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100">
                    <div className={`h-full rounded-full ${s.dot}`} style={{ width: `${(count / top) * 100}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card title={`Today · ${dayLabel(data.today)}`}>
          {data.today_jobs.length === 0 ? (
            <Empty>No installations today.</Empty>
          ) : (
            <ul className="divide-y divide-gray-100">
              {data.today_jobs.map((job) => (
                <li key={job.id}>
                  <button type="button" onClick={() => view(job)} className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-gray-50">
                    <span className="w-24 shrink-0 text-xs font-semibold">
                      {timeLabel(job.start_time)}
                      {job.start_time && <span className="block font-normal text-gray-400">to {timeLabel(endTime(job.start_time, job.duration_minutes))}</span>}
                    </span>
                    <JobLine job={job} />
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${STAGE[job.status].badge}`}>{STAGE[job.status].label}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Needs scheduling" hint="Highest priority first">
          {data.backlog.length === 0 ? (
            <Empty>Nothing waiting — every job has an installer and a date.</Empty>
          ) : (
            <ul className="divide-y divide-gray-100">
              {data.backlog.map((job) => (
                <li key={job.id} className="flex items-center gap-3 px-5 py-3">
                  <button type="button" onClick={() => view(job)} className="min-w-0 flex-1 text-left">
                    <span className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-gray-400">{job.reference}</span>
                      {job.priority === "high" && <span className="rounded-full bg-red-100 px-1.5 text-[10px] font-bold uppercase text-red-700">High</span>}
                    </span>
                    <JobLine job={job} />
                  </button>
                  <button type="button" onClick={() => edit(job)} className="shrink-0 rounded-full border border-brand px-3 py-1.5 text-xs font-semibold text-brand hover:bg-red-50">
                    Find installer
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card title="Installer load this week" hint={`${dayLabel(data.week.from)} – ${dayLabel(data.week.to)}`} className="xl:col-span-2">
          {data.load.length === 0 ? (
            <Empty>
              No active installers. <Link href="/admin/installations/personnel" className="font-semibold text-brand hover:underline">Add them</Link> to start scheduling.
            </Empty>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[620px] w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    <th className="px-5 py-2 text-left">Installer</th>
                    {WEEKDAYS.map((w, i) => (
                      <th key={w} className={`px-1 py-2 text-center ${i === todayIndex ? "text-brand" : ""}`}>{w}</th>
                    ))}
                    <th className="px-5 py-2 text-right">Week</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.load.map((row) => (
                    <tr key={row.installer_id}>
                      <td className="px-5 py-2">
                        <p className="font-semibold">{row.name}</p>
                        <p className="text-[11px] text-gray-400">{row.base_address ?? "No base pinned"}</p>
                      </td>
                      {row.days.map((n, i) => (
                        <td key={i} className="px-1 py-2">
                          <div title={`${n} of ${row.daily_capacity} jobs`} className={`mx-auto grid h-8 w-9 place-items-center rounded-md text-xs font-bold ${loadCls(n, row.daily_capacity)}`}>
                            {n || ""}
                          </div>
                        </td>
                      ))}
                      <td className="px-5 py-2 text-right font-bold">{row.week}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card title="Next 7 days">
          {data.upcoming.length === 0 ? (
            <Empty>Nothing booked yet.</Empty>
          ) : (
            <ul className="divide-y divide-gray-100">
              {data.upcoming.map((job) => (
                <li key={job.id}>
                  <button type="button" onClick={() => view(job)} className="w-full px-5 py-2.5 text-left hover:bg-gray-50">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-sm font-semibold">{job.title}</span>
                      <span className="shrink-0 text-[11px] text-gray-400">{dayLabel(job.scheduled_on!)}</span>
                    </span>
                    <span className="block truncate text-xs text-gray-500">
                      {job.start_time ? `${timeLabel(job.start_time)} · ` : ""}{job.installer_name ?? "Unassigned"} · {job.address}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {modals}
    </>
  );
}

function loadCls(n: number, cap: number) {
  if (n === 0) return "bg-gray-50 text-gray-300";
  if (n > cap) return "bg-red-600 text-white";
  if (n === cap) return "bg-amber-500 text-white";
  return n / cap >= 0.5 ? "bg-sky-600 text-white" : "bg-sky-100 text-sky-800";
}

function JobLine({ job }: { job: Installation }) {
  return (
    <span className="min-w-0 flex-1">
      <span className="block truncate text-sm font-semibold">{job.title}{job.units > 1 ? ` · ${job.units} units` : ""}</span>
      <span className="block truncate text-xs text-gray-500">
        {job.customer_name ? `${job.customer_name} · ` : ""}{job.address}{job.installer_name ? ` · ${job.installer_name}` : ""}
      </span>
    </span>
  );
}

function Stat({ href, label, value, sub, tone = "" }: { href: string; label: string; value: number; sub: string; tone?: string }) {
  return (
    <Link href={href} className="rounded-2xl border border-gray-200 bg-white p-4 transition hover:border-gray-300 hover:shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">{label}</p>
      <p className={`mt-2 text-2xl font-extrabold tracking-tight ${tone}`}>{value}</p>
      <p className="mt-0.5 text-[11px] text-gray-400">{sub}</p>
    </Link>
  );
}

function Card({ title, hint, action, className = "", children }: { title: string; hint?: string; action?: React.ReactNode; className?: string; children: React.ReactNode }) {
  return (
    <section className={`rounded-2xl border border-gray-200 bg-white ${className}`}>
      <header className="flex items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
        <div>
          <h2 className="font-bold">{title}</h2>
          {hint && <p className="text-xs text-gray-400">{hint}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="px-5 py-10 text-center text-sm text-gray-500">{children}</p>;
}
