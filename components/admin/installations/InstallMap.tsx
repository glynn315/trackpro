"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import type * as Leaflet from "leaflet";
import { STAGE, type MapBase, type MapJob } from "@/lib/admin/installations";

// Cagayan de Oro — only used before anything is pinned.
const DEFAULT_CENTRE: [number, number] = [8.4822, 124.6472];

const JOB_COLOUR: Record<string, string> = {
  pending: "#d97706",
  scheduled: "#0284c7",
  in_progress: "#4f46e5",
  completed: "#059669",
  cancelled: "#9ca3af",
};

const esc = (v: string) => v.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

type Props = {
  jobs?: MapJob[];
  bases?: MapBase[];
  focus?: { lat: number; lng: number } | null;
  highlight?: number | null;
  showRadius?: boolean;
  height?: number;
  onPick?: (lat: number, lng: number) => void;
  onJobClick?: (id: number) => void;
  onBaseClick?: (id: number) => void;
};

type Live = {
  L: typeof Leaflet | null;
  map: Leaflet.Map | null;
  layer: Leaflet.LayerGroup | null;
  fitted: string;
  props: Props;
};

/**
 * Leaflet map of job sites (dots) and installer home bases (diamonds). With
 * `onPick` it doubles as a picker: clicking drops the pin. Leaflet touches
 * `window`, so it is imported inside the effect, never during server render.
 */
export function InstallMap(props: Props) {
  const { height = 360, onPick } = props;
  const el = useRef<HTMLDivElement>(null);
  const live = useRef<Live>({ L: null, map: null, layer: null, fitted: "", props });

  // After every render: hand the latest props to Leaflet and redraw.
  useEffect(() => {
    live.current.props = props;
    draw(live.current);
  });

  useEffect(() => {
    const state = live.current;
    let cancelled = false;

    import("leaflet").then((mod) => {
      if (cancelled || !el.current || state.map) return;

      const m = mod.map(el.current, { center: DEFAULT_CENTRE, zoom: 11, scrollWheelZoom: false });
      mod.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap contributors",
      }).addTo(m);
      m.on("click", (e: Leaflet.LeafletMouseEvent) => state.props.onPick?.(e.latlng.lat, e.latlng.lng));

      state.L = mod;
      state.map = m;
      state.layer = mod.layerGroup().addTo(m);
      setTimeout(() => m.invalidateSize(), 50);
      draw(state);
    });

    return () => {
      cancelled = true;
      state.map?.remove();
      state.map = null;
      state.layer = null;
      state.fitted = "";
    };
  }, []);

  return (
    <div className="relative">
      <div ref={el} style={{ height }} className={`z-0 w-full overflow-hidden rounded-xl ${onPick ? "cursor-crosshair" : ""}`} />
      {!onPick && (
        <div className="pointer-events-none absolute bottom-2 left-2 z-[400] flex flex-wrap gap-3 rounded-lg bg-white/95 px-3 py-1.5 text-[11px] font-semibold shadow">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" />To schedule</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-sky-600" />Scheduled</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rotate-45 border-2 border-ink bg-white" />Installer base</span>
        </div>
      )}
    </div>
  );
}

function draw(state: Live) {
  const { L: mod, map: m, layer: group } = state;
  if (!mod || !m || !group) return;

  const { jobs = [], bases = [], focus = null, highlight = null, showRadius = false } = state.props;
  group.clearLayers();
  const points: [number, number][] = [];

  for (const b of bases) {
    const lit = highlight === b.id;
    points.push([b.lat, b.lng]);

    if (showRadius || lit) {
      mod.circle([b.lat, b.lng], {
        radius: b.service_radius_km * 1000,
        color: lit ? "#ed1c24" : "#6b7280",
        weight: 1,
        opacity: lit ? 0.8 : 0.35,
        fillOpacity: lit ? 0.08 : 0.03,
        interactive: false,
      }).addTo(group);
    }

    mod.marker([b.lat, b.lng], {
      icon: mod.divIcon({
        className: "",
        html: `<div style="width:16px;height:16px;transform:rotate(45deg);background:${lit ? "#ed1c24" : "#fff"};border:3px solid #0a0a0a;box-shadow:0 1px 3px rgba(0,0,0,.35)"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      }),
      zIndexOffset: lit ? 1000 : 500,
    })
      .bindTooltip(`<strong>${esc(b.name)}</strong><br>${esc(b.base_address ?? "Home base")}`)
      .on("click", () => state.props.onBaseClick?.(b.id))
      .addTo(group);
  }

  for (const j of jobs) {
    points.push([j.lat, j.lng]);
    mod.circleMarker([j.lat, j.lng], {
      radius: 8,
      color: "#fff",
      weight: 2,
      fillColor: JOB_COLOUR[j.status] ?? "#0284c7",
      fillOpacity: 1,
    })
      .bindTooltip(
        `<strong>${esc(j.reference)}</strong> · ${esc(j.title)}<br>${esc(j.address)}<br>` +
          `${STAGE[j.status].label}${j.installer_name ? " · " + esc(j.installer_name) : ""}${j.scheduled_on ? " · " + j.scheduled_on : ""}`
      )
      .on("click", () => state.props.onJobClick?.(j.id))
      .addTo(group);
  }

  if (focus) {
    points.push([focus.lat, focus.lng]);
    mod.marker([focus.lat, focus.lng], {
      icon: mod.divIcon({
        className: "",
        html: `<div style="width:22px;height:22px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#ed1c24;border:3px solid #fff;box-shadow:0 2px 4px rgba(0,0,0,.4)"></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 22],
      }),
      zIndexOffset: 2000,
    }).addTo(group);
  }

  // Re-fit only when the set of points changes, so clicking around doesn't keep zooming.
  const key = points.map((p) => p.join(",")).join("|");
  if (key === state.fitted) return;
  state.fitted = key;

  if (points.length === 1) m.setView(points[0], Math.max(m.getZoom(), 13));
  else if (points.length > 1) m.fitBounds(mod.latLngBounds(points), { padding: [28, 28], maxZoom: 14 });
}
