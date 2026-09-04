import type { Certificate } from "@/dearlyfebriano/types";

/* ============================================================
 * GOOGLE DRIVE LIVE CERTIFICATES (server-only)
 * ------------------------------------------------------------
 * Mengambil daftar sertifikat dari folder Google Drive publik
 * milik user secara realtime, dengan cache in-memory supaya
 * tidak memberatkan (Drive hanya di-fetch maksimum 1x per TTL).
 *
 * Cara kerja:
 * 1. GET halaman folder Drive (public) → parse data-id +
 *    aria-label dari DOM untuk mendapat daftar file.
 * 2. Cache hasil parse di modul (TTL 5 menit) + dedup request
 *    in-flight (hanya 1 fetch berjalan walau banyak request).
 * 3. Metadata kurated (issuer/tanggal/kategori) digabung dengan
 *    data hasil scan; file baru yang belum ter-meta otomatis
 *    dapat kategori dari heuristik judul.
 * 4. Gambar disajikan lewat proxy /api/certificates/image agar
 *    bebas CORS & kompatibel dengan next/image.
 * ============================================================ */

/** Folder Drive berisi semua sertifikat (milik user). */
export const DRIVE_FOLDER_ID = "1mfKr3F1EITWK6cXEfybwE4obZD5FEppj";
export const DRIVE_FOLDER_URL =
  "https://drive.google.com/drive/folders/1mfKr3F1EITWK6cXEfybwE4obZD5FEppj?usp=sharing";

/** Cache TTL — berapa lama hasil fetch Drive dipakai ulang. */
const DRIVE_CACHE_TTL_MS = 5 * 60 * 1000;
/** Timeout fetch Drive. */
const DRIVE_FETCH_TIMEOUT_MS = 10_000;
/** User-Agent browser-like supaya halaman Drive ter-render penuh. */
const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

export interface DriveFile {
  id: string;
  /** Nama file lengkap dengan ekstensi, mis. "Intro to ML.png". */
  fileName: string;
  ext: string;
  kind: "image" | "pdf" | "other";
}

/* ------------------------------------------------------------
 * Metadata kurated — diisi dari data sertifikat asli (scan
 * gambar). File BARU yang diunggah user tanpa metadata tetap
 * muncul otomatis memakai heuristik di bawah.
 * Tambahkan entri di sini saat ingin melengkapi sertifikat baru.
 * ------------------------------------------------------------ */
const DRIVE_CERT_META: Record<string, Omit<Certificate, "id" | "imageUrl">> = {
  "1uSSFOyvLoRhioEVXaTi494uGHyPMmZqx": {
    title: "Intermediate Machine Learning",
    issuer: "Kaggle",
    issueDate: "2026-09-03",
    category: "ai",
    driveFileId: "1uSSFOyvLoRhioEVXaTi494uGHyPMmZqx",
    source: "drive",
    description:
      "Intermediate-level Kaggle Learn certificate covering feature engineering, model ensembling, cross-validation strategy, and leakage prevention.",
  },
  "1e5HYPQLgXvE1Da4GVtbpqG9MzzN8LgXv": {
    title: "Intro to Deep Learning",
    issuer: "Kaggle",
    issueDate: "2026-09-03",
    category: "ai",
    driveFileId: "1e5HYPQLgXvE1Da4GVtbpqG9MzzN8LgXv",
    source: "drive",
    description:
      "Kaggle Learn certificate covering neural networks with TensorFlow and Keras, stochastic gradient descent, and overfitting mitigation with dropout.",
  },
  "1z73WAMV_XvIzjanAsclUE-FgQoYDRCC2": {
    title: "Intro to Machine Learning",
    issuer: "Kaggle",
    issueDate: "2026-09-03",
    category: "ai",
    driveFileId: "1z73WAMV_XvIzjanAsclUE-FgQoYDRCC2",
    source: "drive",
    description:
      "Kaggle Learn certificate covering core ML concepts: model validation, underfitting/overfitting, random forests, and gradient boosting with XGBoost.",
  },
  "1R-d-aEZTqT4_GymkOELK6WvJZgfIkT7Q": {
    title: "Intro to Programming",
    issuer: "Kaggle",
    issueDate: "2026-09-03",
    category: "web",
    driveFileId: "1R-d-aEZTqT4_GymkOELK6WvJZgfIkT7Q",
    source: "drive",
    description:
      "Kaggle Learn certificate covering Python fundamentals — variables, functions, booleans, lists, loops, and string operations.",
  },
  "1Xljth-_QYFpicfCbBy__1wRUEnxODteY": {
    title: "Belajar Dasar Pemrograman JavaScript",
    issuer: "Dicoding Indonesia",
    issueDate: "2024-09-28",
    credentialId: "3494738",
    category: "web",
    driveFileId: "1Xljth-_QYFpicfCbBy__1wRUEnxODteY",
    source: "drive",
    description:
      "Dicoding certificate covering JavaScript fundamentals — variables, data types, functions, DOM manipulation, and asynchronous programming.",
  },
};

