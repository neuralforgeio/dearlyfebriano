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
 * 1. mShots   (s0.wp.com)     — screenshot engine milik
 *                              WordPress.com, menunggu render
 *                              selesai (CSR-friendly)
 * 2. thum.io  (image.thum.io) — fallback bila mShots gagal
 *
 * Kedua layanan tidak memerlukan registrasi / API key,
 * sehingga tidak akan kena limit kuota berbayar.
 *
 * Catatan penting:
 * - mShots mengembalikan GIF "loading" 400x300 sementara
 *   saat screenshot masih diproses — endpoint ini melakukan
 *   polling sampai JPEG asli tersedia.
 * - thum.io kadang meng-capture halaman CSR terlalu cepat
 *   sehingga hasilnya blank putih. Screenshot thum.io
 *   diperiksa: jika dominan putih kosong -> pakai fallback
 *   berikutnya.
 *
 * Cache:
 * - s-maxage 86400 (1 hari di CDN), stale-while-revalidate
 * ============================================================ */

export const runtime = "nodejs";

const MSHOTS_POLL_DELAY_MS = 4_000;
const MSHOTS_MAX_POLLS = 5;
const PREVIEW_TIMEOUT_MS = 20_000;
const RETRY_DELAY_MS = 3_000;
const MAX_ATTEMPTS_THUMIO = 2;

const VIEWPORT_WIDTH = 1440;
const VIEWPORT_HEIGHT = 900;

/* ============================================================
 * Validasi magic bytes
 *
 * PNG  : 89 50 4E 47
 * JPEG : FF D8 FF
 * WebP : 52 49 46 46 ... 57 45 42 50 (RIFF...WEBP)
 * GIF  : 47 49 46 38  — placeholder "loading" (mShots)
 * ============================================================ */

function isJpeg(buffer: ArrayBuffer): boolean {
  const b = new Uint8Array(buffer);
  return b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
}

function isPng(buffer: ArrayBuffer): boolean {
  const b = new Uint8Array(buffer);
  return b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47;
}

function isWebp(buffer: ArrayBuffer): boolean {
  const b = new Uint8Array(buffer);
  return (
    b[0] === 0x52 &&
    b[1] === 0x49 &&
    b[2] === 0x46 &&
    b[3] === 0x46 &&
    b[8] === 0x57 &&
    b[9] === 0x45 &&
    b[10] === 0x42 &&
    b[11] === 0x50
  );
}

function isRealScreenshot(buffer: ArrayBuffer): boolean {
  return isJpeg(buffer) || isPng(buffer) || isWebp(buffer);
}

function sniffContentType(buffer: ArrayBuffer): string {
  if (isPng(buffer)) return "image/png";
  if (isJpeg(buffer)) return "image/jpeg";
  if (isWebp(buffer)) return "image/webp";
  return "application/octet-stream";
}

/* ============================================================
 * Deteksi screenshot "blank" (halaman kosong / warna polos)
 *
 * Dipakai untuk hasil thum.io pada situs CSR yang ter-capture
 * terlalu cepat. Dua heuristik:
 *
 * 1. Ukuran: PNG solid 1440x900 terkompresi sangat kecil
 *    (< 120 KB). Screenshot nyata jauh lebih besar.
 *
 * 2. Entropi: dekompres IDAT lalu hitung jumlah nilai byte
 *    unik. PNG pakai per-scanline filter (None/Sub/Up/…),
 *    jadi pixel solid apapun warnanya menghasilkan hanya
 *    beberapa nilai byte berulang (mis. 255 dan 0-delta).
 *    Screenshot nyata punya ratusan nilai unik karena
 *    anti-aliasing, gradient, dan foto.
 * ============================================================ */

const BLANK_MIN_PNG_BYTES = 120_000;
const BLANK_MAX_DISTINCT_VALUES = 16;

