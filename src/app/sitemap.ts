import type { MetadataRoute } from "next";
import { profile } from "@/dearlyfebriano/data/profile";
import { projects } from "@/dearlyfebriano/data/projects";
import { articles } from "@/dearlyfebriano/data/articles";

/* ============================================================
 * sitemap.xml — portfolio kini memakai REAL path routing
 * (tanpa #): /about, /projects/<slug>, dst langsung indexable.
 * Entry: home + 7 view utama + detail tiap project & artikel.
 * ============================================================ */

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || profile.siteUrl;
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified, changeFrequency: "monthly", priority: 1 },
    ...(
      [
        ["about", 0.8],
        ["projects", 0.9],
        ["certificates", 0.6],
        ["experience", 0.6],
        ["notes", 0.7],
        ["guestbook", 0.4],
        ["contact", 0.8],
      ] as const
    ).map(([path, priority]) => ({
      url: `${siteUrl}/${path}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority,
    })),
  ];

  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${siteUrl}/projects/${project.slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const noteRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${siteUrl}/notes/${article.slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...projectRoutes, ...noteRoutes];
}
