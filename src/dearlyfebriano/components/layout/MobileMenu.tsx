"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { NAV_ITEMS } from "@/dearlyfebriano/lib/constants";
import { profile } from "@/dearlyfebriano/data/profile";
import { socialLinks } from "@/dearlyfebriano/data/socialLinks";
import { useUIStore } from "@/dearlyfebriano/store/ui-store";
import { SocialIcon } from "@/dearlyfebriano/components/ui/SocialIcon";
import { LogoMark } from "@/dearlyfebriano/components/ui/LogoMark";
import { LanguageToggle } from "@/dearlyfebriano/components/common/LanguageToggle";
import { ThemeToggle } from "@/dearlyfebriano/components/layout/ThemeToggle";
import { useLanguage } from "@/dearlyfebriano/i18n/language-context";
import { cn } from "@/lib/utils";

/* ============================================================
 * MobileMenu — drawer geser dari KANAN (di bawah lg).
 * Redesign v2 (permintaan user: "sidebar mobile lebih menarik"):
 * - Backdrop gelap (klik untuk tutup) + panel drawer solid
 *   dengan garis gradient di tepi kiri (tanpa backdrop-filter
 *   pada elemen beranimasi — hemat GPU).
 * - Header: monogram DF + nama + role + tombol tutup.
 * - List navigasi: tile ikon + label + nomor indeks mono,
 *   item aktif = rail gradient kiri + tile primary.
 * - Footer: LanguageToggle + ThemeToggle, socials, pill
 *   availability.
 * - A11y: role=dialog/aria-modal, focus-trap Tab, Escape,
 *   body scroll lock, fokus kembali ke trigger saat tutup.
 * Trigger (hamburger) hidup di Navbar; keduanya komunikasi
 * via `isMobileMenuOpen` di zustand UI store.
 * ============================================================ */

