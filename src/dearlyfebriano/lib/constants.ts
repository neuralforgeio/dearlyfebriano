import {
  Award,
  Briefcase,
  FolderGit2,
  Home,
  Mail,
  MessagesSquare,
  NotebookPen,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import type { View } from "@/dearlyfebriano/types";

/* ============================================================
 * GLOBAL CONSTANTS — navigation items, dropdown options, dll.
 * ============================================================ */

/** Item navigasi — `icon` dipakai MobileMenu (drawer mobile). */
export interface NavItem {
  view: View;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { view: "home", label: "Home", icon: Home },
  { view: "about", label: "About", icon: UserRound },
  { view: "projects", label: "Projects", icon: FolderGit2 },
  { view: "certificates", label: "Certificates", icon: Award },
  { view: "experience", label: "Experience", icon: Briefcase },
  { view: "notes", label: "Notes", icon: NotebookPen },
  { view: "guestbook", label: "Guestbook", icon: MessagesSquare },
  { view: "contact", label: "Contact", icon: Mail },
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
