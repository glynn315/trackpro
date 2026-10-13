import { PageHeader } from "@/components/admin/PageHeader";
import { adminGet } from "@/lib/admin/api";
import type { AdminSubscriptionPlan } from "@/lib/admin/types";
import { SubTabs } from "../SubTabs";
import { ComparisonEditor } from "./ComparisonEditor";

export const dynamic = "force-dynamic";

export default async function PlanComparisonPage() {
  const { data } = await adminGet<{ data: AdminSubscriptionPlan[] }>("/api/admin/subscription-plans");

  return (
    <>
      <PageHeader title="Subscriptions" />
      <div className="p-5 lg:p-8">
        <SubTabs />

        <p className="mt-6 max-w-2xl text-sm text-gray-600">
          The <strong>Compare Plans</strong> table on the homepage. Tick a box to show ✓ for that plan, leave
          it empty to show —, or switch a row to <strong>Text</strong> to show a label instead (e.g.
          &ldquo;Priority&rdquo;). Only active plans appear on the website.
        </p>

        <div className="mt-6">
          <ComparisonEditor plans={data} />
        </div>
      </div>
    </>
  );
}
