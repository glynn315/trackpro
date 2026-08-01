import { PageHeader } from "@/components/admin/PageHeader";
import { adminGet } from "@/lib/admin/api";
import type { AdminSubscriptionPlan } from "@/lib/admin/types";
import { SubTabs } from "../SubTabs";
import { PlansManager } from "./PlansManager";

export const dynamic = "force-dynamic";

export default async function SubscriptionPlansPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const { data } = await adminGet<{ data: AdminSubscriptionPlan[] }>("/api/admin/subscription-plans");

  return (
    <>
      <PageHeader title="Subscriptions" />
      <div className="p-5 lg:p-8">
        <SubTabs />

        {sp.saved && (
          <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {sp.saved}
          </div>
        )}
        {sp.error && (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {sp.error}
          </div>
        )}

        <p className="mt-6 max-w-2xl text-sm text-gray-600">
          Yearly plans customers can choose from their account, and the price used when a
          subscription is provisioned from an order that carries no tracking fee. The{" "}
          <strong>default</strong> plan is the one used for that fallback.
        </p>

        <div className="mt-6">
          <PlansManager plans={data} />
        </div>
      </div>
    </>
  );
}
