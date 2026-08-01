import type { Metadata } from "next";
import { SubscriptionPanel } from "./SubscriptionPanel";

export const metadata: Metadata = {
  title: "My Subscription",
  robots: { index: false, follow: false },
};

export default function AccountSubscriptionPage() {
  return <SubscriptionPanel />;
}
