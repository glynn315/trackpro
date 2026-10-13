import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageHero } from "@/components/layout/PageHero";
import { Plans } from "@/components/sections/Plans";
import { MessengerButton } from "@/components/ui/MessengerButton";

export const metadata: Metadata = {
  title: "Subscription Plans",
  description: "Compare TrackPro GPS subscription plans and the features included in each.",
  alternates: { canonical: "/plans" },
};

export default function PlansPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <PageHero
          eyebrow="Products"
          title="Subscription Plans"
          description="Pick the plan that fits your fleet, then compare every feature side by side."
        />
        <Plans />
      </main>
      <Footer />
      <MessengerButton />
    </>
  );
}
