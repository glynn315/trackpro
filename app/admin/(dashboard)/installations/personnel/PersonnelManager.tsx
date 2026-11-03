"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { InstallMap } from "@/components/admin/installations/InstallMap";
import { InstallerDialog } from "@/components/admin/installations/InstallerDialog";
import type { Installer, MapBase } from "@/lib/admin/installations";
import { deleteInstaller } from "../actions";

export function PersonnelManager({ installers }: { installers: Installer[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Installer | "new" | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [busy, start] = useTransition();

  const bases: MapBase[] = installers
    .filter((p) => p.is_active && p.base_lat !== null && p.base_lng !== null)
    .map((p) => ({ id: p.id, name: p.name, base_address: p.base_address, lat: p.base_lat!, lng: p.base_lng!, service_radius_km: p.service_radius_km }));
  const unpinned = installers.filter((p) => p.is_active && p.base_lat === null).length;

  function remove(p: Installer) {
    if (!window.confirm(`Remove ${p.name}? Their pending and scheduled jobs go back to “To schedule”. Jobs in progress or done keep their record.`)) return;
    setError("");
    start(async () => {
      const r = await deleteInstaller(p.id);
      if (!r.ok) setError(r.message ?? "Could not remove the installer.");
      else router.refresh();
    });
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          {installers.length} installer{installers.length === 1 ? "" : "s"} · pin each home base so the nearest one can be suggested for a job.
        </p>
        <button type="button" onClick={() => setEditing("new")} className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
          + Add installer
        </button>
      </div>

      {error && <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">{error}</div>}

      <div className="grid gap-6 xl:grid-cols-[3fr_2fr]">
        <section className="rounded-2xl border border-gray-200 bg-white">
          {installers.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <p className="font-semibold">No installers yet</p>
              <p className="mt-1 text-sm text-gray-500">Add the technicians who fit the devices and pin where each one is based.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {installers.map((p) => (
                <li
                  key={p.id}
                  onMouseEnter={() => setHovered(p.id)}
                  onMouseLeave={() => setHovered(null)}
                  className={`flex items-start gap-3 px-5 py-3 ${busy ? "opacity-70" : ""} ${p.is_active ? "" : "bg-gray-50"}`}
                >
                  <span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold ${p.is_active ? "bg-ink text-white" : "bg-gray-200 text-gray-500"}`}>
                    {p.name.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 font-semibold">
                      {p.name}
                      {!p.is_active && <span className="rounded-full bg-gray-200 px-2 text-[10px] font-bold uppercase text-gray-600">Inactive</span>}
                      {p.base_lat === null && <span className="rounded-full bg-amber-100 px-2 text-[10px] font-bold uppercase text-amber-800">Base not pinned</span>}
                    </p>
                    <p className="truncate text-xs text-gray-500">📍 {p.base_address ?? "No home base"}</p>
                    <p className="text-xs text-gray-400">
                      {[p.phone, p.skills].filter(Boolean).join(" · ") || "—"}
                    </p>
                  </div>
                  <div className="hidden shrink-0 text-right text-xs text-gray-500 sm:block">
                    <p><span className="font-bold text-gray-800">{p.open_jobs ?? 0}</span> open jobs</p>
                    <p>{p.daily_capacity}/day · {p.service_radius_km} km area</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <button type="button" onClick={() => setEditing(p)} className="text-xs font-semibold text-brand hover:underline">Edit</button>
                    <button type="button" onClick={() => remove(p)} disabled={busy} className="text-xs font-semibold text-gray-400 hover:text-red-600">Remove</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-4">
          <h2 className="font-bold">Where the crew is based</h2>
          <p className="mb-3 text-xs text-gray-400">Circles show each installer’s usual area.</p>
          <InstallMap
            height={420}
            bases={bases}
            showRadius
            highlight={hovered}
            onBaseClick={(id) => setEditing(installers.find((p) => p.id === id) ?? null)}
          />
          {unpinned > 0 && (
            <p className="mt-2 text-xs text-amber-700">
              {unpinned} active installer{unpinned === 1 ? " has" : "s have"} no home base pinned and can’t be ranked by distance.
            </p>
          )}
        </section>
      </div>

      {editing && (
        <InstallerDialog
          installer={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
