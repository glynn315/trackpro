// Shapes returned by the Laravel admin API (snake_case, as Eloquent serializes).

/** An uploaded photo or short video clip on a product / add-on. */
export type MediaItem = { type: "image" | "video"; path: string; url: string };

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
  media: MediaItem[];
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
  invoice_reference: string | null;
  incurred_on: string;
  notes: string | null;
  expense_category_id: number | null;
  wallet_id: number | null;
  /** The wallet it was paid from (the default wallet for expenses recorded before wallets). */
  wallet_name: string | null;
};

export type PeriodFlow = { income: number; expenses: number; net: number };

export type ExpenseCategory = {
  id: number;
  name: string;
  /** Expenses in it must have a description and an invoice / OR reference. */
  requires_reference: boolean;
  sort_order?: number;
  expenses_count?: number;
  expenses_total?: number;
};

export type WalletType = "cash" | "ewallet" | "bank" | "other";

export type Wallet = {
  id: number;
  name: string;
  type: WalletType;
  is_default: boolean;
  is_active?: boolean;
  opening_balance?: number;
  /** Opening balance + sales (default wallet) − expenses ± transfers. */
  balance?: number;
  month?: { in: number; out: number };
};

export type WalletTransfer = {
  id: number;
  amount: number;
  transferred_on: string;
  notes: string | null;
  from: { id: number; name: string };
  to: { id: number; name: string };
};

export type WalletsResponse = { data: Wallet[]; total: number; transfers: WalletTransfer[] };

export type ExpensesResponse = {
  data: Expense[];
  meta: PageMeta;
  cashflow: { today: PeriodFlow; month: PeriodFlow; year: PeriodFlow };
  category_total: number;
  options: { categories: ExpenseCategory[]; wallets: Wallet[] };
};

/* ------------------------------------------------ yearly subscriptions */

export type AdminSubscriptionPlan = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  fleet_size: string | null;
  price: number;
  billing_period: "yearly" | "monthly";
  features: string[] | null;
  recommended_for: string[] | null;
  comparison: { feature: string; value: boolean | string }[] | null;
  is_popular: boolean;
  sort_order: number;
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
  issued_at: string | null;
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

export type AdminClient = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  fleet_size: string | null;
  email_verified: boolean;
  created_at: string;
  orders_count: number;
  active_subscriptions_count: number;
  unpaid_invoices_count: number;
  total_spent: number;
};

export type AdminClientDetail = Omit<
  AdminClient,
  "orders_count" | "active_subscriptions_count" | "unpaid_invoices_count" | "total_spent"
> & {
  vehicle_info: string | null;
  terms_accepted_at: string | null;
  orders: {
    id: number;
    reference: string;
    hardware_subtotal: number;
    subscription_total: number;
    status: string;
    payment_status: string;
    paid_at: string | null;
    created_at: string;
    items_count: number;
  }[];
  subscriptions: {
    id: number;
    reference: string;
    plan_name: string;
    billing_period: "yearly" | "monthly";
    quantity: number;
    unit_price: number;
    price: number;
    status: string;
    starts_at: string;
    renews_at: string;
    auto_renew: boolean;
    last_paid_at: string | null;
  }[];
  invoices: {
    id: number;
    reference: string;
    description: string;
    amount: number;
    period_start: string;
    period_end: string;
    due_date: string;
    status: string;
    payment_method: string | null;
    paid_at: string | null;
    subscription: { id: number; reference: string } | null;
  }[];
  totals: { hardware_paid: number; billing_paid: number; billing_outstanding: number };
};

export type AdminAddOn = {
  id: number;
  slug: string;
  name: string;
  subtitle: string | null;
  price: number;
  icon: string | null;
  description: string | null;
  features: string[] | null;
  devices: string[] | null;
  media: MediaItem[];
  warranty: string | null;
  sort_order: number;
  is_active: boolean;
};

/* ------------------------------------------------ sales report detail */

type SaleCustomer = {
  id: number | null;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  address: string | null;
};

/** One paid sale: an order payment, or a paid subscription renewal invoice. */
export type SaleTransaction = {
  id: number;
  paid_at: string;
  amount: number;
  method: string | null;
  customer: SaleCustomer;
} & (
  | {
      type: "order";
      order: {
        id: number;
        reference: string;
        status: string;
        hardware_subtotal: number;
        subscription_total: number;
        has_invoice: boolean;
        items: { name: string; model: string; qty: number; unit_price: number; line_total: number }[];
      };
      renewal: null;
    }
  | {
      type: "subscription";
      order: null;
      renewal: {
        id: number;
        reference: string;
        description: string;
        plan_name: string | null;
        subscription_reference: string | null;
        quantity: number | null;
        period_start: string;
        period_end: string;
      };
    }
);

export type TransactionsResponse = {
  data: SaleTransaction[];
  meta: PageMeta;
  totals: { amount: number; count: number };
};

/** One Philippine-time day of sales (default today), newest first. */
export type TodaySalesResponse = {
  date: string;
  data: SaleTransaction[];
  totals: { amount: number; count: number; orders: number; renewals: number };
};

export type SalesInvoice = {
  number: string;
  date: string;
  bill_to: { name: string; company: string | null; email: string | null; phone: string | null; address: string | null };
  items: { description: string; qty: number; unit_price: number }[];
  discount: number;
  notes: string | null;
};

/** One renewal invoice with the billing details its printable copy needs. */
export type AdminSubscriptionInvoiceDetail = AdminSubscriptionInvoice & {
  bill_to: { name: string; company: string | null; email: string | null; phone: string | null } | null;
  quantity: number;
  unit_price: number;
  billing_period: "monthly" | "yearly" | null;
};
