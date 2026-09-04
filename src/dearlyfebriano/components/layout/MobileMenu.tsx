"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { NAV_ITEMS } from "@/dearlyfebriano/lib/constants";
import { profile } from "@/dearlyfebriano/data/profile";
import { socialLinks } from "@/dearlyfebriano/data/socialLinks";
import { useUIStore } from "@/dearlyfebriano/store/ui-store";
import { SocialIcon } from "@/dearlyfebriano/components/ui/SocialIcon";
import { LanguageToggle } from "@/dearlyfebriano/components/common/LanguageToggle";
import { useLanguage } from "@/dearlyfebriano/i18n/language-context";
import { cn } from "@/lib/utils";

/* ============================================================
 * MobileMenu — fullscreen overlay navigation (below lg).
 * The trigger (hamburger) lives in Navbar; both communicate
 * through `isMobileMenuOpen` in the zustand UI store.
 * ============================================================ */

export function MobileMenu() {
  const { t } = useLanguage();
  const isOpen = useUIStore((state) => state.isMobileMenuOpen);
  const setMobileMenuOpen = useUIStore((state) => state.setMobileMenuOpen);
  const view = useUIStore((state) => state.view);
  const navigate = useUIStore((state) => state.navigate);

  const prefersReducedMotion = useReducedMotion();
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  /* Body scroll lock + Escape-to-close + focus management. */
  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
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
  const overlayOffset = prefersReducedMotion ? 0 : -20;
  const contentOffset = prefersReducedMotion ? 0 : 24;
  const contentDuration = prefersReducedMotion ? 0 : 0.4;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label={t("Navigation menu")}
          initial={{ opacity: 0, y: overlayOffset }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: overlayOffset }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.3, ease: "easeInOut" }}
          className="fixed inset-0 z-[60] flex flex-col bg-background/95 backdrop-blur-2xl"
        >
          {/* Top bar — mirrors the navbar height & logo */}
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
            <button
              type="button"
              onClick={() => navigate("home")}
              aria-label={t("Go to home")}
              className="flex h-11 items-center font-mono text-lg font-bold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              <span className="text-foreground">dearly</span>
              <span className="text-gradient">febriano</span>
              <span className="text-primary" aria-hidden="true">
                .
              </span>
            </button>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label={t("Close menu")}
              className="grid size-11 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          {/* Links + socials + availability */}
          <nav
            aria-label={t("Mobile navigation")}
            className="flex flex-1 flex-col justify-center overflow-y-auto px-6 py-8 sm:px-10"
          >
            <ul className="flex flex-col gap-1">
              {NAV_ITEMS.map((item, index) => {
                const isActive = item.view === activeView;
                return (
                  <motion.li
                    key={item.view}
                    initial={{ opacity: 0, y: contentOffset }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: prefersReducedMotion ? 0 : 0.05 + index * 0.06,
                      duration: contentDuration,
                      ease: "easeOut",
                    }}
                  >
                    <button
                      type="button"
                      /* navigate() also closes the menu (store behavior). */
                      onClick={() => navigate(item.view)}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "flex h-14 items-center text-2xl font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-4",
                        isActive
                          ? "text-gradient"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {t(item.label)}
                    </button>
                  </motion.li>
                );
              })}
            </ul>

            {/* Socials + availability pill */}
            <motion.div
              initial={{ opacity: 0, y: contentOffset }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: prefersReducedMotion ? 0 : 0.05 + NAV_ITEMS.length * 0.06,
                duration: contentDuration,
                ease: "easeOut",
              }}
              className="mt-10 flex flex-wrap items-center justify-between gap-6"
            >
              <ul className="flex items-center gap-3">
                {socialLinks.map((link) => (
                  <li key={link.icon}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${link.label} (${t("opens in new tab")})`}
                      className="grid size-11 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                      <SocialIcon icon={link.icon} className="size-[18px]" />
                    </a>
                  </li>
                ))}
              </ul>
              <LanguageToggle />
              <p className="inline-flex items-center gap-2.5 rounded-full border border-border/80 bg-card/60 px-4 py-2 text-sm text-muted-foreground">
                <span className="relative flex size-2" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                  <span className="relative inline-flex h-full w-full rounded-full bg-success" />
                </span>
                {t(profile.availability)}
              </p>
            </motion.div>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
