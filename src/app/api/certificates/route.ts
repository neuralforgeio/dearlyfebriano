import { NextRequest, NextResponse } from "next/server";
import {
  driveFilesToCertificates,
  driveSyncedAt,
  fetchDriveFiles,
} from "@/dearlyfebriano/lib/drive";
import { certificates as staticCertificates } from "@/dearlyfebriano/data/certificates";

/* ============================================================
 * GET /api/certificates
 * ------------------------------------------------------------
 * Sertifikat live-sync dari folder Google Drive user.
 * - Cache in-memory 5 menit (TTL) + dedup in-flight → Drive
 *   tidak pernah di-fetch lebih dari 1x per TTL.
 * - ?refresh=1 → paksa re-fetch (tetap dedup in-flight).
 * - Jika Drive gagal → fallback data statis (certificates.ts).
 * Response: { certificates, syncedAt, source }
 * ============================================================ */

export async function GET(request: NextRequest) {
  const force = request.nextUrl.searchParams.get("refresh") === "1";

  try {
    const files = await fetchDriveFiles(force);

    if (files && files.length > 0) {
      const certificates = driveFilesToCertificates(files);
      return NextResponse.json(
        { certificates, syncedAt: driveSyncedAt(), source: "drive" },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    // Drive kosong / gagal → fallback statis.
    return NextResponse.json(
      { certificates: staticCertificates, syncedAt: null, source: "fallback" },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("[certificates] GET error:", error);
    return NextResponse.json(
      { certificates: staticCertificates, syncedAt: null, source: "fallback" },
      { headers: { "Cache-Control": "no-store" } }
    );
  }
}
