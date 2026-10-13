import { PageHeader } from "@/components/admin/PageHeader";
import { adminGet } from "@/lib/admin/api";
import type { WalletsResponse } from "@/lib/admin/types";
import { ExpenseTabs } from "../expenses/ExpenseTabs";
import { WalletsManager } from "./WalletsManager";

export const dynamic = "force-dynamic";

export default async function WalletsPage() {
  const data = await adminGet<WalletsResponse>("/api/admin/wallets");
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });

  return (
    <>
      <PageHeader title="Expenses & Cashflow" />
      <div className="p-5 lg:p-8">
        <ExpenseTabs />
        <WalletsManager data={data} today={today} />
      </div>
    </>
  );
}
