import { NextRequest } from "next/server";

/* ============================================================
 * Project Preview API (keyless)
 *
 * GET:
 *   /api/project-preview?url=https://example.com
 *
 * Mengambil live preview (screenshot) website project secara
 * otomatis TANPA API key:
 *
 * 1. thum.io  (image.thum.io) — layanan screenshot gratis
 * 2. mShots   (s0.wp.com)     — fallback, screenshot engine
 *                              milik WordPress.com
 *
 * Kedua layanan tidak memerlukan registrasi / API key,
 * sehingga tidak akan kena limit kuota berbayar.
 *
 * Catatan penting:
 * Kedua layanan mengembalikan GIF "loading" sementara saat
 * screenshot masih diproses. Untuk itu respons divalidasi
 * lewat magic bytes — hanya PNG/JPEG yang dianggap screenshot
 * jadi dan di-cache. GIF placeholder memicu retry.
 *
 * Cache:
 * - s-maxage 86400 (1 hari di CDN), stale-while-revalidate
 * ============================================================ */

export const runtime = "nodejs";

const PREVIEW_TIMEOUT_MS = 20_000;
const RETRY_DELAY_MS = 3_000;
const MAX_ATTEMPTS_PER_PROVIDER = 3;

const VIEWPORT_WIDTH = 1440;
const VIEWPORT_HEIGHT = 900;

/* ============================================================
 * Provider screenshots — semuanya keyless
 * ============================================================ */

interface ScreenshotProvider {
  name: string;
  buildUrl: (target: URL) => string;
}

const PROVIDERS: ScreenshotProvider[] = [
  {
    name: "thum.io",

    buildUrl: (target) =>
      `https://image.thum.io/get/width/${VIEWPORT_WIDTH}/crop/${VIEWPORT_HEIGHT}/${target.toString()}`,
  },

  {
    name: "mshots",

    buildUrl: (target) =>
      `https://s0.wp.com/mshots/v1/${encodeURIComponent(
        target.toString(),
      )}?w=${VIEWPORT_WIDTH}&h=${VIEWPORT_HEIGHT}`,
  },
];

/* ============================================================
 * Validasi magic bytes
 *
 * PNG  : 89 50 4E 47
 * JPEG : FF D8 FF
 * WebP : 52 49 46 46 ... 57 45 42 50 (RIFF...WEBP)
 * GIF  : 47 49 46 38  — placeholder "loading", DITOLAK
 * ============================================================ */

function isRealScreenshot(buffer: ArrayBuffer): boolean {
  const bytes = new Uint8Array(buffer);

  if (bytes.length < 12) {
    return false;
  }

  const isPng =
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47;

  const isJpeg =
    bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;

  const isWebp =
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50;

  return isPng || isJpeg || isWebp;
}

function sniffContentType(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);

  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "image/png";
  }

  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    return "image/jpeg";
  }

  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45
  ) {
    return "image/webp";
  }

  return "application/octet-stream";
}

/* ============================================================
 * Fetch screenshot dengan timeout + retry
 *
 * Return ArrayBuffer screenshot jadi, atau null bila gagal.
 * ============================================================ */

async function fetchScreenshot(
  provider: ScreenshotProvider,
  target: URL,
): Promise<ArrayBuffer | null> {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_PROVIDER; attempt++) {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, PREVIEW_TIMEOUT_MS);

    try {
      const response = await fetch(provider.buildUrl(target), {
        signal: controller.signal,

        cache: "no-store",

        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
          Accept: "image/*",
        },
      });

      if (!response.ok) {
        continue;
      }

      const buffer = await response.arrayBuffer();

      /*
       * GIF berarti "loading" sementara dari provider —
       * tunggu sebentar lalu retry.
       */

      if (isRealScreenshot(buffer)) {
        return buffer;
      }
    } catch {
      // Retry pada attempt berikutnya.
    } finally {
      clearTimeout(timeout);
    }

    if (attempt < MAX_ATTEMPTS_PER_PROVIDER) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }

  return null;
}

/* ============================================================
 * GET
 * ============================================================ */

export async function GET(req: NextRequest): Promise<Response> {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return new Response("Missing 'url' query parameter", { status: 400 });
  }

  let target: URL;

  try {
    target = new URL(url);
  } catch {
    return new Response("Invalid URL", { status: 400 });
  }

  if (!["http:", "https:"].includes(target.protocol)) {
    return new Response("Invalid URL protocol", { status: 400 });
  }

  for (const provider of PROVIDERS) {
    const image = await fetchScreenshot(provider, target);

    if (image) {
      return new Response(image, {
        headers: {
          "Content-Type": sniffContentType(image),

          "Cache-Control":
            "public, s-maxage=86400, stale-while-revalidate=604800",
        },
      });
    }
  }

  return new Response("Failed to fetch project preview", { status: 502 });
}
