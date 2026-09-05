"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, type JSX } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useUIStore, viewToPath, pathToView, legacyHashToPath } from "@/dearlyfebriano/store/ui-store";
import { PRELOADER_SESSION_KEY } from "@/dearlyfebriano/lib/constants";
import { getViewDescription, getViewTitle } from "@/dearlyfebriano/lib/titles";
import ScrollProgress from "@/dearlyfebriano/components/animations/ScrollProgress";
import Preloader from "@/dearlyfebriano/components/common/Preloader";
import ScrollToTop from "@/dearlyfebriano/components/common/ScrollToTop";
import WhatsAppButton from "@/dearlyfebriano/components/common/WhatsAppButton";
import { Navbar } from "@/dearlyfebriano/components/layout/Navbar";
import { Footer } from "@/dearlyfebriano/components/layout/Footer";
import HomeView from "@/dearlyfebriano/components/sections/HomeView";
import { profile } from "@/dearlyfebriano/data/profile";
import { useLanguage } from "@/dearlyfebriano/i18n/language-context";

/* PERF: Home tetap di-import statis (LCP/SSR), sedangkan SEMUA view
 * lain di-code-split via next/dynamic — chunk JS awal hanya berisi
 * shell + home. View lain (beserta dependency beratnya) diunduh
 * on-demand saat pertama kali dibuka; skeleton loading minimal
 * menjaga UX tetap mulus. CommandPalette & KonamiConfetti juga
 * lazy (cmdk + dialog kit tidak perlu di bundle awal). */
const ViewFallback = (): JSX.Element => {
  const { t } = useLanguage();
  return (
    <div
      role="status"
      aria-label={t("Loading view…")}
      className="mx-auto min-h-[50vh] max-w-6xl animate-pulse px-4 py-20 sm:px-6"
    >
      <div className="mb-4 h-8 w-40 rounded-lg bg-muted" />
      <div className="mb-8 h-4 w-64 rounded bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="h-40 rounded-xl bg-muted" />
        <div className="h-40 rounded-xl bg-muted" />
        <div className="h-40 rounded-xl bg-muted" />
      </div>
    </div>
  );
};

const AboutView = dynamic(() => import("@/dearlyfebriano/components/views/AboutView"), { loading: ViewFallback });
const ProjectsView = dynamic(() => import("@/dearlyfebriano/components/views/ProjectsView"), { loading: ViewFallback });
const ProjectDetailView = dynamic(() => import("@/dearlyfebriano/components/views/ProjectDetailView"), { loading: ViewFallback });
const CertificatesView = dynamic(() => import("@/dearlyfebriano/components/views/CertificatesView"), { loading: ViewFallback });
const ExperienceView = dynamic(() => import("@/dearlyfebriano/components/views/ExperienceView"), { loading: ViewFallback });
const NotesView = dynamic(() => import("@/dearlyfebriano/components/views/NotesView"), { loading: ViewFallback });
const NoteDetailView = dynamic(() => import("@/dearlyfebriano/components/views/NoteDetailView"), { loading: ViewFallback });
const ContactView = dynamic(() => import("@/dearlyfebriano/components/views/ContactView"), { loading: ViewFallback });
const GuestbookView = dynamic(() => import("@/dearlyfebriano/components/views/GuestbookView"), { loading: ViewFallback });
const NotFoundView = dynamic(() => import("@/dearlyfebriano/components/views/NotFoundView"), { loading: ViewFallback });

const CommandPalette = dynamic(() => import("@/dearlyfebriano/components/common/CommandPalette"));
const KonamiConfetti = dynamic(() => import("@/dearlyfebriano/components/common/KonamiConfetti"));
const ShortcutsDialog = dynamic(() => import("@/dearlyfebriano/components/common/ShortcutsDialog"));

