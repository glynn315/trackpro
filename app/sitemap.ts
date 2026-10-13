import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";
import { solutions } from "@/lib/solutions";
import { legalDocs } from "@/lib/legal";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const page = (path: string, priority: number, changeFrequency: "weekly" | "monthly" | "yearly") => ({
    url: `${siteConfig.url}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  });

  return [
    page("", 1, "weekly"),
    ...solutions.map((s) => page(`/solutions/${s.slug}`, 0.8, "monthly")),
    page("/products", 0.9, "weekly"),
    page("/plans", 0.9, "weekly"),
    page("/contact", 0.7, "yearly"),
    page("/faqs", 0.6, "monthly"),
    ...legalDocs.map((d) => page(`/${d.slug}`, 0.3, "yearly")),
  ];
}
