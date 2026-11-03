"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { InstallOptions, Installation } from "@/lib/admin/installations";
import { JobDetail } from "./JobDetail";
import { JobDialog, type JobPreset } from "./JobDialog";

/** View / edit / book modals shared by the dashboard, schedule and board. */
export function useJobModals(options: InstallOptions, onChange?: (job: Installation | null, id: number) => void) {
  const router = useRouter();
  const [viewing, setViewing] = useState<Installation | null>(null);
  const [editing, setEditing] = useState<Installation | null>(null);
  const [creating, setCreating] = useState<JobPreset | null>(null);

  function changed(job: Installation | null, id: number) {
    onChange?.(job, id);
    router.refresh();
  }

  const modals = (
    <>
      {viewing && (
        <JobDetail
          job={viewing}
          onClose={() => setViewing(null)}
          onEdit={(job) => {
            setViewing(null);
            setEditing(job);
          }}
          onChanged={(job) => {
            changed(job, viewing.id);
            setViewing(job);
          }}
        />
      )}
      {editing && (
        <JobDialog
          job={editing}
          options={options}
          onClose={() => setEditing(null)}
          onSaved={(job) => {
            setEditing(null);
            changed(job, job.id);
          }}
        />
      )}
      {creating && (
        <JobDialog
          job={null}
          preset={creating}
          options={options}
          onClose={() => setCreating(null)}
          onSaved={(job) => {
            setCreating(null);
            changed(job, job.id);
          }}
        />
      )}
    </>
  );

  return { view: setViewing, edit: setEditing, create: (preset: JobPreset = {}) => setCreating(preset), modals };
}
