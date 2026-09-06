import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* ROUTING: portfolio adalah path-SPA (tanpa #) — SEMUA path
   * (/about, /projects/<slug>, dst) di-serve halaman yang sama.
   * `afterFiles` berjalan SETELAH route file nyata + file publik,
   * jadi /api/*, /images/*, /sitemap.xml, /robots.txt, dll tetap
   * dimenangkan oleh file aslinya dan TIDAK ter-rewrite.
   * Tidak ada file route tambahan — tetap satu page.tsx. */
  async rewrites() {
    return {
      afterFiles: [{ source: "/:path*", destination: "/" }],
    };
  },
  /* CATATAN: `output: "standalone"` sengaja TIDAK dipakai.
   * Vercel tidak membutuhkan standalone (punya build system sendiri),
   * dan mode standalone memindahkan file tracing (next-server.js.nft.json)
   * ke .next/standalone/ → hook onBuildComplete Vercel gagal dengan
   * "ENOENT: no such file or directory .next/next-server.js.nft.json".
   * Standalone hanya untuk self-host/Docker — tambahkan kembali bila perlu. */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    /* SEMANTIK Next.js 16 (match-local-pattern.js):
     * - `search` undefined → query string APA PUN diizinkan.
     * - `search: ""`       → query harus persis kosong.
     * Karena itu route sertifikat (/api/certificates/image?id=...&sz=...)
     * dideklarasikan TANPA properti search. */
    localPatterns: [
      { pathname: "/images/**" },
      { pathname: "/api/certificates/image" },
      { pathname: "/api/project-preview" },
    ],
    // Local SVG assets (certificate placeholders) rendered via next/image.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
