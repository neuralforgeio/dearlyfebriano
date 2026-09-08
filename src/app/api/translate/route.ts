import { NextRequest, NextResponse } from "next/server";

import { translate } from "google-translate-api-x";

import { getClientIp, rateLimit } from "@/dearlyfebriano/lib/rate-limit";

export const runtime = "nodejs";

/* ============================================================
 * Limits
 * ============================================================ */

const MAX_STRINGS = 60;

const MAX_SOURCE_LENGTH = 12000;

const TRANSLATION_CHUNK_LENGTH = 1700;

/* ============================================================
 * Server cache
 *
 * Cache is separated by target:
 *
 * en:source
 * id:source
 * ============================================================ */

const CACHE_VERSION = "v4";

const globalCache = globalThis as unknown as {
  __dfTranslateCacheV4?: Map<string, string>;
};

const cache =
  globalCache.__dfTranslateCacheV4 ??
  (globalCache.__dfTranslateCacheV4 = new Map());

/* ============================================================
 * Helpers
 * ============================================================ */

function normalize(value: string): string {
  return value.replace(/\r\n/g, "\n");
}

function cacheKey(source: string, target: "en" | "id"): string {
  return `${CACHE_VERSION}:${target}:${source}`;
}

/* ============================================================
 * Quality overrides
 * ============================================================ */

const OVERRIDES: Record<string, Partial<Record<"en" | "id", string>>> = {
  Home: {
    en: "Home",
    id: "Beranda",
  },

  Projects: {
    en: "Projects",
    id: "Proyek",
  },

  Certificates: {
    en: "Certificates",
    id: "Sertifikat",
  },

  Experience: {
    en: "Experience",
    id: "Pengalaman",
  },

  Notes: {
    en: "Notes",
    id: "Catatan",
  },

  Contact: {
    en: "Contact",
    id: "Kontak",
  },

  Guestbook: {
    en: "Guestbook",
    id: "Buku Tamu",
  },
};

/* ============================================================
 * Split long text
 * ============================================================ */

function splitLongText(text: string): string[] {
  if (text.length <= TRANSLATION_CHUNK_LENGTH) {
    return [text];
  }

  const chunks: string[] = [];

  const paragraphs = text.split(/\n{2,}/);

  let current = "";

  const flush = (): void => {
    if (current.length > 0) {
      chunks.push(current);

      current = "";
    }
  };

  for (const paragraph of paragraphs) {
    const candidate =
      current.length === 0 ? paragraph : `${current}\n\n${paragraph}`;

    if (candidate.length <= TRANSLATION_CHUNK_LENGTH) {
      current = candidate;

      continue;
    }

    flush();

    if (paragraph.length > TRANSLATION_CHUNK_LENGTH) {
      const sentences = paragraph.split(/(?<=[.!?])\s+/);

      let sentenceChunk = "";

      for (const sentence of sentences) {
        const candidateSentence =
          sentenceChunk.length === 0
            ? sentence
            : `${sentenceChunk} ${sentence}`;

        if (candidateSentence.length <= TRANSLATION_CHUNK_LENGTH) {
          sentenceChunk = candidateSentence;

          continue;
        }

        if (sentenceChunk.length > 0) {
          chunks.push(sentenceChunk);
        }

        if (sentence.length > TRANSLATION_CHUNK_LENGTH) {
          for (
            let index = 0;
            index < sentence.length;
            index += TRANSLATION_CHUNK_LENGTH
          ) {
            chunks.push(
              sentence.slice(index, index + TRANSLATION_CHUNK_LENGTH),
            );
          }

          sentenceChunk = "";
        } else {
          sentenceChunk = sentence;
        }
      }

      if (sentenceChunk.length > 0) {
        chunks.push(sentenceChunk);
      }

      continue;
    }

    current = paragraph;
  }

  flush();

  return chunks.filter(Boolean);
}

/* ============================================================
 * Translate one chunk
 * ============================================================ */

