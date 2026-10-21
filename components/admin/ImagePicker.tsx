"use client";

import { useRef, useState } from "react";

const MAX_MB = 10;

export type PickedImage = { image: string | null; image_url: string | null };

/**
 * One optional image (e.g. a hardware option's picture). Uploads straight
 * away via /api/admin/media, like MediaField; the caller keeps the path.
 */
export function ImagePicker({
  value,
  onChange,
  label = "image",
}: {
  value: PickedImage;
  onChange: (next: PickedImage) => void;
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);

  async function upload(file: File | undefined) {
    if (!file) return;
    setError("");
    if (!file.type.startsWith("image/")) return setError("Choose an image file.");
    if (file.size > MAX_MB * 1024 * 1024) return setError(`Larger than ${MAX_MB} MB.`);
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/media", { method: "POST", body });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) setError(json?.errors?.file?.[0] ?? json?.message ?? "Upload failed.");
      else onChange({ image: json.data.path, image_url: json.data.url });
    } catch {
      setError("Upload failed — check your connection.");
    } finally {
      setUploading(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="flex shrink-0 flex-col items-center gap-0.5">
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={uploading}
        title={value.image_url ? `Change ${label}` : `Add ${label}`}
        aria-label={value.image_url ? `Change ${label}` : `Add ${label}`}
        className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-lg border border-dashed border-gray-300 bg-white text-gray-400 hover:border-brand hover:text-brand disabled:opacity-50"
      >
        {value.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value.image_url} alt="" className="h-full w-full object-cover" />
        ) : uploading ? (
          <span className="text-[10px]">…</span>
        ) : (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <circle cx="9" cy="10" r="1.5" />
            <path d="M21 16l-5-5-8 8" />
          </svg>
        )}
      </button>
      {value.image_url && (
        <button
          type="button"
          onClick={() => onChange({ image: null, image_url: null })}
          className="text-[10px] text-gray-400 hover:text-red-600"
        >
          Remove
        </button>
      )}
      {error && <span className="max-w-24 text-center text-[10px] text-red-600">{error}</span>}
      <input ref={input} type="file" accept="image/*" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
    </div>
  );
}
