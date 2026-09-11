"use client";

import { BarChart3, TrendingUp } from "lucide-react";

import type { JSX } from "react";

import FadeIn from "@/dearlyfebriano/components/animations/FadeIn";


import { SectionHeading } from "@/dearlyfebriano/components/ui/SectionHeading";

import { useLanguage } from "@/dearlyfebriano/i18n/language-context";

import type { ProjectMetric } from "@/dearlyfebriano/types";

/* ============================================================
 * Props
 * ============================================================ */

interface ProjectMetricsProps {
  metrics: ProjectMetric[];
}

/* ============================================================
 * Component
 * ============================================================ */

export default function ProjectMetrics({
  metrics,
}: ProjectMetricsProps): JSX.Element | null {
  const { t } = useLanguage();

  /* ----------------------------------------------------------
   * Don't render anything when there are no metrics.
   * ---------------------------------------------------------- */

  if (!metrics || metrics.length === 0) {
    return null;
  }

  return (
    <section aria-label={t("Project results")} className="mt-14">
      {/* ======================================================
       * Section heading
       * ====================================================== */}

      <FadeIn>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow={t("Results")}
            title={t("Project metrics")}
            description={t(
              "A quick look at the scale, implementation, and measurable characteristics of this project.",
            )}
          />

          <div className="hidden shrink-0 items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 sm:flex">
            <TrendingUp className="size-3.5 text-primary" aria-hidden />

            <span className="font-mono text-[10px] uppercase tracking-widest text-primary">
              {t("Key results")}
            </span>
          </div>
        </div>
      </FadeIn>

      {/* ======================================================
       * Metric cards
       * ====================================================== */}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <FadeIn
            key={`${metric.label}-${metric.value}`}
            delay={index * 0.05}
            className="h-full"
          >
            <div className="group relative h-full overflow-hidden rounded-2xl border border-border/70 bg-card/50 p-5 transition-all duration-300 hover:border-foreground/25 hover:shadow-lg hover:shadow-primary/5">
              {/* Decorative icon */}

              <div className="absolute right-4 top-4 opacity-20 transition-opacity duration-300 group-hover:opacity-40">
                <BarChart3 className="size-5 text-primary" aria-hidden />
              </div>

              {/* Label */}

              <p className="pr-8 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {t(metric.label)}
              </p>

              {/* Value */}

              <p className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {metric.value}
              </p>

              {/* Description */}

              {metric.description && (
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {t(metric.description)}
                </p>
              )}

              {/* Bottom accent */}

              <div
                aria-hidden
                className="absolute inset-x-5 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-50 transition-opacity duration-300 group-hover:opacity-100"
              />
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
