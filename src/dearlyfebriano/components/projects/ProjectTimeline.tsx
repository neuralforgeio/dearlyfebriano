"use client";

import { CheckCircle2, Clock3, GitCommitVertical } from "lucide-react";

import type { JSX } from "react";

import FadeIn from "@/dearlyfebriano/components/animations/FadeIn";


import { SectionHeading } from "@/dearlyfebriano/components/ui/SectionHeading";

import { useLanguage } from "@/dearlyfebriano/i18n/language-context";

import type { ProjectTimeline as ProjectTimelineItem } from "@/dearlyfebriano/types";

/* ============================================================
 * Props
 * ============================================================ */

interface ProjectTimelineProps {
  timeline: ProjectTimelineItem[];
}

/* ============================================================
 * Component
 * ============================================================ */

export default function ProjectTimeline({
  timeline,
}: ProjectTimelineProps): JSX.Element | null {
  const { t } = useLanguage();

  if (!timeline || timeline.length === 0) {
    return null;
  }

  return (
    <section aria-label={t("Engineering timeline")} className="mt-14">
      {/* ======================================================
       * Heading
       * ====================================================== */}

      <FadeIn>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow={t("Engineering timeline")}
            title={t("How the project evolved")}
            description={t(
              "A high-level view of the major engineering stages from foundation to production.",
            )}
          />

          <div className="hidden items-center gap-2 rounded-md border border-border bg-secondary px-3 py-1.5 sm:flex">
            <Clock3 className="size-3.5 text-primary" aria-hidden />

            <span className="font-mono text-[10px] uppercase tracking-widest text-primary">
              {timeline.length}{" "}
              {timeline.length === 1 ? t("milestone") : t("milestones")}
            </span>
          </div>
        </div>
      </FadeIn>

      {/* ======================================================
       * Timeline
       * ====================================================== */}

      <FadeIn delay={0.08} className="mt-8">
        <div className="rounded-xl border border-border bg-card p-5 sm:p-7">
          <div className="relative">
            {/* Vertical line */}

            <div
              aria-hidden
              className="absolute bottom-5 left-[15px] top-5 w-px bg-gradient-to-b from-primary/60 via-primary/25 to-border/20 sm:left-[18px]"
            />

            <ol className="space-y-8">
              {timeline.map((item, index) => {
                const isLast = index === timeline.length - 1;

                return (
                  <li key={`${item.title}-${index}`} className="relative">
                    <FadeIn delay={index * 0.05} y={12}>
                      <div className="grid grid-cols-[32px_1fr] gap-4 sm:grid-cols-[36px_1fr] sm:gap-5">
                        {/* ==================================
                         * Marker
                         * ================================== */}

                        <div className="relative z-10 flex justify-center">
                          <div
                            className={[
                              "grid size-8 place-items-center rounded-full border bg-background shadow-sm sm:size-9",
                              isLast
                                ? "border-primary/60 "
                                : "border-border",
                            ].join(" ")}
                          >
                            {isLast ? (
                              <CheckCircle2
                                className="size-4 text-primary sm:size-4.5"
                                aria-hidden
                              />
                            ) : (
                              <GitCommitVertical
                                className="size-4 text-muted-foreground sm:size-4.5"
                                aria-hidden
                              />
                            )}
                          </div>
                        </div>

                        {/* ==================================
                         * Content
                         * ================================== */}

                        <article
                          className={[
                            "rounded-xl border p-4 transition-all duration-300 sm:p-5",
                            isLast
                              ? "border-primary/30 bg-primary/5"
                              : "border-border bg-background/30 hover:border-foreground/25",
                          ].join(" ")}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h3 className="font-semibold text-foreground">
                              {t(item.title)}
                            </h3>

                            {item.date && (
                              <span
                                className={[
                                  "rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider",
                                  isLast
                                    ? "border-primary/20 bg-primary/10 text-primary"
                                    : "border-border bg-secondary text-muted-foreground",
                                ].join(" ")}
                              >
                                {t(item.date)}
                              </span>
                            )}
                          </div>

                          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                            {t(item.description)}
                          </p>

                          {/* Progress hint */}

                          <div className="mt-4 flex items-center gap-2">
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                              <div
                                className="h-full rounded-full bg-primary/60 transition-all duration-700"
                                style={{
                                  width: `${Math.max(
                                    12,
                                    Math.round(
                                      ((index + 1) / timeline.length) * 100,
                                    ),
                                  )}%`,
                                }}
                              />
                            </div>

                            <span className="font-mono text-[9px] tabular-nums text-muted-foreground">
                              {String(index + 1).padStart(2, "0")}/
                              {String(timeline.length).padStart(2, "0")}
                            </span>
                          </div>
                        </article>
                      </div>
                    </FadeIn>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
