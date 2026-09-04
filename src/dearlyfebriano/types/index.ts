import type { LucideIcon } from "lucide-react";

/* ============================================================
 * Global view types for the single-page app (SPA) navigation.
 * The portfolio renders every "page" as a view at route `/`.
 * ============================================================ */
export type View =
  | "home"
  | "about"
  | "projects"
  | "project-detail"
  | "certificates"
  | "experience"
  | "notes"
  | "note-detail"
  | "contact"
  | "guestbook"
  | "not-found";

export type ProjectCategory = "web" | "mobile" | "api" | "opensource";
export type ProjectStatus = "live" | "in-progress" | "archived";

export interface Project {
  slug: string;
  title: string;
  shortDesc: string;
  longDesc: string;
  thumbnail: string;
  /** Extra gallery images shown on the project detail view */
  images: string[];
  techStack: string[];
  category: ProjectCategory;
  status: ProjectStatus;
  liveUrl?: string;
  githubUrl?: string;
  features: string[];
  challenges: { title: string; description: string }[];
  startDate: string;
  endDate?: string;
  /** Human readable duration, e.g. "6 months" */
  duration?: string;
  featured: boolean;
}

export type ArticleCategory = "engineering" | "tutorial" | "opinion" | "career";

/** Rich content blocks for a tech note (no markdown parser needed). */
export type ArticleSection =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; items: string[] }
  | { type: "quote"; text: string; author?: string }
  | { type: "code"; language: string; code: string }
  | { type: "callout"; variant: "tip" | "warning" | "info"; text: string };

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  updatedAt?: string;
  /** Pre-computed reading time in minutes. */
  readingMinutes: number;
  tags: string[];
  category: ArticleCategory;
  featured: boolean;
  /** Ordered article body. */
  sections: ArticleSection[];
}

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  imageUrl: string;
  category: "web" | "backend" | "cloud" | "data" | "ai" | "mobile";
  credentialId?: string;
  verifyUrl?: string;
  description?: string;
  /** Google Drive file id — sertifikat live-sync dari folder Drive. */
  driveFileId?: string;
  /** Asal data: folder Drive (realtime) atau data statis lokal. */
  source?: "drive" | "local";
  /**
   * Jenis file asli di Drive. "pdf" → preview membuka embedded viewer
   * (SEMUA halaman bisa di-scroll), "image" → lightbox gambar biasa.
   */
  fileType?: "image" | "pdf";
}

export interface SkillItem {
  name: string;
  /** 0 – 100 */
  level: number;
}

export interface SkillGroup {
  id: string;
  label: string;
  skills: SkillItem[];
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  companyInitials: string;
  location: string;
  locationType: "Remote" | "Onsite" | "Hybrid";
  period: { start: string; end: string | null; current: boolean };
  summary: string;
  responsibilities: string[];
  tech: string[];
}

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  company: string;
  initials: string;
}

export type SocialIconKey =
  | "github"
  | "linkedin"
  | "instagram"
  | "whatsapp"
  | "email";

export interface SocialLink {
  label: string;
  href: string;
  icon: SocialIconKey;
}

export interface FunFact {
  icon: LucideIcon;
  label: string;
  description: string;
}

export interface Education {
  degree: string;
  school: string;
  period: string;
  description: string;
}

/* ============================================================
 * Shared shapes between the frontend and the API routes.
 * ============================================================ */
export interface GuestbookEntry {
  id: string;
  name: string;
  message: string;
  createdAt: string;
}

/** Pesan contact-form — dipakai mode Manage (baca + hapus). */
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  /** true bila email notifikasi berhasil dikirim via Resend. */
  emailed: boolean;
  createdAt: string;
}

export interface ContactFormValues {
  name: string;
  email: string;
  subject: string;
  message: string;
}
