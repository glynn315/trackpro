import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in to your account",
  description: "Sign in to manage your TrackPro GPS subscription, billing, and orders.",
  robots: { index: false, follow: true },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  // Read `next` here rather than with useSearchParams in the form: that would
  // put the form behind a Suspense boundary and serve an empty card until the
  // client bundle hydrates.
  const { next } = await searchParams;

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to manage your subscription, billing, and orders."
    >
      <LoginForm next={next} />
    </AuthShell>
  );
}
