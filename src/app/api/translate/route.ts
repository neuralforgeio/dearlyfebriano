import { NextRequest, NextResponse } from "next/server";

import { translate } from "google-translate-api-x";

import { getClientIp, rateLimit } from "@/dearlyfebriano/lib/rate-limit";

/* ============================================================
 * POST /api/translate
 *
 * Body:
 *   {
 *     strings: string[]
 *   }
 *
 * Behavior:
 * - menerima batch string
 * - string pendek diterjemahkan langsung
 * - string panjang otomatis dipecah menjadi beberapa chunk
 * - hasil chunk digabung kembali
 * - cache server digunakan untuk menghindari translate ulang
 *
 * ============================================================ */

export const runtime = "nodejs";

/* ============================================================
 * Request limits
 * ============================================================ */

const MAX_STRINGS = 60;

/*
 * Ini bukan lagi hard limit untuk panjang string sumber.
 * String panjang akan di-split terlebih dahulu.
 */
const MAX_SOURCE_LENGTH = 12000;

/*
 * Ukuran aman per potongan yang dikirim ke translator.
 */
const TRANSLATION_CHUNK_LENGTH = 1700;

/*
 * Jarak overlap kecil membantu menjaga kontinuitas kalimat
 * ketika sebuah kalimat kebetulan terpotong di batas chunk.
 *
 * Namun untuk menjaga hasil tetap stabil, overlap hanya dipakai
 * di level paragraf/splitter dan tidak menggandakan output.
 */
const CACHE_PREFIX = "v2:";

/* ============================================================
 * Quality overrides
 * ============================================================ */

const QUALITY_OVERRIDES: Record<string, string> = {
  Home: "Beranda",
};

/* ============================================================
 * Server cache
 * ============================================================ */

const globalCache = globalThis as unknown as {
  __dfTranslateCacheV2?: Map<string, string>;
};

const cache: Map<string, string> =
  globalCache.__dfTranslateCacheV2 ??
  (globalCache.__dfTranslateCacheV2 = new Map());

/* ============================================================
 * Helpers
 * ============================================================ */

function cacheKey(source: string): string {
  return `${CACHE_PREFIX}${source}`;
}

function normalizeSource(value: string): string {
  return value.replace(/\r\n/g, "\n");
}

/**
 * Split a long natural-language string without destroying
 * paragraph boundaries whenever possible.
 */
function splitLongText(text: string): string[] {
  if (text.length <= TRANSLATION_CHUNK_LENGTH) {
    return [text];
  }

  const chunks: string[] = [];

  /*
   * Prefer paragraph boundaries first.
   */
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

    /*
     * Paragraph itself is too large.
     * Split by sentence-ish boundaries.
     */
    if (paragraph.length > TRANSLATION_CHUNK_LENGTH) {
      const sentenceParts = paragraph.split(/(?<=[.!?])\s+/);

      let sentenceChunk = "";

      for (const sentence of sentenceParts) {
        const sentenceCandidate =
          sentenceChunk.length === 0
            ? sentence
            : `${sentenceChunk} ${sentence}`;

        if (sentenceCandidate.length <= TRANSLATION_CHUNK_LENGTH) {
          sentenceChunk = sentenceCandidate;
          continue;
        }

        if (sentenceChunk.length > 0) {
          chunks.push(sentenceChunk);
        }

        /*
         * Extremely long single sentence:
         * hard-split it safely.
         */
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

  return chunks.filter((chunk) => chunk.length > 0);
}

/**
 * Translate one chunk.
 */
async function translateChunk(text: string): Promise<string> {
  const result = await translate(text, {
    from: "en",
    to: "id",
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

/**
 * Translate one complete source string while preserving its
 * original source key.
 */
async function translateString(source: string): Promise<string> {
  const key = cacheKey(source);

  const existing = cache.get(key);

  if (existing !== undefined) {
    return existing;
  }

  const override = QUALITY_OVERRIDES[source];

  if (override !== undefined) {
    cache.set(key, override);

    return override;
  }

  const normalized = normalizeSource(source);

  if (normalized.length === 0) {
    return normalized;
  }

  /*
   * Reject absurdly large payloads.
   * This protects the endpoint from accidental huge inputs.
   */
  if (normalized.length > MAX_SOURCE_LENGTH) {
    throw new Error(`String exceeds ${MAX_SOURCE_LENGTH} characters.`);
  }

  const parts = splitLongText(normalized);

  const translatedParts: string[] = [];

  for (const part of parts) {
    const translated = await translateChunk(part);

    translatedParts.push(translated);
  }

  /*
   * We use a simple newline join for long text.
   *
   * For single-paragraph text, this preserves readability
   * without requiring the original client to know about
   * chunking.
   */
  const translated = translatedParts.join("\n");

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
   * Parse body
   * ---------------------------------------------------------- */

  const body = await request.json().catch(() => null);

  const strings: unknown =
    body && typeof body === "object"
      ? (
          body as {
            strings?: unknown;
          }
        ).strings
      : null;

  /* ----------------------------------------------------------
   * Validate array
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

  /* ----------------------------------------------------------
   * Validate individual strings
   *
   * We allow long strings now because the server handles the
   * chunking internally.
   * ---------------------------------------------------------- */

  if (
    !strings.every(
      (item) =>
        typeof item === "string" &&
        item.length >= 1 &&
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

  const sourceStrings = Array.from(new Set(strings as string[]));

  /* ----------------------------------------------------------
   * Translate in parallel by source string.
   *
   * Each source string may internally consist of multiple
   * translation chunks.
   * ---------------------------------------------------------- */

  const translations: Record<string, string> = {};

  const results = await Promise.all(
    sourceStrings.map(async (source) => {
      try {
        const translated = await translateString(source);

        return {
          source,
          translated,
        };
      } catch (error) {
        console.error("[translate] string error:", error);

        return {
          source,
          translated: undefined,
        };
      }
    }),
  );

  for (const result of results) {
    if (result.translated !== undefined) {
      translations[result.source] = result.translated;
    }
  }

  /* ----------------------------------------------------------
   * If nothing could be translated, return 502.
   * ---------------------------------------------------------- */

  if (Object.keys(translations).length === 0) {
    return NextResponse.json(
      {
        error: "Translation service unavailable.",
      },
      {
        status: 502,
      },
    );
  }

  return NextResponse.json({
    translations,
  });
}
