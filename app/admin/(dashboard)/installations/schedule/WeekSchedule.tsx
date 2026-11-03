"use client";

import Link from "next/link";
import { Fragment, useMemo, useState, useTransition } from "react";
import { useJobModals } from "@/components/admin/installations/useJobModals";
import {
  addDays,
  dayLabel,
  kmBetween,
  timeLabel,
  type InstallOptions,
  type Installation,
  type Installer,
} from "@/lib/admin/installations";
import { scheduleInstallation } from "../actions";

const NOBODY = "nobody";
const TRAY = "tray";

type Row = { id: string; installer: Installer | null; name: string; sub: string | null; capacity: number | null };

/**
 * Week grid: one row per installer (plus "Unassigned"), one column per day.
 * Drag a job onto a cell to give it that person and day, or into the tray to
 * take its date off. While dragging, each row shows how far that installer's
 * base is from the job site and marks the nearest.
 */
export function WeekSchedule({
  monday,
  today,
  jobs: initial,
  installers,
  options,
}: {
  monday: string;
  today: string;
  jobs: Installation[];
  installers: Installer[];
  options: InstallOptions;
}) {
  const [jobs, setJobs] = useState(initial);
  const [dragging, setDragging] = useState<Installation | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [, start] = useTransition();
  const { view, create, modals } = useJobModals(options);

  // Take fresh server data after router.refresh() without an effect.
  const [synced, setSynced] = useState(initial);
  if (synced !== initial) {
    setSynced(initial);
    setJobs(initial);
  }

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(monday, i)), [monday]);

  const rows: Row[] = useMemo(() => {
    const busy = new Set(jobs.map((j) => j.installer_id));
    return [
      ...installers
        .filter((p) => p.is_active || busy.has(p.id))
        .map((p) => ({ id: String(p.id), installer: p, name: p.name, sub: p.base_address ?? p.skills, capacity: p.daily_capacity })),
      { id: NOBODY, installer: null, name: "Unassigned", sub: "Dated, nobody going", capacity: null },
    ];
  }, [installers, jobs]);

  const cells = useMemo(() => {
    const out: Record<string, Installation[]> = {};
    for (const j of jobs) {
      if (!j.scheduled_on) continue;
      (out[`${j.installer_id ?? NOBODY}|${j.scheduled_on}`] ??= []).push(j);
    }
    for (const list of Object.values(out)) list.sort((a, b) => (a.start_time ?? "99").localeCompare(b.start_time ?? "99"));
    return out;
  }, [jobs]);

  const undated = jobs.filter((j) => !j.scheduled_on && (j.status === "pending" || j.status === "scheduled"));
  const dated = jobs.filter((j) => j.scheduled_on).length;

  const distance = useMemo(() => {
    const out: Record<string, { km: string; near: boolean; best: boolean }> = {};
    if (!dragging || dragging.lat === null || dragging.lng === null) return out;
    let best: string | null = null;
    let bestKm = Infinity;
    for (const p of installers) {
      if (p.base_lat === null || p.base_lng === null) continue;
      const km = kmBetween(p.base_lat, p.base_lng, dragging.lat, dragging.lng);
      out[p.id] = { km: km.toFixed(1), near: km <= p.service_radius_km, best: false };
      if (p.is_active && km < bestKm) {
        bestKm = km;
        best = String(p.id);
      }
    }
    if (best) out[best].best = true;
    return out;
  }, [dragging, installers]);

  function drop(rowId: string, day: string | null) {
    const job = dragging;
    setDragging(null);
    setHover(null);
    if (!job) return;

    if (rowId === TRAY) {
      if (!job.scheduled_on) return;
    } else if (String(job.installer_id ?? NOBODY) === rowId && job.scheduled_on === day) {
      return;
    }

    if (job.status === "in_progress" && rowId === NOBODY) {
      setError(`${job.reference} is in progress — somebody is on site, so it can't be unassigned.`);
      return;
    }

    const person = installers.find((p) => String(p.id) === rowId) ?? null;
    const payload =
      rowId === TRAY ? { scheduled_on: null } : { installer_id: person?.id ?? null, scheduled_on: day };

    setJobs((rows) =>
      rows.map((j) =>
        j.id === job.id
          ? {
              ...j,
              scheduled_on: payload.scheduled_on,
              ...(rowId === TRAY ? {} : { installer_id: person?.id ?? null, installer_name: person?.name ?? null }),
            }
          : j
      )
    );

    start(async () => {
      const r = await scheduleInstallation(job.id, payload);
      if (!r.ok || !r.data) {
        setError(r.message ?? "Could not reschedule.");
        setJobs(initial);
      } else {
        setError("");
        setJobs((rows) => rows.map((j) => (j.id === r.data!.id ? r.data! : j)));
      }
    });
  }

  const target = (key: string, rowId: string, day: string | null) => ({
    onDragOver: (e: React.DragEvent) => {
      if (!dragging) return;
      e.preventDefault();
      if (hover !== key) setHover(key);
    },
    onDragLeave: (e: React.DragEvent) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHover(null);
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      drop(rowId, day);
    },
  });

  const chip = (job: Installation, wide: boolean) => (
    <button
      key={job.id}
      type="button"
      data-chip
      draggable={job.status !== "completed"}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", String(job.id));
        e.dataTransfer.effectAllowed = "move";
        setDragging(job);
      }}
      onDragEnd={() => {
        setDragging(null);
        setHover(null);
      }}
      onClick={(e) => {
        e.stopPropagation();
        view(job);
      }}
      className={`block rounded-md border-l-[3px] px-2 py-1 text-left text-[11px] leading-tight shadow-sm transition hover:brightness-95 ${chipCls(job)} ${
        wide ? "w-56" : "w-full"
      } ${dragging?.id === job.id ? "opacity-40" : ""} ${job.status !== "completed" ? "cursor-grab active:cursor-grabbing" : ""}`}
    >
      <span className="flex items-center gap-1">
        <span className="font-semibold">{timeLabel(job.start_time)}</span>
        {job.priority === "high" && <span className="rounded-full bg-red-100 px-1 text-[9px] font-bold uppercase text-red-700">High</span>}
        {wide && job.installer_name && <span className="ml-auto truncate text-gray-500">{job.installer_name}</span>}
      </span>
      <span className="mt-0.5 block truncate font-semibold">{job.title}</span>
      <span className="block truncate text-gray-500">{job.address}</span>
    </button>
  );

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex items-center overflow-hidden rounded-full border border-gray-300 bg-white text-sm">
          <Link href={`?week=${addDays(monday, -7)}`} aria-label="Previous week" className="px-3 py-1.5 hover:bg-gray-50">‹</Link>
          <Link href="?" className="border-x border-gray-300 px-3 py-1.5 font-semibold hover:bg-gray-50">This week</Link>
          <Link href={`?week=${addDays(monday, 7)}`} aria-label="Next week" className="px-3 py-1.5 hover:bg-gray-50">›</Link>
        </div>
        <h2 className="font-bold">{dayLabel(days[0])} – {dayLabel(days[6])}</h2>
        <span className="text-xs text-gray-500">{dated} job{dated === 1 ? "" : "s"} · drag onto an installer and day; click an empty slot to book</span>
        <button type="button" onClick={() => create()} className="ml-auto rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
          + New installation
        </button>
      </div>

      {error && (
        <div className="mb-3 flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
          <span>{error}</span>
          <button type="button" onClick={() => setError("")} aria-label="Dismiss" className="font-bold">✕</button>
        </div>
      )}

      <section
        {...target(TRAY, TRAY, null)}
        className={`mb-4 rounded-2xl border bg-white p-3 transition ${hover === TRAY ? "border-brand bg-red-50/60 ring-2 ring-brand/30" : "border-gray-200"}`}
      >
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          <h3 className="text-sm font-bold">Not dated yet</h3>
          <span className="rounded-full bg-gray-100 px-2 text-xs font-semibold text-gray-600">{undated.length}</span>
          <span className="text-xs text-gray-400">Drag onto the grid to book. Drop a booked job here to take its date off.</span>
        </div>
        {undated.length === 0 ? (
          <p className="text-xs text-gray-400">Everything has a date.</p>
        ) : (
          <div className="flex flex-wrap gap-2">{undated.map((j) => chip(j, true))}</div>
        )}
      </section>

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
        <div className="grid min-w-[1080px]" style={{ gridTemplateColumns: "200px repeat(7, minmax(0, 1fr))" }}>
          <div className="sticky left-0 z-10 border-b border-gray-200 bg-white px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-500">
            Installer
          </div>
          {days.map((d) => (
            <div key={d} className={`border-b border-l border-gray-200 px-2 py-2 text-center text-xs font-semibold ${d === today ? "bg-red-50 text-brand" : ""}`}>
              {dayLabel(d)}
            </div>
          ))}

          {rows.map((row) => (
            <Fragment key={row.id}>
              <div className="sticky left-0 z-10 flex flex-col justify-center border-b border-gray-200 bg-white px-3 py-2">
                <p className={`truncate text-sm font-semibold ${row.id === NOBODY ? "text-amber-700" : ""}`}>{row.name}</p>
                {distance[row.id] ? (
                  <p className={`text-[11px] font-semibold ${distance[row.id].near ? "text-emerald-700" : "text-gray-500"}`}>
                    {distance[row.id].km} km from site{distance[row.id].best ? " · nearest" : ""}
                  </p>
                ) : (
                  row.sub && <p className="truncate text-[11px] text-gray-400">{row.sub}</p>
                )}
              </div>
              {days.map((d) => {
                const key = `${row.id}|${d}`;
                const cell = cells[key] ?? [];
                return (
                  <div
                    key={key}
                    {...target(key, row.id, d)}
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest("[data-chip]")) return;
                      create({ scheduled_on: d, installer_id: row.installer?.id ?? null });
                    }}
                    className={`group relative min-h-[88px] cursor-pointer border-b border-l border-gray-200 p-1.5 transition-colors ${
                      hover === key ? "bg-red-50 ring-2 ring-inset ring-brand/40" : d === today ? "bg-red-50/30" : "hover:bg-gray-50"
                    }`}
                  >
                    {row.capacity !== null && cell.length > 0 && (
                      <span
                        title={`${cell.length} of ${row.capacity} jobs that day`}
                        className={`absolute right-1.5 top-1 text-[10px] font-bold ${
                          cell.length > row.capacity ? "text-red-600" : cell.length === row.capacity ? "text-amber-600" : "text-gray-400"
                        }`}
                      >
                        {cell.length}/{row.capacity}
                      </span>
                    )}
                    <div className="flex flex-col gap-1 pt-3">{cell.map((j) => chip(j, false))}</div>
                    {cell.length === 0 && (
                      <span className="pointer-events-none absolute inset-0 grid place-items-center text-lg text-brand opacity-0 transition-opacity group-hover:opacity-50">+</span>
                    )}
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>

      {modals}
    </>
  );
}

function chipCls(job: Installation) {
  switch (job.status) {
    case "completed":
      return "border-emerald-600 bg-emerald-50";
    case "in_progress":
      return "border-indigo-600 bg-indigo-50";
    case "pending":
      return "border-amber-500 bg-amber-50";
    default:
      return "border-sky-600 bg-white ring-1 ring-gray-200";
  }
}
