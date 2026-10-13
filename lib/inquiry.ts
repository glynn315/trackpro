import { siteConfig } from "@/lib/site";

const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? "";

export type InquiryResult = { ok: true } | { ok: false; message: string } | { ok: "mailto" };

/**
 * Sends a website form through Web3Forms. Without a key configured, falls back
 * to opening the visitor's mail client with the fields pre-filled.
 */
export async function submitInquiry(data: FormData, subject: string): Promise<InquiryResult> {
  if (!WEB3FORMS_KEY) {
    const body = [...data.entries()]
      .filter(([k]) => !k.startsWith("_") && k !== "access_key" && k !== "botcheck")
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");
    window.location.href = `mailto:${siteConfig.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    return { ok: "mailto" };
  }

  data.append("access_key", WEB3FORMS_KEY);
  data.append("subject", subject);
  data.append("from_name", "TrackPro Website");

  try {
    const res = await fetch("https://api.web3forms.com/submit", { method: "POST", body: data });
    const json = await res.json();
    return json.success ? { ok: true } : { ok: false, message: json.message || "Something went wrong. Please try again." };
  } catch {
    return { ok: false, message: "Network error." };
  }
}
