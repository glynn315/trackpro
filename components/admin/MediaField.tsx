"use client";

import { useRef, useState } from "react";
import type { MediaItem } from "@/lib/admin/types";

const MAX_MB = 50;

/**
 * Photo / short video picker for the product and add-on forms. Files upload
 * straight away (via /api/admin/media); the list is submitted with the form as
 * JSON in a hidden `media` input. The first item is the cover on the website.
 */
export function MediaField({ name = "media", initial = [] }: { name?: string; initial?: MediaItem[] }) {
  const [items, setItems] = useState<MediaItem[]>(initial);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setError("");
    for (const file of Array.from(files)) {
      if (file.size > MAX_MB * 1024 * 1024) {
        setError(`${file.name} is larger than ${MAX_MB} MB.`);
        continue;
      }
      setUploading((n) => n + 1);
      try {
        const body = new FormData();
        body.append("file", file);
        const res = await fetch("/api/admin/media", { method: "POST", body });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          const fieldError = json?.errors?.file?.[0];
          setError(`${file.name}: ${fieldError ?? json?.message ?? "upload failed."}`);
        } else {
          setItems((cur) => [...cur, json.data as MediaItem]);
        }
      } catch {
        setError(`${file.name}: upload failed — check your connection.`);
      } finally {
        setUploading((n) => n - 1);
      }
    }
    if (input.current) input.current.value = "";
  }

  function move(i: number, by: -1 | 1) {
    setItems((cur) => {
      const next = [...cur];
      const j = i + by;
      if (j < 0 || j >= next.length) return cur;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(items.map(({ type, path }) => ({ type, path })))} />

      {items.length > 0 && (
        <ul className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {items.map((m, i) => (
            <li key={m.path} className="group relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
              {m.type === "video" ? (
                <video src={m.url} muted playsInline preload="metadata" className="aspect-square w-full object-cover" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.url} alt="" className="aspect-square w-full object-cover" />
              )}
              {i === 0 && (
                <span className="absolute left-1 top-1 rounded bg-brand px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                  Cover
                </span>
              )}
              {m.type === "video" && (
                <span className="absolute right-1 top-1 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                  Video
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/60 px-1 py-0.5 text-xs text-white">
                <span className="flex gap-1">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move earlier" className="px-1 disabled:opacity-30">
                    ←
                  </button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move later" className="px-1 disabled:opacity-30">
                    →
                  </button>
                </span>
                <button
                  type="button"
                  onClick={() => setItems((cur) => cur.filter((x) => x.path !== m.path))}
                  aria-label="Remove"
                  className="px-1 font-bold hover:text-red-300"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-white px-3 py-4 text-sm font-semibold text-gray-600 hover:border-brand hover:text-brand">
        <input
          ref={input}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
          onChange={(e) => upload(e.target.files)}
          className="sr-only"
        />
        {uploading > 0 ? `Uploading ${uploading} file${uploading > 1 ? "s" : ""}…` : "+ Add photos or video clips"}
      </label>
      <p className="mt-1 text-[11px] text-gray-500">
        JPG, PNG, WebP, GIF or MP4 / WebM / MOV up to {MAX_MB} MB. The first item is the cover. Save the form to keep changes.
      </p>
      {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

