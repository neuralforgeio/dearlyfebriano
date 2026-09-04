import type { View } from "@/dearlyfebriano/types";

/* ============================================================
 * GLOBAL CONSTANTS — navigation items, dropdown options, dll.
 * ============================================================ */

export const NAV_ITEMS: { view: View; label: string }[] = [
  { view: "home", label: "Home" },
  { view: "about", label: "About" },
  { view: "projects", label: "Projects" },
  { view: "certificates", label: "Certificates" },
  { view: "experience", label: "Experience" },
  { view: "notes", label: "Notes" },
  { view: "guestbook", label: "Guestbook" },
  { view: "contact", label: "Contact" },
];

export const CONTACT_SUBJECTS = [
  "Freelance Project",
  "Job Opportunity",
  "Collaboration",
  "Just saying hi",
] as const;

export const GUESTBOOK_RATE_LIMIT_SECONDS = 60;
export const CONTACT_RATE_LIMIT_SECONDS = 60;

export const PRELOADER_SESSION_KEY = "dearlyfebriano:preloader-done";

/** Judul default tab (dipakai layout metadata + dynamic view titles). */
export const SITE_TITLE = "Dearly Febriano Irwansyah — Full Stack Developer";
