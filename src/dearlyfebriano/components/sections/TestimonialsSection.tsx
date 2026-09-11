"use client";

import { useCallback, useEffect, useState } from "react";
import type { JSX } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { SectionHeading } from "@/dearlyfebriano/components/ui/SectionHeading";
import { testimonials } from "@/dearlyfebriano/data/testimonials";
import { useLanguage } from "@/dearlyfebriano/i18n/language-context";
import { avatarGradientFor } from "@/dearlyfebriano/lib/helpers";
import { cn } from "@/lib/utils";

/* ============================================================
 * TestimonialsSection — auto-advancing carousel (5s) that
 * pauses on hover/focus and respects reduced motion.
 * ============================================================ */

const AUTO_ADVANCE_MS = 5000;

export default function TestimonialsSection(): JSX.Element {
  const count = testimonials.length;
  const [index, setIndex] = useState(0);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [focusPaused, setFocusPaused] = useState(false);
  const reducedMotion = useReducedMotion();
  const { t } = useLanguage();
  const isPaused = hoverPaused || focusPaused;

  const goTo = useCallback(
    (nextIndex: number) => setIndex(((nextIndex % count) + count) % count),
    [count]
  );
  const goNext = useCallback(() => setIndex((current) => (current + 1) % count), [count]);
  const goPrev = useCallback(
    () => setIndex((current) => (current - 1 + count) % count),
    [count]
  );

  useEffect(() => {
    if (isPaused || reducedMotion || count <= 1) return;
    const interval = setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(interval);
  }, [isPaused, reducedMotion, count]);

  const active = count > 0 ? testimonials[index % count] : undefined;

  return (
    <section id="testimonials" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading eyebrow={t("Testimonials")} title={t("What people say")} align="center" />

        <div
          className="relative mx-auto max-w-3xl"
          onMouseEnter={() => setHoverPaused(true)}
          onMouseLeave={() => setHoverPaused(false)}
          onFocus={() => setFocusPaused(true)}
          onBlur={() => setFocusPaused(false)}
        >
          <div aria-live="polite" className="min-h-[320px] sm:min-h-[330px]">
            <AnimatePresence mode="wait">
              {active && (
                <motion.figure
                  key={active.id}
                  initial={{ opacity: 0, x: reducedMotion ? 0 : 48 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: reducedMotion ? 0 : -48 }}
                  transition={{ duration: reducedMotion ? 0 : 0.35, ease: "easeOut" }}
                  className="card-surface rounded-2xl p-8 text-center sm:p-10"
                >
                  <Quote aria-hidden className="mx-auto mb-5 size-8 text-primary/40" />
                  <blockquote className="text-base italic leading-relaxed text-foreground/90 sm:text-lg">
                    {`"${t(active.quote)}"`}
                  </blockquote>
                  <figcaption className="mt-7 flex items-center justify-center gap-4">
                    <span
                      aria-hidden
                      className={cn(
                        "grid size-12 place-items-center rounded-full font-bold text-white ring-2 ring-background/60",
                        avatarGradientFor(active.name)
                      )}
                    >
                      {active.initials}
                    </span>
                    <span className="text-left">
                      <span className="block font-semibold text-foreground">{active.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {t(active.role)} · {active.company}
                      </span>
                    </span>
                  </figcaption>
                </motion.figure>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={goPrev}
              aria-label={t("Previous testimonial")}
              className="card-surface grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:border-foreground/25 hover:text-primary"
            >
              <ChevronLeft aria-hidden className="size-4" />
            </button>

            <div className="flex items-center gap-2.5">
              {testimonials.map((testimonial, dotIndex) => {
                const isActive = dotIndex === index;
                return (
                  <button
                    key={testimonial.id}
                    type="button"
                    onClick={() => goTo(dotIndex)}
                    aria-label={`${t("Go to testimonial")} ${dotIndex + 1}`}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "h-2 rounded-full transition-all",
                      isActive
                        ? "w-6 bg-primary"
                        : "w-2 bg-border hover:bg-muted-foreground/40"
                    )}
                  />
                );
              })}
            </div>

            <button
              type="button"
              onClick={goNext}
              aria-label={t("Next testimonial")}
              className="card-surface grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:border-foreground/25 hover:text-primary"
            >
              <ChevronRight aria-hidden className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
