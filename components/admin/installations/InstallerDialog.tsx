"use client";

import { useState, useTransition } from "react";
import { saveInstaller } from "@/app/admin/(dashboard)/installations/actions";
import { inputCls, type Installer } from "@/lib/admin/installations";
import { LocationField, type Place } from "./LocationField";
import { Label, Modal, btnGhost, btnPrimary } from "./Modal";

export function InstallerDialog({
  installer,
  onSaved,
  onClose,
}: {
  installer: Installer | null;
  onSaved: () => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(installer?.name ?? "");
  const [phone, setPhone] = useState(installer?.phone ?? "");
  const [email, setEmail] = useState(installer?.email ?? "");
  const [skills, setSkills] = useState(installer?.skills ?? "");
  const [base, setBase] = useState<Place>({
    address: installer?.base_address ?? "",
    lat: installer?.base_lat ?? null,
    lng: installer?.base_lng ?? null,
  });
  const [radius, setRadius] = useState(installer?.service_radius_km ?? 30);
  const [capacity, setCapacity] = useState(installer?.daily_capacity ?? 3);
  const [active, setActive] = useState(installer?.is_active ?? true);
  const [notes, setNotes] = useState(installer?.notes ?? "");
  const [error, setError] = useState("");
  const [saving, start] = useTransition();

  function save() {
    setError("");
    start(async () => {
      const r = await saveInstaller(installer?.id ?? null, {
        name: name.trim(),
        phone: phone.trim() || null,
        email: email.trim() || null,
        skills: skills.trim() || null,
        base_address: base.address.trim() || null,
        base_lat: base.lat,
        base_lng: base.lng,
        service_radius_km: Math.max(1, Math.round(radius) || 30),
        daily_capacity: Math.max(1, Math.round(capacity) || 3),
        is_active: active,
        notes: notes.trim() || null,
      });
      if (!r.ok) setError(r.message ?? "Could not save the installer.");
      else onSaved();
    });
  }

  return (
    <Modal
      title={installer ? `Edit ${installer.name}` : "Add installer"}
      subtitle="Their home base is where distances to each job are measured from."
      onClose={onClose}
      footer={
        <>
          {error && <p className="mr-auto text-xs font-medium text-red-600">{error}</p>}
          <button type="button" className={btnGhost} onClick={onClose} disabled={saving}>Cancel</button>
          <button type="button" className={btnPrimary} onClick={save} disabled={saving || !name.trim()}>
            {saving ? "Saving…" : installer ? "Save changes" : "Add to crew"}
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Label required>Name</Label>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} className={inputCls} />
          </div>
          <div>
            <Label>Phone</Label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={40} className={inputCls} />
          </div>
          <div>
            <Label>Email</Label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
          </div>
        </div>
        <div>
          <Label>Skills</Label>
          <input value={skills} onChange={(e) => setSkills(e.target.value)} maxLength={160} placeholder="e.g. GPS, dashcam, fuel sensor, motorcycle" className={inputCls} />
        </div>

        <LocationField label="Home base" value={base} onChange={setBase} placeholder="Where they set out from each morning" />
        {!(base.lat !== null && base.lng !== null) && (
          <p className="-mt-1 text-[11px] text-amber-700">Pin the base so they can be suggested for jobs nearby.</p>
        )}

        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label>Area (km)</Label>
            <input type="number" min={1} max={1000} value={radius} onChange={(e) => setRadius(Number(e.target.value))} className={inputCls} />
          </div>
          <div>
            <Label>Jobs / day</Label>
            <input type="number" min={1} max={20} value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} className={inputCls} />
          </div>
          <div>
            <Label>Status</Label>
            <select value={active ? "1" : "0"} onChange={(e) => setActive(e.target.value === "1")} className={inputCls}>
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>
        </div>
        <div>
          <Label>Notes</Label>
          <input value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} className={inputCls} />
        </div>
      </div>
    </Modal>
  );
}
