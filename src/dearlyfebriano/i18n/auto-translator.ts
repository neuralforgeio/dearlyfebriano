import { TRANSLATABLE_STRINGS } from "./strings";

/* ============================================================
 * AUTO TRANSLATOR RUNTIME
 *
 * Source text boleh:
 * - English
 * - Indonesian
 * - Mixed
 *
 * Target:
 * - en -> semua English
 * - id -> semua Indonesian
 *
 * IMPORTANT:
 * Translator bekerja di browser pada DOM yang sudah dirender.
 * `t()` tetap dipakai untuk data dinamis yang sudah mempunyai
 * dictionary sendiri.
 * ============================================================ */

export type TranslationTarget = "en" | "id";

export interface AutoTranslationRuntimeOptions {
  target: TranslationTarget;

  translateBatch: (
    strings: string[],
    target: TranslationTarget,
  ) => Promise<Record<string, string>>;

  lookupTranslation?: (
    text: string,
    target: TranslationTarget,
  ) => string | undefined;
}

/* ============================================================
 * Internal caches
 * ============================================================ */

/**
 * source -> translated target
 */
const translationCache = new Map<string, string>();

/**
 * Pair-aware language cache.
 *
 * Example:
 *
 * {
 *   "Setiap project dimulai...": {
 *     en: "Every project starts..."
 *     id: "Setiap project dimulai..."
 *   },
 *
 *   "Every project starts...": {
 *     en: "Every project starts..."
 *     id: "Setiap project dimulai..."
 *   }
 * }
 *
 * This allows:
 *
 * ID -> EN -> ID -> EN
 *
 * even when React creates completely new Text nodes.
 */
interface TranslationPair {
  en?: string;
  id?: string;
}

const pairCache = new Map<string, TranslationPair>();

/**
 * Text node -> canonical source text.
 *
 * The source is the first text we saw for this node.
 */
const sourceCache = new WeakMap<Text, string>();

/**
 * Nodes touched by the runtime.
 *
 * Used only for housekeeping.
 */
const trackedNodes = new Set<Text>();

/* ============================================================
 * Request serialization
 *
 * Only one browser -> /api/translate request at a time.
 * This prevents accidental request storms.
 * ============================================================ */

let activeRequest: Promise<Record<string, string>> | null = null;

/* ============================================================
 * Tags that must never be translated.
 * ============================================================ */

const IGNORED_TAGS = new Set([
  "CODE",
  "PRE",
  "KBD",
  "SAMP",
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "TEXTAREA",
  "INPUT",
  "SELECT",
  "OPTION",
  "SVG",
  "PATH",
  "VIDEO",
  "AUDIO",
]);

/* ============================================================
 * Helpers
 * ============================================================ */

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function isIgnoredNode(node: Text): boolean {
  let parent = node.parentElement;

  while (parent) {
    if (IGNORED_TAGS.has(parent.tagName)) {
      return true;
    }

    if (parent.hasAttribute("data-no-auto-translate")) {
      return true;
    }

    parent = parent.parentElement;
  }

  return false;
}

function looksTechnical(value: string): boolean {
  const text = normalizeText(value);

  if (!text) {
    return true;
  }

  /* URL */

  if (/^https?:\/\//i.test(text) || /^www\./i.test(text)) {
    return true;
  }

  /* Email */

  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
    return true;
  }

  /* Pure number / percentage */

  if (/^[\d\s.,:+\-/%()]+$/.test(text)) {
    return true;
  }

  /* File/path */

  if (/^(?:\.?\.\/|\/|[A-Za-z]:\\)/.test(text)) {
    return true;
  }

  /* Code operators */

  if (
    text.includes("=>") ||
    text.includes("===") ||
    text.includes("!==") ||
    text.includes("&&") ||
    text.includes("||")
  ) {
    return true;
  }

  /* package names */

  if (/^(?:@[\w-]+\/[\w.-]+|[\w.-]+\/[\w.-]+)$/.test(text)) {
    return true;
  }

  /*
   * PascalCase / camelCase technical identifiers.
   *
   * Examples:
   * FlowCanvas
   * TechStackGraph
   * projectMetrics
   */

  if (
    !/\s/.test(text) &&
    /^[A-Za-z][A-Za-z0-9]*$/.test(text) &&
    /[A-Z]/.test(text.slice(1))
  ) {
    return true;
  }

  /*
   * Protect common technologies / brands.
   */

  if (
    /^(?:Next|Node|React|Vue|Angular|Svelte|TypeScript|JavaScript|Tailwind|Prisma|SQLite|PostgreSQL|MongoDB|Redis|Vercel|GitHub|Google Drive|WhatsApp|OpenAI|Resend)(?:\s|\.|$)/i.test(
      text,
    )
  ) {
    return true;
  }

  return false;
}

