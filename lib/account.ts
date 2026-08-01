/**
 * Customer account data layer — subscriptions, billing, and the dashboard.
 *
 * These all run in the browser with the Sanctum Bearer token from `useAuth()`
 * (see lib/auth.tsx); the Laravel API scopes every response to that token's
 * customer, so there is nothing to filter client-side.
 */

import { API_BASE } from "@/lib/api-base";

/* ------------------------------------------------------------------ types */

export type InvoiceStatus = "unpaid" | "awaiting" | "paid" | "void";

export type Invoice = {
  reference: string;
  subscription_reference: string | null;
  description: string;
  amount: number;
  period_start: string;
  period_end: string;
  due_date: string;
  status: InvoiceStatus;
  checkout_url: string | null;
  payment_method: string | null;
  paid_at: string | null;
  is_overdue: boolean;
};

export type SubscriptionStatus = "pending" | "active" | "past_due" | "expired" | "cancelled";

export type Subscription = {
  reference: string;
  plan_name: string;
  billing_period: "yearly" | "monthly";
  quantity: number;
  unit_price: number;
  price: number;
  status: SubscriptionStatus;
  starts_at: string;
  renews_at: string;
  days_until_renewal: number;
  auto_renew: boolean;
  last_paid_at: string | null;
  notes: string | null;
  open_invoice: Invoice | null;
  invoices?: Invoice[];
};

export type AccountOrder = {
  id: number;
  reference: string;
  hardware_subtotal: number;
  status: string;
  payment_status: string;
  created_at: string;
};

export type DashboardData = {
  customer: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    email_verified: boolean;
    member_since: string | null;
  };
  stats: {
    active_subscriptions: number;
    devices_covered: number;
    next_renewal_date: string | null;
    days_until_renewal: number | null;
    amount_due: number;
    unpaid_invoices: number;
    orders_total: number;
  };
  subscription: Subscription | null;
  subscriptions: Subscription[];
  open_invoices: Invoice[];
  recent_orders: AccountOrder[];
};

export type Plan = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  billing_period: "yearly" | "monthly";
  features: string[] | null;
  is_default: boolean;
};

/* --------------------------------------------------------------- requests */

async function request<T>(path: string, token: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.message) message = body.message as string;
      else if (body?.errors) message = String(Object.values(body.errors).flat()[0] ?? message);
    } catch {
      /* non-JSON error body */
    }
    // 401 means the stored token is stale — the account pages sign the user out.
    throw new AccountError(message, res.status);
  }

  return res.json() as Promise<T>;
}

export class AccountError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = "AccountError";
  }
}

export const getDashboard = (token: string) =>
  request<DashboardData>("/api/customer/dashboard", token);

export const getSubscriptions = (token: string) =>
  request<{ data: Subscription[] }>("/api/customer/subscriptions", token).then((r) => r.data);

export const getInvoices = (token: string) =>
  request<{ data: Invoice[]; totals: { outstanding: number; paid_all_time: number } }>(
    "/api/customer/invoices",
    token
  );

export const getOrders = (token: string) =>
  request<{ data: unknown[] }>("/api/customer/orders", token).then((r) => r.data);

/** Raises (or reuses) the invoice for the next period and returns how to pay it. */
export const renewSubscription = (token: string, reference: string) =>
  request<{ invoice: Invoice; checkout_url: string | null }>(
    `/api/customer/subscriptions/${encodeURIComponent(reference)}/renew`,
    token,
    { method: "POST" }
  );

export const payInvoice = (token: string, reference: string) =>
  request<{ invoice: Invoice; checkout_url?: string | null; message?: string }>(
    `/api/customer/invoices/${encodeURIComponent(reference)}/pay`,
    token,
    { method: "POST" }
  );

export const cancelSubscription = (token: string, reference: string) =>
  request<{ data: Subscription }>(
    `/api/customer/subscriptions/${encodeURIComponent(reference)}/cancel`,
    token,
    { method: "POST" }
  );

export const subscribeToPlan = (token: string, planSlug: string, quantity = 1) =>
  request<{ data: Subscription; invoice: Invoice | null; checkout_url: string | null }>(
    "/api/customer/subscriptions",
    token,
    { method: "POST", body: JSON.stringify({ plan_slug: planSlug, quantity }) }
  );

/** Public — no token needed. */
export async function getPlans(): Promise<Plan[]> {
  const res = await fetch(`${API_BASE}/api/subscription-plans`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const { data } = await res.json();
  return (data ?? []) as Plan[];
}

/* --------------------------------------------------------------- display */

export const peso = (n: number) => "₱" + Math.round(n).toLocaleString("en-PH");

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" });
}

export function formatShortDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}

/** "in 3 months" / "12 days ago" — how the renewal date is described. */
export function relativeDays(days: number): string {
  if (days === 0) return "today";
  const abs = Math.abs(days);
  const unit =
    abs >= 365
      ? `${Math.round(abs / 365)} year${Math.round(abs / 365) === 1 ? "" : "s"}`
      : abs >= 60
        ? `${Math.round(abs / 30)} months`
        : `${abs} day${abs === 1 ? "" : "s"}`;
  return days > 0 ? `in ${unit}` : `${unit} ago`;
}

export const SUBSCRIPTION_STATUS_LABEL: Record<SubscriptionStatus, string> = {
  pending: "Awaiting payment",
  active: "Active",
  past_due: "Past due",
  expired: "Expired",
  cancelled: "Cancelled",
};

export const SUBSCRIPTION_STATUS_CLASS: Record<SubscriptionStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  active: "bg-emerald-100 text-emerald-800",
  past_due: "bg-red-100 text-red-800",
  expired: "bg-gray-200 text-gray-700",
  cancelled: "bg-gray-200 text-gray-600",
};

export const INVOICE_STATUS_LABEL: Record<InvoiceStatus, string> = {
  unpaid: "Unpaid",
  awaiting: "Awaiting payment",
  paid: "Paid",
  void: "Cancelled",
};

export const INVOICE_STATUS_CLASS: Record<InvoiceStatus, string> = {
  unpaid: "bg-amber-100 text-amber-800",
  awaiting: "bg-blue-100 text-blue-800",
  paid: "bg-emerald-100 text-emerald-800",
  void: "bg-gray-200 text-gray-600",
};
