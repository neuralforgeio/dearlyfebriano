"use client";

import {
  ArrowRight,
  Compass,
  Lightbulb,
  Target,
  Trophy,
  Wrench,
} from "lucide-react";

import type { JSX } from "react";

import FadeIn from "@/dearlyfebriano/components/animations/FadeIn";


import { SectionHeading } from "@/dearlyfebriano/components/ui/SectionHeading";

import { useLanguage } from "@/dearlyfebriano/i18n/language-context";

import type { ProjectWhyBuilt as ProjectWhyBuiltData } from "@/dearlyfebriano/data/project-why-built";

/* ============================================================
 * Props
 * ============================================================ */

interface ProjectWhyBuiltProps {
  data: ProjectWhyBuiltData | null;
}

/* ============================================================
 * Main component
 * ============================================================ */

export default function ProjectWhyBuilt({
  data,
}: ProjectWhyBuiltProps): JSX.Element | null {
  const { t } = useLanguage();

  if (!data) {
    return null;
  }

  const sections = [
    {
      icon: Target,
      eyebrow: "The problem",
      title: "What needed to be solved?",
     text: data.problem,
    },

    {
      icon: Lightbulb,
      eyebrow: "The motivation",
      title: "Why I built it",
     text: data.motivation,
    },

    {
      icon: Wrench,
      eyebrow: "The approach",
      title: "How I approached it",
     text: data.approach,
    },

    {
      icon: Trophy,
      eyebrow: "The outcome",
      title: "What came out of it",
     text: data.outcome,
    },
  ];

  return (
    <section aria-label={t("Why I built this")} className="mt-14">
      {/* ======================================================
       * Header
       * ====================================================== */}

      <FadeIn>
        <SectionHeading
          eyebrow={t("The story behind the code")}
          title={t("Why I Built This")}
          description={t(
            "The problem, motivation, engineering approach, and outcome behind this project.",
          )}
        />
      </FadeIn>

      {/* ======================================================
       * Main narrative
       * ====================================================== */}

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {sections.map((section, index) => {
          const Icon = section.icon;

          return (
            <FadeIn
              key={section.eyebrow}
              delay={index * 0.06}
              className="h-full"
            >
              <div className="group h-full rounded-2xl border border-border/70 bg-card/50 p-5 transition-all duration-300 hover:border-primary/30 sm:p-6">
                <div className="flex items-start gap-4">
                  {/* Icon */}

                  <div className="grid size-11 shrink-0 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary transition-transform duration-300">
                    <Icon className="size-5" aria-hidden />
                  </div>

                  {/* Content */}

                  <div className="min-w-0">
                    <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-primary">
                      {t(section.eyebrow)}
                    </p>

                    <h3 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
                      {t(section.title)}
                    </h3>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-7 text-muted-foreground">
                  {t(section.text)}
                </p>

                {/* subtle footer */}

                <div className="mt-5 flex items-center gap-2 border-t border-border/60 pt-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-primary/60" />

                  {String(index + 1).padStart(2, "0")}

                  <ArrowRight className="size-3" aria-hidden />
                </div>
              </div>
            </FadeIn>
          );
        })}
      </div>

      {/* ======================================================
       * Key decisions
       * ====================================================== */}

      {data.decisions.length > 0 && (
        <FadeIn delay={0.1} className="mt-6">
          <div className="rounded-2xl border border-border/70 bg-card/50 p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="grid size-11 shrink-0 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                <Compass className="size-5" aria-hidden />
              </div>

              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-primary">
                  {t("Engineering decisions")}
                </p>

                <h3 className="mt-1 text-lg font-semibold text-foreground">
                  {t("Key decisions")}
                </h3>
              </div>
            </div>

            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {data.decisions.map((decision, index) => (
                <li
                  key={decision}
                  className="group rounded-xl border border-border/60 bg-background/30 p-4 transition-colors hover:border-primary/30 hover:bg-background/50"
                >
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-[10px] text-primary">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <p className="text-sm leading-relaxed text-foreground/90">
                      {t(decision)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </FadeIn>
      )}
    </section>
  );
}
