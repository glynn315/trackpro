"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useJobModals } from "@/components/admin/installations/useJobModals";
import {
  PRIORITY_BADGE,
  STAGES,
  dayLabel,
  initials,
  inputCls,
  isOverdue,
  timeLabel,
  type InstallOptions,
  type InstallStatus,
  type Installation,
} from "@/lib/admin/installations";
import { moveInstallation, scheduleInstallation } from "../actions";

type Columns = Record<InstallStatus, Installation[]>;

/**
 * Kanban board. Cards drag between columns and reorder within one; the drop
 * position is saved. A card that needs a person or date before it can move
 * on opens the booking form (with nearest-installer suggestions) instead.
 */
export function Board({ jobs: initial, options, today }: { jobs: Installation[]; options: InstallOptions; today: string }) {
  const [jobs, setJobs] = useState(initial);
  const [search, setSearch] = useState("");
  const [person, setPerson] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [dragging, setDragging] = useState<number | null>(null);
  const [target, setTarget] = useState<{ status: InstallStatus; index: number } | null>(null);
  const [error, setError] = useState("");
  const [, start] = useTransition();
  const { view, edit, create, modals } = useJobModals(options);
  const dropIndex = useRef(0);

  // Take fresh server data after router.refresh() without an effect.
  const [synced, setSynced] = useState(initial);
  if (synced !== initial) {
    setSynced(initial);
    setJobs(initial);
  }

  const columns = useMemo(() => {
    const term = search.trim().toLowerCase();
    const cutoff = Date.parse(`${today}T00:00:00+08:00`) - 14 * 86_400_000;
    const out = Object.fromEntries(STAGES.map((s) => [s.key, [] as Installation[]])) as Columns;

    for (const j of jobs) {
      if (term && !`${j.reference} ${j.title} ${j.customer_name ?? ""} ${j.address} ${j.vehicle ?? ""}`.toLowerCase().includes(term)) continue;
      if (person === "none" && j.installer_id !== null) continue;
      if (person && person !== "none" && String(j.installer_id) !== person) continue;
      if (!showOld && (j.status === "completed" || j.status === "cancelled")) {
        const closed = Date.parse(j.completed_at ?? j.updated_at);
        if (!Number.isNaN(closed) && closed < cutoff) continue;
      }
      out[j.status]?.push(j);
    }
    for (const list of Object.values(out)) list.sort((a, b) => a.position - b.position);
    return out;
  }, [jobs, search, person, showOld, today]);

  function onDragOver(e: React.DragEvent<HTMLElement>, status: InstallStatus) {
    if (dragging === null) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    const cards = Array.from(e.currentTarget.querySelectorAll<HTMLElement>("[data-card]")).filter(
      (el) => el.dataset.id !== String(dragging)
    );
    let index = cards.length;
    for (let i = 0; i < cards.length; i++) {
      const r = cards[i].getBoundingClientRect();
      if (e.clientY < r.top + r.height / 2) {
        index = i;
        break;
      }
    }
    dropIndex.current = index;

    const visible = columns[status].filter((j) => j.id !== dragging);
    const anchor = visible[index];
    const at = anchor ? columns[status].indexOf(anchor) : columns[status].length;
    if (target?.status !== status || target.index !== at) setTarget({ status, index: at });
  }

  /** Index among *all* cards in the column (filters may hide some), excluding the dragged one. */
  function serverIndex(status: InstallStatus, id: number): number {
    const anchor = columns[status].filter((j) => j.id !== id)[dropIndex.current];
    const all = jobs.filter((j) => j.status === status && j.id !== id).sort((a, b) => a.position - b.position);
    return anchor ? all.findIndex((j) => j.id === anchor.id) : all.length;
  }

  function place(id: number, status: InstallStatus, index: number) {
    setJobs((rows) => {
      const moving = rows.find((j) => j.id === id);
      if (!moving) return rows;
      const sibs = rows.filter((j) => j.status === status && j.id !== id).sort((a, b) => a.position - b.position);
      sibs.splice(index, 0, { ...moving, status });
      const pos = new Map(sibs.map((j, i) => [j.id, i]));
      return rows.map((j) => (pos.has(j.id) ? { ...j, status: j.id === id ? status : j.status, position: pos.get(j.id)! } : j));
    });
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const id = dragging;
    const t = target;
    setDragging(null);
    setTarget(null);
    if (id === null || !t) return;

    const job = jobs.find((j) => j.id === id);
    if (!job) return;
    const { status } = t;
    const index = serverIndex(status, id);

    if (job.status === status && columns[status].findIndex((j) => j.id === id) === index) return;

    if ((status === "scheduled" && (!job.installer_id || !job.scheduled_on)) ||
        ((status === "in_progress" || status === "completed") && !job.installer_id)) {
      setError(
        status === "scheduled"
          ? `${job.reference} needs an installer and a date first — pick them here, nearest first.`
          : `${job.reference} has nobody assigned. Choose who is going first.`
      );
      edit(job);
      return;
    }

    if (status === "pending" && job.status !== "pending" && job.installer_id && job.scheduled_on) {
      if (!window.confirm(`Unschedule ${job.reference}? Its date (${dayLabel(job.scheduled_on)}) is cleared; ${job.installer_name} stays pencilled in.`)) return;
      place(id, status, index);
      start(async () => {
        const r = await scheduleInstallation(id, { scheduled_on: null });
        if (!r.ok) return fail(r.message);
        commit(id, status, index);
      });
      return;
    }

    place(id, status, index);
    start(() => commit(id, status, index));
  }

  async function commit(id: number, status: InstallStatus, index: number) {
    const r = await moveInstallation(id, status, index);
    if (!r.ok || !r.data) return fail(r.message);
    setError("");
    setJobs((rows) => rows.map((j) => (j.id === r.data!.id ? r.data! : j)));
  }

  function fail(message?: string) {
    setError(message ?? "Could not move the card.");
    setJobs(initial);
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search job, client, site or vehicle…" className={`${inputCls} max-w-xs`} />
        <select value={person} onChange={(e) => setPerson(e.target.value)} aria-label="Filter by installer" className={`${inputCls} max-w-[220px]`}>
          <option value="">Everybody</option>
          <option value="none">Unassigned</option>
          {options.installers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <label className="flex items-center gap-2 text-xs text-gray-500">
          <input type="checkbox" checked={showOld} onChange={(e) => setShowOld(e.target.checked)} />
          Show finished older than 14 days
        </label>
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

      <div className="-mx-1 overflow-x-auto pb-2">
        <div className="grid min-w-[1100px] grid-cols-5 gap-3 px-1">
          {STAGES.map((stage) => {
            const cards = columns[stage.key];
            const here = target?.status === stage.key;
            return (
              <section
                key={stage.key}
                aria-label={stage.label}
                onDragOver={(e) => onDragOver(e, stage.key)}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setTarget(null);
                }}
                onDrop={onDrop}
                className={`flex min-h-[520px] flex-col rounded-2xl border transition-colors ${here ? "border-brand bg-red-50/50" : "border-gray-200 bg-gray-100/60"}`}
              >
                <header className="flex items-center gap-2 border-b border-gray-200 px-3 py-2.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${stage.dot}`} />
                  <h2 className="text-sm font-bold">{stage.label}</h2>
                  <span className="ml-auto rounded-full bg-white px-2 text-xs font-semibold text-gray-500">{cards.length}</span>
                </header>
                <p className="px-3 pt-2 text-[11px] text-gray-400">{stage.hint}</p>

                <ol className="flex flex-1 flex-col gap-2 p-2">
                  {cards.map((job, i) => (
                    <li key={job.id} className="contents">
                      {here && target!.index === i && dragging !== job.id && <div className="h-1 rounded-full bg-brand" aria-hidden />}
                      <div
                        data-card
                        data-id={job.id}
                        draggable
                        tabIndex={0}
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", String(job.id));
                          e.dataTransfer.effectAllowed = "move";
                          setDragging(job.id);
                        }}
                        onDragEnd={() => {
                          setDragging(null);
                          setTarget(null);
                        }}
                        onClick={() => view(job)}
                        onKeyDown={(e) => e.key === "Enter" && view(job)}
                        className={`cursor-grab rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition hover:border-brand/50 active:cursor-grabbing ${
                          dragging === job.id ? "opacity-40" : ""
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] text-gray-400">{job.reference}</span>
                          {job.priority !== "normal" && (
                            <span className={`rounded-full px-1.5 text-[10px] font-bold uppercase ${PRIORITY_BADGE[job.priority]}`}>{job.priority}</span>
                          )}
                          {isOverdue(job, today) && <span className="ml-auto rounded-full bg-red-100 px-1.5 text-[10px] font-bold uppercase text-red-700">Overdue</span>}
                        </div>
                        <p className="mt-1 text-sm font-semibold leading-snug">{job.title}</p>
                        {(job.customer_name || job.units > 1) && (
                          <p className="text-xs text-gray-500">
                            {job.customer_name}{job.customer_name && job.units > 1 ? " · " : ""}{job.units > 1 ? `${job.units} units` : ""}
                          </p>
                        )}
                        <p className="mt-1 line-clamp-2 text-xs text-gray-500">📍 {job.address}</p>
                        <div className="mt-2 flex items-center justify-between gap-2 border-t border-gray-100 pt-2 text-xs">
                          <span className={job.scheduled_on ? "text-gray-600" : "font-semibold text-amber-600"}>
                            📅 {job.scheduled_on ? dayLabel(job.scheduled_on) : "No date"}
                            {job.start_time && ` · ${timeLabel(job.start_time)}`}
                          </span>
                          {job.installer_name ? (
                            <span title={job.installer_name} className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ink text-[10px] font-bold text-white">
                              {initials(job.installer_name)}
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold text-amber-600">Unassigned</span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                  {here && target!.index >= cards.length && <li className="h-1 rounded-full bg-brand" aria-hidden />}
                  {cards.length === 0 && !here && (
                    <li className="grid flex-1 place-items-center rounded-xl border border-dashed border-gray-300 p-4 text-center text-xs text-gray-400">
                      Drop a card here
                    </li>
                  )}
                </ol>
              </section>
            );
          })}
        </div>
      </div>

      {modals}
    </>
  );
}
