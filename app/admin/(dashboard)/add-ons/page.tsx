import { PageHeader } from "@/components/admin/PageHeader";
import { adminGet } from "@/lib/admin/api";
import type { AdminAddOn } from "@/lib/admin/types";
import { AddOnsManager } from "./AddOnsManager";
import { BandwidthManager } from "./BandwidthManager";
import type { BandwidthPackageInput } from "./actions";

export const dynamic = "force-dynamic";

export default async function AddOnsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const [{ data }, { data: bandwidth }] = await Promise.all([
    adminGet<{ data: AdminAddOn[] }>("/api/admin/add-ons"),
    adminGet<{ data: BandwidthPackageInput[] }>("/api/admin/bandwidth-packages"),
  ]);

  return (
    <>
      <PageHeader title="Add-ons" />
      <div className="p-5 lg:p-8">
        {sp.saved && (
          <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {sp.saved}
          </div>
        )}
        {sp.error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {sp.error}
          </div>
        )}

        <p className="mb-6 max-w-2xl text-sm text-gray-600">
          Accessories shown in the homepage <strong>Optional Add-ons</strong> section and offered in a
          product&apos;s add-to-cart options (choose which per product under Products → Edit). Active add-ons
          appear on the site in display order (lowest first); changes can take up to a minute to show.
        </p>

        <AddOnsManager addOns={data} />

        <BandwidthManager initial={bandwidth} />
      </div>
    </>
  );
}
