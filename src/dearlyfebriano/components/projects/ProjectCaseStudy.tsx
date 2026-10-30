"use client";

import {
  BriefcaseBusiness,
  CheckCircle2,
  GraduationCap,
  Scale,
} from "lucide-react";

import type { JSX } from "react";

import FadeIn from "@/dearlyfebriano/components/animations/FadeIn";

import { SectionHeading } from "@/dearlyfebriano/components/ui/SectionHeading";

import { useLanguage } from "@/dearlyfebriano/i18n/language-context";

import type { ProjectCaseStudy as ProjectCaseStudyData } from "@/dearlyfebriano/data/project-case-study";

/* ============================================================
 * Props
 * ============================================================ */

interface ProjectCaseStudyProps {
  data: ProjectCaseStudyData | null;
}

/* ============================================================
 * Main Component
 * ============================================================ */

export default function ProjectCaseStudy({
  data,
}: ProjectCaseStudyProps): JSX.Element | null {
  const { t } = useLanguage();

  if (!data) {
    return null;
  }

  return (
    <section aria-label={t("Engineering case study")} className="mt-16">
      {/* ======================================================
       * Header
       * ====================================================== */}

      <FadeIn>
        <SectionHeading
          eyebrow={t("Beyond the implementation")}
          title={t("Engineering Case Study")}
          description={t(
            "A closer look at my responsibilities, technical decisions, engineering trade-offs, and lessons learned while building this project.",
          )}
        />
      </FadeIn>

      {/* ======================================================
       * My Role + Responsibilities
       * ====================================================== */}

      <div className="mt-8 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        {/* Role */}

        <FadeIn className="h-full">
          <article className="h-full rounded-xl border border-border bg-card p-5 transition-colors hover:border-foreground/25 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="grid size-11 shrink-0 place-items-center rounded-xl border border-border bg-secondary text-primary">
                <BriefcaseBusiness className="size-5" aria-hidden />
              </div>

              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-primary">
                  {t("My role")}
                </p>

                <h3 className="mt-1 text-lg font-semibold text-foreground">
                  {t("Project ownership")}
                </h3>
              </div>
            </div>

            <p className="mt-6 text-xl font-semibold tracking-tight text-foreground">
              {t(data.role)}
            </p>

            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {t(
                "The responsibilities and engineering work involved in bringing this project from concept to implementation.",
              )}
            </p>
          </article>
        </FadeIn>

        {/* Responsibilities */}

        <FadeIn delay={0.07} className="h-full">
          <article className="h-full rounded-xl border border-border bg-card p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="grid size-11 shrink-0 place-items-center rounded-xl border border-border bg-secondary text-primary">
                <CheckCircle2 className="size-5" aria-hidden />
              </div>

              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-primary">
                  {t("Scope of work")}
                </p>

                <h3 className="mt-1 text-lg font-semibold text-foreground">
                  {t("My responsibilities")}
                </h3>
              </div>
            </div>

            <ul className="mt-6 space-y-3">
              {data.responsibilities.map((item, index) => (
                <li key={`${index}-${item}`} className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                    <CheckCircle2 className="size-3" aria-hidden />
                  </span>

                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {t(item)}
                  </p>
                </li>
              ))}
            </ul>
          </article>
        </FadeIn>
      </div>

      {/* ======================================================
       * Engineering Trade-offs
       * ====================================================== */}

      {data.tradeoffs.length > 0 && (
        <div className="mt-12">
          <FadeIn>
            <div className="flex items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-secondary text-primary">
                <Scale className="size-5" aria-hidden />
              </div>

              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-primary">
                  {t("Engineering decisions")}
                </p>

                <h3 className="mt-1 text-xl font-semibold text-foreground">
                  {t("Engineering Trade-offs")}
                </h3>

                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {t(
                    "Every technical decision comes with advantages and compromises. These are the considerations behind the implementation.",
                  )}
                </p>
              </div>
            </div>
          </FadeIn>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {data.tradeoffs.map((item, index) => (
              <FadeIn
                key={`${item.decision}-${index}`}
                delay={index * 0.06}
                className="h-full"
              >
                <article className="group h-full rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/40 sm:p-6">
                  {/* Number + title */}

                  <div className="flex items-start gap-3">
                    <span className="font-mono text-xs text-primary">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <h4 className="font-semibold leading-relaxed text-foreground">
                      {t(item.decision)}
                    </h4>
                  </div>

                  {/* Rationale */}

                  <div className="mt-5">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-emerald-500">
                      {t("Why this decision?")}
                    </p>

                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      {t(item.rationale)}
                    </p>
                  </div>

                  {/* Trade-off */}

                  <div className="mt-5 rounded-lg border border-border bg-background/50 p-4">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-amber-500">
                      {t("The trade-off")}
                    </p>

                    <p className="mt-2 text-sm leading-7 text-foreground/80">
                      {t(item.tradeOff)}
                    </p>
                  </div>
                </article>
              </FadeIn>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================
       * Lessons Learned
       * ====================================================== */}

      {data.lessonsLearned.length > 0 && (
        <div className="mt-12">
          <FadeIn>
            <div className="flex items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-secondary text-primary">
                <GraduationCap className="size-5" aria-hidden />
              </div>

              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-primary">
                  {t("Engineering reflection")}
                </p>

                <h3 className="mt-1 text-xl font-semibold text-foreground">
                  {t("Lessons Learned")}
                </h3>

                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {t(
                    "Engineering insights and principles gained from solving real implementation challenges.",
                  )}
                </p>
              </div>
            </div>
          </FadeIn>

          <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {data.lessonsLearned.map((lesson, index) => (
              <FadeIn
                key={`${index}-${lesson}`}
                delay={index * 0.05}
                className="h-full"
              >
                <article className="flex h-full gap-3 rounded-xl border border-border bg-card p-5 transition-colors hover:border-foreground/25">
                  <span className="shrink-0 font-mono text-xs text-primary">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <p className="text-sm leading-7 text-muted-foreground">
                    {t(lesson)}
                  </p>
                </article>
              </FadeIn>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
