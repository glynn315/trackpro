"use client";

import { useState } from "react";
import type { AdminCustomer, AdminSubscription, SubscriptionsResponse } from "@/lib/admin/types";

type PlanOption = SubscriptionsResponse["plans"][number];

const inputCls =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

const STATUSES = ["active", "pending", "past_due", "expired", "cancelled"] as const;

/**
 * Every field of an existing subscription. Picking a different plan prefills
 * its price and billing period; both stay editable for negotiated rates.
 */
export function EditSubscriptionForm({
  sub,
  plans,
  customers,
  busy,
  onSave,
  onCancel,
}: {
  sub: AdminSubscription;
  plans: PlanOption[];
  customers: AdminCustomer[];
  busy: boolean;
  onSave: (formData: FormData) => void;
  onCancel: () => void;
}) {
  const [planId, setPlanId] = useState(sub.subscription_plan_id ? String(sub.subscription_plan_id) : "");
  const [unitPrice, setUnitPrice] = useState(sub.unit_price);
  const [period, setPeriod] = useState(sub.billing_period);
  const [quantity, setQuantity] = useState(sub.quantity);

  // Keep the current customer selectable even if they fall outside the picker's first 50.
  const customerOptions =
    sub.customer && !customers.some((c) => c.id === sub.customer!.id)
      ? [{ id: sub.customer.id, name: sub.customer.name, email: sub.customer.email }, ...customers]
      : customers;
  // Inactive plans only show when this subscription is already on one.
  const planOptions = plans.filter((p) => p.is_active || p.id === sub.subscription_plan_id);

  return (
    <form
      id="subscription-edit"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(new FormData(e.currentTarget));
      }}
      className="scroll-mt-20 rounded-2xl border border-brand/30 bg-white p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-bold">
          Edit {sub.reference}
          {sub.customer?.name ? <span className="font-normal text-gray-500"> · {sub.customer.name}</span> : null}
        </h2>
        <button type="button" onClick={onCancel} className="text-xs font-semibold text-gray-500 hover:text-brand">
          Cancel
        </button>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Label htmlFor="edit_customer_id">Customer</Label>
          <select id="edit_customer_id" name="customer_id" required defaultValue={sub.customer?.id ?? ""} className={inputCls}>
            {customerOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.email}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="edit_status">Status</Label>
          <select id="edit_status" name="status" defaultValue={sub.status} className={`${inputCls} capitalize`}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="edit_plan">Plan</Label>
          <select
            id="edit_plan"
            name="subscription_plan_id"
            value={planId}
            onChange={(e) => {
              setPlanId(e.target.value);
              const plan = plans.find((p) => String(p.id) === e.target.value);
              if (plan) {
                setUnitPrice(plan.price);
                setPeriod(plan.billing_period);
              }
            }}
            className={inputCls}
          >
            <option value="">Custom (no plan)</option>
            {planOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — ₱{p.price.toLocaleString("en-PH")}/{p.billing_period === "yearly" ? "yr" : "mo"}
                {p.is_active ? "" : " (inactive)"}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="edit_plan_name">Label</Label>
          <input
            id="edit_plan_name"
            name="plan_name"
            defaultValue={sub.plan_name}
            placeholder="Defaults to the plan name"
            className={inputCls}
          />
        </div>

        <div>
          <Label htmlFor="edit_period">Billed</Label>
          <select
            id="edit_period"
            name="billing_period"
            value={period}
            onChange={(e) => setPeriod(e.target.value as AdminSubscription["billing_period"])}
            className={inputCls}
          >
            <option value="yearly">Yearly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div>
          <Label htmlFor="edit_quantity">Devices</Label>
          <input
            id="edit_quantity"
            name="quantity"
            type="number"
            min={1}
            max={100}
            required
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
            className={inputCls}
          />
        </div>

        <div>
          <Label htmlFor="edit_unit_price">Price per device / {period === "yearly" ? "year" : "month"} (₱)</Label>
          <input
            id="edit_unit_price"
            name="unit_price"
            type="number"
            min={0}
            required
            value={unitPrice}
            onChange={(e) => setUnitPrice(Math.max(0, Number(e.target.value) || 0))}
            className={inputCls}
          />
          <p className="mt-1 text-[11px] text-gray-500">
            Total ₱{(unitPrice * quantity).toLocaleString("en-PH")} per {period === "yearly" ? "year" : "month"} — applies from the next invoice.
          </p>
        </div>

        <div>
          <Label htmlFor="edit_starts_at">Start date</Label>
          <input id="edit_starts_at" name="starts_at" type="date" defaultValue={sub.starts_at?.slice(0, 10)} className={inputCls} />
        </div>

        <div>
          <Label htmlFor="edit_renews_at">Renewal date</Label>
          <input id="edit_renews_at" name="renews_at" type="date" required defaultValue={sub.renews_at?.slice(0, 10)} className={inputCls} />
        </div>

        <label className="flex items-center gap-2 self-end pb-2 text-sm text-gray-700">
          <input type="checkbox" name="auto_renew" defaultChecked={sub.auto_renew} className="h-4 w-4 rounded border-gray-300" />
          Auto-renew (raise renewal invoices)
        </label>

        <div className="sm:col-span-2 lg:col-span-3">
          <Label htmlFor="edit_notes">Notes</Label>
          <textarea id="edit_notes" name="notes" rows={2} defaultValue={sub.notes ?? ""} className={inputCls} />
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <button disabled={busy} className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50">
          Save Changes
        </button>
        <button type="button" onClick={onCancel} className="text-sm font-semibold text-gray-500 hover:text-gray-900">
          Cancel
        </button>
      </div>
    </form>
  );
}

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
      {children}
    </label>
  );
}
