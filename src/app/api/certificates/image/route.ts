import { NextRequest, NextResponse } from "next/server";

/* ============================================================
 * GET /api/certificates/image?id=FILE_ID&sz=w400|w800|w1200
 * ------------------------------------------------------------
 * Proxy thumbnail Google Drive → menghindari masalah CORS &
 * remotePatterns next/image. Response di-cache lama (1 hari)
 * karena file id Drive bersifat immutable — sertifikat baru
 * selalu mendapat file id baru.
 * ============================================================ */

const ALLOWED_SIZES = new Set(["w400", "w800", "w1200"]);
const FILE_ID_PATTERN = /^[A-Za-z0-9_-]{20,}$/;
const FETCH_TIMEOUT_MS = 15_000;
const MAX_IMAGE_BYTES = 15 * 1024 * 1024; // 15 MB safety cap

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  const sz = request.nextUrl.searchParams.get("sz") ?? "w800";

  if (!id || !FILE_ID_PATTERN.test(id)) {
    return NextResponse.json({ error: "Invalid file id." }, { status: 400 });
  }
  if (!ALLOWED_SIZES.has(sz)) {
    return NextResponse.json({ error: "Invalid size." }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const response = await fetch(
      `https://drive.google.com/thumbnail?id=${id}&sz=${sz}`,
      {
        headers: { "User-Agent": BROWSER_UA },
        signal: controller.signal,
        cache: "no-store",
      }
    );
    clearTimeout(timeout);

    if (!response.ok) {
      return NextResponse.json(
        { error: "Could not load the certificate image." },
        { status: response.status === 404 ? 404 : 502 }
      );
    }

    const contentType = response.headers.get("content-type") ?? "application/octet-stream";
    if (!contentType.startsWith("image/")) {
      return NextResponse.json(
        { error: "Unexpected content type from Drive." },
        { status: 502 }
      );
    }

    const buffer = await response.arrayBuffer();
    if (buffer.byteLength > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "Image too large." }, { status: 502 });
    }

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        // File id immutable → aman di-cache sangat lama.
        "Cache-Control": "public, max-age=86400, s-maxage=86400, immutable",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json({ error: "Drive fetch timed out." }, { status: 504 });
    }
    console.error("[certificates/image] error:", error);
    return NextResponse.json(
      { error: "Could not load the certificate image." },
      { status: 502 }
    );
  }
}
