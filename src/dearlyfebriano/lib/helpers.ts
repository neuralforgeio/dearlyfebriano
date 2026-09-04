import { profile } from "@/dearlyfebriano/data/profile";

/* ============================================================
 * Helper functions for the portfolio.
 * ============================================================ */

/** `cn` (class merge) tersedia dari `@/lib/utils` — gunakan itu. */

/** Format date string (ISO or "YYYY-MM") menjadi "Jan 2024" style. */
export function formatTimeline(date: string, withDay = false): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    ...(withDay ? { day: "numeric" } : {}),
    year: "numeric",
  });
}

/** Format full date, e.g. "12 November 2023". */
export function formatDateLong(date: string): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Relative time like "2h ago" / "3d ago". */
export function timeAgo(dateInput: string): string {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "";
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

/** Build a WhatsApp deep link with an optional prefilled message. */
export function buildWhatsAppUrl(message?: string): string {
  const number = process.env.NEXT_PUBLIC_WA_NUMBER || profile.whatsappNumber;
  const text =
    message ||
    process.env.NEXT_PUBLIC_WA_MESSAGE ||
    `Hi ${profile.name}! I found your portfolio and would love to connect.`;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

/** Initials fallback for avatars. */
export function initialsOf(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

/** Gradient avatar palettes — deterministic by name hash so each
 * guestbook visitor keeps a stable, distinct identity color.
 * (Palet brand-safe: indigo/violet/emerald/rose/amber.) */
const AVATAR_GRADIENTS = [
  "from-indigo-500/80 to-violet-500/80",
  "from-violet-500/80 to-fuchsia-500/80",
  "from-emerald-500/80 to-teal-500/80",
  "from-rose-500/80 to-orange-500/80",
  "from-amber-500/80 to-yellow-500/80",
  "from-sky-500/80 to-indigo-500/80",
] as const;

/** Stable gradient class (bg-gradient-to-br + from/to) for a name. */
export function avatarGradientFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % AVATAR_GRADIENTS.length;
  return `bg-gradient-to-br ${AVATAR_GRADIENTS[index]}`;
}

/** Build a vCard 3.0 payload from profile data. */
export function buildVCard(): string {
  const [first = "", ...rest] = profile.fullName.split(" ");
  const last = rest.join(" ");
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${profile.fullName}`,
    `N:${last};${first};;;`,
    `TITLE:${profile.roles[0]}`,
    `EMAIL;TYPE=INTERNET,PREF:${profile.email}`,
    `TEL;TYPE=CELL,VOICE:${profile.phone.replace(/[^+\d]/g, "")}`,
    `ADR;TYPE=WORK:;;;;${profile.location};;;;`,
    `URL:${profile.siteUrl}`,
    `NOTE:${profile.tagline}`,
    `X-SOCIAL-GITHUB:https://github.com/neuralforgeio`,
    "END:VCARD",
  ].join("\r\n");
}

/** Trigger a client-side vCard (.vcf) download. */
export function downloadVCard(): void {
  const blob = new Blob([buildVCard()], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${profile.fullName.toLowerCase().replace(/\s+/g, "-")}.vcf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
