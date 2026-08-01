import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot your password?",
  description: "Reset the password for your TrackPro GPS account.",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Password Help"
      title="Forgot your password?"
      subtitle="We'll email you a secure link to set a new one."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
