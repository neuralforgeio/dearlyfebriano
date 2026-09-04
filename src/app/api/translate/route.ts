import { NextRequest, NextResponse } from "next/server";
import { translate } from "google-translate-api-x";
import { getClientIp, rateLimit } from "@/dearlyfebriano/lib/rate-limit";

/* ============================================================
 * POST /api/translate — auto-translate EN → ID.
 * ------------------------------------------------------------
 * Body  : { strings: string[] }  (max 60 string, tiap string
 *          max 2000 karakter — client sudah mengirim per-chunk
 *          kecil supaya aman untuk durasi serverless Vercel).
 * Resp  : { translations: Record<string, string> }
 *
 * Server-side memory cache (globalThis) supaya string yang sama
 * tidak diterjemahkan ulang. Client juga cache di localStorage.
 * Bila layanan gagal, client otomatis fallback ke English.
 * ============================================================ */

export const runtime = "nodejs";

const MAX_STRINGS = 60;
const MAX_STRING_LENGTH = 2000;

/* Koreksi kualitas ringan untuk beberapa istilah yang terjemahan
 * mesin-nya kurang natural di konteks website (mis. "Home" nav
 * seharusnya "Beranda", bukan "Rumah"). Library tetap yang
 * menerjemahkan sisanya. */
const QUALITY_OVERRIDES: Record<string, string> = {
  Home: "Beranda",
};

const globalCache = globalThis as unknown as {
  __dfTranslateCache?: Map<string, string>;
};
const cache: Map<string, string> =
  globalCache.__dfTranslateCache ?? (globalCache.__dfTranslateCache = new Map());

export async function POST(request: NextRequest) {
  /* Rate limit ringan (anti abuse). */
  const ip = getClientIp(request);
  const { allowed } = rateLimit(`translate:${ip}`, 30, 60);
  if (!allowed) {
    return NextResponse.json({ error: "Too many translation requests." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const strings: unknown = body && typeof body === "object" ? (body as { strings?: unknown }).strings : null;

  if (!Array.isArray(strings) || strings.length === 0 || strings.length > MAX_STRINGS) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }
  if (
    !strings.every(
      (item) => typeof item === "string" && item.length >= 1 && item.length <= MAX_STRING_LENGTH
    )
  ) {
    return NextResponse.json({ error: "Invalid strings." }, { status: 400 });
  }

  /* Terjemahkan hanya string yang belum ada di cache. */
  const missing = Array.from(new Set(strings.filter((text) => !cache.has(text as string))));
  if (missing.length > 0) {
    try {
      const results = await translate(missing, {
        from: "en",
        to: "id",
        autoCorrect: false,
        requestOptions: { timeout: 15000 },
      });
      const list = Array.isArray(results) ? results : [results];
      missing.forEach((text, index) => {
        const raw = list[index]?.text;
        let translated = typeof raw === "string" && raw.length > 0 ? raw : undefined;
        if (translated !== undefined && QUALITY_OVERRIDES[text as string] !== undefined) {
          translated = QUALITY_OVERRIDES[text as string];
        }
        if (translated !== undefined) {
          cache.set(text as string, translated);
        }
      });
    } catch (error) {
      console.error("[translate] batch error:", error);
      /* Lanjut — kembalikan apa pun yang sudah ada di cache. */
    }
  }

  const translations: Record<string, string> = {};
  let hits = 0;
  for (const text of strings as string[]) {
    const translated = cache.get(text);
    if (translated !== undefined) {
      translations[text] = translated;
      hits += 1;
    }
  }

  if (hits === 0 && missing.length > 0) {
    return NextResponse.json(
      { error: "Translation service unavailable." },
      { status: 502 }
    );
  }

  return NextResponse.json({ translations });
}
