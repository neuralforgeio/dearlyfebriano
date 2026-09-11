"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useEffect, useState, type JSX } from "react";
import { useLanguage } from "@/dearlyfebriano/i18n/language-context";

/* ============================================================
 * ScrollToTop — floating card-surface button that appears once the
 * page is scrolled past 600px. Positioned at bottom-24 so it
 * never collides with the WhatsApp button (bottom-6 right-6).
 * Ring progress di sekeliling tombol menunjukkan seberapa
 * jauh halaman sudah di-scroll (0–100%).
 * ============================================================ */

const SHOW_THRESHOLD = 600;
const RING_RADIUS = 22;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function ScrollToTop(): JSX.Element {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const reducedMotion = useReducedMotion();
  const { t } = useLanguage();

  useEffect(() => {
    let raf = 0;
    const onScroll = (): void => {
      if (raf !== 0) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const scrollTop = window.scrollY;
        setIsVisible(scrollTop > SHOW_THRESHOLD);
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(max > 0 ? Math.min(scrollTop / max, 1) : 0);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf !== 0) cancelAnimationFrame(raf);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          type="button"
          onClick={scrollToTop}
          aria-label={`${t("Scroll to top")} (${Math.round(progress * 100)}% ${t("scrolled")})`}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.2 }}
          className="card-surface group fixed bottom-24 right-6 z-40 flex size-11 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background print:hidden"
        >
          {/* Progress ring */}
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 size-full -rotate-90"
            viewBox="0 0 48 48"
          >
            <circle
              cx="24"
              cy="24"
              r={RING_RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-border/60"
            />
            <circle
              cx="24"
              cy="24"
              r={RING_RADIUS}
              fill="none"
              stroke="url(#scroll-top-gradient)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={RING_CIRCUMFERENCE * (1 - progress)}
              style={{
                transition: reducedMotion
                  ? "none"
                  : "stroke-dashoffset 150ms ease-out, stroke 200ms ease",
              }}
            />
            <defs>
              <linearGradient id="scroll-top-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
          <ArrowUp
            className="size-5 transition-transform duration-300 group-hover:-translate-y-0.5"
            aria-hidden
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