/* ---------------- Parsing helpers ---------------- */

/** Buang akhiran label Drive seperti " Image Shared" / " PDF Shared". */
function cleanDriveLabel(label: string): string {
  return label
    .replace(/\s+(Image|PDF|Video|Document|Spreadsheet|Folder)\s+Shared$/i, "")
    .replace(/\s+Shared$/i, "")
    .trim();
}

const EXT_KIND: Record<string, DriveFile["kind"]> = {
  png: "image",
  jpg: "image",
  jpeg: "image",
  webp: "image",
  gif: "image",
  bmp: "image",
  svg: "image",
  pdf: "pdf",
};

/** Ekstrak daftar file dari HTML halaman folder Drive. */
export function parseDriveFolderHtml(html: string): DriveFile[] {
  const files = new Map<string, DriveFile>();

  // Setiap item file dirender beberapa kali; cukup ambil kemunculan pertama.
  const idPattern = /data-id="([A-Za-z0-9_-]{20,})"/g;
  const labelPattern = /aria-label="([^"]+)"/g;

  const ids: { pos: number; id: string }[] = [];
  let match: RegExpExecArray | null;
  while ((match = idPattern.exec(html)) !== null) {
    ids.push({ pos: match.index, id: match[1] });
  }
  const labels: { pos: number; label: string }[] = [];
  while ((match = labelPattern.exec(html)) !== null) {
    labels.push({ pos: match.index, label: match[1] });
  }

  for (const { pos, id } of ids) {
    if (files.has(id)) continue;
    // Cari aria-label filename terdekat SETELAH data-id (dalam 3000 char).
    let fileName: string | null = null;
    for (const label of labels) {
      if (label.pos > pos && label.pos - pos < 3000) {
        const cleaned = cleanDriveLabel(label.label);
        if (/\.(png|jpe?g|webp|gif|bmp|svg|pdf)$/i.test(cleaned)) {
          fileName = cleaned;
          break;
        }
      }
    }
    if (!fileName) continue;
    const ext = (fileName.split(".").pop() ?? "").toLowerCase();
    files.set(id, {
      id,
      fileName,
      ext,
      kind: EXT_KIND[ext] ?? "other",
    });
  }

  return Array.from(files.values()).sort((a, b) =>
    a.fileName.localeCompare(b.fileName, undefined, { numeric: true })
  );
}

/* ---------------- Cache + fetch ---------------- */

interface DriveCacheEntry {
  files: DriveFile[];
  fetchedAt: number;
}

let driveCache: DriveCacheEntry | null = null;
let inFlight: Promise<DriveFile[] | null> | null = null;

