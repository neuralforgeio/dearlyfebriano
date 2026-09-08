import {
  profile,
  stats,
  funFacts,
  education,
} from "@/dearlyfebriano/data/profile";

import { projects } from "@/dearlyfebriano/data/projects";

import { skillGroups } from "@/dearlyfebriano/data/skills";

import { experiences } from "@/dearlyfebriano/data/experience";

import { testimonials } from "@/dearlyfebriano/data/testimonials";

import {
  certificates,
  certificateCategories,
} from "@/dearlyfebriano/data/certificates";

import { articles } from "@/dearlyfebriano/data/articles";

import { projectWhyBuilt } from "@/dearlyfebriano/data/project-why-built";

import { CORE_STRINGS } from "./strings-core";

import { SECTION_STRINGS } from "./strings-sections";

import { VIEW_STRINGS } from "./strings-views";

import { LAYOUT_STRINGS } from "./strings-layout";

import { COMMON_COMPONENT_STRINGS } from "./strings-common";

import { PROJECT_STRINGS } from "./strings-projects";

/* ============================================================
 * TRANSLATABLE STRINGS
 *
 * Sumber:
 *
 * 1. CORE_STRINGS
 * 2. SECTION_STRINGS
 * 3. VIEW_STRINGS
 * 4. LAYOUT_STRINGS
 * 5. COMMON_COMPONENT_STRINGS
 * 6. PROJECT_STRINGS
 * 7. Dynamic data
 *
 * Dynamic data:
 * - profile
 * - projects
 * - projectWhyBuilt
 * - certificates
 * - articles
 * - dll.
 * ============================================================ */

export const DICT_VERSION = 7;

/* ============================================================
 * Heuristic collector
 * ============================================================ */

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

/* ============================================================
 * Recursive collector
 * ============================================================ */

function collect(value: unknown, out: Set<string>): void {
  if (typeof value === "string") {
    if (looksTranslatable(value)) {
      out.add(value);
    }

    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collect(item, out);
    }

    return;
  }

  if (value && typeof value === "object") {
    for (const item of Object.values(value)) {
      collect(item, out);
    }
  }
}

/* ============================================================
 * Article data
 *
 * Code blocks are deliberately excluded.
 * ============================================================ */

const articleData = articles.map(({ sections, ...meta }) => ({
  ...meta,

  sections: sections.flatMap((section) =>
    section.type === "code" ? [] : [section],
  ),
}));

/* ============================================================
 * Dynamic data collection
 * ============================================================ */

const dataStrings = new Set<string>();

for (const source of [
  profile,
  stats,
  funFacts,
  education,
  projects,
  projectWhyBuilt,
  skillGroups,
  experiences,
  testimonials,
  certificates,
  certificateCategories,
  articleData,
]) {
  collect(source, dataStrings);
}

/* ============================================================
 * Final dictionary
 * ============================================================ */

export const TRANSLATABLE_STRINGS: string[] = Array.from(
  new Set<string>([
    ...CORE_STRINGS,
    ...SECTION_STRINGS,
    ...VIEW_STRINGS,
    ...LAYOUT_STRINGS,
    ...COMMON_COMPONENT_STRINGS,
    ...PROJECT_STRINGS,
    ...dataStrings,
  ]),
);
