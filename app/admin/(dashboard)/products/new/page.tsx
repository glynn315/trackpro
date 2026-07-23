import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { createProduct } from "../actions";

export default function NewProductPage() {
  return (
    <>
      <PageHeader title="Add Product">
        <Link
          href="/admin/products"
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          ← Back
        </Link>
      </PageHeader>

      <div className="p-5 lg:p-8">
        <form
          action={createProduct}
          className="max-w-2xl space-y-5 rounded-2xl border border-gray-200 bg-white p-7"
        >
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-2xl font-extrabold">New product</h2>
            <p className="mt-1 text-sm text-gray-600">
              Add an item to inventory. It appears in the storefront when set to <span className="font-semibold">Active</span>.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field className="sm:col-span-2" name="name" label="Name" placeholder="TrackPro 4G Multi-functional GPS" required />
            <Field name="model" label="Model" placeholder="S5L" required />
            <Field name="category" label="Category" placeholder="Vehicle / Asset / Dashcam / OBD" required />
            <Field className="sm:col-span-2" name="slug" label="Slug (optional — auto-generated)" placeholder="trackpro-4g-multi-functional" mono />
            <Field name="price" label="Price (₱)" type="number" defaultValue="0" required />
            <Field name="subscription" label="Subscription (₱/mo)" type="number" defaultValue="0" required />
            <Field name="stock" label="Stock" type="number" defaultValue="0" required />
            <Field name="icon" label="Icon (optional)" placeholder="map / shield / signal / geo / chart / power" />
            <Field className="sm:col-span-2" name="tagline" label="Tagline" placeholder="Powerful 4G real-time vehicle tracker…" required />

            <div className="sm:col-span-2">
              <Label>Description (optional)</Label>
              <textarea name="description" rows={3} className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <Label>Highlights (one per line)</Label>
              <textarea
                name="highlights"
                rows={4}
                placeholder={"Real-Time GPS Tracking\nRemote Engine Cut-Off\nAnti-Theft Alarm System"}
                className={inputCls}
              />
            </div>

            <div>
              <Label>Featured</Label>
              <select name="featured" className={inputCls} defaultValue="0">
                <option value="0">No</option>
                <option value="1">Yes — Flagship</option>
              </select>
            </div>
            <div>
              <Label>Visibility</Label>
              <select name="is_active" className={inputCls} defaultValue="1">
                <option value="1">Active — visible in catalog</option>
                <option value="0">Inactive — hidden</option>
              </select>
            </div>
          </div>

          <button className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
            Add to Inventory
          </button>
        </form>
      </div>
    </>
  );
}

const inputCls =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

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
  defaultValue?: string;
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