function isBlankImage(buffer: ArrayBuffer): boolean {
  try {
    const b = new Uint8Array(buffer);

    if (b.length < BLANK_MIN_PNG_BYTES) {
      return true;
    }

    const zlib = require("zlib") as typeof import("zlib");

    /*
     * Cari byte sequence "IDAT" (49 44 41 54) manual —
     * Uint8Array.indexOf tidak menerima Buffer/array.
     */

    let idatStart = -1;

    for (let i = 8; i < b.length - 8; i++) {
      if (
        b[i] === 0x49 &&
        b[i + 1] === 0x44 &&
        b[i + 2] === 0x41 &&
        b[i + 3] === 0x54
      ) {
        idatStart = i;
        break;
      }
    }

    if (idatStart < 0) {
      return false;
    }

    /*
     * Kumpulkan semua IDAT chunk (bisa multiple). Setiap chunk
     * PNG: [4-byte length][4-byte type][data][4-byte CRC].
     * idatStart menunjuk posisi "IDAT" (type), jadi length
     * berada 4 byte sebelumnya.
     */

    const idatParts: Uint8Array[] = [];

    let cursor = idatStart;

    while (cursor < b.length - 8) {
      const len =
        (b[cursor - 4] << 24) |
        (b[cursor - 3] << 16) |
        (b[cursor - 2] << 8) |
        b[cursor - 1];

      const dataStart = cursor + 4;

      idatParts.push(b.slice(dataStart, dataStart + len));

      const nextChunk = dataStart + len + 4; // skip CRC

      if (nextChunk + 8 > b.length) {
        break;
      }

      // Chunk berikutnya bukan IDAT lagi (misal IEND) — berhenti.
      if (
        b[nextChunk + 4] !== 0x49 ||
        b[nextChunk + 5] !== 0x44 ||
        b[nextChunk + 6] !== 0x41 ||
        b[nextChunk + 7] !== 0x54
      ) {
        break;
      }

      cursor = nextChunk + 4;
    }

    const totalIdatLength = idatParts.reduce(
      (sum, part) => sum + part.length,
      0,
    );

    const idat = new Uint8Array(totalIdatLength);

    let offset = 0;

    for (const part of idatParts) {
      idat.set(part, offset);
      offset += part.length;
    }

    const raw = zlib.inflateSync(Buffer.from(idat));

    /*
     * Hitung nilai byte unik. Gambar solid -> sangat sedikit
     * nilai unik; screenshot nyata -> ratusan.
     */

    const seen = new Uint8Array(256);

    let distinct = 0;

    for (let i = 0; i < raw.length; i++) {
      const value = raw[i];

      if (seen[value] === 0) {
        seen[value] = 1;
        distinct++;

        if (distinct > BLANK_MAX_DISTINCT_VALUES) {
          return false; // jelas bukan gambar solid
        }
      }
    }

    return true;
  } catch {
    /*
     * Bila parsing PNG gagal, jangan blokir responsnya —
     * anggap bukan blank.
     */
    return false;
  }
}

/* ============================================================
 * Fetch dengan timeout
 * ============================================================ */

async function fetchWithTimeout(
  url: string,
  timeoutMs: number,
): Promise<Response | null> {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    return await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Accept: "image/*",
      },
    });
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/* ============================================================
 * Provider 1: mShots (primary)
 *
 * Polling GIF placeholder sampai JPEG asli tersedia.
 * ============================================================ */

async function fetchFromMshots(target: URL): Promise<ArrayBuffer | null> {
  const requestUrl = `https://s0.wp.com/mshots/v1/${encodeURIComponent(
    target.toString(),
  )}?w=${VIEWPORT_WIDTH}&h=${VIEWPORT_HEIGHT}`;

  for (let poll = 1; poll <= MSHOTS_MAX_POLLS; poll++) {
    const response = await fetchWithTimeout(requestUrl, PREVIEW_TIMEOUT_MS);

    if (response && response.ok) {
      const buffer = await response.arrayBuffer();

      // JPEG berarti screenshot final sudah siap.
      if (isJpeg(buffer)) {
        return buffer;
      }
    }

    if (poll < MSHOTS_MAX_POLLS) {
      await new Promise((resolve) => setTimeout(resolve, MSHOTS_POLL_DELAY_MS));
    }
  }

  return null;
}

/* ============================================================
 * Provider 2: thum.io (fallback)
 *
 * Retry bila respons bukan gambar; hasil blank putih
 * ditolak agar CSR site tidak tampil kosong.
 * ============================================================ */

async function fetchFromThumIo(target: URL): Promise<ArrayBuffer | null> {
  const requestUrl = `https://image.thum.io/get/width/${VIEWPORT_WIDTH}/crop/${VIEWPORT_HEIGHT}/${target.toString()}`;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS_THUMIO; attempt++) {
    const response = await fetchWithTimeout(requestUrl, PREVIEW_TIMEOUT_MS);

    if (response && response.ok) {
      const buffer = await response.arrayBuffer();

      if (
        isRealScreenshot(buffer) &&
        !isBlankImage(buffer)
      ) {
        return buffer;
      }
    }

    if (attempt < MAX_ATTEMPTS_THUMIO) {
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

  const mshots = await fetchFromMshots(target);

  if (mshots) {
    return new Response(mshots, {
      headers: {
        "Content-Type": sniffContentType(mshots),
        "Cache-Control":
          "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  }

  const thumio = await fetchFromThumIo(target);

  if (thumio) {
    return new Response(thumio, {
      headers: {
        "Content-Type": sniffContentType(thumio),
        "Cache-Control":
          "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  }

  return new Response("Failed to fetch project preview", { status: 502 });
}
