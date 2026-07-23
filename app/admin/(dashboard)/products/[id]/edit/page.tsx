import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { adminApi } from "@/lib/admin/api";
import type { AdminProduct } from "@/lib/admin/types";
import { updateProduct } from "../../actions";

export const dynamic = "force-dynamic";

const inputCls =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await adminApi(`/api/admin/products/${id}`);
  if (res.status === 401 || res.status === 403) redirect("/admin/login");
  if (res.status === 404) notFound();
  if (!res.ok) throw new Error(`Failed to load product (${res.status})`);
  const { data: product } = (await res.json()) as { data: AdminProduct };

  return (
    <>
      <PageHeader title={`Edit ${product.name}`}>
        <Link href="/admin/products" className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
          ← Back
        </Link>
      </PageHeader>

      <div className="p-5 lg:p-8">
        <form action={updateProduct.bind(null, product.id)} className="max-w-2xl space-y-5 rounded-2xl border border-gray-200 bg-white p-7">
          <div className="border-b border-gray-100 pb-4">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Model {product.model} · {product.category}</p>
            <h2 className="mt-1 text-2xl font-extrabold">{product.name}</h2>
            <p className="mt-1 text-sm text-gray-600">{product.tagline}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">Price (₱)</label>
              <input name="price" type="number" min={0} required defaultValue={product.price} className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">Subscription (₱/mo)</label>
              <input name="subscription" type="number" min={0} required defaultValue={product.subscription} className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">Stock</label>
              <input name="stock" type="number" min={0} required defaultValue={product.stock} className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">Featured</label>
              <select name="featured" defaultValue={product.featured ? "1" : "0"} className={inputCls}>
                <option value="0">No</option>
                <option value="1">Yes — Flagship</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">Visibility</label>
              <select name="is_active" defaultValue={product.is_active ? "1" : "0"} className={inputCls}>
                <option value="1">Active — visible in catalog</option>
                <option value="0">Inactive — hidden</option>
              </select>
            </div>
          </div>

          <button className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-dark">Save Product</button>
        </form>
      </div>
    </>
  );
}
