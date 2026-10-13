import { LegalPage, legalMetadata } from "@/components/legal/LegalPage";
import { warrantyPolicy } from "@/lib/legal";

export const metadata = legalMetadata(warrantyPolicy);

export default function Page() {
  return <LegalPage doc={warrantyPolicy} />;
}
