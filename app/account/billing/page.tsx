import type { Metadata } from "next";
import { BillingPanel } from "./BillingPanel";

export const metadata: Metadata = {
  title: "Billing",
  robots: { index: false, follow: false },
};

export default function AccountBillingPage() {
  return <BillingPanel />;
}