/* ============================================================
 * Source node management
 * ============================================================ */

function getNodeSource(node: Text): string {
  const existing = sourceCache.get(node);

  if (existing !== undefined) {
    trackedNodes.add(node);

    return existing;
  }

  const source = node.nodeValue ?? "";

  sourceCache.set(node, source);

  trackedNodes.add(node);

  return source;
}

/* ============================================================
 * Translation pair management
 *
 * Suppose:
 *
 * source = "Punya ide?"
 * target = "en"
 * result = "Have an idea?"
 *
 * We store:
 *
 * "Punya ide?" -> {
 *    id: "Punya ide?",
 *    en: "Have an idea?"
 * }
 *
 * "Have an idea?" -> {
 *    en: "Have an idea?",
 *    id: "Punya ide?"
 * }
 * ============================================================ */

function rememberPair(
  source: string,
  target: TranslationTarget,
  translated: string,
): void {
  const sourceKey = normalizeText(source);

  const translatedKey = normalizeText(translated);

  if (!sourceKey || !translatedKey) {
    return;
  }

  const sourcePair = pairCache.get(sourceKey) ?? {};

  sourcePair[target] = translated;

  /*
   * The source itself should be considered the value for the
   * opposite language only when source and target differ.
   *
   * We cannot know the actual source language with certainty,
   * but this representation is useful for round-tripping.
   */

  if (target === "en") {
    sourcePair.id = source;
  } else {
    sourcePair.en = source;
  }

  pairCache.set(sourceKey, sourcePair);

  const translatedPair = pairCache.get(translatedKey) ?? {};

  translatedPair[target] = translated;

  if (target === "en") {
    translatedPair.id = source;
  } else {
    translatedPair.en = source;
  }

  pairCache.set(translatedKey, translatedPair);
}

/* ============================================================
 * Eligibility
 * ============================================================ */

function canTranslate(node: Text): boolean {
  if (isIgnoredNode(node)) {
    return false;
  }

  const parent = node.parentElement;

  if (!parent) {
    return false;
  }

  if (parent.closest("[data-no-auto-translate]")) {
    return false;
  }

  const text = normalizeText(node.nodeValue ?? "");

  if (!text) {
    return false;
  }

  return !looksTechnical(text);
}

/* ============================================================
 * DOM collection
 * ============================================================ */

export function collectTranslatableNodes(root: Node = document.body): Text[] {
  const result: Text[] = [];

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);

  let current: Node | null = walker.nextNode();

  while (current) {
    const node = current as Text;

    if (node.nodeType === Node.TEXT_NODE && canTranslate(node)) {
      getNodeSource(node);

      result.push(node);
    }

    current = walker.nextNode();
  }

  return result;
}

/* ============================================================
 * Get cached translation
 * ============================================================ */

function getCachedTranslation(
  text: string,
  target: TranslationTarget,
): string | undefined {
  const normalized = normalizeText(text);

  /*
   * 1. Pair cache
   */

  const pair = pairCache.get(normalized);

  if (pair?.[target] !== undefined) {
    return pair[target];
  }

  /*
   * 2. Simple memory cache
   */

  const direct = translationCache.get(`${target}:${normalized}`);

  if (direct !== undefined) {
    return direct;
  }

  return undefined;
}

/* ============================================================
 * Save direct cache
 * ============================================================ */

