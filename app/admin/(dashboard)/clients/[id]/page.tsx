import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { peso } from "@/lib/admin/format";
import { adminApi } from "@/lib/admin/api";
import type { AdminClientDetail } from "@/lib/admin/types";

export const dynamic = "force-dynamic";

const badge: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-700",
  active: "bg-emerald-100 text-emerald-700",
  completed: "bg-emerald-100 text-emerald-700",
  unpaid: "bg-amber-100 text-amber-700",
  awaiting: "bg-amber-100 text-amber-700",
  pending: "bg-amber-100 text-amber-700",
  past_due: "bg-red-100 text-red-700",
  failed: "bg-red-100 text-red-700",
  cancelled: "bg-gray-200 text-gray-600",
  void: "bg-gray-200 text-gray-600",
  expired: "bg-gray-200 text-gray-600",
};

function Badge({ s }: { s: string }) {
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badge[s] ?? "bg-gray-100 text-gray-700"}`}>{s.replace("_", " ")}</span>;
}

function fmtDate(d: string | null) {
  return d ? new Date(d).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }) : "—";
}

export default async function ClientShowPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await adminApi(`/api/admin/clients/${id}`);
  if (res.status === 401 || res.status === 403) redirect("/admin/login");
  if (res.status === 404) notFound();
  if (!res.ok) throw new Error(`Failed to load client (${res.status})`);
  const { data: client } = (await res.json()) as { data: AdminClientDetail };

  return (
    <>
      <PageHeader title={client.name}>
        <Link href="/admin/clients" className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">← Back</Link>
      </PageHeader>

      <div className="p-5 lg:p-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Client information */}
          <aside className="space-y-6">
            <Card title="Client Information">
              <dl className="space-y-3 px-5 py-4 text-sm">
                <Row label="Name" value={client.name} />
                <Row label="Company" value={client.company} />
                <Row label="Email" value={
                  <span>
                    <a href={`mailto:${client.email}`} className="text-brand hover:underline">{client.email}</a>{" "}
                    {client.email_verified ? (
                      <span className="text-xs text-emerald-700">✓ verified</span>
                    ) : (
                      <span className="text-xs text-amber-700">unverified</span>
                    )}
                  </span>
                } />
                <Row label="Contact" value={client.phone && <a href={`tel:${client.phone}`} className="hover:underline">{client.phone}</a>} />
                <Row label="Fleet size" value={client.fleet_size} />
                <Row label="Vehicles" value={client.vehicle_info && <span className="whitespace-pre-line">{client.vehicle_info}</span>} />
                <Row label="Joined" value={fmtDate(client.created_at)} />
                <Row label="Agreed to terms" value={fmtDate(client.terms_accepted_at)} />
              </dl>
            </Card>

            <Card title="Totals">
              <dl className="space-y-2 px-5 py-4 text-sm">
                <div className="flex justify-between"><dt className="text-gray-500">Hardware paid</dt><dd className="font-semibold">{peso(client.totals.hardware_paid)}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Subscription paid</dt><dd className="font-semibold">{peso(client.totals.billing_paid)}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Outstanding</dt><dd className={`font-semibold ${client.totals.billing_outstanding > 0 ? "text-amber-700" : ""}`}>{peso(client.totals.billing_outstanding)}</dd></div>
              </dl>
            </Card>
          </aside>

          <section className="space-y-6 lg:col-span-2">
            {/* Orders */}
            <Card title={`Orders (${client.orders.length})`}>
              <Empty show={client.orders.length === 0}>No orders yet.</Empty>
              <ul className="divide-y divide-gray-100">
                {client.orders.map((o) => (
                  <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm">
                    <div>
                      <Link href={`/admin/orders/${o.id}`} className="font-mono text-xs font-semibold text-brand hover:underline">{o.reference}</Link>
                      <p className="text-xs text-gray-500">{o.items_count} item{o.items_count === 1 ? "" : "s"} · {fmtDate(o.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge s={o.status} />
                      <Badge s={o.payment_status} />
                      <span className="w-24 text-right font-bold">{peso(o.hardware_subtotal)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Subscription plan */}
            <Card title="Subscription Plan">
              <Empty show={client.subscriptions.length === 0}>No subscriptions.</Empty>
              <ul className="divide-y divide-gray-100">
                {client.subscriptions.map((s) => (
                  <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm">
                    <div>
                      <p className="font-semibold">{s.plan_name}</p>
                      <p className="text-xs text-gray-500">
                        <span className="font-mono">{s.reference}</span> · {s.quantity} device{s.quantity === 1 ? "" : "s"} · {peso(s.unit_price)}/{s.billing_period === "monthly" ? "mo" : "yr"} each
                      </p>
                      <p className="text-xs text-gray-500">Started {fmtDate(s.starts_at)} · Renews {fmtDate(s.renews_at)}{s.auto_renew ? "" : " (auto-renew off)"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge s={s.status} />
                      <span className="w-24 text-right font-bold">{peso(s.price)}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <footer className="border-t border-gray-200 px-5 py-3 text-right">
                <Link href="/admin/subscriptions" className="text-xs font-semibold text-brand hover:underline">Manage subscriptions →</Link>
              </footer>
            </Card>

            {/* Billing */}
            <Card title="Billing">
              <Empty show={client.invoices.length === 0}>No invoices.</Empty>
              <ul className="divide-y divide-gray-100">
                {client.invoices.map((inv) => (
                  <li key={inv.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm">
                    <div>
                      <p className="font-semibold">{inv.description}</p>
                      <p className="text-xs text-gray-500">
                        <span className="font-mono">{inv.reference}</span> · {fmtDate(inv.period_start)} – {fmtDate(inv.period_end)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {inv.status === "paid" ? `Paid ${fmtDate(inv.paid_at)}${inv.payment_method ? ` via ${inv.payment_method}` : ""}` : `Due ${fmtDate(inv.due_date)}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge s={inv.status} />
                      <span className="w-24 text-right font-bold">{peso(inv.amount)}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <footer className="border-t border-gray-200 px-5 py-3 text-right">
                <Link href="/admin/subscriptions/billing" className="text-xs font-semibold text-brand hover:underline">Open billing →</Link>
              </footer>
            </Card>
          </section>
        </div>
      </div>
    </>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <header className="border-b border-gray-200 px-5 py-4"><h2 className="font-bold">{title}</h2></header>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</dt>
      <dd className="mt-0.5 break-words text-gray-900">{value || "—"}</dd>
    </div>
  );
}

function Empty({ show, children }: { show: boolean; children: React.ReactNode }) {
  return show ? <p className="px-5 py-8 text-center text-sm text-gray-500">{children}</p> : null;
}
