import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

/* ============================================================
 * MESSAGE STORE — pengganti Prisma/SQLite.
 * ------------------------------------------------------------
 * Guestbook + Contact messages disimpan ke satu file JSON
 * (`data/messages.json`, di-gitignore) sehingga repo TIDAK
 * memerlukan folder prisma/ sama sekali — build Vercel pun
 * jadi jauh lebih ringan (tanpa prisma generate).
 *
 * Mode penyimpanan:
 *  1. FILE (default, local dev)  → data/messages.json di
 *     project root. Write atomik (tmp + rename).
 *  2. MEMORY (Vercel / FS read-only) → fallback otomatis:
 *     pesan hidup selama instance serverless aktif.
 *
 * Bentuk data 100% kompatibel dengan API lama (Prisma):
 * id / name / message / createdAt (ISO string) dst, sehingga
 * response API tidak berubah sama sekali.
 * ============================================================ */

export interface StoredGuestbookEntry {
  id: string;
  name: string;
  message: string;
  createdAt: string; // ISO 8601
}

export interface StoredContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  emailed: boolean;
  createdAt: string; // ISO 8601
}

interface StoreData {
  guestbook: StoredGuestbookEntry[];
  contact: StoredContactMessage[];
}

const EMPTY_DATA: StoreData = { guestbook: [], contact: [] };

/** Lokasi file store — relatif terhadap project root. */
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "messages.json");

/**
 * State global (disimpan di globalThis agar tetap hidup melewati
 * HMR saat dev dan di-share antar request pada satu instance).
 */
interface GlobalStore {
  data: StoreData | null;
  /** false setelah write pertama gagal → mode memory-only. */
  fileMode: boolean;
}

const globalStore = globalThis as unknown as { __dfMessageStore?: GlobalStore };
const store: GlobalStore =
  globalStore.__dfMessageStore ??
  (globalStore.__dfMessageStore = { data: null, fileMode: true });

/* ---------------------------- internals ---------------------------- */

function newId(): string {
  return randomUUID();
}

function toIso(value: number | string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

async function readFileStore(): Promise<StoreData> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Partial<StoreData>;
    return {
      guestbook: Array.isArray(parsed.guestbook) ? parsed.guestbook : [],
      contact: Array.isArray(parsed.contact) ? parsed.contact : [],
    };
  } catch {
    /* File belum ada / rusak → mulai dari kosong. */
    return { ...EMPTY_DATA };
  }
}

async function writeFileStore(data: StoreData): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${DATA_FILE}.${newId()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf-8");
  await fs.rename(tmp, DATA_FILE);
}

/** Muat state sekali (lazy) — file mode bila memungkinkan. */
async function getState(): Promise<StoreData> {
  if (store.data) return store.data;
  if (store.fileMode) {
    store.data = await readFileStore();
  } else {
    store.data = { ...EMPTY_DATA };
  }
  return store.data;
}

/** Simpan ke memory + file (fallback memory bila FS read-only). */
async function persist(next: StoreData): Promise<void> {
  store.data = next;
  if (!store.fileMode) return;
  try {
    await writeFileStore(next);
  } catch {
    /* FS tidak bisa ditulis (mis. Vercel read-only) → memory-only. */
    store.fileMode = false;
  }
}

function clampTake(take: number | undefined, fallback: number): number {
  if (typeof take !== "number" || !Number.isFinite(take) || take <= 0) return fallback;
  return Math.min(Math.floor(take), 500);
}

/* ------------------------------ public ------------------------------ */

export const messageStore = {
  /** 50 pesan guestbook terbaru (desc). */
  async listGuestbook(take = 50): Promise<StoredGuestbookEntry[]> {
    const data = await getState();
    return [...data.guestbook]
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .slice(0, clampTake(take, 50));
  },

  /** 50 pesan contact terbaru (desc). */
  async listContact(take = 50): Promise<StoredContactMessage[]> {
    const data = await getState();
    return [...data.contact]
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .slice(0, clampTake(take, 50));
  },

  async addGuestbook(input: { name: string; message: string }): Promise<StoredGuestbookEntry> {
    const data = await getState();
    const entry: StoredGuestbookEntry = {
      id: newId(),
      name: input.name,
      message: input.message,
      createdAt: new Date().toISOString(),
    };
    await persist({ ...data, guestbook: [entry, ...data.guestbook] });
    return entry;
  },

  async addContact(input: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<StoredContactMessage> {
    const data = await getState();
    const entry: StoredContactMessage = {
      id: newId(),
      name: input.name,
      email: input.email,
      subject: input.subject,
      message: input.message,
      emailed: false,
      createdAt: new Date().toISOString(),
    };
    await persist({ ...data, contact: [entry, ...data.contact] });
    return entry;
  },

  async markContactEmailed(id: string): Promise<void> {
    const data = await getState();
    const exists = data.contact.some((m) => m.id === id);
    if (!exists) return;
    await persist({
      ...data,
      contact: data.contact.map((m) => (m.id === id ? { ...m, emailed: true } : m)),
    });
  },

  async deleteGuestbook(id: string): Promise<boolean> {
    const data = await getState();
    const exists = data.guestbook.some((e) => e.id === id);
    if (!exists) return false;
    await persist({ ...data, guestbook: data.guestbook.filter((e) => e.id !== id) });
    return true;
  },

  async deleteContact(id: string): Promise<boolean> {
    const data = await getState();
    const exists = data.contact.some((m) => m.id === id);
    if (!exists) return false;
    await persist({ ...data, contact: data.contact.filter((m) => m.id !== id) });
    return true;
  },
};

/** Dipakai skrip migrasi (seed awal dari SQLite lama). */
export async function seedStore(seed: StoreData): Promise<void> {
  await persist(seed);
}
