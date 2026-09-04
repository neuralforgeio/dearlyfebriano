import type { MetadataRoute } from "next";
import { profile } from "@/dearlyfebriano/data/profile";

/* ============================================================
 * robots.txt dinamis — perbolehkan semua crawler, arahkan ke
 * sitemap. (Menggantikan public/robots.txt statis.)
 * ============================================================ */

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || profile.siteUrl;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
