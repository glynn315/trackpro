"use client";

import { useCart } from "@/lib/cart";

export function CartIcon({ className = "" }: { className?: string }) {
  const { itemCount, openDrawer } = useCart();

  return (
    <button
      type="button"
      onClick={openDrawer}
      aria-label={`Open cart (${itemCount} item${itemCount === 1 ? "" : "s"})`}
      className={`relative grid h-10 w-10 place-items-center rounded-full text-brand transition-colors hover:bg-soft ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden
      >
        <path d="M6 7h12l-1.5 11a2 2 0 0 1-2 1.75H9.5a2 2 0 0 1-2-1.75L6 7z" />
        <path d="M9 7V5a3 3 0 0 1 6 0v2" />
      </svg>
      {itemCount > 0 && (
        <span
          aria-hidden
          className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold leading-none text-white shadow-[0_4px_10px_-2px_rgba(237,28,36,0.55)]"
        >
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </button>
  );
}
