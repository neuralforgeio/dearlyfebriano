import { timingSafeEqual } from "crypto";

/* ============================================================
 * ADMIN AUTH (server-only)
 * ------------------------------------------------------------
 * Validasi header `x-admin-key` terhadap env ADMIN_DELETE_KEY.
 * Dipakai bersama oleh route guestbook & contact untuk mode
 * "Manage" (membaca + menghapus pesan).
 *
 * - Compare timing-safe supaya timing tidak membocorkan key.
 * - Panjang berbeda → compare dengan dummy sebesar expected
 *   agar pola timing tetap seragam.
 * - Env ADMIN_DELETE_KEY menang bila di-set; tanpa env, key
 *   default "dearlyfebriano08" yang dipakai (permintaan owner).
 * ============================================================ */

/** Timing-safe comparison admin key (null-safe). */
export function isAdminKeyValid(provided: string | null): boolean {
  /* Env ADMIN_DELETE_KEY selalu menang bila di-set. Fallback default
   * (dearlyfebriano08) memastikan mode "Manage" tetap berfungsi di
   * Vercel tanpa perlu setup env — key ini hanya boleh menghapus
   * pesan guestbook/contact, bukan data sensitif lain. */
  const expected = process.env.ADMIN_DELETE_KEY || "dearlyfebriano08";
  const a = Buffer.from(provided ?? "");
  const b = Buffer.from(expected);
  if (a.length !== b.length) {
    // Jangan bocorkan panjang — bandingkan dengan dummy sebesar expected.
    timingSafeEqual(b, b);
    return false;
  }
  return timingSafeEqual(a, b);
}
