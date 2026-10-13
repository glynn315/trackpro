import { FLEET_SIZES } from "@/components/auth/SignupFields";
import { createClient } from "./actions";

const inputCls =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

/**
 * Manual client entry — for walk-ins, phone orders, or clients migrated from
 * paper records. The account is created verified; leave the password blank and
 * tick "send invite" to let the client set their own via a reset link.
 */
export function NewClientForm() {
  return (
    <details className="mb-6 rounded-2xl border border-gray-200 bg-white">
      <summary className="cursor-pointer px-5 py-4 font-bold">Add a client manually</summary>

      <form action={createClient} className="grid gap-4 border-t border-gray-200 p-5 lg:grid-cols-3">
        <div>
          <Label htmlFor="name">Full name</Label>
          <input id="name" name="name" required maxLength={120} className={inputCls} />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <input id="email" name="email" type="email" required maxLength={120} className={inputCls} />
        </div>

        <div>
          <Label htmlFor="phone">Phone (optional)</Label>
          <input id="phone" name="phone" type="tel" maxLength={32} className={inputCls} />
        </div>

        <div>
          <Label htmlFor="company">Company (optional)</Label>
          <input id="company" name="company" maxLength={160} className={inputCls} />
        </div>

        <div>
          <Label htmlFor="fleet_size">Fleet size (optional)</Label>
          <select id="fleet_size" name="fleet_size" className={inputCls} defaultValue="">
            <option value="">—</option>
            {FLEET_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="password">Password (optional)</Label>
          <input id="password" name="password" type="password" minLength={6} autoComplete="new-password" className={inputCls} />
          <p className="mt-1 text-[11px] text-gray-500">Leave blank to set a random one.</p>
        </div>

        <div className="lg:col-span-3">
          <Label htmlFor="vehicle_info">Vehicles (optional)</Label>
          <textarea id="vehicle_info" name="vehicle_info" rows={2} maxLength={2000} className={inputCls} />
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700 lg:col-span-3">
          <input type="checkbox" name="send_invite" defaultChecked className="h-4 w-4 rounded border-gray-300" />
          Email the client a link to set their password and sign in
        </label>

        <div className="lg:col-span-3">
          <button className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">
            Add Client
          </button>
        </div>
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
