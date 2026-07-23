"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard", icon: "📊", exact: true },
  { href: "/admin/orders", label: "Orders", icon: "📦" },
  { href: "/admin/products", label: "Products / Stock", icon: "📡" },
  { href: "/admin/payments", label: "Payments", icon: "💳" },
  { href: "/admin/reports", label: "Sales Reports", icon: "📈" },
  { href: "/admin/expenses", label: "Expenses", icon: "💸" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-1 px-3 py-5 text-sm">
      {links.map((l) => {
        const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
              active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span className="text-base">{l.icon}</span>
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
