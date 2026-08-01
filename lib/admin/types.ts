// Shapes returned by the Laravel admin API (snake_case, as Eloquent serializes).

export type AdminProduct = {
  id: number;
  slug: string;
  name: string;
  model: string;
  category: string;
  icon: string | null;
  price: number;
  subscription: number;
  tagline: string;
  description: string | null;
  highlights: string[];
  featured: boolean;
  stock: number;
  is_active: boolean;
};

export type AdminOrderItem = {
  id: number;
  product_name: string;
  product_model: string;
  unit_price: number;
  unit_subscription: number;
  qty: number;
  line_total: number;
};

export type AdminPayment = {
  id: number;
  order_id: number;
  provider: string;
  payment_method: string | null;
  amount: number;
  status: string;
  paid_at: string | null;
  created_at: string;
  order?: { id: number; reference: string; customer_name: string };
};

export type AdminOrder = {
  id: number;
  reference: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  notes: string | null;
  hardware_subtotal: number;
  subscription_total: number;
  status: string;
  payment_status: string;
  created_at: string;
  items_count?: number;
  items?: AdminOrderItem[];
  payments?: AdminPayment[];
};

export type PageMeta = { current_page: number; last_page: number; total: number; has_more: boolean };

export type SeriesPoint = { label: string; total: number };

export type SalesReport = {
  totals: { today: number; month: number; year: number; all_time: number };
  daily: SeriesPoint[];
  monthly: SeriesPoint[];
  yearly: SeriesPoint[];
};

export type Expense = {
  id: number;
  title: string;
  category: string;
  amount: number;
  incurred_on: string;
  notes: string | null;
};

export type PeriodFlow = { income: number; expenses: number; net: number };

export type ExpensesResponse = {
  data: Expense[];
  meta: PageMeta;
  cashflow: { today: PeriodFlow; month: PeriodFlow; year: PeriodFlow };
  category_total: number;
};

/* ------------------------------------------------ yearly subscriptions */

export type AdminSubscriptionPlan = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  billing_period: "yearly" | "monthly";
  features: string[] | null;
  is_default: boolean;
  is_active: boolean;
  subscriptions_count?: number;
  active_subscriptions_count?: number;
};

export type AdminSubscriptionStatus = "pending" | "active" | "past_due" | "expired" | "cancelled";

export type AdminSubscription = {
  id: number;
  reference: string;
  customer: { id: number; name: string; email: string; phone: string | null } | null;
  plan_name: string;
  billing_period: "yearly" | "monthly";
  quantity: number;
  unit_price: number;
  price: number;
  status: AdminSubscriptionStatus;
  starts_at: string;
  renews_at: string;
  days_until_renewal: number;
  auto_renew: boolean;
  last_paid_at: string | null;
  unpaid_invoices_count: number;
  order_reference: string | null;
  notes: string | null;
};

export type SubscriptionStats = {
  total: number;
  active: number;
  past_due: number;
  expired: number;
  cancelled: number;
  devices_covered: number;
  arr: number;
  renewals_due_soon: number;
  outstanding: number;
  collected_this_year: number;
};

export type SubscriptionsResponse = {
  data: AdminSubscription[];
  meta: PageMeta;
  stats: SubscriptionStats;
  plans: Pick<AdminSubscriptionPlan, "id" | "slug" | "name" | "price" | "billing_period" | "is_active">[];
};

export type AdminSubscriptionInvoice = {
  id: number;
  reference: string;
  customer: { id: number; name: string; email: string } | null;
  subscription: { id: number; reference: string; plan_name: string } | null;
  description: string;
  amount: number;
  period_start: string;
  period_end: string;
  due_date: string;
  status: "unpaid" | "awaiting" | "paid" | "void";
  provider: string | null;
  payment_method: string | null;
  checkout_url: string | null;
  paid_at: string | null;
  is_overdue: boolean;
};

export type SubscriptionInvoicesResponse = {
  data: AdminSubscriptionInvoice[];
  meta: PageMeta;
  totals: { outstanding: number; overdue: number; collected_this_year: number };
};

export type AdminCustomer = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
};

export type DashboardData = {
  stats: {
    orders_total: number;
    orders_pending: number;
    orders_paid: number;
    revenue_total: number;
    revenue_today: number;
    products_total: number;
    products_out_of_stock: number;
    products_low_stock: number;
  };
  recent_orders: {
    id: number;
    reference: string;
    customer_name: string;
    items_count: number;
    hardware_subtotal: number;
    payment_status: string;
    created_at: string;
  }[];
  low_stock: { id: number; model: string; name: string; stock: number }[];
  subscriptions: {
    active: number;
    past_due: number;
    arr: number;
    renewals_due_soon: number;
    outstanding: number;
  };
};
