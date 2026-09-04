import type { MetadataRoute } from "next";
import { profile } from "@/dearlyfebriano/data/profile";

/* ============================================================
 * sitemap.xml — portfolio adalah hash-SPA pada satu route "/",
 * jadi sitemap utamanya adalah halaman root. Google mengabaikan
 * fragment (#) pada URL, sehingga cukup 1 entry canonical.
 * ============================================================ */

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || profile.siteUrl;

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