/* ============================================================
 * PortfolioApp — root SPA shell milik Dearly Febriano.
 * - REAL path routing (tanpa #): / , /about , /projects ,
 *   /projects/<slug> , /certificates , /experience , /notes ,
 *   /notes/<slug> , /contact , /guestbook. Semua path di-serve
 *   halaman yang sama via rewrites next.config; navigasi client
 *   memakai history.pushState, back/forward via popstate.
 * - Link lama #about/#projects/... di-redirect ke path bersih
 *   sekali saat load (history.replaceState).
 * - Scroll restoration: posisi scroll disimpan ke sessionStorage
 *   per-path → RELOAD kembali ke posisi terakhir; session BARU
 *   (tab/web ditutup → sessionStorage bersih) mulai dari atas;
 *   pindah route = atas; browser Back = kembali ke posisi route itu.
 * - View transitions via AnimatePresence (mode="wait")
 * - Preloader hanya sekali per session (sessionStorage)
 * - Footer selalu menempel di bawah (min-h-screen flex-col)
 * ============================================================ */

/** Key sessionStorage untuk posisi scroll per-path. */
const scrollKey = (path: string): string => `dearlyfebriano:scroll:${path}`;
/** Durasi maksimum menunggu konten cukup tinggi sebelum restore. */
const SCROLL_RESTORE_TIMEOUT_MS = 2400;

/** Kembalikan scroll ke posisi tersimpan untuk `path` — menunggu
 * konten view cukup tinggi (lazy views) sebelum lompat.
 * `force` = true dipakai jalur popstate (SPA back/forward) — selalu
 * coba restore dari key tersimpan. Tanpa force (initial load):
 * hanya restore bila tipe navigasi "reload" (F5) atau
 * "back_forward" — entry "navigate" (user masuk dari luar /
 * typed URL) selalu mulai dari atas + key lama dihapus. */
function restoreScrollPosition(path: string, options?: { force?: boolean }): void {
  if (!options?.force) {
    let entryType = "";
    try {
      const [entry] = performance.getEntriesByType("navigation");
      entryType = (entry as PerformanceNavigationTiming | undefined)?.type ?? "";
    } catch {
      /* Performance API unavailable — fallback: treat as reload. */
      entryType = "reload";
    }
    if (entryType === "navigate") {
      try {
        sessionStorage.removeItem(scrollKey(path));
      } catch {
        /* ignore */
      }
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      return;
    }
  }

  let target = 0;
  try {
    const stored = sessionStorage.getItem(scrollKey(path));
    target = stored ? Number.parseInt(stored, 10) : 0;
  } catch {
    /* sessionStorage unavailable — default top. */
  }
  if (!Number.isFinite(target) || target <= 0) {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    return;
  }
  const startedAt = performance.now();
  const attempt = (): void => {
    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight;
    if (target <= maxScroll || performance.now() - startedAt > SCROLL_RESTORE_TIMEOUT_MS) {
      window.scrollTo({ top: Math.min(target, Math.max(0, maxScroll)), left: 0, behavior: "instant" });
      return;
    }
    requestAnimationFrame(attempt);
  };
  requestAnimationFrame(attempt);
}

