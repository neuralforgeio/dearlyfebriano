import { getProjectBySlug } from "@/dearlyfebriano/data/projects";
import { getArticleBySlug } from "@/dearlyfebriano/data/articles";
import { profile } from "@/dearlyfebriano/data/profile";
import { SITE_TITLE } from "@/dearlyfebriano/lib/constants";
import type { View } from "@/dearlyfebriano/types";

/* ============================================================
 * VIEW TITLES — dynamic document.title per SPA view.
 * Dipakai oleh PortfolioApp agar setiap view punya judul tab
 * yang bermakna (UX + shareability).
 * ============================================================ */

const BASE_TITLES: Record<Exclude<View, "project-detail" | "note-detail">, string> = {
  home: "",
  about: "About",
  projects: "Projects",
  certificates: "Certificates",
  experience: "Experience",
  notes: "Tech Notes",
  contact: "Contact",
  guestbook: "Guestbook",
  "not-found": "Page not found",
};

/** Ringkas judul artikel/project supaya tab title tetap ramping. */
function truncate(value: string, max = 40): string {
  return value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value;
}

export function getViewTitle(
  view: View,
  projectSlug: string | null,
  noteSlug: string | null
): string {
  if (view === "project-detail" && projectSlug) {
    const project = getProjectBySlug(projectSlug);
    if (project) return `${truncate(project.title)} — Projects | ${profile.fullName}`;
    return `Projects | ${profile.fullName}`;
  }
  if (view === "note-detail" && noteSlug) {
    const article = getArticleBySlug(noteSlug);
    if (article) return `${truncate(article.title)} — Notes | ${profile.fullName}`;
    return `Tech Notes | ${profile.fullName}`;
  }
  const base = BASE_TITLES[view as Exclude<View, "project-detail" | "note-detail">] ?? "";
  return base ? `${base} | ${SITE_TITLE}` : SITE_TITLE;
}

/** Deskripsi meta per view (untuk teg <meta name="description"> dinamis). */
const VIEW_DESCRIPTIONS: Record<Exclude<View, "project-detail" | "note-detail">, string> = {
  home: `Full stack developer portfolio of ${profile.fullName} — projects, tech notes, and contact.`,
  about: `The story, education, and fun facts behind ${profile.fullName}.`,
  projects: `Selected full stack projects by ${profile.fullName} — web apps, APIs, and tools.`,
  certificates: `Certificates and credentials earned by ${profile.fullName}.`,
  experience: `Work experience and professional journey of ${profile.fullName}.`,
  notes: `Tech notes and articles on full stack engineering by ${profile.fullName}.`,
  contact: `Get in touch with ${profile.fullName} for freelance, jobs, or collaboration.`,
  guestbook: `Leave a message on ${profile.fullName}'s guestbook.`,
  "not-found": `This page could not be found on ${profile.fullName}'s portfolio.`,
};

export function getViewDescription(
  view: View,
  projectSlug: string | null,
  noteSlug: string | null
): string {
  if (view === "note-detail" && noteSlug) {
    const article = getArticleBySlug(noteSlug);
    if (article) return article.excerpt;
  }
  if (view === "project-detail" && projectSlug) {
    const project = getProjectBySlug(projectSlug);
    if (project) return project.shortDesc;
  }
  return VIEW_DESCRIPTIONS[view as Exclude<View, "project-detail" | "note-detail">] ?? VIEW_DESCRIPTIONS.home;
}
