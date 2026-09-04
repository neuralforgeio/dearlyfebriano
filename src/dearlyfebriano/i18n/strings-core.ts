/* ============================================================
 * CORE STRINGS — string UI inti (single-word & API responses)
 * yang tidak tertangkap heuristik kolektor data otomatis.
 * Konten panjang (deskripsi project, bio, dll) dikumpulkan
 * otomatis oleh strings.ts dari file data.
 * ============================================================ */

/** Label navigasi (single word — tidak tertangkap heuristik spasi). */
export const NAV_LABEL_STRINGS: string[] = [
  "Home",
  "About",
  "Projects",
  "Certificates",
  "Experience",
  "Notes",
  "Guestbook",
  "Contact",
];

/** Opsi subject pada contact form (dipakai server + client). */
export const SUBJECT_STRINGS: string[] = [
  "Freelance Project",
  "Job Opportunity",
  "Collaboration",
  "Just saying hi",
];

/** String UI umum yang muncul di banyak komponen. */
export const COMMON_UI_STRINGS: string[] = [
  "Search",
  "Language",
  "opens in new tab",
  "Open menu",
  "Go to home",
  "Primary navigation",
  "Open command palette (Ctrl+K)",
  "View All",
  "Learn More",
  "Live Demo",
  "Source Code",
  "Back",
  "Close",
  "Copy",
  "Copied",
];

/** Pesan error/sukses dari API yang ditampilkan user (toast/dll). */
export const API_RESPONSE_STRINGS: string[] = [
  "Name must be at least 2 characters",
  "Name must be at most 50 characters",
  "Name must be at most 80 characters",
  "Message must be at least 5 characters",
  "Message must be at most 500 characters",
  "Message must be at most 2000 characters",
  "Please enter a valid email address",
  "Please wait a moment before sending another message.",
  "You just sent a message. Please wait a minute before trying again.",
  "Failed to load guestbook entries.",
  "Failed to save your message. Please try again.",
  "Failed to delete the message.",
  "Failed to load messages.",
  "Invalid admin key — deletion not permitted.",
  "Invalid admin key — messages are private.",
  "Too many delete attempts — try again later.",
  "Too many attempts — try again later.",
  "Missing entry id.",
  "Missing message id.",
  "Entry not found.",
  "Message not found.",
  "Something went wrong while sending your message. Please try again.",
];

export const CORE_STRINGS: string[] = Array.from(
  new Set<string>([
    ...NAV_LABEL_STRINGS,
    ...SUBJECT_STRINGS,
    ...COMMON_UI_STRINGS,
    ...API_RESPONSE_STRINGS,
  ])
);