function saveCachedTranslation(
  source: string,
  target: TranslationTarget,
  translated: string,
): void {
  const sourceKey = normalizeText(source);

  const translatedKey = normalizeText(translated);

  translationCache.set(`${target}:${sourceKey}`, translated);

  /*
   * Also save the translated phrase as an input for the same
   * target. This makes repeated scanning harmless.
   */

  translationCache.set(`${target}:${translatedKey}`, translated);

  rememberPair(source, target, translated);
}

/* ============================================================
 * Batch API with serialization
 * ============================================================ */

async function requestTranslations(
  strings: string[],
  target: TranslationTarget,
  translateBatch: (
    strings: string[],
    target: TranslationTarget,
  ) => Promise<Record<string, string>>,
): Promise<Record<string, string>> {
  const unique = Array.from(
    new Set(strings.map(normalizeText).filter(Boolean)),
  );

  if (unique.length === 0) {
    return {};
  }

  if (activeRequest) {
    const existing = await activeRequest;

    const remaining = unique.filter((text) => existing[text] === undefined);

    if (remaining.length === 0) {
      return existing;
    }
  }

  activeRequest = translateBatch(unique, target);

  try {
    const result = await activeRequest;

    return result;
  } finally {
    activeRequest = null;
  }
}

/* ============================================================
 * Translate document
 * ============================================================ */

export async function translateDocument(
  options: AutoTranslationRuntimeOptions,
): Promise<void> {
  if (typeof document === "undefined") {
    return;
  }

  const nodes = collectTranslatableNodes();

  if (nodes.length === 0) {
    return;
  }

  const resolved: Record<string, string> = {};

  const missing: string[] = [];

  /*
   * ----------------------------------------------------------
   * Resolve each node
   * ----------------------------------------------------------
   */

  for (const node of nodes) {
    const source = getNodeSource(node);

    const normalized = normalizeText(source);

    if (!normalized) {
      continue;
    }

    /*
     * Pair cache first.
     */

    const pairValue = getCachedTranslation(normalized, options.target);

    if (pairValue !== undefined) {
      resolved[normalized] = pairValue;

      continue;
    }

    /*
     * Existing `t()` dictionary.
     */

    const dictionaryValue = options.lookupTranslation?.(
      normalized,
      options.target,
    );

    if (
      dictionaryValue !== undefined &&
      normalizeText(dictionaryValue) !== normalized
    ) {
      resolved[normalized] = dictionaryValue;

      saveCachedTranslation(normalized, options.target, dictionaryValue);

      continue;
    }

    /*
     * No cache -> API.
     */

    if (!missing.includes(normalized)) {
      missing.push(normalized);
    }
  }

  /*
   * ----------------------------------------------------------
   * Translate missing strings in ONE HTTP request.
   * ----------------------------------------------------------
   */

  if (missing.length > 0) {
    const translated = await requestTranslations(
      missing,
      options.target,
      options.translateBatch,
    );

    for (const source of Object.keys(translated)) {
      const value = translated[source];

      if (!value) {
        continue;
      }

      resolved[normalizeText(source)] = value;

      saveCachedTranslation(source, options.target, value);
    }
  }

  /*
   * ----------------------------------------------------------
   * Apply translations.
   * ----------------------------------------------------------
   */

  for (const node of nodes) {
    if (!node.isConnected) {
      continue;
    }

    const source = getNodeSource(node);

    const normalized = normalizeText(source);

    const translated = resolved[normalized];

    if (!translated) {
      continue;
    }

    const current = normalizeText(node.nodeValue ?? "");

    /*
     * IMPORTANT:
     *
     * If React changed the node after we started fetching,
     * do not overwrite its new value.
     *
     * The node will be processed again by MutationObserver.
     */

    if (current !== normalized) {
      continue;
    }

    if (normalizeText(translated) === current) {
      continue;
    }

    node.nodeValue = translated;
  }

  cleanupTouchedNodes();
}

/* ============================================================
 * Cleanup disconnected nodes
 * ============================================================ */

export function cleanupTouchedNodes(): void {
  for (const node of trackedNodes) {
    if (!node.isConnected) {
      trackedNodes.delete(node);
    }
  }
}

/* ============================================================
 * Clear runtime cache
 * ============================================================ */

export function clearAutoTranslationCache(): void {
  translationCache.clear();
  pairCache.clear();
}
