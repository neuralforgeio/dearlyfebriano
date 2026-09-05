import { create } from "zustand";
import type { View } from "@/dearlyfebriano/types";

/* ============================================================
 * UI STORE (Zustand) — SPA navigation state + preloader flag.
 * Path routing REAL (tanpa #): /about, /projects, /projects/slug,
 * /notes/slug, dst — disinkronkan oleh PortfolioApp.tsx via
 * history.pushState + popstate. Semua path di-serve page yang
 * sama lewat rewrites next.config (afterFiles) sehingga URL
 * bersih & shareable tanpa file route tambahan.
 * ============================================================ */

interface UIState {
  view: View;
  projectSlug: string | null;
  noteSlug: string | null;
  isPreloaderDone: boolean;
  isMobileMenuOpen: boolean;
  isCommandOpen: boolean;
  /** Dialog cheatsheet keyboard shortcuts — buka via tombol "?". */
  isShortcutsOpen: boolean;
  /** True setelah path awal dibaca (mencegah render view salah saat deep-link). */
  isRouterReady: boolean;

  /** User-triggered navigation (dipantau PortfolioApp untuk pushState path). */
  navigate: (view: View, detailSlug?: string) => void;
  /** Internal navigation (dari popstate listener) — tanpa push ulang. */
  setView: (view: View, detailSlug?: string | null) => void;
  setPreloaderDone: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  setCommandOpen: (open: boolean) => void;
  setShortcutsOpen: (open: boolean) => void;
  setRouterReady: () => void;
}

const resolveDetail = (
  view: View,
  detailSlug: string | null | undefined,
  state: { projectSlug: string | null; noteSlug: string | null }
): { projectSlug: string | null; noteSlug: string | null } => {
  if (view === "project-detail") {
    return { projectSlug: detailSlug ?? state.projectSlug, noteSlug: null };
  }
  if (view === "note-detail") {
    return { projectSlug: null, noteSlug: detailSlug ?? state.noteSlug };
  }
  return { projectSlug: null, noteSlug: null };
};

export const useUIStore = create<UIState>((set) => ({
  view: "home",
  projectSlug: null,
  noteSlug: null,
  isPreloaderDone: false,
  isMobileMenuOpen: false,
  isCommandOpen: false,
  isShortcutsOpen: false,
  isRouterReady: false,

  navigate: (view, detailSlug) =>
    set((state) => ({
      view,
      ...resolveDetail(view, detailSlug, state),
      isMobileMenuOpen: false,
      isCommandOpen: false,
      isShortcutsOpen: false,
    })),

  setView: (view, detailSlug) =>
    set((state) => ({
      view,
      ...resolveDetail(view, detailSlug, state),
    })),

  setPreloaderDone: () => set({ isPreloaderDone: true }),

  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),

  setCommandOpen: (open) => set({ isCommandOpen: open }),

  setShortcutsOpen: (open) => set({ isShortcutsOpen: open }),

  setRouterReady: () => set({ isRouterReady: true }),
}));

/** Helper: convert view state → REAL path (tanpa #).
 * Mengembalikan null untuk view yang tidak punya URL sendiri
 * ("not-found" hanya dihasilkan dari parse path, tidak pernah
 * di-push). */
export function viewToPath(
  view: View,
  projectSlug: string | null,
  noteSlug: string | null
): string | null {
  if (view === "project-detail" && projectSlug) return `/projects/${projectSlug}`;
  if (view === "note-detail" && noteSlug) return `/notes/${noteSlug}`;
  if (view === "home") return "/";
  /* View internal tanpa URL canonical — tidak pernah di-push. */
  if (view === "not-found" || view === "project-detail" || view === "note-detail") {
    return null;
  }
  return `/${view}`;
}

/** Helper: parse REAL path → view state. */
export function pathToView(pathname: string): {
  view: View;
  projectSlug: string | null;
  noteSlug: string | null;
} {
  const clean = pathname.replace(/\/+$/, "");
  if (!clean || clean === "") return { view: "home", projectSlug: null, noteSlug: null };

  const segments = clean.split("/").filter(Boolean);
  const [head, tail] = segments;

  if (head === "projects" && tail) {
    return { view: "project-detail", projectSlug: decodeURIComponent(tail), noteSlug: null };
  }
  if (head === "notes" && tail) {
    return { view: "note-detail", projectSlug: null, noteSlug: decodeURIComponent(tail) };
  }
  const views: View[] = [
    "home",
    "about",
    "projects",
    "certificates",
    "experience",
    "notes",
    "contact",
    "guestbook",
    "not-found",
  ];
  if (views.includes(head as View)) {
    return { view: head as View, projectSlug: null, noteSlug: null };
  }
  /* Path tak dikenal (mis. /foobar) → tampilkan view 404 yang elegan. */
  return { view: "not-found", projectSlug: null, noteSlug: null };
}

/* ============================================================
 * LEGACY HASH → PATH (kompatibilitas link lama #about, #/projects)
 * Dipakai PortfolioApp saat load untuk redirect sekali.
 * ============================================================ */

/** Parse hash lama → path baru. null bila hash bukan route SPA. */
export function legacyHashToPath(hash: string): string | null {
  const raw = hash.replace(/^#/, "");
  if (!raw || raw === "/") return "/";
  const parsed = pathToView("/" + raw.replace(/^\/+/, ""));
  const mapped = viewToPath(parsed.view, parsed.projectSlug, parsed.noteSlug);
  return mapped ?? "/";
}
