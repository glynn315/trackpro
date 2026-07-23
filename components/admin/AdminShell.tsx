"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/admin/actions";
import { AdminNav } from "@/components/admin/AdminNav";
import { Logo } from "@/components/ui/Logo";

export function AdminShell({
  admin,
  children,
}: {
  admin: { name: string; email: string };
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer on navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-white/10 bg-ink px-4 text-white lg:hidden">
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          className="grid h-9 w-9 place-items-center rounded-md hover:bg-white/10"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
        <Logo variant="light" />
      </header>

      {/* Backdrop (mobile only) */}
      {open && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      {/* Sidebar — fixed on desktop, off-canvas drawer on mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-ink text-white transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between gap-2 border-b border-white/10 px-6">
          <Logo variant="light" />
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="grid h-8 w-8 place-items-center rounded-md text-white/70 hover:bg-white/10 lg:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M6 18L18 6" />
            </svg>
          </button>
        </div>
        <AdminNav />
        <div className="border-t border-white/10 p-4 text-xs">
          <p className="font-semibold text-white">{admin.name}</p>
          <p className="mt-0.5 truncate text-white/60">{admin.email}</p>
          <form action={logoutAction} className="mt-3">
            <button className="text-white/70 underline hover:text-brand">Sign out</button>
          </form>
        </div>
      </aside>

      <main className="lg:ml-64">{children}</main>
    </div>
  );
}
