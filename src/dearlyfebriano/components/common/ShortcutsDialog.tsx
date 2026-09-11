"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Keyboard, Sparkles, X } from "lucide-react";
import { useEffect, useRef, type JSX } from "react";
import { useUIStore } from "@/dearlyfebriano/store/ui-store";
import { useLanguage } from "@/dearlyfebriano/i18n/language-context";
import { cn } from "@/lib/utils";

/* ============================================================
 * ShortcutsDialog — cheatsheet semua keyboard shortcut site
 * dalam satu tempat (rekomendasi worklog ronde sebelumnya).
 * Buka: tombol "?" saat tidak mengetik, atau action "Keyboard
 * shortcuts" di CommandPalette. Escape / klik backdrop / tombol X
 * menutup. Semua key di-render sebagai keycap (utility .kbd).
 * ============================================================ */

interface ShortcutRow {
  /** Deskripsi aksi (di-translate via t()). */
  label: string;
  /** Deretan keycap yang ditampilkan. */
  keys: string[];
}

interface ShortcutGroup {
  /** Judul grup (di-translate). */
  title: string;
  /** Ikon kecil di samping judul grup. */
  icon: "global" | "gallery" | "egg";
  rows: ShortcutRow[];
}

/** True bila fokus sedang berada di elemen input — jangan intercept key. */
function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return (
    tag === "input" ||
    tag === "textarea" ||
    tag === "select" ||
    target.isContentEditable
  );
}

const GROUP_ICON = {
  global: Keyboard,
  gallery: Sparkles,
  egg: Sparkles,
} as const;

function KeyCap({ children }: { children: string }): JSX.Element {
  return <kbd className="kbd">{children}</kbd>;
}

export default function ShortcutsDialog(): JSX.Element {
  const isOpen = useUIStore((s) => s.isShortcutsOpen);
  const setOpen = useUIStore((s) => s.setShortcutsOpen);
  const reducedMotion = useReducedMotion();
  const { t } = useLanguage();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  /* ---------- Shortcut global: "?" toggle (saat tidak mengetik) ---------- */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "?" || event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;
      event.preventDefault();
      setOpen(!useUIStore.getState().isShortcutsOpen);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setOpen]);

  /* ---------- Scroll lock + focus management + Escape ---------- */
  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      previouslyFocused?.focus();
    };
  }, [isOpen, setOpen]);

  const isMac =
    typeof navigator !== "undefined" &&
    /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent);

  const groups: ShortcutGroup[] = [
    {
      title: t("Global"),
      icon: "global",
      rows: [
        { label: t("Open command palette"), keys: [isMac ? "⌘" : "Ctrl", "K"] },
        { label: t("Toggle this shortcuts panel"), keys: ["?"] },
        { label: t("Close any overlay"), keys: ["Esc"] },
      ],
    },
    {
      title: t("Project gallery"),
      icon: "gallery",
      rows: [
        { label: t("Open the gallery from a project page"), keys: ["G"] },
        { label: t("Previous image"), keys: ["←"] },
        { label: t("Next image"), keys: ["→"] },
      ],
    },
    {
      title: t("Easter egg"),
      icon: "egg",
      rows: [
        {
          label: t("Konami code — confetti rain"),
          keys: ["↑", "↑", "↓", "↓", "←", "→", "←", "→", "B", "A"],
        },
      ],
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-background/95 p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={t("Keyboard shortcuts")}
        >
          <motion.div
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            onClick={(event) => event.stopPropagation()}
            className="card-surface relative w-full max-w-md overflow-hidden rounded-xl border border-border shadow-2xl "
          >
            {/* Aksen gradient tipis di tepi atas — konsisten tema site. */}
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent"
            />

            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
                  <Keyboard className="size-4" aria-hidden />
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-foreground">
                    {t("Keyboard shortcuts")}
                  </h2>
                  <p className="eyebrow">
                    {t("Move faster, look cooler")}
                  </p>
                </div>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                aria-label={t("Close preview")}
                onClick={() => setOpen(false)}
                className="grid size-8 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground/25 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>

            {/* Body — daftar grup shortcut */}
            <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
              {groups.map((group, groupIndex) => {
                const GroupIcon = GROUP_ICON[group.icon];
                return (
                  <section
                    key={group.title}
                    className={cn(groupIndex > 0 && "mt-5")}
                    aria-label={group.title}
                  >
                    <h3 className="flex items-center gap-2 eyebrow">
                      <GroupIcon className="size-3 text-primary" aria-hidden />
                      {group.title}
                    </h3>
                    <ul className="mt-2.5 space-y-1">
                      {group.rows.map((row, rowIndex) => (
                        <motion.li
                          key={row.label}
                          initial={reducedMotion ? undefined : { opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.25,
                            delay: 0.06 + groupIndex * 0.08 + rowIndex * 0.04,
                            ease: "easeOut",
                          }}
                          className="flex items-center justify-between gap-4 rounded-lg px-2.5 py-2 transition-colors hover:bg-secondary"
                        >
                          <span className="text-sm text-foreground/90">{row.label}</span>
                          <span className="flex shrink-0 flex-wrap items-center justify-end gap-1">
                            {/* Index dipakai dalam key: Konami punya keycap
                                duplikat (↑↑↓↓←→←→) — key React harus unik. */}
                            {row.keys.map((key, keyIndex) => (
                              <KeyCap key={`${keyIndex}-${key}`}>{key}</KeyCap>
                            ))}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>

            {/* Footer hint */}
            <div className="border-t border-border px-5 py-3">
              <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-center font-mono text-[11px] text-muted-foreground">
                {t("Press")}
                <KeyCap>?</KeyCap>
                {t("anytime to reopen this panel")}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
