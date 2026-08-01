"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";

/**
 * Header entry point to the customer area: "Sign in" for visitors, the
 * customer's first name once they have a token. Renders a stable placeholder
 * until auth has hydrated so the header doesn't flicker between states.
 */
export function AccountLink({ onNavigate }: { onNavigate?: () => void }) {
  const { user, hydrated } = useAuth();

  if (!hydrated) {
    return <span aria-hidden className="h-10 w-24 rounded-full bg-soft/60" />;
  }

  if (!user) {
    return (
      <Link
        href="/login"
        onClick={onNavigate}
        className="inline-flex h-10 items-center gap-2 rounded-full border border-line px-4 text-sm font-semibold text-ink transition-colors hover:border-ink/20 hover:bg-soft"
      >
        <UserIcon />
        Sign in
      </Link>
    );
  }

  return (
    <Link
      href="/account"
      onClick={onNavigate}
      className="inline-flex h-10 max-w-40 items-center gap-2 rounded-full border border-line px-4 text-sm font-semibold text-ink transition-colors hover:border-ink/20 hover:bg-soft"
      title={`${user.name} — my account`}
    >
      <UserIcon />
      <span className="truncate">{user.name.split(" ")[0]}</span>
    </Link>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="8" r="3.5" strokeLinecap="round" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" strokeLinecap="round" />
    </svg>
  );
}
