"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { DICT_VERSION, TRANSLATABLE_STRINGS } from "./strings";

/* ============================================================
 * LANGUAGE CONTEXT — dua bahasa: English (default) & Indonesia.
 * ------------------------------------------------------------
 * - Bahasa default English sesuai permintaan owner.
 * - Terjemahan Indonesia dihasilkan OTOMATIS oleh library
 *   (google-translate-api-x) lewat /api/translate — tidak ada
 *   penerjemahan manual per kalimat.
 * - Hasil diterjemahkan per-chunk (progressive) dan di-cache
 *   di localStorage + cache memory server, jadi kunjungan
 *   berikutnya instan tanpa request tambahan.
 * - String yang belum/b gagal diterjemahkan → fallback English.
 * ============================================================ */

export type Language = "en" | "id";

const LANG_STORAGE_KEY = "dearlyfebriano:lang";
const DICT_STORAGE_KEY = `dearlyfebriano:dict:id:v${DICT_VERSION}`;

/** Budget karakter per request translate (menjaga durasi
 *  serverless function tetap pendek, aman untuk Vercel). */
const CHUNK_CHAR_BUDGET = 3000;
/** Maksimum jumlah string per request. */
const CHUNK_MAX_ITEMS = 40;

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  /** t("English text") → teks terjemahan (fallback: English). */
  t: (text: string) => string;
  /** true saat kamus Indonesia sedang diambil (progressive). */
  loading: boolean;
  /** Progres penerjemahan (untuk indikator opsional). */
  progress: { translated: number; total: number };
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readCachedDict(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(DICT_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function writeCachedDict(dict: Record<string, string>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DICT_STORAGE_KEY, JSON.stringify(dict));
  } catch {
    /* localStorage penuh / private mode → abaikan. */
  }
}

/** Bagi string menjadi chunk kecil (budget karakter + jumlah item). */
function chunkStrings(strings: string[]): string[][] {
  const chunks: string[][] = [];
  let current: string[] = [];
  let size = 0;
  for (const text of strings) {
    const cost = Math.max(text.length, 32);
    if (current.length >= CHUNK_MAX_ITEMS || (size + cost > CHUNK_CHAR_BUDGET && current.length > 0)) {
      chunks.push(current);
      current = [];
      size = 0;
    }
    current.push(text);
    size += cost;
  }
  if (current.length > 0) chunks.push(current);
  return chunks;
}

function countTranslated(dict: Record<string, string>): number {
  let count = 0;
  for (const text of TRANSLATABLE_STRINGS) {
    if (dict[text] !== undefined) count += 1;
  }
  return count;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");
  const [dict, setDict] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [total] = useState(() => TRANSLATABLE_STRINGS.length);
  const [translated, setTranslated] = useState(0);
  /** Token untuk membatalkan loop fetch yang basi (switch cepat). */
  const loadToken = useRef(0);

  /* Restore bahasa tersimpan (post-hydration, aman untuk SSR).
   * setState dijalankan lewat macrotask callback — bukan sinkron
   * di body effect — supaya tidak memicu cascading render
   * (react-hooks/set-state-in-effect). */
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(LANG_STORAGE_KEY);
        if (saved === "id" || saved === "en") setLangState(saved);
      } catch {
        /* abaikan */
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  /* Sinkronkan atribut <html lang> untuk aksesibilitas. */
  useEffect(() => {
    document.documentElement.lang = lang === "id" ? "id" : "en";
  }, [lang]);

  /* Muat kamus Indonesia (progressive per chunk) saat dibutuhkan.
   * Seluruh setState berjalan di dalam callback (macrotask /
   * async loop) — tidak sinkron di body effect. */
  useEffect(() => {
    if (lang !== "id") return;
    const token = ++loadToken.current;

    const timer = window.setTimeout(() => {
      const cached = readCachedDict();
      setDict(cached);
      const missing = TRANSLATABLE_STRINGS.filter((text) => !(text in cached));
      setTranslated(countTranslated(cached));

      if (missing.length === 0) return;

      setLoading(true);
      let merged: Record<string, string> = { ...cached };

      void (async () => {
        for (const chunk of chunkStrings(missing)) {
          if (loadToken.current !== token) return;
          try {
            const response = await fetch("/api/translate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ strings: chunk }),
            });
            if (!response.ok) continue; // chunk gagal → tetap English untuk string itu
            const data = (await response.json()) as { translations?: Record<string, string> };
            if (data.translations && Object.keys(data.translations).length > 0) {
              merged = { ...merged, ...data.translations };
              setDict({ ...merged });
              setTranslated(countTranslated(merged));
              writeCachedDict(merged);
            }
          } catch {
            /* chunk gagal (offline/dll) → lanjut chunk berikutnya. */
          }
        }
        if (loadToken.current === token) setLoading(false);
      })();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [lang]);

  const setLang = useCallback((next: Language) => {
    setLangState(next);
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, next);
    } catch {
      /* abaikan */
    }
  }, []);

  const t = useCallback(
    (text: string) => (lang === "id" ? dict[text] ?? text : text),
    [lang, dict]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, loading, progress: { translated, total } }}>
      {children}
    </LanguageContext.Provider>
  );
}

/** Hook akses bahasa — wajib dipakai di dalam <LanguageProvider>. */
export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    /* Fallback aman (tanpa provider): English murni. */
    return {
      lang: "en",
      setLang: () => undefined,
      t: (text) => text,
      loading: false,
      progress: { translated: 0, total: 0 },
    };
  }
  return context;
}
