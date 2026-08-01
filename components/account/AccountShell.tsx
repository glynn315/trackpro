"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";

const TABS = [
  { href: "/account", label: "Overview", exact: true },
  { href: "/account/subscription", label: "Subscription" },
  { href: "/account/billing", label: "Billing" },
  { href: "/account/orders", label: "Orders" },
];

/**
 * Guard + chrome for everything under /account.
 *
 * The customer token lives in localStorage (see lib/auth.tsx), so the gate runs
 * in the browser: while hydrating we show a skeleton, and a visitor without a
 * token is bounced to /login with a `next` back to where they were headed.
 */
export function AccountShell({ children }: { children: React.ReactNode }) {
  const { user, hydrated, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [hydrated, user, pathname, router]);

  return (
    <>
      <Header />
      <main className="flex-1 bg-cloud pb-16 pt-24 sm:pt-28">
        <Container>
          {!hydrated || !user ? (
            <div className="flex min-h-[40vh] items-center justify-center">
              <p className="text-sm text-muted">
                {hydrated ? "Redirecting to sign in…" : "Loading your account…"}
              </p>
            </div>
          ) : (
            <>
              {/* Account header */}
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-brand">
                    My Account
                  </p>
                  <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
                    Hi, {user.name.split(" ")[0]}
                  </h1>
                  <p className="mt-0.5 text-sm text-muted">{user.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    signOut();
                    router.replace("/");
                  }}
                  className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-ink/20 hover:bg-soft"
                >
                  Sign out
                </button>
              </div>

              {!user.emailVerified && <VerifyEmailBanner />}

              {/* Tabs */}
              <nav aria-label="Account sections" className="mt-6 border-b border-line">
                <ul className="-mb-px flex gap-1 overflow-x-auto">
                  {TABS.map((tab) => {
                    const active = tab.exact
                      ? pathname === tab.href
                      : pathname.startsWith(tab.href);
                    return (
                      <li key={tab.href}>
                        <Link
                          href={tab.href}
                          aria-current={active ? "page" : undefined}
                          className={`inline-block whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                            active
                              ? "border-brand text-brand"
                              : "border-transparent text-muted hover:border-line hover:text-ink"
                          }`}
                        >
                          {tab.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <div className="mt-6">{children}</div>
            </>
          )}
        </Container>
      </main>
      <Footer />
    </>
  );
}

function VerifyEmailBanner() {
  const { resendVerification, refresh } = useAuth();

  return (
    <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-amber-500 text-xs font-bold text-white">
        !
      </span>
      <p className="flex-1">
        Please verify your email address — it&apos;s required before placing an order.
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => void resendVerification()}
          className="font-semibold underline hover:text-amber-950"
        >
          Resend link
        </button>
        <button
          type="button"
          onClick={() => void refresh()}
          className="font-semibold underline hover:text-amber-950"
        >
          I&apos;ve verified
        </button>
      </div>
    </div>
  );
}
