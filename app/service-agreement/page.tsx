import { LegalPage, legalMetadata } from "@/components/legal/LegalPage";
import { serviceAgreement } from "@/lib/legal";

export const metadata = legalMetadata(serviceAgreement);

export default function Page() {
  return <LegalPage doc={serviceAgreement} />;
}
