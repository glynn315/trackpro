import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { MediaField } from "@/components/admin/MediaField";
import { CartOptionsField } from "@/components/admin/CartOptionsField";
import { adminApi, adminGet } from "@/lib/admin/api";
import type { AdminAddOn, AdminBandwidthPackage, AdminProduct } from "@/lib/admin/types";
import { updateProduct } from "../../actions";

export const dynamic = "force-dynamic";

const inputCls =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const res = await adminApi(`/api/admin/products/${id}`);
  if (res.status === 401 || res.status === 403) redirect("/admin/login");
  if (res.status === 404) notFound();
  if (!res.ok) throw new Error(`Failed to load product (${res.status})`);
  const { data: product } = (await res.json()) as { data: AdminProduct };
  const [{ data: addOns }, { data: bandwidthPackages }] = await Promise.all([
    adminGet<{ data: AdminAddOn[] }>("/api/admin/add-ons"),
    adminGet<{ data: AdminBandwidthPackage[] }>("/api/admin/bandwidth-packages"),
  ]);

  return (
    <>
      <PageHeader title={`Edit ${product.name}`}>
        <Link href="/admin/products" className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
          ← Back
        </Link>
      </PageHeader>

      <div className="p-5 lg:p-8">
        {error && (
          <div className="mb-5 max-w-2xl rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            Could not save the product — {error !== "1" ? error : "check the fields and try again."}
          </div>
        )}

        <form action={updateProduct.bind(null, product.id)} className="max-w-2xl space-y-5 rounded-2xl border border-gray-200 bg-white p-7">
          <div className="border-b border-gray-100 pb-4">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">{product.model} · {product.category}</p>
            <h2 className="mt-1 text-2xl font-extrabold">{product.name}</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field className="sm:col-span-2" name="name" label="Name" defaultValue={product.name} required />
            <Field name="model" label="Device type" defaultValue={product.model} required />
            <Field name="category" label="Category" defaultValue={product.category} required />
            <Field
              className="sm:col-span-2"
              name="slug"
              label="Slug (URL — blank regenerates it from the name)"
              defaultValue={product.slug}
              mono
            />
            <Field name="price" label="Price (₱)" type="number" defaultValue={product.price} required />
            <Field name="subscription" label="Subscription (₱/mo)" type="number" defaultValue={product.subscription} required />
            <Field name="stock" label="Stock" type="number" defaultValue={product.stock} required />
            <Field name="icon" label="Icon (optional)" defaultValue={product.icon ?? ""} placeholder="map / shield / signal / geo / chart / power" />
            <Field className="sm:col-span-2" name="tagline" label="Tagline" defaultValue={product.tagline} required />

            <div className="sm:col-span-2">
              <Label>Description (optional)</Label>
              <textarea name="description" rows={3} defaultValue={product.description ?? ""} className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <Label>Highlights (one per line)</Label>
              <textarea name="highlights" rows={4} defaultValue={(product.highlights ?? []).join("\n")} className={inputCls} />
            </div>

            <div className="sm:col-span-2">
              <Label>Photos &amp; video clips</Label>
              <MediaField initial={product.media ?? []} />
            </div>

            <div className="sm:col-span-2">
              <Label>Add to cart options</Label>
              <CartOptionsField
                initial={{
                  hardware_options: product.hardware_options ?? [],
                  // Never configured = every add-on offered.
                  add_on_slugs: product.add_on_slugs ?? addOns.map((a) => a.slug),
                  offers_bandwidth: product.offers_bandwidth ?? true,
                  bandwidth_options: product.bandwidth_options ?? [],
                  requires_plan: product.requires_plan,
                }}
                addOns={addOns}
                defaultBandwidth={bandwidthPackages.filter((p) => p.is_active)}
              />
            </div>

            <div>
              <Label>Featured</Label>
              <select name="featured" defaultValue={product.featured ? "1" : "0"} className={inputCls}>
                <option value="0">No</option>
                <option value="1">Yes — Flagship</option>
              </select>
            </div>
            <div>
              <Label>Visibility</Label>
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

function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">{children}</label>;
}

function Field({
  name,
  label,
  type = "text",
  placeholder,
  defaultValue,
  required,
  mono,
  className = "",
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string | number;
  required?: boolean;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      <input
        name={name}
        type={type}
        min={type === "number" ? 0 : undefined}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required={required}
        className={`${inputCls} ${mono ? "font-mono text-xs" : ""}`}
      />
    </div>
  );
}
