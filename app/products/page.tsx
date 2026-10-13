import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageHero } from "@/components/layout/PageHero";
import { Products } from "@/components/sections/Products";
import { AddOns } from "@/components/sections/AddOns";
import { MessengerButton } from "@/components/ui/MessengerButton";

export const metadata: Metadata = {
  title: "Hardware & Add-ons",
  description: "TrackPro GPS hardware packages and optional add-ons — fuel sensors, cameras, RFID and more.",
  alternates: { canonical: "/products" },
};

export default function ProductsPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <PageHero
          eyebrow="Products"
          title="Hardware & Add-ons"
          description="Choose a GPS hardware package, then extend it with optional add-ons for your vehicles and fleet."
        />
        <Products />
        <AddOns />
      </main>
      <Footer />
      <MessengerButton />
    </>
  );
}
