"use client";

import { useState, useTransition } from "react";
import { deleteInstallation, moveInstallation } from "@/app/admin/(dashboard)/installations/actions";
import {
  PRIORITY_BADGE,
  STAGE,
  dayLabel,
  endTime,
  hours,
  timeLabel,
  type InstallStatus,
  type Installation,
} from "@/lib/admin/installations";
import { Modal, btnGhost, btnOutline, btnPrimary } from "./Modal";

const STEPS: Record<InstallStatus, { to: InstallStatus; label: string; primary?: boolean }[]> = {
  pending: [{ to: "cancelled", label: "Cancel job" }],
  scheduled: [
    { to: "cancelled", label: "Cancel job" },
    { to: "in_progress", label: "Start", primary: true },
  ],
  in_progress: [
    { to: "scheduled", label: "Not started" },
    { to: "completed", label: "Mark installed", primary: true },
  ],
  completed: [],
  cancelled: [],
};

export function JobDetail({
  job,
  onChanged,
  onEdit,
  onClose,
}: {
  job: Installation;
  onChanged: (job: Installation | null) => void;
  onEdit: (job: Installation) => void;
  onClose: () => void;
}) {
  const [error, setError] = useState("");
  const [busy, start] = useTransition();

  const steps =
    job.status === "completed" || job.status === "cancelled"
      ? [{ to: (job.installer_id && job.scheduled_on ? "scheduled" : "pending") as InstallStatus, label: "Reopen", primary: true }]
      : STEPS[job.status];

  function move(to: InstallStatus) {
    setError("");
    start(async () => {
      const r = await moveInstallation(job.id, to);
      if (!r.ok || !r.data) setError(r.message ?? "Could not move the job.");
      else onChanged(r.data);
    });
  }

  function remove() {
    if (!window.confirm(`Delete ${job.reference}? It comes off the schedule and the board. Cancel it instead to keep a record.`)) return;
    start(async () => {
      const r = await deleteInstallation(job.id);
      if (!r.ok) setError(r.message ?? "Could not delete the job.");
      else onChanged(null);
    });
  }

  const end = endTime(job.start_time, job.duration_minutes);

  return (
    <Modal
      title={job.title}
      subtitle={job.reference + (job.order_reference ? ` · order ${job.order_reference}` : "")}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={remove} disabled={busy} className="mr-auto rounded-full px-3 py-2 text-sm font-semibold text-gray-400 hover:bg-red-50 hover:text-red-600">
            Delete
          </button>
          {steps.map((s) => (
            <button key={s.to} type="button" onClick={() => move(s.to)} disabled={busy} className={s.primary ? btnPrimary : btnGhost}>
              {s.label}
            </button>
          ))}
          <button type="button" onClick={() => onEdit(job)} disabled={busy} className={btnOutline}>Edit</button>
        </>
      }
    >
      <div className="flex flex-wrap gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STAGE[job.status].badge}`}>{STAGE[job.status].label}</span>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${PRIORITY_BADGE[job.priority]}`}>{job.priority} priority</span>
        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">{job.units} unit{job.units === 1 ? "" : "s"}</span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <Item label="When">
          <span className="font-semibold">{job.scheduled_on ? dayLabel(job.scheduled_on, true) : "Not dated yet"}</span>
          {job.scheduled_on && (
            <span className="block text-xs text-gray-500">
              {timeLabel(job.start_time)}{end ? ` – ${timeLabel(end)}` : ""} · {hours(job.duration_minutes)}
            </span>
          )}
        </Item>
        <Item label="Installer"><span className="font-semibold">{job.installer_name ?? "Nobody yet"}</span></Item>
        <Item label="Site" wide>
          {job.address}
          {job.lat !== null && (
            <a
              className="ml-2 text-xs font-semibold text-brand hover:underline"
              target="_blank"
              rel="noopener noreferrer"
              href={`https://www.google.com/maps/dir/?api=1&destination=${job.lat},${job.lng}`}
            >
              Directions ↗
            </a>
          )}
        </Item>
        <Item label="Contact">{job.customer_name ?? "—"}{job.customer_phone && <span className="block text-xs text-gray-500">{job.customer_phone}</span>}</Item>
        <Item label="Vehicle(s)">{job.vehicle ?? "—"}</Item>
        {job.started_at && <Item label="Started">{new Date(job.started_at).toLocaleString("en-PH", { timeZone: "Asia/Manila", dateStyle: "medium", timeStyle: "short" })}</Item>}
        {job.completed_at && <Item label="Installed">{new Date(job.completed_at).toLocaleString("en-PH", { timeZone: "Asia/Manila", dateStyle: "medium", timeStyle: "short" })}</Item>}
        {job.notes && <Item label="Notes" wide><span className="whitespace-pre-line">{job.notes}</span></Item>}
      </dl>

      {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{error}</p>}
    </Modal>
  );
}

function Item({ label, wide, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <div className={wide ? "col-span-2" : ""}>
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{label}</dt>
      <dd className="mt-0.5">{children}</dd>
    </div>
  );
}
