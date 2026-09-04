"use client";

import { useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  type Transition,
} from "framer-motion";
import { Menu, Search } from "lucide-react";
import { NAV_ITEMS } from "@/dearlyfebriano/lib/constants";
import { socialLinks } from "@/dearlyfebriano/data/socialLinks";
import { useUIStore } from "@/dearlyfebriano/store/ui-store";
import { useLanguage } from "@/dearlyfebriano/i18n/language-context";
import { SocialIcon } from "@/dearlyfebriano/components/ui/SocialIcon";
import { LanguageToggle } from "@/dearlyfebriano/components/common/LanguageToggle";
import { cn } from "@/lib/utils";
import { MobileMenu } from "./MobileMenu";
import { NavbarMoreMenu } from "./NavbarMoreMenu";
import { ThemeToggle } from "./ThemeToggle";

/* ============================================================
 * Navbar — fixed top navigation (store-based SPA navigation).
 * - Transparent at the very top; blurred + condensed after
 *   scrolling past 24px.
 * - Hides on scroll down, reveals on scroll up, always visible
 *   near the top. Respects prefers-reduced-motion (stays put).
 * - Layout IN-FLOW (3 zona: logo / links / actions) — link nav
 *   tidak pernah absolute sehingga mustahil menimpa zona aksi
 *   kanan (bug lama: Contact menimpa toggle). Pada lg→xl item
 *   sekunder lipat ke dropdown "More"; di xl+ semua tampil.
 * ============================================================ */

/** Past this scroll offset the bar gets its scrolled treatment. */
const SCROLLED_THRESHOLD = 24;
/** Below this scroll offset the bar is always visible. */
const SHOW_NEAR_TOP = 100;
/** Dead zone (px) so tiny scroll jitter does not flip visibility. */
const DIRECTION_DEAD_ZONE = 4;

/** Item yang SELALU tampil di navbar lg+ (perjalanan utama user). */
const PRIMARY_VIEWS = new Set(["home", "about", "projects", "contact"]);
/** Item sekunder — in-flow mulai xl, dilipat ke "More" pada lg→xl. */
const OVERFLOW_ITEMS = NAV_ITEMS.filter((item) => !PRIMARY_VIEWS.has(item.view));