async function translateChunk(
  text: string,
  target: "en" | "id",
): Promise<string> {
  const override = OVERRIDES[text]?.[target];

  if (override !== undefined) {
    return override;
  }

  /*
   * IMPORTANT:
   *
   * `auto` means Google Translate detects whether the source
   * text is English, Indonesian, or another supported language.
   */

  const result = await translate(text, {
    from: "auto",
    to: target,

    autoCorrect: false,

    requestOptions: {
      timeout: 15000,
    },
  });

  if (Array.isArray(result)) {
    return result[0]?.text ?? text;
  }

  return result?.text ?? text;
}

/* ============================================================
 * Translate full source string
 * ============================================================ */

async function translateString(
  source: string,
  target: "en" | "id",
): Promise<string> {
  const normalized = normalize(source);

  if (!normalized) {
    return normalized;
  }

  const key = cacheKey(normalized, target);

  const cached = cache.get(key);

  if (cached !== undefined) {
    return cached;
  }

  const override = OVERRIDES[normalized]?.[target];

  if (override !== undefined) {
    cache.set(key, override);

    return override;
  }

  if (normalized.length > MAX_SOURCE_LENGTH) {
    throw new Error(`String exceeds ${MAX_SOURCE_LENGTH} characters.`);
  }

  const chunks = splitLongText(normalized);

  const translatedChunks: string[] = [];

  for (const chunk of chunks) {
    const translated = await translateChunk(chunk, target);

    translatedChunks.push(translated);
  }

  const translated = translatedChunks.join("\n");

  cache.set(key, translated);

  return translated;
}

/* ============================================================
 * POST
 * ============================================================ */

export async function POST(request: NextRequest): Promise<Response> {
  /* ----------------------------------------------------------
   * Rate limit
   * ---------------------------------------------------------- */

  const ip = getClientIp(request);

  const { allowed } = rateLimit(`translate:${ip}`, 30, 60);

  if (!allowed) {
    return NextResponse.json(
      {
        error: "Too many translation requests.",
      },
      {
        status: 429,
      },
    );
  }

  /* ----------------------------------------------------------
   * Parse JSON
   * ---------------------------------------------------------- */

  const body = await request.json().catch(() => null);

  const strings =
    body && typeof body === "object"
      ? (
          body as {
            strings?: unknown;
          }
        ).strings
      : null;

  const target =
    body && typeof body === "object"
      ? (
          body as {
            target?: unknown;
          }
        ).target
      : null;

  /* ----------------------------------------------------------
   * Validate target
   * ---------------------------------------------------------- */

  if (target !== "en" && target !== "id") {
    return NextResponse.json(
      {
        error: "Invalid target language.",
      },
      {
        status: 400,
      },
    );
  }

  /* ----------------------------------------------------------
   * Validate strings
   * ---------------------------------------------------------- */

  if (
    !Array.isArray(strings) ||
    strings.length === 0 ||
    strings.length > MAX_STRINGS
  ) {
    return NextResponse.json(
      {
        error: "Invalid payload.",
      },
      {
        status: 400,
      },
    );
  }

  if (
    !strings.every(
      (item) =>
        typeof item === "string" &&
        item.length > 0 &&
        item.length <= MAX_SOURCE_LENGTH,
    )
  ) {
    return NextResponse.json(
      {
        error: "Invalid strings.",
      },
      {
        status: 400,
      },
    );
  }

  const uniqueStrings = Array.from(new Set(strings as string[]));

  /* ----------------------------------------------------------
   * Translation
   * ---------------------------------------------------------- */

  const translations: Record<string, string> = {};

  const results = await Promise.all(
    uniqueStrings.map(async (source) => {
      try {
        const translated = await translateString(source, target as "en" | "id");

        return {
          source,
          translated,
        };
      } catch (error) {
        console.error("[translate]", error);

        /*
         * Fallback:
         * returning source prevents the client from
         * replacing its current content with undefined.
         */

        return {
          source,
          translated: source,
        };
      }
    }),
  );

  for (const result of results) {
    translations[result.source] = result.translated;
  }

  return NextResponse.json({
    translations,
    target,
  });
}
