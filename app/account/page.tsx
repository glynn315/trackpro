import { AccountOverview } from "./AccountOverview";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>;
}) {
  // Read here rather than with useSearchParams in the panel, which would put it
  // behind a Suspense boundary and render an empty page until hydration.
  const { reset } = await searchParams;

  return <AccountOverview justReset={reset === "1"} />;
}