export function Navbar() {
  const view = useUIStore((state) => state.view);
  const navigate = useUIStore((state) => state.navigate);
  const isMobileMenuOpen = useUIStore((state) => state.isMobileMenuOpen);
  const setMobileMenuOpen = useUIStore((state) => state.setMobileMenuOpen);
  const setCommandOpen = useUIStore((state) => state.setCommandOpen);
  const { t } = useLanguage();

  /* Keycap label platform-aware (⌘ di Apple, Ctrl di lainnya). */
  const isMac =
    typeof navigator !== "undefined" &&
    /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent);

  const prefersReducedMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    setScrolled(latest > SCROLLED_THRESHOLD);

    // Reduced motion: keep the bar fully functional but always visible.
    if (prefersReducedMotion) {
      setHidden(false);
      return;
    }

    // Always show near the top of the page.
    if (latest < SHOW_NEAR_TOP) {
      setHidden(false);
      return;
    }

    // Hide on scroll down, reveal on scroll up.
    if (latest > previous + DIRECTION_DEAD_ZONE) {
      setHidden(true);
    } else if (previous > latest + DIRECTION_DEAD_ZONE) {
      setHidden(false);
    }
  });

  // "project-detail"/"note-detail" are visually owned by their parent nav items.
  const activeView =
    view === "project-detail"
      ? "projects"
      : view === "note-detail"
        ? "notes"
        : view;
  const githubLink = socialLinks.find((link) => link.icon === "github");
  const underlineTransition: Transition = prefersReducedMotion
    ? { duration: 0 }
    : { type: "spring", stiffness: 380, damping: 32 };

  return (
    <>
      <motion.header
        initial={false}
        animate={{ y: hidden ? "-100%" : "0%" }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.3, ease: "easeInOut" }}
        className="fixed inset-x-0 top-0 z-50 print:hidden"
      >
        <div
          className={cn(
            "transition-[background-color,border-color,padding,backdrop-filter] duration-300",
            scrolled
              ? "border-b border-border/60 bg-background/70 py-3 backdrop-blur-md"
              : "border-b border-transparent bg-transparent py-5"
          )}
        >
          <nav
            aria-label={t("Primary navigation")}
            className="mx-auto flex h-11 w-full max-w-6xl items-center justify-between gap-2 px-4 sm:px-6"
          >
            {/* LEFT — logo (out of the shared flex row, never shrinks) */}
            <button
              type="button"
              onClick={() => navigate("home")}
              aria-label={t("Go to home")}
              className="flex h-11 shrink-0 items-center font-mono text-lg font-bold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              <span className="text-foreground">dearly</span>
              <span className="text-gradient">febriano</span>
              <span className="text-primary" aria-hidden="true">
                .
              </span>
            </button>

            {/* CENTER — nav links IN-FLOW (bukan absolute!) — link
             * mengikuti ruang sisa antara logo & aksi, jadi Contact
             * tidak akan pernah menimpa LanguageToggle/ThemeToggle.
             * Item sekunder: hidden di lg, tampil di xl. */}
            <div className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex">
              <ul className="flex items-center gap-1">
                {NAV_ITEMS.map((item) => {
                  const isActive = item.view === activeView;
                  const isPrimary = PRIMARY_VIEWS.has(item.view);
                  return (
                    <li
                      key={item.view}
                      className={isPrimary ? undefined : "hidden xl:block"}
                    >
                      <button
                        type="button"
                        onClick={() => navigate(item.view)}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "relative flex h-11 items-center whitespace-nowrap rounded-md px-2.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
                          isActive
                            ? "font-medium text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {isActive && (
                          <motion.span
                            aria-hidden
                            layoutId="nav-active-pill"
                            transition={underlineTransition}
                            className="absolute inset-x-0 inset-y-1.5 rounded-full border border-border/60 bg-secondary/50"
                          />
                        )}
                        <span className="relative z-10">{t(item.label)}</span>
                        {isActive && (
                          <motion.span
                            layoutId="nav-active-underline"
                            transition={underlineTransition}
                            className="absolute inset-x-3 bottom-0.5 h-0.5 rounded-full bg-gradient-accent"
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
              {/* Lipatan item sekunder — hanya ada pada lg→xl */}
              <div className="xl:hidden">
                <NavbarMoreMenu items={OVERFLOW_ITEMS} activeView={activeView} />
              </div>
            </div>

            {/* RIGHT — actions (shrink-0: tidak pernah tergeser link) */}
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => setCommandOpen(true)}
                aria-label={t("Open command palette (Ctrl+K)")}
                title={t("Open command palette (Ctrl+K)")}
                className="hidden h-10 items-center gap-1.5 rounded-full border border-border/70 bg-card/40 px-2.5 text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 lg:flex"
              >
                <Search className="size-3.5" aria-hidden />
                {/* Keycap utility (.kbd) — konsisten dengan ShortcutsDialog */}
                <kbd className="kbd !h-6 !min-w-6 !px-1.5 !text-[9px]">
                  {isMac ? "⌘ K" : "Ctrl K"}
                </kbd>
              </button>
              {githubLink && (
                <a
                  href={githubLink.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${githubLink.label} (${t("opens in new tab")})`}
                  className="grid size-10 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <SocialIcon icon="github" className="size-[18px]" />
                </a>
              )}
              <LanguageToggle />
              <ThemeToggle />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label={t("Open menu")}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
                className="grid size-10 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 lg:hidden"
              >
                <Menu className="size-5" aria-hidden="true" />
              </button>
            </div>
          </nav>
        </div>
      </motion.header>
      {/* Rendered outside the (transformed) header so its `fixed`
          positioning is always relative to the viewport. */}
      <MobileMenu />
    </>
  );
}
