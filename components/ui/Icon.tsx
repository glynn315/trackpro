import type { ReactElement } from "react";

type IconName =
  | "map"
  | "truck"
  | "shield"
  | "geo"
  | "support"
  | "chart"
  | "check"
  | "arrow"
  | "power"
  | "lock"
  | "signal";

const paths: Record<IconName, ReactElement> = {
  map: (
    <path d="M9 4l-6 2v14l6-2 6 2 6-2V4l-6 2-6-2zm0 2.2v13.6m6-11.6v13.6" />
  ),
  truck: (
    <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7zM7 18a2 2 0 100-4 2 2 0 000 4zm10 0a2 2 0 100-4 2 2 0 000 4z" />
  ),
  shield: (
    <path d="M12 3l8 3v6c0 4.5-3.5 8.5-8 9-4.5-.5-8-4.5-8-9V6l8-3zm-3 9l2 2 4-4" />
  ),
  geo: (
    <path d="M12 22s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12zm0-9a3 3 0 100-6 3 3 0 000 6z" />
  ),
  support: (
    <path d="M4 13a8 8 0 0116 0v3a3 3 0 01-3 3h-1v-7h4M8 19H7a3 3 0 01-3-3v-3h4v6z" />
  ),
  chart: <path d="M4 20V10m6 10V4m6 16v-7m6 7V8M3 20h18" />,
  check: <path d="M5 12l4 4L19 6" />,
  arrow: <path d="M5 12h14M13 5l7 7-7 7" />,
  // Engine kill / power button
  power: <path d="M12 3v9M5.64 7.64a9 9 0 1012.72 0" />,
  // Door lock — padlock
  lock: (
    <path d="M6 11h12v9H6zM9 11V8a3 3 0 016 0v3M12 15v2" />
  ),
  // Wifi/signal jammer — wifi with a slash through it
  signal: (
    <path d="M3 9a14 14 0 0118 0M6 12.5a9 9 0 0112 0M9 16a4 4 0 016 0M12 20h.01M4 4l16 16" />
  ),
};

type IconProps = {
  name: IconName;
  className?: string;
};

export function Icon({ name, className = "h-6 w-6" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {paths[name]}
    </svg>
  );
}

export type { IconName };
