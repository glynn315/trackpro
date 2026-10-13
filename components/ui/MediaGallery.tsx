"use client";

import { useState } from "react";

export type StoreMedia = { type: "image" | "video"; url: string };

/** Photo / video carousel for product and add-on cards (uploaded in the admin). */
export function MediaGallery({ media, alt }: { media: readonly StoreMedia[]; alt: string }) {
  const [index, setIndex] = useState(0);
  if (media.length === 0) return null;
  const current = media[Math.min(index, media.length - 1)];
  const go = (by: number) => setIndex((i) => (i + by + media.length) % media.length);

  return (
    <div className="relative mb-4 overflow-hidden rounded-xl bg-soft">
      {current.type === "video" ? (
        <video
          key={current.url}
          src={current.url}
          controls
          muted
          playsInline
          preload="metadata"
          className="aspect-[4/3] w-full bg-black object-contain"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={current.url} src={current.url} alt={alt} loading="lazy" className="aspect-[4/3] w-full object-cover" />
      )}

      {media.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous"
            className="absolute left-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-ink shadow hover:bg-white"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next"
            className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-ink shadow hover:bg-white"
          >
            ›
          </button>
          <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
            {media.map((m, i) => (
              <span
                key={m.url}
                className={`h-1.5 rounded-full transition-all ${i === index ? "w-4 bg-brand" : "w-1.5 bg-white/80"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
