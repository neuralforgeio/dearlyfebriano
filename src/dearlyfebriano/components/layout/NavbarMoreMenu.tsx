"use client";

import { useEffect, useRef, useState, type JSX } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import type { View } from "@/dearlyfebriano/types";
import { useUIStore } from "@/dearlyfebriano/store/ui-store";
import { useLanguage } from "@/dearlyfebriano/i18n/language-context";
import { cn } from "@/lib/utils";

/* ============================================================
 * NavbarMoreMenu — dropdown "More" untuk item navigasi sekunder.
 * Hanya tampil di breakpoint lg→xl (di xl semua item nav sudah
 * muat in-flow; di bawah lg navigasi memakai MobileMenu).
 * - Buka/tutup dengan animasi transform+opacity ringan.
 * - Tutup via: pilih item, klik luar, Escape (fokus kembali
 *   ke tombol pemicu).
 * - Navigasi arrow ↑/↓ di dalam menu (pola WAI-ARIA menu).
 * ============================================================ */

interface NavbarMoreMenuProps {
  items: { view: View; label: string }[];
  /** View yang sedang aktif (termasuk pemetaan project/note-detail). */
  activeView: View;
}

export function NavbarMoreMenu({ items, activeView }: NavbarMoreMenuProps): JSX.Element {
  const navigate = useUIStore((s) => s.navigate);
  const { t } = useLanguage();
  const prefersReducedMotion = useReducedMotion();
  const [open, setOpen] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const hasActiveItem = items.some((item) => item.view === activeView);

  /* Tutup saat pointer ditekan di luar menu (capture supaya
   * terpicu sebelum handler klik target lain). */
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent): void => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [open]);

  /* Escape → tutup dan kembalikan fokus ke tombol pemicu. */
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  /* Saat terbuka, pindahkan fokus ke item pertama (pola menu
   * WAI-ARIA) — satu kali, tidak menulis state. */
  useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => {
      listRef.current
        ?.querySelector<HTMLButtonElement>("button")
        ?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(raf);
  }, [open]);

  /* Navigasi arrow ↑/↓ antar item menu. */
  const handleMenuKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const buttons = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>("button") ?? []
    );
    if (buttons.length === 0) return;
    const currentIndex = buttons.findIndex((button) => button === document.activeElement);
    const nextIndex =
      event.key === "ArrowDown"
        ? (currentIndex + 1) % buttons.length
        : (currentIndex - 1 + buttons.length) % buttons.length;
    buttons[nextIndex]?.focus({ preventScroll: true });
  };

  const panelTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.18, ease: "easeOut" as const };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "flex h-11 items-center gap-1 rounded-md px-2.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
          open || hasActiveItem
            ? "font-medium text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        {t("More")}
        <motion.span
          aria-hidden="true"
          initial={false}
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
          className="grid place-items-center"
        >
          <ChevronDown className="size-3.5" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label={t("More")}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={panelTransition}
            onKeyDown={handleMenuKeyDown}
            className="absolute right-0 top-full z-50 mt-2 w-44 origin-top-right rounded-xl border border-border/70 bg-card/95 p-1 shadow-lg shadow-black/10 backdrop-blur-md"
          >
            <ul ref={listRef} className="flex flex-col">
              {items.map((item) => {
                const isActive = item.view === activeView;
                return (
                  <li key={item.view} role="none">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        navigate(item.view);
                        setOpen(false);
                        triggerRef.current?.focus();
                      }}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2",
                        isActive
                          ? "font-medium text-foreground"
                          : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                      )}
                    >
                      <span className="min-w-0 truncate">{t(item.label)}</span>
                      {isActive && (
                        <Check className="size-4 shrink-0 text-primary" aria-hidden="true" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
