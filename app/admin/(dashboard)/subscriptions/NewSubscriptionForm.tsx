"use client";

import { useState } from "react";
import type { AdminCustomer, SubscriptionsResponse } from "@/lib/admin/types";
import { createSubscription } from "./actions";

type PlanOption = SubscriptionsResponse["plans"][number];

const inputCls =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

/**
 * Manual subscription entry — for devices sold offline or subscribers migrated
 * from paper records. Picking a plan prefills its yearly price, which stays
 * editable so a negotiated rate can be entered.
 */
export function NewSubscriptionForm({
  plans,
  customers,
}: {
  plans: PlanOption[];
  customers: AdminCustomer[];
}) {
  const activePlans = plans.filter((p) => p.is_active);
  const [unitPrice, setUnitPrice] = useState<number>(activePlans[0]?.price ?? 0);
  const [planId, setPlanId] = useState<string>(activePlans[0] ? String(activePlans[0].id) : "");
  const today = new Date().toISOString().slice(0, 10);

  return (
    <details className="rounded-2xl border border-gray-200 bg-white">
      <summary className="cursor-pointer px-5 py-4 font-bold">Add a subscription manually</summary>

      <form action={createSubscription} className="grid gap-4 border-t border-gray-200 p-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Label htmlFor="customer_id">Customer</Label>
          <select id="customer_id" name="customer_id" required className={inputCls} defaultValue="">
            <option value="" disabled>
              Select a customer…
            </option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.email}
              </option>
            ))}
          </select>
          {customers.length === 0 && (
            <p className="mt-1 text-xs text-amber-700">
              No customer accounts yet. The customer must register on the storefront first.
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="subscription_plan_id">Plan</Label>
          <select
            id="subscription_plan_id"
            name="subscription_plan_id"
            className={inputCls}
            value={planId}
            onChange={(e) => {
              setPlanId(e.target.value);
              const plan = activePlans.find((p) => String(p.id) === e.target.value);
              if (plan) setUnitPrice(plan.price);
            }}
          >
            <option value="">Custom (no plan)</option>
            {activePlans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — ₱{p.price.toLocaleString("en-PH")}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="plan_name">Label (optional)</Label>
          <input
            id="plan_name"
            name="plan_name"
            placeholder="Defaults to the plan name"
            className={inputCls}
          />
        </div>

        <div>
          <Label htmlFor="quantity">Devices</Label>
          <input
            id="quantity"
            name="quantity"
            type="number"
            min={1}
            max={100}
            defaultValue={1}
            required
            className={inputCls}
          />
        </div>

        <div>
          <Label htmlFor="unit_price">Price per device / year (₱)</Label>
          <input
            id="unit_price"
            name="unit_price"
            type="number"
            min={0}
            required
            value={unitPrice}
            onChange={(e) => setUnitPrice(Math.max(0, Number(e.target.value) || 0))}
            className={inputCls}
          />
        </div>

        <div>
          <Label htmlFor="starts_at">Start date</Label>
          <input
            id="starts_at"
            name="starts_at"
            type="date"
            defaultValue={today}
            required
            className={inputCls}
          />
        </div>

        <div>
          <Label htmlFor="renews_at">Renewal date (optional)</Label>
          <input id="renews_at" name="renews_at" type="date" className={inputCls} />
          <p className="mt-1 text-[11px] text-gray-500">Defaults to one year after the start date.</p>
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <select id="status" name="status" className={inputCls} defaultValue="active">
            <option value="active">Active</option>
            <option value="pending">Pending (awaiting payment)</option>
          </select>
        </div>

        <div className="lg:col-span-3">
          <Label htmlFor="notes">Notes (optional)</Label>
          <textarea id="notes" name="notes" rows={2} className={inputCls} />
        </div>

        <input type="hidden" name="billing_period" value="yearly" />

        <div className="lg:col-span-3">
          <button className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">
            Create Subscription
          </button>
        </div>
      </form>
    </details>
  );
}

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500"
    >
      {children}
    </label>
  );
}
