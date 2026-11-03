"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { saveInstallation, suggestInstallers } from "@/app/admin/(dashboard)/installations/actions";
import {
  DURATIONS,
  inputCls,
  type InstallOptions,
  type InstallPriority,
  type Installation,
  type MapBase,
  type Suggestion,
} from "@/lib/admin/installations";
import { InstallMap } from "./InstallMap";
import { LocationField, type Place } from "./LocationField";
import { Label, Modal, btnGhost, btnPrimary } from "./Modal";

export type JobPreset = { scheduled_on?: string | null; installer_id?: number | null };

/**
 * Book or edit an installation. Once the site is pinned, the right-hand panel
 * ranks the crew for that date and time — nearest free person first — and a
 * click assigns them.
 */
export function JobDialog({
  job,
  preset = {},
  options,
  onSaved,
  onClose,
}: {
  job: Installation | null;
  preset?: JobPreset;
  options: InstallOptions;
  onSaved: (job: Installation) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(job?.title ?? "GPS tracker installation");
  const [orderId, setOrderId] = useState<number | "">(job?.order_id ?? "");
  const [customerId, setCustomerId] = useState<number | "">(job?.customer_id ?? "");
  const [customerName, setCustomerName] = useState(job?.customer_name ?? "");
  const [phone, setPhone] = useState(job?.customer_phone ?? "");
  const [vehicle, setVehicle] = useState(job?.vehicle ?? "");
  const [units, setUnits] = useState(job?.units ?? 1);
  const [site, setSite] = useState<Place>({ address: job?.address ?? "", lat: job?.lat ?? null, lng: job?.lng ?? null });
  const [date, setDate] = useState(job?.scheduled_on ?? preset.scheduled_on ?? "");
  const [time, setTime] = useState(job?.start_time ?? "");
  const [duration, setDuration] = useState(job?.duration_minutes ?? 120);
  const [installerId, setInstallerId] = useState<number | "">(job?.installer_id ?? preset.installer_id ?? "");
  const [priority, setPriority] = useState<InstallPriority>(job?.priority ?? "normal");
  const [notes, setNotes] = useState(job?.notes ?? "");

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loadedKey, setLoadedKey] = useState("");
  const [hovered, setHovered] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [saving, startSaving] = useTransition();

  const pinned = site.lat !== null && site.lng !== null;
  // The ranking on screen belongs to this query; until it arrives, show "finding".
  const queryKey = [site.lat, site.lng, date, time, duration].join("|");
  const waiting = loadedKey !== queryKey;

  // An order already booked elsewhere is hidden from options; keep this job's own order selectable.
  const orders = useMemo(() => {
    if (!job?.order_id || options.orders.some((o) => o.id === job.order_id)) return options.orders;
    return [
      { id: job.order_id, reference: job.order_reference ?? `#${job.order_id}`, customer_id: job.customer_id, customer_name: job.customer_name ?? "", customer_phone: job.customer_phone ?? "", delivery_address: job.address },
      ...options.orders,
    ];
  }, [job, options.orders]);

  useEffect(() => {
    if (!pinned) return;
    let stale = false;
    const timer = setTimeout(async () => {
      const rows = await suggestInstallers({
        lat: site.lat!,
        lng: site.lng!,
        date: date || null,
        start_time: time ? time.slice(0, 5) : null,
        duration_minutes: duration,
        installation_id: job?.id ?? null,
      });
      if (!stale) {
        setSuggestions(rows);
        setLoadedKey(queryKey);
      }
    }, 350);
    return () => {
      stale = true;
      clearTimeout(timer);
    };
  }, [pinned, site.lat, site.lng, date, time, duration, job?.id, queryKey]);

  const ranked = pinned ? suggestions : [];

  const bases: MapBase[] = ranked
    .filter((s) => s.base_lat !== null && s.base_lng !== null)
    .map((s) => ({ id: s.installer_id, name: s.name, base_address: s.base_address, lat: s.base_lat!, lng: s.base_lng!, service_radius_km: s.service_radius_km }));

  function pickOrder(id: string) {
    const order = orders.find((o) => o.id === Number(id));
    setOrderId(order ? order.id : "");
    if (!order) return;
    if (order.customer_id) setCustomerId(order.customer_id);
    if (!customerName.trim()) setCustomerName(order.customer_name);
    if (!phone.trim()) setPhone(order.customer_phone);
    if (!site.address.trim()) setSite({ address: order.delivery_address, lat: null, lng: null });
  }

  function pickCustomer(id: string) {
    const c = options.customers.find((x) => x.id === Number(id));
    setCustomerId(c ? c.id : "");
    if (!c) return;
    if (!customerName.trim()) setCustomerName(c.company ? `${c.name} (${c.company})` : c.name);
    if (!phone.trim() && c.phone) setPhone(c.phone);
  }

  function save() {
    setError("");
    startSaving(async () => {
      const r = await saveInstallation(job?.id ?? null, {
        title: title.trim(),
        order_id: orderId || null,
        customer_id: customerId || null,
        customer_name: customerName.trim() || null,
        customer_phone: phone.trim() || null,
        vehicle: vehicle.trim() || null,
        units,
        address: site.address.trim(),
        lat: site.lat,
        lng: site.lng,
        scheduled_on: date || null,
        start_time: time ? time.slice(0, 5) : null,
        duration_minutes: duration,
        installer_id: installerId || null,
        priority,
        notes: notes.trim() || null,
      });
      if (!r.ok || !r.data) setError(r.message ?? "Could not save the installation.");
      else onSaved(r.data);
    });
  }

  return (
    <Modal
      wide
      title={job ? `Edit ${job.reference}` : "New installation"}
      subtitle={job ? job.title : "Pin the site and pick a date — the closest free installer is suggested."}
      onClose={onClose}
      footer={
        <>
          {error && <p className="mr-auto text-xs font-medium text-red-600">{error}</p>}
          <button type="button" className={btnGhost} onClick={onClose} disabled={saving}>Cancel</button>
          <button type="button" className={btnPrimary} onClick={save} disabled={saving || !title.trim() || !site.address.trim()}>
            {saving ? "Saving…" : job ? "Save changes" : "Book installation"}
          </button>
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div>
            <Label required>What is being installed</Label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={160} className={inputCls} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>From order</Label>
              <select value={orderId} onChange={(e) => pickOrder(e.target.value)} className={inputCls}>
                <option value="">No order</option>
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>{o.reference} · {o.customer_name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Client</Label>
              <select value={customerId} onChange={(e) => pickCustomer(e.target.value)} className={inputCls}>
                <option value="">Walk-in / not on file</option>
                {options.customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}{c.company ? ` · ${c.company}` : ""}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Contact person</Label>
              <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} maxLength={120} className={inputCls} />
            </div>
            <div>
              <Label>Phone</Label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={40} className={inputCls} />
            </div>
            <div>
              <Label>Vehicle(s)</Label>
              <input value={vehicle} onChange={(e) => setVehicle(e.target.value)} maxLength={160} placeholder="e.g. Hilux ABC 1234" className={inputCls} />
            </div>
            <div>
              <Label>Units to fit</Label>
              <input type="number" min={1} max={500} value={units} onChange={(e) => setUnits(Math.max(1, Number(e.target.value) || 1))} className={inputCls} />
            </div>
          </div>

          <LocationField label="Site" required value={site} onChange={setSite} placeholder="Street, barangay, city" />

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Date</Label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
            </div>
            <div>
              <Label>Start</Label>
              <input type="time" step={900} value={time} onChange={(e) => setTime(e.target.value)} className={inputCls} />
            </div>
            <div>
              <Label>Takes</Label>
              <select value={duration} onChange={(e) => setDuration(Number(e.target.value))} className={inputCls}>
                {DURATIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Installer</Label>
              <select value={installerId} onChange={(e) => setInstallerId(e.target.value ? Number(e.target.value) : "")} className={inputCls}>
                <option value="">Nobody yet</option>
                {options.installers
                  .filter((p) => p.is_active || p.id === installerId)
                  .map((p) => <option key={p.id} value={p.id}>{p.name}{p.is_active ? "" : " (inactive)"}</option>)}
              </select>
            </div>
            <div>
              <Label>Priority</Label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as InstallPriority)} className={inputCls}>
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <Label>Notes</Label>
            <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Parking, access, what to bring" className={inputCls} />
          </div>
        </div>

        <div className="min-w-0">
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Who should go</h3>
            {date && <span className="text-[11px] text-gray-400">ranked for {date}{time ? ` at ${time.slice(0, 5)}` : ""}</span>}
          </div>

          {!pinned ? (
            <div className="rounded-xl border border-dashed border-gray-300 px-4 py-10 text-center">
              <p className="text-sm font-semibold">Pin the site first</p>
              <p className="mt-1 text-xs text-gray-500">
                Press <strong>📍 Pin on map</strong> beside Site. The crew is then ranked by distance — from their home
                base, or from another job they already have nearby that day.
              </p>
            </div>
          ) : (
            <>
              <InstallMap height={200} bases={bases} focus={{ lat: site.lat!, lng: site.lng! }} highlight={hovered ?? (installerId || null)} />
              <div className="mt-3 max-h-[320px] space-y-2 overflow-y-auto pr-1">
                {waiting && ranked.length === 0 && <p className="py-6 text-center text-sm text-gray-400">Finding who is closest…</p>}
                {!waiting && ranked.length === 0 && (
                  <p className="py-6 text-center text-sm text-gray-500">No active installers yet. Add them under Personnel.</p>
                )}
                {ranked.map((s, i) => (
                  <SuggestionRow
                    key={s.installer_id}
                    s={s}
                    rank={i + 1}
                    selected={s.installer_id === installerId}
                    onHover={setHovered}
                    onPick={() => setInstallerId(s.installer_id === installerId ? "" : s.installer_id)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}

function SuggestionRow({
  s,
  rank,
  selected,
  onPick,
  onHover,
}: {
  s: Suggestion;
  rank: number;
  selected: boolean;
  onPick: () => void;
  onHover: (id: number | null) => void;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      onMouseEnter={() => onHover(s.installer_id)}
      onMouseLeave={() => onHover(null)}
      className={`flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
        selected ? "border-brand bg-red-50" : s.available ? "border-gray-200 hover:border-brand/50 hover:bg-gray-50" : "border-gray-200 bg-gray-50 opacity-70 hover:opacity-100"
      }`}
    >
      <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${s.recommended ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-600"}`}>
        {rank}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-1.5">
          <span className="text-sm font-semibold">{s.name}</span>
          {s.recommended && <Tag className="bg-emerald-100 text-emerald-700">Suggested</Tag>}
          {s.clash ? <Tag className="bg-red-100 text-red-700">Busy</Tag> : s.full && <Tag className="bg-amber-100 text-amber-800">Full day</Tag>}
          {s.within_radius === false && <Tag className="bg-gray-200 text-gray-600">Outside area</Tag>}
          {selected && <Tag className="bg-brand text-white">Assigned</Tag>}
        </span>
        <span className="mt-0.5 block text-xs text-gray-500">{s.reason}</span>
        {s.skills && <span className="block text-[11px] text-gray-400">{s.skills}</span>}
      </span>
      <span className="shrink-0 text-right">
        <span className="block text-base font-bold leading-tight">{s.distance_km === null ? "—" : `${s.distance_km} km`}</span>
        <span className="block text-[11px] text-gray-400">{s.jobs_that_day}/{s.daily_capacity} jobs</span>
      </span>
    </button>
  );
}

function Tag({ className, children }: { className: string; children: React.ReactNode }) {
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${className}`}>{children}</span>;
}
