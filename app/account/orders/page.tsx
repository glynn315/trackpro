import type { Metadata } from "next";
import { OrdersPanel } from "./OrdersPanel";

export const metadata: Metadata = {
  title: "My Orders",
  robots: { index: false, follow: false },
};

export default function AccountOrdersPage() {
  return <OrdersPanel />;
}
