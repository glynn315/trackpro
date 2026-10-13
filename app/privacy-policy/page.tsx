import { LegalPage, legalMetadata } from "@/components/legal/LegalPage";
import { privacyPolicy } from "@/lib/legal";

export const metadata = legalMetadata(privacyPolicy);

export default function Page() {
  return <LegalPage doc={privacyPolicy} />;
}
