import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pagination } from "@/components/admin/Pagination";
import { adminGet } from "@/lib/admin/api";
import type { AdminProduct, PageMeta } from "@/lib/admin/types";
import { ProductsList } from "./ProductsList";
import { HardwareDefaultsManager } from "./HardwareDefaultsManager";
import type { HardwareDefault } from "./actions";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; page?: string }>;
}) {
  const { saved, page } = await searchParams;
  const [{ data, meta }, { data: hardwareDefaults }] = await Promise.all([
    adminGet<{ data: AdminProduct[]; meta: PageMeta }>(`/api/admin/products${page ? `?page=${page}` : ""}`),
    adminGet<{ data: HardwareDefault[] }>("/api/admin/hardware-defaults"),
  ]);

  return (
    <>
      <PageHeader title="Products / Inventory">
        <Link href="/admin/products/new" className="rounded-full bg-brand px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark">
          + Add Product
        </Link>
      </PageHeader>

      <div className="p-5 lg:p-8">
        {saved && (
          <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Product {saved === "created" ? "added to inventory" : "updated"}.
          </div>
        )}

        <ProductsList key={meta.current_page} items={data} />
        <Pagination meta={meta} />

        <HardwareDefaultsManager initial={hardwareDefaults} />
      </div>
    </>
  );
}
