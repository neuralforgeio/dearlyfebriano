"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { motion, useReducedMotion, type Transition } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useLanguage } from "@/dearlyfebriano/i18n/language-context";

/* ============================================================
 * ThemeToggle — dark/light switch with a crossfading,
 * rotating sun/moon icon pair. Renders a same-size invisible
 * placeholder until hydrated to avoid mismatch (the resolved
 * theme is only known on the client).
 * ============================================================ */

/** No-op subscription — we only care about the hydration gate. */
const emptySubscribe = () => () => {};

/** false on the server & during hydration, true after mount. */
function useIsHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const { t } = useLanguage();
  const prefersReducedMotion = useReducedMotion();
  const mounted = useIsHydrated();

  if (!mounted) {
    // Placeholder: keeps the layout stable and stays out of the a11y tree.
    return (
      <button
        type="button"
        aria-hidden="true"
        tabIndex={-1}
        disabled
        className="invisible size-10"
      />
    );
  }

  const isDark = resolvedTheme === "dark";
  const iconTransition: Transition = prefersReducedMotion
    ? { duration: 0 }
    : { type: "spring", duration: 0.4, bounce: 0.35 };

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? t("Switch to light mode") : t("Switch to dark mode")}
      className="grid size-10 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <span className="relative block size-5" aria-hidden="true">
        {/* Sun — visible in dark mode (click to switch to light) */}
        <motion.span
          initial={false}
          animate={
            isDark
              ? { rotate: 0, scale: 1, opacity: 1 }
              : { rotate: -90, scale: 0.5, opacity: 0 }
          }
          transition={iconTransition}
          className="absolute inset-0 grid place-items-center"
        >
          <Sun className="size-[18px]" />
        </motion.span>
        {/* Moon — visible in light mode (click to switch to dark) */}
        <motion.span
          initial={false}
          animate={
            isDark
              ? { rotate: 90, scale: 0.5, opacity: 0 }
              : { rotate: 0, scale: 1, opacity: 1 }
          }
          transition={iconTransition}
          className="absolute inset-0 grid place-items-center"
        >
          <Moon className="size-[18px]" />
        </motion.span>
      </span>
    </button>
  );
}
