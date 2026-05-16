import type { HTMLAttributes } from "react";
import { Container } from "./Container";

type SectionProps = HTMLAttributes<HTMLElement> & {
  id: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  surface?: "white" | "soft" | "dark";
};

const surfaceMap = {
  white: "bg-white text-ink",
  soft: "bg-[var(--color-cloud)] text-ink bg-dots",
  dark: "bg-ink text-white",
} as const;

export function Section({
  id,
  eyebrow,
  title,
  description,
  surface = "white",
  className = "",
  children,
  ...rest
}: SectionProps) {
  return (
    <section
      id={id}
      className={`py-12 sm:py-16 lg:py-20 ${surfaceMap[surface]} ${className}`}
      {...rest}
    >
      <Container>
        {(eyebrow || title || description) && (
          <header className="mx-auto mb-8 max-w-2xl text-center sm:mb-10 lg:mb-12">
            {eyebrow && (
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-brand sm:text-sm">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="text-balance text-[1.75rem] font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                {title}
              </h2>
            )}
            {description && (
              <p
                className={`mt-4 text-[15px] leading-relaxed sm:mt-5 sm:text-lg ${
                  surface === "dark" ? "text-white/70" : "text-muted"
                }`}
              >
                {description}
              </p>
            )}
          </header>
        )}
        {children}
      </Container>
    </section>
  );
}
