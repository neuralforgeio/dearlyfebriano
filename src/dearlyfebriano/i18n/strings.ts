import { profile, stats, funFacts, education } from "@/dearlyfebriano/data/profile";
import { projects } from "@/dearlyfebriano/data/projects";
import { skillGroups } from "@/dearlyfebriano/data/skills";
import { experiences } from "@/dearlyfebriano/data/experience";
import { testimonials } from "@/dearlyfebriano/data/testimonials";
import { certificates, certificateCategories } from "@/dearlyfebriano/data/certificates";
import { articles } from "@/dearlyfebriano/data/articles";
import { CORE_STRINGS } from "./strings-core";
import { SECTION_STRINGS } from "./strings-sections";
import { VIEW_STRINGS } from "./strings-views";
import { LAYOUT_STRINGS } from "./strings-layout";
import { COMMON_COMPONENT_STRINGS } from "./strings-common";

/* ============================================================
 * TRANSLATABLE STRINGS — kamus lengkap untuk auto-translate.
 * ------------------------------------------------------------
 * Terjemahan ID TIDAK ditulis manual. String bahasa Inggris
 * dikirim ke /api/translate (library google-translate-api-x)
 * lalu hasilnya di-cache di client (localStorage) + server
 * (memory). String yang gagal diterjemahkan otomatis fallback
 * ke bahasa Inggris.
 *
 * Sumber string:
 *  1. CORE_STRINGS      — label UI inti + pesan API.
 *  2. File data         — dikumpulkan otomatis (heuristik di
 *     bawah) sehingga data baru otomatis ikut diterjemahkan.
 *  3. Group komponen    — ditambahkan lewat strings-sections /
 *     strings-views / strings-common (diedit terpisah).
 * ============================================================ */

/** Naikkan versi bila ada perubahan besar pada kumpulan string
 *  agar cache lama di client di-refresh. (v6: isi artikel non-kode
 *  ikut diterjemahkan.) */
export const DICT_VERSION = 6;

/** Heuristik: string yang terlihat seperti bahasa natural
 *  (bukan nama teknologi, tanggal, angka, atau URL). */
function looksTranslatable(value: string): boolean {
  return (
    value.length >= 8 &&
    /[a-zA-Z]/.test(value) &&
    /\s/.test(value) &&
    !value.startsWith("/") &&
    !value.startsWith("http") &&
    !value.includes("@") &&
    !/^[\d\s—–\-+/().,#]+$/.test(value)
  );
}

/** Walk rekursif atas struktur data → kumpulkan string yang layak. */
function collect(value: unknown, out: Set<string>): void {
  if (typeof value === "string") {
    if (looksTranslatable(value)) out.add(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collect(item, out);
    return;
  }
  if (value && typeof value === "object") {
    for (const item of Object.values(value)) collect(item, out);
  }
}

/* Artikel: meta + section non-kode (paragraph/heading/list/quote/
 * callout) — isi artikel ikut diterjemahkan. Section "code"
 * sengaja TIDAK ikut supaya potongan kode & label bahasanya
 * tetap utuh (tidak pernah melewati /api/translate). */
const articleData = articles.map(({ sections, ...meta }) => ({
  ...meta,
  sections: sections.flatMap((section) =>
    section.type === "code" ? [] : [section]
  ),
}));

const dataStrings = new Set<string>();
for (const source of [
  profile,
  stats,
  funFacts,
  education,
  projects,
  skillGroups,
  experiences,
  testimonials,
  certificates,
  certificateCategories,
  articleData,
]) {
  collect(source, dataStrings);
}

/** Seluruh string yang akan diterjemahkan EN → ID (dedup). */
export const TRANSLATABLE_STRINGS: string[] = Array.from(
  new Set<string>([
    ...CORE_STRINGS,
    ...SECTION_STRINGS,
    ...VIEW_STRINGS,
    ...LAYOUT_STRINGS,
    ...COMMON_COMPONENT_STRINGS,
    ...dataStrings,
  ])
);
