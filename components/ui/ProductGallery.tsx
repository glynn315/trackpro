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
    <div className="relative flex h-full flex-col bg-soft">
      {/* Main image */}
      <div className="relative aspect-4/5 w-full overflow-hidden sm:aspect-5/4 lg:aspect-auto lg:flex-1 lg:min-h-112">
        {images.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt={i === safe ? alt : ""}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority={i === 0}
            className={`object-cover transition-opacity duration-500 ${
              i === safe ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        {/* TrackPro brand strip — covers any OEM branding baked into product photos */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between bg-white/95 px-4 py-2.5 backdrop-blur-sm sm:px-5 sm:py-3">
          <div className="flex items-center gap-2">
            <Image src="/icon.png" alt="" width={32} height={48} className="h-6 w-auto sm:h-7" aria-hidden />
            <span className="text-sm font-extrabold tracking-tight text-ink sm:text-base">
              TRACK<span className="text-brand">PRO</span>
            </span>
          </div>
          <span className="text-[9px] font-bold uppercase tracking-widest text-brand sm:text-[10px]">
            4G · Anti-Jammer GPS
          </span>
        </div>

        {/* Prev / next controls (only when multiple) */}
        {showThumbs && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => setActive((a) => (a - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-ink shadow-md backdrop-blur-sm transition-all hover:scale-105 hover:bg-white active:scale-95"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => setActive((a) => (a + 1) % images.length)}
              className="absolute right-3 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-ink shadow-md backdrop-blur-sm transition-all hover:scale-105 hover:bg-white active:scale-95"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
              {images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  aria-label={`Show image ${i + 1}`}
                  onClick={() => setActive(i)}
                  className={`h-1.5 rounded-full bg-white shadow-md transition-all ${
                    i === safe ? "w-6 opacity-100" : "w-1.5 opacity-60 hover:opacity-90"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {showThumbs && (
        <div className="flex gap-2 overflow-x-auto border-t border-line bg-white p-3 sm:p-4">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              aria-label={`Show image ${i + 1}`}
              aria-current={i === safe}
              onClick={() => setActive(i)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all sm:h-20 sm:w-20 ${
                i === safe
                  ? "border-brand shadow-[0_6px_18px_-8px_rgba(237,28,36,0.5)]"
                  : "border-line opacity-70 hover:border-brand/40 hover:opacity-100"
              }`}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
