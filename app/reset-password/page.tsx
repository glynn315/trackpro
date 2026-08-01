import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { ResetPasswordForm } from "./ResetPasswordForm";

export const metadata: Metadata = {
  title: "Set a new password",
  description: "Choose a new password for your TrackPro GPS account.",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; email?: string }>;
}) {
  // The emailed link carries both. Reading them server-side (instead of with
  // useSearchParams) means the form renders in the first response rather than
  // after hydration — they're already in the URL, so nothing extra is exposed.
  const { token, email } = await searchParams;

  return (
    <AuthShell
      eyebrow="Password Help"
      title="Set a new password"
      subtitle="Choose something you haven't used before."
    >
      <ResetPasswordForm token={token ?? ""} email={email ?? ""} />
    </AuthShell>
  );
}
