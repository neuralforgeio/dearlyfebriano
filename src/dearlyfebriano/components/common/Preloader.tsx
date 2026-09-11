"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type JSX } from "react";
import { profile } from "@/dearlyfebriano/data/profile";
import { useLanguage } from "@/dearlyfebriano/i18n/language-context";

/* ============================================================
 * Preloader — fullscreen intro overlay. The owner's name is
 * revealed per-character with a stagger, followed by a mono
 * subtitle and a thin progress bar. Calls onComplete() once
 * after ~2.3s (or immediately on click / Escape). The parent
 * wraps this in <AnimatePresence> so `exit` animates the fade.
 * ============================================================ */

interface PreloaderProps {
  onComplete: () => void;
}

const STORAGE_KEY = "df:preloader-seen";
const PROGRESS_DURATION = 1500; // ms — progress bar fill (kunjungan pertama)
const TOTAL_DURATION = 2300; // ms — intro penuh, kunjungan PERTAMA saja
const REPEAT_TOTAL_DURATION = 900; // ms — kunjungan berikutnya (reload) — jauh lebih responsif
const REDUCED_TOTAL_DURATION = 500; // ms — reduced motion shortcut

const CHAR_STAGGER = 0.04;
const CHAR_BASE_DELAY = 0.15;

/** TRUE bila user sudah pernah melihat intro (reload tidak disiksa
 *  dengan 2.3s preloader penuh — website terasa jauh lebih ringan). */
function isRepeatVisit(): boolean {
  try {
    if (localStorage.getItem(STORAGE_KEY) === "1") return true;
    localStorage.setItem(STORAGE_KEY, "1");
    return false;
  } catch {
    return false;
  }
}

export default function Preloader({ onComplete }: PreloaderProps): JSX.Element {
  const reducedMotion = useReducedMotion();
  const { t } = useLanguage();
  const [progress, setProgress] = useState(0);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const finish = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    onCompleteRef.current();
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") finish();
    };
    document.addEventListener("keydown", onKey);

    let raf = 0;
    let timeout = 0;

    if (reducedMotion) {
      timeout = window.setTimeout(finish, REDUCED_TOTAL_DURATION);
    } else {
      const isRepeat = isRepeatVisit();
      const totalDuration = isRepeat ? REPEAT_TOTAL_DURATION : TOTAL_DURATION;
      const progressDuration = isRepeat
        ? REPEAT_TOTAL_DURATION - 100
        : PROGRESS_DURATION;
      const start = performance.now();
      const tick = (now: number) => {
        const ratio = Math.min((now - start) / progressDuration, 1);
        setProgress(ratio);
        if (ratio < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      timeout = window.setTimeout(finish, totalDuration);
    }

    return () => {
      document.removeEventListener("keydown", onKey);
      cancelAnimationFrame(raf);
      window.clearTimeout(timeout);
    };
  }, [reducedMotion]);

  const [firstName = "", ...rest] = profile.fullName.split(" ");
  const lastName = rest.join(" ");
  const firstNameChars = Array.from(firstName);
  const surnameChars = Array.from(lastName);

  return (
    <motion.div
      onClick={finish}
      exit={{ opacity: 0, transition: { duration: 0.4 } }}
      className="fixed inset-0 z-[100] flex cursor-pointer items-center justify-center bg-background"
    >
      <p className="sr-only">
        {profile.fullName} — {t("Full Stack Developer")}. {t("Loading portfolio, click anywhere to skip.")}
      </p>
      <div className="flex flex-col items-center gap-8 px-6 text-center">
        <div
          aria-hidden
          className="flex flex-wrap items-baseline justify-center text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl"
        >
          {firstNameChars.map((char, index) => (
            <motion.span
              key={`first-${index}`}
              className="inline-block"
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reducedMotion ? 0.01 : 0.45,
                delay: CHAR_BASE_DELAY + index * CHAR_STAGGER,
                ease: "easeOut",
              }}
            >
              {char}
            </motion.span>
          ))}
          {surnameChars.length > 0 && <span className="inline-block">&nbsp;</span>}
          {surnameChars.map((char, index) => (
            <motion.span
              key={`last-${index}`}
              className="text-foreground inline-block"
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reducedMotion ? 0.01 : 0.45,
                delay:
                  CHAR_BASE_DELAY +
                  (firstNameChars.length + index) * CHAR_STAGGER,
                ease: "easeOut",
              }}
            >
              {char}
            </motion.span>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reducedMotion ? 0 : 0.8, duration: 0.5 }}
          className="eyebrow"
        >
          {t("Full Stack Developer")}
        </motion.p>

        <div className="h-[2px] w-40 overflow-hidden rounded-full bg-border">
          <motion.div
            className="h-full w-full origin-left bg-primary"
            style={{ scaleX: reducedMotion ? 1 : progress }}
          />
        </div>
      </div>

      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reducedMotion ? 0 : 1.1, duration: 0.6 }}
        className="absolute bottom-8 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60"
      >
        {t("Click anywhere to skip")}
      </motion.span>
    </motion.div>
  );
}
