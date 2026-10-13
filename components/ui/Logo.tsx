import Image from "next/image";

type LogoProps = {
  variant?: "light" | "dark";
  className?: string;
  priority?: boolean;
};

/**
 * "dark" = wordmark on a light background → renders the brand PNG (black TRACK + red PRO).
 * "light" = wordmark on a dark background → the pin icon on a white tile + text so TRACK reads
 * as white. (The icon's "V" is black on transparent, so without the tile it vanishes on a dark
 * background and only the red pin shows.)
 */
export function Logo({ variant = "dark", className = "", priority = false }: LogoProps) {
  if (variant === "light") {
    return (
      <span className={`inline-flex items-center gap-2.5 ${className}`}>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white shadow-sm ring-1 ring-white/10">
          <Image
            src="/icon.png"
            alt=""
            width={414}
            height={641}
            aria-hidden
            priority={priority}
            className="h-6 w-auto"
          />
        </span>
        <span className="text-base font-extrabold tracking-tight text-white sm:text-lg">
          TRACK<span className="text-brand">PRO</span>
        </span>
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center ${className}`}>
      <Image
        src="/logo.png"
        alt="TrackPro GPS"
        width={1664}
        height={250}
        priority={priority}
        className="h-6 w-auto sm:h-7"
      />
    </span>
  );
}
