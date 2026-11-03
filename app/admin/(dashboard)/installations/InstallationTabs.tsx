"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin/installations", label: "Dashboard", exact: true },
  { href: "/admin/installations/schedule", label: "Schedule" },
  { href: "/admin/installations/board", label: "Board" },
  { href: "/admin/installations/personnel", label: "Personnel" },
];

export function InstallationTabs() {
  const pathname = usePathname();

  return (
    <nav aria-label="Installation sections" className="mb-6 border-b border-gray-200">
      <ul className="-mb-px flex gap-1 overflow-x-auto">
        {TABS.map((tab) => {
          const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`inline-block whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                  active
                    ? "border-brand text-brand"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
