export type InstallStatus = "pending" | "scheduled" | "in_progress" | "completed" | "cancelled";
export type InstallPriority = "low" | "normal" | "high";

export type Installation = {
  id: number;
  reference: string;
  title: string;
  customer_id: number | null;
  order_id: number | null;
  order_reference: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  vehicle: string | null;
  units: number;
  address: string;
  lat: number | null;
  lng: number | null;
  scheduled_on: string | null;
  start_time: string | null;
  duration_minutes: number;
  installer_id: number | null;
  installer_name: string | null;
  priority: InstallPriority;
  status: InstallStatus;
  position: number;
  started_at: string | null;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Installer = {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  skills: string | null;
  base_address: string | null;
  base_lat: number | null;
  base_lng: number | null;
  service_radius_km: number;
  daily_capacity: number;
  is_active: boolean;
  notes: string | null;
  open_jobs?: number;
};

export type InstallOptions = {
  customers: { id: number; name: string; phone: string | null; company: string | null }[];
  orders: {
    id: number;
    reference: string;
    customer_id: number | null;
    customer_name: string;
    customer_phone: string;
    delivery_address: string;
  }[];
  installers: Pick<
    Installer,
    "id" | "name" | "is_active" | "base_address" | "base_lat" | "base_lng" | "service_radius_km" | "daily_capacity"
  >[];
};

export type Suggestion = {
  installer_id: number;
  name: string;
  phone: string | null;
  skills: string | null;
  base_address: string | null;
  base_lat: number | null;
  base_lng: number | null;
  distance_km: number | null;
  base_distance_km: number | null;
  from: { kind: "base" | "job"; label: string } | null;
  service_radius_km: number;
  within_radius: boolean | null;
  jobs_that_day: number;
  daily_capacity: number;
  full: boolean;
  clash: { reference: string; title: string; start_time: string } | null;
  available: boolean;
  recommended: boolean;
  reason: string;
};

export type MapJob = {
  id: number;
  reference: string;
  title: string;
  address: string;
  lat: number;
  lng: number;
  status: InstallStatus;
  scheduled_on: string | null;
  installer_name: string | null;
};

export type MapBase = {
  id: number;
  name: string;
  base_address: string | null;
  lat: number;
  lng: number;
  service_radius_km: number;
};

export type InstallDashboard = {
  today: string;
  week: { from: string; to: string };
  kpis: {
    today: number;
    week: number;
    backlog: number;
    in_progress: number;
    overdue: number;
    completed_month: number;
    personnel: number;
    units_month: number;
  };
  by_status: { status: InstallStatus; count: number }[];
  today_jobs: Installation[];
  upcoming: Installation[];
  backlog: Installation[];
  load: {
    installer_id: number;
    name: string;
    base_address: string | null;
    today: number;
    week: number;
    daily_capacity: number;
    days: number[];
  }[];
  map: { jobs: MapJob[]; installers: MapBase[] };
};

export const STAGES: { key: InstallStatus; label: string; hint: string; dot: string; badge: string }[] = [
  { key: "pending", label: "To schedule", hint: "Needs a person and a date", dot: "bg-amber-500", badge: "bg-amber-100 text-amber-800" },
  { key: "scheduled", label: "Scheduled", hint: "Booked and waiting", dot: "bg-sky-600", badge: "bg-sky-100 text-sky-800" },
  { key: "in_progress", label: "In progress", hint: "Technician on site", dot: "bg-indigo-600", badge: "bg-indigo-100 text-indigo-800" },
  { key: "completed", label: "Installed", hint: "Device fitted and online", dot: "bg-emerald-600", badge: "bg-emerald-100 text-emerald-800" },
  { key: "cancelled", label: "Cancelled", hint: "Called off", dot: "bg-gray-400", badge: "bg-gray-100 text-gray-600" },
];

export const STAGE = Object.fromEntries(STAGES.map((s) => [s.key, s])) as Record<InstallStatus, (typeof STAGES)[number]>;

export const PRIORITY_BADGE: Record<InstallPriority, string> = {
  high: "bg-red-100 text-red-700",
  normal: "bg-gray-100 text-gray-600",
  low: "bg-gray-50 text-gray-400",
};

export const DURATIONS = [30, 60, 90, 120, 180, 240, 300, 360, 480].map((m) => ({
  value: m,
  label: m < 60 ? `${m} min` : `${m / 60} hr${m === 60 ? "" : "s"}`,
}));

export const inputCls =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

/** Today as YYYY-MM-DD in Philippine time (the server may run in UTC). */
export function manilaToday(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
}

function parseDay(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(iso: string, days: number): string {
  const d = parseDay(iso);
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("en-CA");
}

export function mondayOf(iso: string): string {
  const offset = (parseDay(iso).getDay() + 6) % 7;
  return addDays(iso, -offset);
}

export function dayLabel(iso: string, long = false): string {
  return parseDay(iso).toLocaleDateString("en-PH", {
    weekday: long ? "long" : "short",
    month: "short",
    day: "numeric",
  });
}

export function timeLabel(time: string | null): string {
  if (!time) return "Any time";
  const [h, m] = time.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

export function endTime(start: string | null, minutes: number): string | null {
  if (!start) return null;
  const [h, m] = start.split(":").map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export function hours(minutes: number): string {
  return minutes < 60 ? `${minutes} min` : `${+(minutes / 60).toFixed(1)} hr${minutes === 60 ? "" : "s"}`;
}

export function kmBetween(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const rad = (v: number) => (v * Math.PI) / 180;
  const a =
    Math.sin(rad(lat2 - lat1) / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lng2 - lng1) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.min(1, Math.sqrt(a)));
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

export function isOverdue(job: Installation, today: string): boolean {
  return (job.status === "scheduled" || job.status === "in_progress") && !!job.scheduled_on && job.scheduled_on < today;
}
