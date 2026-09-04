import { create } from "zustand";
import type { View } from "@/dearlyfebriano/types";

/* ============================================================
 * UI STORE (Zustand) — SPA navigation state + preloader flag.
 * Hash routing (#/projects, #/projects/slug, #notes, #notes/slug,
 * dst) disinkronkan oleh PortfolioApp.tsx.
 * ============================================================ */

interface UIState {
  view: View;
  projectSlug: string | null;
  noteSlug: string | null;
  isPreloaderDone: boolean;
  isMobileMenuOpen: boolean;
  isCommandOpen: boolean;
  /** True setelah hash awal dibaca (mencegah render view salah saat deep-link). */
  isRouterReady: boolean;

  /** User-triggered navigation (juga dipantau PortfolioApp untuk sync hash). */
  navigate: (view: View, detailSlug?: string) => void;
  /** Internal navigation (dari hashchange listener) — tanpa sync ulang. */
  setView: (view: View, detailSlug?: string | null) => void;
  setPreloaderDone: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  setCommandOpen: (open: boolean) => void;
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
  isRouterReady: false,

  navigate: (view, detailSlug) =>
    set((state) => ({
      view,
      ...resolveDetail(view, detailSlug, state),
      isMobileMenuOpen: false,
      isCommandOpen: false,
    })),

  setView: (view, detailSlug) =>
    set((state) => ({
      view,
      ...resolveDetail(view, detailSlug, state),
    })),

  setPreloaderDone: () => set({ isPreloaderDone: true }),

  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),

  setCommandOpen: (open) => set({ isCommandOpen: open }),

  setRouterReady: () => set({ isRouterReady: true }),
}));

/** Helper: convert view state → location hash. */
export function viewToHash(
  view: View,
  projectSlug: string | null,
  noteSlug: string | null
): string {
  if (view === "project-detail" && projectSlug) return `#projects/${projectSlug}`;
  if (view === "note-detail" && noteSlug) return `#notes/${noteSlug}`;
  if (view === "home") return "#/";
  if (view === "not-found") return "#not-found";
  return `#${view}`;
}

/** Helper: parse location hash → view state. */
export function hashToView(hash: string): {
  view: View;
  projectSlug: string | null;
  noteSlug: string | null;
} {
  const clean = hash.replace(/^#\/?/, "").replace(/\/$/, "");
  if (!clean) return { view: "home", projectSlug: null, noteSlug: null };

  const [head, tail] = clean.split("/");
  const views: View[] = [
    "home",
    "about",
    "projects",
    "project-detail",
    "certificates",
    "experience",
    "notes",
    "note-detail",
    "contact",
    "guestbook",
    "not-found",
  ];
  if (head === "projects" && tail) {
    return { view: "project-detail", projectSlug: tail, noteSlug: null };
  }
  if (head === "notes" && tail) {
    return { view: "note-detail", projectSlug: null, noteSlug: tail };
  }
  if (views.includes(head as View)) {
    return { view: head as View, projectSlug: null, noteSlug: null };
  }
  /* Hash tak dikenal (mis. #foobar) → tampilkan view 404 yang elegan. */
  return { view: "not-found", projectSlug: null, noteSlug: null };
}
