import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { messageStore } from "@/dearlyfebriano/lib/message-store";
import { isAdminKeyValid } from "@/dearlyfebriano/lib/admin-auth";
import { getClientIp, rateLimit } from "@/dearlyfebriano/lib/rate-limit";
import { GUESTBOOK_RATE_LIMIT_SECONDS } from "@/dearlyfebriano/lib/constants";

/* ============================================================
 * GET    /api/guestbook          — ambil 50 pesan terbaru.
 * POST   /api/guestbook          — kirim pesan baru (rate limited 1/menit).
 * DELETE /api/guestbook?id=...   — hapus pesan (owner only, x-admin-key).
 *
 * Hapus pesan memerlukan header `x-admin-key` yang cocok dengan
 * env ADMIN_DELETE_KEY (di-set di .env.local). Key di-compare
 * secara timing-safe (lib/admin-auth); attempt di-rate-limit
 * 10/menit per IP supaya tidak bisa di-brute-force.
 * ============================================================ */

const createSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters"),
  message: z
    .string()
    .trim()
    .min(5, "Message must be at least 5 characters")
    .max(500, "Message must be at most 500 characters"),
});

export async function GET() {
  try {
    const entries = await messageStore.listGuestbook(50);
    return NextResponse.json({ entries });
  } catch (error) {
    console.error("[guestbook] GET error:", error);
    return NextResponse.json(
      { error: "Failed to load guestbook entries." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const { allowed, retryAfterSeconds } = rateLimit(
      `guestbook:${ip}`,
      1,
      GUESTBOOK_RATE_LIMIT_SECONDS
    );
    if (!allowed) {
      return NextResponse.json(
        { error: "Please wait a moment before sending another message." },
        { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return NextResponse.json(
        { error: first?.message || "Invalid input." },
        { status: 400 }
      );
    }

    const entry = await messageStore.addGuestbook({
      name: parsed.data.name,
      message: parsed.data.message,
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error("[guestbook] POST error:", error);
    return NextResponse.json(
      { error: "Failed to save your message. Please try again." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    /* Rate limit attempt hapus (anti brute-force key). */
    const ip = getClientIp(request);
    const { allowed, retryAfterSeconds } = rateLimit(`guestbook-delete:${ip}`, 10, 60);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many delete attempts — try again later." },
        { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
      );
    }

    if (!isAdminKeyValid(request.headers.get("x-admin-key"))) {
      return NextResponse.json(
        { error: "Invalid admin key — deletion not permitted." },
        { status: 401 }
      );
    }

    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing entry id." }, { status: 400 });
    }

    const deleted = await messageStore.deleteGuestbook(id);
    if (!deleted) {
      return NextResponse.json({ error: "Entry not found." }, { status: 404 });
    }
    return NextResponse.json({ deleted: true, id });
  } catch (error) {
    console.error("[guestbook] DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete the message." },
      { status: 500 }
    );
  }
}
