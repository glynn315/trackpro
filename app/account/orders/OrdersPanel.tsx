"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { AccountError, formatShortDate, peso } from "@/lib/account";
import { API_BASE } from "@/lib/api-base";
import { Card, EmptyState, ErrorState, PanelSkeleton } from "@/components/account/ui";

type OrderItem = {
  id: number;
  product_name: string;
  product_model: string;
  qty: number;
  unit_price: number;
  line_total: number;
};

type Order = {
  id: number;
  reference: string;
  hardware_subtotal: number;
  subscription_total: number;
  status: string;
  payment_status: string;
  created_at: string;
  items?: OrderItem[];
};

const statusClass: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-800",
  unpaid: "bg-amber-100 text-amber-800",
  awaiting: "bg-blue-100 text-blue-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-purple-100 text-purple-800",
};

/** Orders tab — device purchases, which is what starts a subscription. */
export function OrdersPanel() {
  const { token, signOut } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState("");

  const [reloadKey, setReloadKey] = useState(0);
  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    void (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/customer/orders`, {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (res.status === 401) throw new AccountError("Session expired", 401);
        if (!res.ok) throw new Error(`Could not load your orders (${res.status}).`);
        const { data } = await res.json();
        if (cancelled) return;
        setOrders((data ?? []) as Order[]);
        setError("");
      } catch (err) {
        if (cancelled) return;
        if (err instanceof AccountError && err.status === 401) {
          signOut();
          return;
        }
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, reloadKey, signOut]);

  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!orders) return <PanelSkeleton />;

  return (
    <Card title="My orders">
      {orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          message="Buy a TrackPro device and your yearly tracking subscription starts automatically."
          action={
            <Link
              href="/products"
              className="inline-flex h-10 items-center rounded-full bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              Browse devices
            </Link>
          }
        />
      ) : (
        <ul className="divide-y divide-line">
          {orders.map((order) => (
            <li key={order.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-sm font-semibold text-ink">{order.reference}</p>
                  <p className="text-xs text-muted">{formatShortDate(order.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-ink">{peso(order.hardware_subtotal)}</p>
                  <span
                    className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                      statusClass[order.payment_status] ?? "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {order.payment_status}
                  </span>
                </div>
              </div>

              {order.items && order.items.length > 0 && (
                <ul className="mt-3 space-y-1 border-t border-line pt-3 text-xs text-muted">
                  {order.items.map((item) => (
                    <li key={item.id} className="flex justify-between gap-3">
                      <span>
                        {item.qty} × {item.product_name}{" "}
                        <span className="text-subtle">({item.product_model})</span>
                      </span>
                      <span className="font-semibold text-ink">{peso(item.line_total)}</span>
                    </li>
                  ))}
                </ul>
              )}

              <p className="mt-3 text-xs capitalize text-subtle">Order status: {order.status}</p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
