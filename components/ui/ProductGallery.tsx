"use client";

import { useState } from "react";
import Image from "next/image";

type ProductGalleryProps = {
  images: string[];
  alt: string;
};

export function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const safe = Math.min(active, images.length - 1);
  const showThumbs = images.length > 1;

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      {/* Main display — dark with branded ambient */}
      <div className="relative aspect-4/5 w-full overflow-hidden bg-linear-to-br from-[#0a0a0a] via-[#141414] to-[#0a0a0a] sm:aspect-5/4 lg:aspect-auto lg:flex-1 lg:min-h-112">
        {/* Layered ambient */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 70% at 30% 30%, rgba(237,28,36,0.22) 0%, rgba(0,0,0,0) 60%), radial-gradient(50% 60% at 80% 80%, rgba(237,28,36,0.14) 0%, rgba(0,0,0,0) 60%)",
          }}
        />
        <div aria-hidden className="bg-dots-light absolute inset-0 opacity-30" />
        <div aria-hidden className="bg-noise absolute inset-0 opacity-[0.12] mix-blend-overlay" />

        {/* Decorative GPS pulse rings */}
        <div className="absolute inset-0 grid place-items-center">
          {[0, 1.4, 2.8].map((delay) => (
            <span
              key={delay}
              aria-hidden
              className="animate-pulse-ring absolute h-[28rem] w-[28rem] rounded-full border border-brand/15"
              style={{ animationDelay: `${delay}s` }}
            />
          ))}
        </div>

        {/* Decorative pin watermark */}
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-12 -right-12 h-56 w-56 opacity-[0.06] sm:-bottom-16 sm:-right-16 sm:h-72 sm:w-72"
        >
          <Image src="/icon.png" alt="" fill className="object-contain" />
        </div>

        {/* Catalog images */}
        {images.map((src, i) => (
          <div
            key={src}
            className={`absolute inset-0 grid place-items-center transition-all duration-500 ${
              i === safe ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
          >
            <div className="relative h-full w-full p-12 sm:p-14 lg:p-16">
              <Image
                src={src}
                alt={i === safe ? alt : ""}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                priority={i === 0}
                className="object-contain drop-shadow-[0_24px_48px_rgba(0,0,0,0.5)]"
              />
            </div>
          </div>
        ))}

        {/* Prev / next */}
        {showThumbs && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => setActive((a) => (a - 1 + images.length) % images.length)}
              className="group absolute left-3 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-white/10 text-white shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)] backdrop-blur-md transition-all hover:scale-110 hover:border-brand/50 hover:bg-brand active:scale-95 sm:left-4 sm:h-12 sm:w-12"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => setActive((a) => (a + 1) % images.length)}
              className="group absolute right-3 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-white/10 text-white shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)] backdrop-blur-md transition-all hover:scale-110 hover:border-brand/50 hover:bg-brand active:scale-95 sm:right-4 sm:h-12 sm:w-12"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </>
        )}

        {/* Dot progress at bottom */}
        {showThumbs && (
          <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-1.5 rounded-full border border-white/10 bg-black/40 px-3 py-2 backdrop-blur-md">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                aria-label={`Show image ${i + 1}`}
                onClick={() => setActive(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === safe
                    ? "w-8 bg-brand shadow-[0_0_12px_rgba(237,28,36,0.6)]"
                    : "w-1.5 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
