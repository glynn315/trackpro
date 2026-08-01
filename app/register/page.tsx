import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = {
  title: "Create your account",
  description: "Create a TrackPro GPS account to order devices and manage your yearly subscription.",
  robots: { index: false, follow: true },
};

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Order devices, track your subscription, and pay renewals in one place."
    >
      <RegisterForm />
    </AuthShell>
  );
}
