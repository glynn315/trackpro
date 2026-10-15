import { FLEET_SIZES } from "@/components/auth/SignupFields";
import type { AdminClientDetail } from "@/lib/admin/types";
import { updateClient } from "../actions";

const inputCls =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

/** Collapsible editor for a client's profile. A blank password keeps the current one. */
export function EditClientForm({ client }: { client: AdminClientDetail }) {
  const fleetSizes: string[] = [...FLEET_SIZES];
  // Keep a legacy fleet size selectable even if it's no longer in the list.
  if (client.fleet_size && !fleetSizes.includes(client.fleet_size)) fleetSizes.push(client.fleet_size);

  return (
    <details className="rounded-2xl border border-gray-200 bg-white">
      <summary className="cursor-pointer px-5 py-4 font-bold">Edit client</summary>

      <form action={updateClient.bind(null, client.id)} className="space-y-4 border-t border-gray-200 p-5">
        <div>
          <Label htmlFor="name">Full name</Label>
          <input id="name" name="name" required maxLength={120} defaultValue={client.name} className={inputCls} />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <input id="email" name="email" type="email" required maxLength={120} defaultValue={client.email} className={inputCls} />
        </div>

        <div>
          <Label htmlFor="phone">Phone</Label>
          <input id="phone" name="phone" type="tel" maxLength={32} defaultValue={client.phone ?? ""} className={inputCls} />
        </div>

        <div>
          <Label htmlFor="company">Company</Label>
          <input id="company" name="company" maxLength={160} defaultValue={client.company ?? ""} className={inputCls} />
        </div>

        <div>
          <Label htmlFor="fleet_size">Fleet size</Label>
          <select id="fleet_size" name="fleet_size" className={inputCls} defaultValue={client.fleet_size ?? ""}>
            <option value="">—</option>
            {fleetSizes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="vehicle_info">Vehicles</Label>
          <textarea id="vehicle_info" name="vehicle_info" rows={3} maxLength={2000} defaultValue={client.vehicle_info ?? ""} className={inputCls} />
        </div>

        <div>
          <Label htmlFor="password">New password (optional)</Label>
          <input id="password" name="password" type="password" minLength={6} autoComplete="new-password" className={inputCls} />
          <p className="mt-1 text-[11px] text-gray-500">Leave blank to keep the current password.</p>
        </div>

        <button className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">
          Save Changes
        </button>
      </form>
    </details>
  );
}

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
      {children}
    </label>
  );
}