export default function PortfolioApp() {
  const view = useUIStore((s) => s.view);
  const projectSlug = useUIStore((s) => s.projectSlug);
  const noteSlug = useUIStore((s) => s.noteSlug);
  const isPreloaderDone = useUIStore((s) => s.isPreloaderDone);
  const setPreloaderDone = useUIStore((s) => s.setPreloaderDone);
  const setView = useUIStore((s) => s.setView);
  const reducedMotion = useReducedMotion();
  const { t } = useLanguage();

  /* Router belum siap sampai hash awal disinkronkan — mencegah HomeView
     ter-mount sesaat saat deep-link (menghilangkan flash + warning LCP). */
  const isRouterReady = useUIStore((s) => s.isRouterReady);
  const setRouterReady = useUIStore((s) => s.setRouterReady);

  /* ---------- Preloader session guard ---------- */
  const seenRef = useRef(false);
  useEffect(() => {
    try {
      if (sessionStorage.getItem(PRELOADER_SESSION_KEY) === "1") {
        seenRef.current = true;
        setPreloaderDone();
      }
    } catch {
      /* sessionStorage unavailable — biarkan preloader tampil */
    }
  }, [setPreloaderDone]);

  const handlePreloaderComplete = useCallback(() => {
    try {
      sessionStorage.setItem(PRELOADER_SESSION_KEY, "1");
    } catch {
      /* ignore */
    }
    setPreloaderDone();
  }, [setPreloaderDone]);

  /* ---------- Path router: pathname → store ----------
   * Sekalian: migrasi link hash lama (#about → /about) via
   * replaceState — link lama yang tersebar tetap hidup. */
  useEffect(() => {
    /* Nonaktifkan restorasi scroll bawaan browser (flaky pada SPA)
     * — kita yang pegang penuh lewat sessionStorage. */
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";

    if (window.location.hash && window.location.hash !== "#main") {
      const migrated = legacyHashToPath(window.location.hash);
      if (migrated && migrated !== "/") {
        history.replaceState(null, "", migrated);
      } else {
        /* Hash kosong / #main (in-page anchor) — cukup buang fragmen. */
        history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    }

    const applyPath = () => {
      const parsed = pathToView(window.location.pathname);
      setView(parsed.view, parsed.projectSlug ?? parsed.noteSlug);
    };

    const parsed = pathToView(window.location.pathname);
    setView(parsed.view, parsed.projectSlug ?? parsed.noteSlug);
    setRouterReady();

    /* RELOAD dalam session yang sama → pulihkan posisi scroll
     * terakhir untuk path ini (session baru → tidak ada data
     * tersimpan → otomatis atas). */
    restoreScrollPosition(window.location.pathname);

    window.addEventListener("popstate", applyPath);
    return () => window.removeEventListener("popstate", applyPath);
  }, [setView, setRouterReady]);

  /* ---------- Store → URL (pushState) + scroll per tipe navigasi ----------
   * Run PERTAMA di-skip: saat load, URL adalah sumber kebenaran —
   * menulis URL dengan nilai stale dari store default akan
   * mem-push entri history ekstra (back button "patah" setelah
   * deep-link reload).
   * Deteksi popstate TANPA ref mutable: bila state berubah TAPI
   * canonical path-nya sudah sama dengan URL aktif, pasti ini
   * sinkronisasi dari popstate (back/forward) → cukup pulihkan
   * posisi scroll route tujuan. Bila beda → navigate user
   * (klik nav/kartu/palette): pushState path baru + scroll ke
   * atas + hapus posisi tersimpan path itu (reload setelah
   * pindah route = mulai bersih dari atas). */
  const didInitialSyncRef = useRef(false);
  useEffect(() => {
    if (!didInitialSyncRef.current) {
      didInitialSyncRef.current = true;
      return;
    }
    const target = viewToPath(view, projectSlug, noteSlug);
    if (!target) return;

    if (target === window.location.pathname) {
      restoreScrollPosition(target, { force: true });
      return;
    }

    window.history.pushState(null, "", target);
    try {
      sessionStorage.removeItem(scrollKey(target));
    } catch {
      /* ignore */
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [view, projectSlug, noteSlug]);

  /* ---------- Scroll saver: simpan posisi ke sessionStorage ----------
   * Throttle ~150ms (murah untuk low-end) + pagehide untuk
   * menangkap posisi terakhir sebelum reload/tutup tab. */
  useEffect(() => {
    let lastSaveAt = 0;
    const save = (): void => {
      try {
        sessionStorage.setItem(
          scrollKey(window.location.pathname),
          String(Math.round(window.scrollY))
        );
      } catch {
        /* ignore — private mode dsb. */
      }
    };
    const onScroll = (): void => {
      const now = performance.now();
      if (now - lastSaveAt < 150) return;
      lastSaveAt = now;
      save();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", save);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", save);
    };
  }, []);

  /* ---------- Dynamic document.title + meta description per view ----------
   * Catatan: React 19 dapat memulihkan <title> SSR saat re-render
   * (head reconciliation) sehingga write imperatif bisa ter-revert.
   * Solusi: re-assert pada frame berikutnya + MutationObserver yang
   * memaksa nilai kembali jika pihak lain mengubah <title>. */
  useEffect(() => {
    const expectedTitle = getViewTitle(view, projectSlug, noteSlug);
    const description = getViewDescription(view, projectSlug, noteSlug);

    const apply = (): void => {
      /* Guard: jangan menulis nilai yang sama — setter document.title
         memicu mutation walau nilainya identik, yang akan memicu
         observer lagi (infinite loop). */
      if (document.title !== expectedTitle) {
        document.title = expectedTitle;
      }
    };
    apply();

    const raf = requestAnimationFrame(apply);

    const titleElement = document.querySelector("title");
    const observer = titleElement
      ? new MutationObserver(apply)
      : null;
    if (titleElement && observer) {
      observer.observe(titleElement, { childList: true, characterData: true, subtree: true });
    }

    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = description;

    /* ---------- Canonical self-referencing + og:url dinamis ----------
     * Halaman yang sama di-serve untuk semua path — canonical statis
     * "/" akan menganggap semua path duplikat root. Suntik canonical
     * yang menunjuk ke path AKTIF (dinamis, dihormati crawler). */
    const canonicalUrl =
      (process.env.NEXT_PUBLIC_SITE_URL || profile.siteUrl) +
      (viewToPath(view, projectSlug, noteSlug) ?? window.location.pathname);
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    if (canonical.href !== canonicalUrl) canonical.href = canonicalUrl;
    let ogUrl = document.querySelector<HTMLMetaElement>('meta[property="og:url"]');
    if (ogUrl && ogUrl.content !== canonicalUrl) ogUrl.content = canonicalUrl;

    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
    };
  }, [view, projectSlug, noteSlug]);

  /* ---------- Render current view ---------- */
  const renderView = () => {
    switch (view) {
      case "home":
        return <HomeView />;
      case "about":
        return <AboutView />;
      case "projects":
        return <ProjectsView />;
      case "project-detail":
        return <ProjectDetailView />;
      case "certificates":
        return <CertificatesView />;
      case "experience":
        return <ExperienceView />;
      case "notes":
        return <NotesView />;
      case "note-detail":
        return <NoteDetailView />;
      case "contact":
        return <ContactView />;
      case "guestbook":
        return <GuestbookView />;
      case "not-found":
        return <NotFoundView />;
      default:
        return <HomeView />;
    }
  };

  const viewKey =
    view === "project-detail"
      ? `project-${projectSlug ?? "none"}`
      : view === "note-detail"
        ? `note-${noteSlug ?? "none"}`
        : view;

  const transition = reducedMotion
    ? { duration: 0.01 }
    : { duration: 0.35, ease: "easeOut" as const };

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip bg-background text-foreground">
      {/* Skip to content (a11y) */}
      <a href="#main" className="skip-link">
        {t("Skip to content")}
      </a>

      <ScrollProgress />
      <CommandPalette />
      <ShortcutsDialog />
      <KonamiConfetti />

      {/* Preloader — sekali per session */}
      <AnimatePresence>
        {!isPreloaderDone && <Preloader onComplete={handlePreloaderComplete} />}
      </AnimatePresence>

      <Navbar />

      <main id="main" className="flex-1">
        {isRouterReady ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={viewKey}
              /* `relative` — framer-motion butuh container berposisi
                 non-static untuk kalkulasi offset whileInView anak-anak
                 view selama transisi (menghindari warning console). */
              className="relative"
              initial={{ opacity: 0, y: reducedMotion ? 0 : 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reducedMotion ? 0 : -12 }}
              transition={transition}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        ) : (
          /* Placeholder sebelum hash awal dibaca — menjaga footer tetap
             di bawah dan mencegah flash view yang salah. */
          <div aria-hidden="true" className="min-h-[60vh]" />
        )}
      </main>

      <Footer />

      <WhatsAppButton />
      <ScrollToTop />
    </div>
  );
}
