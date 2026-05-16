import Image from "next/image";

type LogoProps = {
  variant?: "light" | "dark";
  className?: string;
  priority?: boolean;
};

/**
 * "dark" = wordmark on light background → renders the brand PNG (black TRACK + red PRO).
 * "light" = wordmark on dark background → renders text fallback so TRACK reads as white.
 * The pin icon stays in red on both.
 */
export function Logo({ variant = "dark", className = "", priority = false }: LogoProps) {
  if (variant === "light") {
    return (
      <span className={`inline-flex items-center gap-2.5 ${className}`}>
        <Image
          src="/icon.png"
          alt=""
          width={64}
          height={96}
          aria-hidden
          className="h-8 w-auto"
        />
        <span className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
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
        className="h-7 w-auto sm:h-8 md:h-9"
      />
    </span>
  );
}