export function MobileMenu() {
  const { t } = useLanguage();
  const isOpen = useUIStore((state) => state.isMobileMenuOpen);
  const setMobileMenuOpen = useUIStore((state) => state.setMobileMenuOpen);
  const view = useUIStore((state) => state.view);
  const navigate = useUIStore((state) => state.navigate);

  const prefersReducedMotion = useReducedMotion();
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  /* Body scroll lock + Escape/Tab handling + focus management. */
  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
        return;
      }
      /* Focus trap sederhana — Tab/Shift+Tab berputar di dalam drawer. */
      if (event.key === "Tab" && drawerRef.current) {
        const focusables = drawerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (!drawerRef.current.contains(active)) {
          event.preventDefault();
          first.focus();
        } else if (event.shiftKey && active === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    // Move focus to the close button once the overlay is committed.
    const focusTimer = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 0);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [isOpen, setMobileMenuOpen]);

  const activeView =
    view === "project-detail"
      ? "projects"
      : view === "note-detail"
        ? "notes"
        : view;

  const drawerVariants = {
    initial: { x: prefersReducedMotion ? 0 : "100%" },
    animate: { x: 0 },
    exit: { x: prefersReducedMotion ? 0 : "100%" },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          {/* Backdrop — klik untuk tutup (dim tanpa blur: murah di GPU). */}
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.25 }}
            onClick={() => setMobileMenuOpen(false)}
            className="absolute inset-0 bg-black/60"
          />

          {/* Drawer panel */}
          <motion.div
            id="mobile-menu"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label={t("Navigation menu")}
            initial={drawerVariants.initial}
            animate={drawerVariants.animate}
            exit={drawerVariants.exit}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 380, damping: 40 }
            }
            className="absolute inset-y-0 right-0 flex w-[20rem] max-w-[86vw] flex-col border-l border-border bg-background shadow-2xl"
          >
            {/* Garis gradient di tepi kiri — aksen khas portfolio. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-[#6366f1] via-[#8b5cf6] to-[#a78bfa]"
            />

            {/* Header — monogram DF + nama + role + tombol tutup */}
            <div className="flex items-center gap-3 border-b border-border/70 px-4 py-4">
              <button
                type="button"
                onClick={() => navigate("home")}
                aria-label={t("Go to home")}
                className="flex shrink-0 items-center rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                <LogoMark className="transition-transform duration-200 hover:scale-105 active:scale-95" />
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-sm font-bold leading-tight tracking-tight">
                  <span className="text-foreground">dearly</span>
                  <span className="text-gradient">febriano</span>
                </p>
                <p className="truncate text-[11px] leading-tight text-muted-foreground">
                  {profile.roles[0]}
                </p>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label={t("Close menu")}
                className="grid size-10 shrink-0 place-items-center rounded-full border border-border/70 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            {/* Nav list */}
            <nav
              aria-label={t("Mobile navigation")}
              className="flex-1 overflow-y-auto px-3 py-4"
            >
              <p
                aria-hidden="true"
                className="px-3 pb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60"
              >
                {t("Menu")}
              </p>
              <ul className="flex flex-col gap-1">
                {NAV_ITEMS.map((item, index) => {
                  const isActive = item.view === activeView;
                  const Icon = item.icon;
                  return (
                    <motion.li
                      key={item.view}
                      initial={{ opacity: 0, x: prefersReducedMotion ? 0 : 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: prefersReducedMotion ? 0 : 0.08 + index * 0.045,
                        duration: prefersReducedMotion ? 0 : 0.25,
                        ease: "easeOut",
                      }}
                    >
                      <button
                        type="button"
                        /* navigate() also closes the menu (store behavior). */
                        onClick={() => navigate(item.view)}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "group relative flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
                          isActive
                            ? "bg-secondary/70"
                            : "hover:bg-secondary/40"
                        )}
                      >
                        {/* Rail gradient kiri — penanda item aktif */}
                        {isActive && (
                          <span
                            aria-hidden="true"
                            className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-gradient-accent"
                          />
                        )}
                        <span
                          className={cn(
                            "grid size-9 shrink-0 place-items-center rounded-lg border transition-colors",
                            isActive
                              ? "border-primary/50 bg-primary/10 text-primary"
                              : "border-border/70 bg-card/60 text-muted-foreground group-hover:text-foreground"
                          )}
                        >
                          <Icon className="size-[17px]" aria-hidden="true" />
                        </span>
                        <span
                          className={cn(
                            "flex-1 truncate text-left text-[15px]",
                            isActive
                              ? "font-semibold text-foreground"
                              : "font-medium text-muted-foreground group-hover:text-foreground"
                          )}
                        >
                          {t(item.label)}
                        </span>
                        <span
                          aria-hidden="true"
                          className={cn(
                            "font-mono text-[10px] tabular-nums",
                            isActive
                              ? "text-primary"
                              : "text-muted-foreground/40"
                          )}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </button>
                    </motion.li>
                  );
                })}
              </ul>
            </nav>

            {/* Footer — toggles + socials + availability */}
            <div className="space-y-4 border-t border-border/70 px-4 py-4">
              <div className="flex items-center justify-between gap-2">
                <LanguageToggle />
                <ThemeToggle />
              </div>
              <ul className="flex items-center gap-2">
                {socialLinks.map((link) => (
                  <li key={link.icon}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${link.label} (${t("opens in new tab")})`}
                      className="grid size-9 place-items-center rounded-full border border-border/70 text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                      <SocialIcon icon={link.icon} className="size-[16px]" />
                    </a>
                  </li>
                ))}
              </ul>
              <p className="flex items-center justify-center gap-2.5 rounded-full border border-border/80 bg-card/60 px-4 py-2 text-xs text-muted-foreground">
                <span className="relative flex size-2 shrink-0" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                  <span className="relative inline-flex h-full w-full rounded-full bg-success" />
                </span>
                <span className="truncate">{t(profile.availability)}</span>
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
