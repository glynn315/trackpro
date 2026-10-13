import { PageHeader } from "@/components/admin/PageHeader";
import { adminGet } from "@/lib/admin/api";
import type { ExpenseCategory } from "@/lib/admin/types";
import { ExpenseTabs } from "../ExpenseTabs";
import { CategoriesManager } from "./CategoriesManager";

export const dynamic = "force-dynamic";

export default async function ExpenseCategoriesPage() {
  const { data } = await adminGet<{ data: ExpenseCategory[] }>("/api/admin/expense-categories");

  return (
    <>
      <PageHeader title="Expenses & Cashflow" />
      <div className="p-5 lg:p-8">
        <ExpenseTabs />
        <p className="mb-6 max-w-2xl text-sm text-gray-600">
          The categories offered when recording an expense. Renaming a category updates its past expenses;
          deleting one that&apos;s in use moves its expenses to another category.
        </p>
        <CategoriesManager categories={data} />
      </div>
    </>
  );
}
