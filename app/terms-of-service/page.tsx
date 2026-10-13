import { LegalPage, legalMetadata } from "@/components/legal/LegalPage";
import { termsOfService } from "@/lib/legal";

export const metadata = legalMetadata(termsOfService);

export default function Page() {
  return <LegalPage doc={termsOfService} />;
}
