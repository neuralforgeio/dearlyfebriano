import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { messageStore } from "@/dearlyfebriano/lib/message-store";
import { isAdminKeyValid } from "@/dearlyfebriano/lib/admin-auth";
import { getClientIp, rateLimit } from "@/dearlyfebriano/lib/rate-limit";
import { sendContactEmail } from "@/dearlyfebriano/lib/email";
import { CONTACT_RATE_LIMIT_SECONDS, CONTACT_SUBJECTS } from "@/dearlyfebriano/lib/constants";
import { profile } from "@/dearlyfebriano/data/profile";

/* ============================================================
 * POST   /api/contact          — simpan pesan ke DB + kirim email
 *                                via Resend (jika RESEND_API_KEY ada).
 * GET    /api/contact          — (owner) daftar 50 pesan terbaru.
 * DELETE /api/contact?id=...   — (owner) hapus pesan.
 *
 * GET & DELETE memerlukan header `x-admin-key` yang cocok dengan
 * env ADMIN_DELETE_KEY (mode "Manage" di halaman Contact). Key
 * di-compare timing-safe (lib/admin-auth); attempt di-rate-limit
 * 10/menit per IP supaya tidak bisa di-brute-force.
 * ============================================================ */

const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must be at most 80 characters"),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(120),
  subject: z.enum(CONTACT_SUBJECTS),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be at most 2000 characters"),
});

export async function GET(request: NextRequest) {
  try {
    /* Rate limit listing (anti brute-force key). */
    const ip = getClientIp(request);
    const { allowed, retryAfterSeconds } = rateLimit(`contact-list:${ip}`, 10, 60);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many attempts — try again later." },
        { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
      );
    }

    if (!isAdminKeyValid(request.headers.get("x-admin-key"))) {
      return NextResponse.json(
        { error: "Invalid admin key — messages are private." },
        { status: 401 }
      );
    }

    const messages = await messageStore.listContact(50);
    return NextResponse.json({ messages });
  } catch (error) {
    console.error("[contact] GET error:", error);
    return NextResponse.json(
      { error: "Failed to load messages." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    /* Rate limit attempt hapus (anti brute-force key). */
    const ip = getClientIp(request);
    const { allowed, retryAfterSeconds } = rateLimit(`contact-delete:${ip}`, 10, 60);
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
      return NextResponse.json({ error: "Missing message id." }, { status: 400 });
    }

    const deleted = await messageStore.deleteContact(id);
    if (!deleted) {
      return NextResponse.json({ error: "Message not found." }, { status: 404 });
    }
    return NextResponse.json({ deleted: true, id });
  } catch (error) {
    console.error("[contact] DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete the message." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const { allowed, retryAfterSeconds } = rateLimit(
      `contact:${ip}`,
      1,
      CONTACT_RATE_LIMIT_SECONDS
    );
    if (!allowed) {
      return NextResponse.json(
        { error: "You just sent a message. Please wait a minute before trying again." },
        { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return NextResponse.json(
        { error: first?.message || "Invalid input." },
        { status: 400 }
      );
    }

    const values = parsed.data;

    // Simpan pesan ke store terlebih dahulu (tidak pernah hilang).
    const saved = await messageStore.addContact({
      name: values.name,
      email: values.email,
      subject: values.subject,
      message: values.message,
    });

    // Kirim email via Resend jika dikonfigurasi.
    const to = process.env.PERSONAL_EMAIL || profile.email;
    const emailResult = await sendContactEmail(values, to);
    if (emailResult.sent) {
      await messageStore.markContactEmailed(saved.id);
    }

    return NextResponse.json(
      {
        ok: true,
        id: saved.id,
        emailSent: emailResult.sent,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[contact] POST error:", error);
    return NextResponse.json(
      { error: "Something went wrong while sending your message. Please try again." },
      { status: 500 }
    );
  }
}
