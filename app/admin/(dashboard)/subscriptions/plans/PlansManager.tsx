"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { peso } from "@/lib/admin/format";
import type { AdminSubscriptionPlan } from "@/lib/admin/types";
import { deletePlan, savePlan } from "../actions";

const inputCls =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

export function PlansManager({ plans }: { plans: AdminSubscriptionPlan[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState<AdminSubscriptionPlan | null>(null);

  function remove(plan: AdminSubscriptionPlan) {
    const inUse = (plan.subscriptions_count ?? 0) > 0;
    const question = inUse
      ? `"${plan.name}" is used by ${plan.subscriptions_count} subscription(s), so it will be deactivated instead of deleted. Continue?`
      : `Delete "${plan.name}"?`;
    if (!window.confirm(question)) return;

    setNotice("");
    startTransition(async () => {
      const result = await deletePlan(plan.id);
      setNotice(result.message ?? (result.ok ? "Plan removed." : "Could not remove the plan."));
      if (result.ok) router.refresh();
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <div className="space-y-3">
        {notice && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
            {notice}
          </div>
        )}

        {plans.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white px-5 py-12 text-center">
            <p className="font-semibold text-gray-900">No plans yet</p>
            <p className="mt-1 text-sm text-gray-500">Create your first yearly plan on the right.</p>
          </div>
        )}

        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-2xl border bg-white p-5 ${
              plan.is_active ? "border-gray-200" : "border-dashed border-gray-300 opacity-70"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-gray-900">{plan.name}</h3>
                  {plan.is_default && (
                    <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand">
                      Default
                    </span>
                  )}
                  {!plan.is_active && (
                    <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-600">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="mt-1 font-mono text-[11px] text-gray-400">{plan.slug}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-extrabold text-gray-900">{peso(plan.price)}</p>
                <p className="text-xs text-gray-500">
                  per {plan.billing_period === "yearly" ? "year" : "month"} / device
                </p>
              </div>
            </div>

            {plan.description && <p className="mt-3 text-sm text-gray-600">{plan.description}</p>}

            {plan.features && plan.features.length > 0 && (
              <ul className="mt-3 grid gap-1 text-xs text-gray-600 sm:grid-cols-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-brand">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3 text-xs">
              <p className="text-gray-500">
                <span className="font-semibold text-gray-900">{plan.active_subscriptions_count ?? 0}</span>{" "}
                active · {plan.subscriptions_count ?? 0} total
              </p>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setEditing(plan)}
                  className="font-semibold text-brand hover:underline"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => remove(plan)}
                  disabled={pending}
                  className="font-semibold text-gray-400 hover:text-red-600 disabled:opacity-50"
                >
                  {plan.is_active ? "Delete" : "Remove"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create / edit form — `key` remounts it so defaults follow the selection. */}
      <PlanForm key={editing?.id ?? "new"} plan={editing} onCancel={() => setEditing(null)} />
    </div>
  );
}

function PlanForm({
  plan,
  onCancel,
}: {
  plan: AdminSubscriptionPlan | null;
  onCancel: () => void;
}) {
  return (
    <section className="h-fit rounded-2xl border border-gray-200 bg-white p-5 lg:sticky lg:top-20">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-bold">{plan ? `Edit ${plan.name}` : "New yearly plan"}</h2>
        {plan && (
          <button type="button" onClick={onCancel} className="text-xs font-semibold text-gray-500 hover:text-brand">
            Cancel
          </button>
        )}
      </div>

      <form action={savePlan} className="mt-4 space-y-3">
        {plan && <input type="hidden" name="id" value={plan.id} />}

        <div>
          <Label htmlFor="name">Plan name</Label>
          <input
            id="name"
            name="name"
            required
            defaultValue={plan?.name ?? ""}
            placeholder="e.g. Basic Tracking (Yearly)"
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="price">Price (₱)</Label>
            <input
              id="price"
              name="price"
              type="number"
              min={0}
              required
              defaultValue={plan?.price ?? 1200}
              className={inputCls}
            />
          </div>
          <div>
            <Label htmlFor="billing_period">Billed</Label>
            <select
              id="billing_period"
              name="billing_period"
              defaultValue={plan?.billing_period ?? "yearly"}
              className={inputCls}
            >
              <option value="yearly">Yearly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            name="description"
            rows={2}
            defaultValue={plan?.description ?? ""}
            className={inputCls}
          />
        </div>

        <div>
          <Label htmlFor="features">Features (one per line)</Label>
          <textarea
            id="features"
            name="features"
            rows={5}
            defaultValue={(plan?.features ?? []).join("\n")}
            placeholder={"Real-time location tracking\n30-day travel history"}
            className={inputCls}
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={plan ? plan.is_active : true}
            className="h-4 w-4 rounded border-gray-300"
          />
          Active (customers can choose it)
        </label>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            name="is_default"
            defaultChecked={plan?.is_default ?? false}
            className="h-4 w-4 rounded border-gray-300"
          />
          Default plan for order-provisioned subscriptions
        </label>

        <button className="w-full rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">
          {plan ? "Save Changes" : "Create Plan"}
        </button>
      </form>
    </section>
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