/** Ambil daftar file dari folder Drive (cache TTL, dedup in-flight). */
export async function fetchDriveFiles(force = false): Promise<DriveFile[] | null> {
  if (!force && driveCache && Date.now() - driveCache.fetchedAt < DRIVE_CACHE_TTL_MS) {
    return driveCache.files;
  }
  if (inFlight) return inFlight;

  inFlight = (async (): Promise<DriveFile[] | null> => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), DRIVE_FETCH_TIMEOUT_MS);
      const response = await fetch(
        `https://drive.google.com/drive/folders/${DRIVE_FOLDER_ID}?usp=sharing`,
        {
          headers: { "User-Agent": BROWSER_UA, "Accept-Language": "en-US,en;q=0.9" },
          signal: controller.signal,
          cache: "no-store",
        }
      );
      clearTimeout(timeout);
      if (!response.ok) return null;
      const html = await response.text();
      const files = parseDriveFolderHtml(html);
      if (files.length === 0) return driveCache?.files ?? null;
      driveCache = { files, fetchedAt: Date.now() };
      return files;
    } catch {
      // Jangan sampai kegagalan Drive mem-break request — null = fallback.
      return driveCache?.files ?? null;
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}

/** Kapan terakhir kali Drive berhasil di-sync (epoch ms). */
export function driveSyncedAt(): number | null {
  return driveCache?.fetchedAt ?? null;
}

/* ---------------- Mapping → Certificate ---------------- */

/** Heuristik kategori dari judul file. */
function inferCategory(title: string): Certificate["category"] {
  const t = title.toLowerCase();
  if (/(machine learning|deep learning|neural|ai\b|tensorflow|data scien)/.test(t)) return "ai";
  if (/(sql|database|data analytic|big data)/.test(t)) return "data";
  if (/(aws|azure|cloud|gcp|devops|docker|kubernetes)/.test(t)) return "cloud";
  if (/(node|express|api|backend|laravel|php|golang)/.test(t)) return "backend";
  return "web";
}

/** Heuristik issuer dari nama file (belum ter-meta). */
function inferIssuer(fileName: string): string {
  const f = fileName.toLowerCase();
  if (/sertifikat_course|dicoding/.test(f)) return "Dicoding Indonesia";
  if (/kaggle/.test(f)) return "Kaggle";
  if (/coursera/.test(f)) return "Coursera";
  if (/aws/.test(f)) return "Amazon Web Services";
  return "Google Drive";
}

/** Judul tampilan dari nama file: buang ekstensi & prefix nama pemilik. */
function titleFromFileName(fileName: string): string {
  const withoutExt = fileName.replace(/\.[^.]+$/, "");
  // Buang prefix "DEARLY FEBRIANO I - " bila ada (nama pemilik sertifikat).
  const stripped = withoutExt.replace(/^[A-Z\s.]+?\s*-\s*/, "").trim();
  const title = stripped || withoutExt;
  return title.replace(/\s+/g, " ");
}

/** URL proxy gambar sertifikat (aman untuk next/image). */
export function driveImageUrl(fileId: string, size: "w400" | "w800" | "w1200" = "w800"): string {
  return `/api/certificates/image?id=${fileId}&sz=${size}`;
}

/** URL halaman Drive untuk membuka file asli. */
export function driveViewUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/view`;
}

/** URL embedded viewer Drive — merender PDF dengan SEMUA halaman
 *  (scroll, zoom, navigasi halaman bawaan Google). Dipakai untuk
 *  preview sertifikat PDF multi-halaman di lightbox. */
export function drivePreviewUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

/**
 * Daftar sertifikat dari Drive, digabung metadata kurated.
 * Urutan: metadata kurated dulu (urutan Drive), lalu file tak
 * dikenal dengan heuristik.
 */
export function driveFilesToCertificates(files: DriveFile[]): Certificate[] {
  return files
    .filter((file) => file.kind === "image" || file.kind === "pdf")
    .map<Certificate>((file) => {
      const fileType = file.kind === "pdf" ? "pdf" : "image";
      const meta = DRIVE_CERT_META[file.id];
      if (meta) {
        return {
          ...meta,
          fileType,
          id: `drive-${file.id}`,
          verifyUrl: driveViewUrl(file.id),
          imageUrl: driveImageUrl(file.id),
        };
      }
      const title = titleFromFileName(file.fileName);
      return {
        id: `drive-${file.id}`,
        title,
        fileType,
        issuer: inferIssuer(file.fileName),
        issueDate: "",
        category: inferCategory(title),
        description: undefined,
        driveFileId: file.id,
        verifyUrl: driveViewUrl(file.id),
        imageUrl: driveImageUrl(file.id),
        source: "drive",
      };
    });
}
