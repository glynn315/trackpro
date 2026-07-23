import Image from "next/image";

type LogoProps = {
  variant?: "light" | "dark";
  className?: string;
  priority?: boolean;
};

/**
 * "dark" = wordmark on a light background → renders the brand PNG (black TRACK + red PRO).
 * "light" = wordmark on a dark background → renders the pin icon + text so TRACK reads as white.
 * The pin icon stays red on both.
 */
export function Logo({ variant = "dark", className = "", priority = false }: LogoProps) {
  if (variant === "light") {
    return (
      <span className={`inline-flex items-center gap-2 ${className}`}>
        <Image
          src="/icon.png"
          alt=""
          width={64}
          height={96}
          aria-hidden
          priority={priority}
          className="h-5 w-auto sm:h-6"
        />
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
