import { PageHeader } from "@/components/admin/PageHeader";
import { Pagination } from "@/components/admin/Pagination";
import { peso } from "@/lib/admin/format";
import { adminGet } from "@/lib/admin/api";
import type { ExpensesResponse, PeriodFlow } from "@/lib/admin/types";
import { createExpense } from "./actions";
import { ExpensesList } from "./ExpensesList";

export const dynamic = "force-dynamic";

const CATEGORIES = ["Inventory", "Salaries", "Rent", "Utilities", "Marketing", "Logistics", "Other"];

const inputCls =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string; page?: string }>;
}) {
  const { saved, error, page } = await searchParams;
  const { data, meta, cashflow } = await adminGet<ExpensesResponse>(
    `/api/admin/expenses${page ? `?page=${page}` : ""}`
  );
  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <PageHeader title="Expenses & Cashflow" />
      <div className="p-5 lg:p-8">
        {saved && (
          <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Expense recorded.
          </div>
        )}
        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            Could not save the expense — check the fields and try again.
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <FlowCard label="Today" flow={cashflow.today} />
          <FlowCard label="This Month" flow={cashflow.month} />
          <FlowCard label="This Year" flow={cashflow.year} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <section className="rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="font-bold">Record an expense</h2>
            <form action={createExpense} className="mt-4 space-y-3">
              <div>
                <Label>Title</Label>
                <input name="title" required placeholder="e.g. June office rent" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Category</Label>
                  <select name="category" className={inputCls} defaultValue="Inventory">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Amount (₱)</Label>
                  <input name="amount" type="number" min={0} required defaultValue={0} className={inputCls} />
                </div>
              </div>
              <div>
                <Label>Date</Label>
                <input name="incurred_on" type="date" required defaultValue={today} className={inputCls} />
              </div>
              <div>
                <Label>Notes (optional)</Label>
                <textarea name="notes" rows={2} className={inputCls} />
              </div>
              <button className="w-full rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
                Add Expense
              </button>
            </form>
          </section>

          <div>
            <ExpensesList key={meta.current_page} items={data} />
            <Pagination meta={meta} />
          </div>
        </div>
      </div>
    </>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">{children}</label>;
}

function FlowCard({ label, flow }: { label: string; flow: PeriodFlow }) {
  const positive = flow.net >= 0;
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
      <p className={`mt-2 text-2xl font-extrabold tracking-tight ${positive ? "text-emerald-700" : "text-red-600"}`}>
        {positive ? "" : "−"}{peso(Math.abs(flow.net))}
      </p>
      <p className="mt-0.5 text-[11px] text-gray-400">Net cashflow</p>
      <div className="mt-3 space-y-1 border-t border-gray-100 pt-3 text-xs">
        <div className="flex justify-between"><span className="text-gray-500">Income</span><span className="font-semibold text-emerald-700">{peso(flow.income)}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Expenses</span><span className="font-semibold text-red-600">{peso(flow.expenses)}</span></div>
      </div>
    </div>
  );
}
