"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { MapPin } from "lucide-react";
import FadeIn from "@/dearlyfebriano/components/animations/FadeIn";
import { TechBadge } from "@/dearlyfebriano/components/ui/TechIcon";
import { experiences } from "@/dearlyfebriano/data/experience";
import { useLanguage } from "@/dearlyfebriano/i18n/language-context";
import { cn } from "@/lib/utils";
import type { ExperienceItem } from "@/dearlyfebriano/types";
import type { JSX } from "react";

/* ============================================================
 * ExperienceView — signature interactive timeline. A gradient
 * progress line fills as you scroll; entries alternate sides
 * on desktop and stack on a left rail on mobile.
 * ============================================================ */

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
}

function PageHeader({ eyebrow, title, description }: PageHeaderProps): JSX.Element {
  return (
    <FadeIn y={20} className="flex flex-col gap-4">
      <span className="eyebrow text-primary">{eyebrow}</span>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
        {title}
      </h1>
      {description && (
        <p className="max-w-2xl leading-relaxed text-muted-foreground">{description}</p>
      )}
    </FadeIn>
  );
}

const MAX_VISIBLE_TECH = 5;

function TimelineEntry({
  experience,
  index,
}: {
  experience: ExperienceItem;
  index: number;
}): JSX.Element {
  const reducedMotion = useReducedMotion();
  const { t } = useLanguage();
  // Even indexes sit on the left half (right-aligned), odd on the right half.
  const isLeft = index % 2 === 0;

  return (
    <li className="relative pb-12 pl-12 last:pb-0 md:grid md:grid-cols-2 md:gap-12 md:pl-0">
      {/* Node dot on the rail — glow anchors it visually to the line */}
      <span
        aria-hidden
        className="absolute left-3 top-7 z-10 size-4 rounded-full bg-primary ring-4 ring-background md:left-1/2 md:-translate-x-1/2"
      />
      {/* Desktop connector: horizontal line bridging the grid gap between
          the rail dot and the card edge, so the dot feels anchored to the
          entry instead of floating on the rail. */}
      <span
        aria-hidden
        className={cn(
          "absolute top-[35px] hidden h-px w-6 md:block",
          isLeft
            ? "right-1/2 bg-gradient-to-l from-primary/50 to-border"
            : "left-1/2 bg-gradient-to-r from-primary/50 to-border"
        )}
      />

      {/* Card — alternating column on desktop */}
      <FadeIn
        x={isLeft ? -32 : 32}
        className={cn(
          "md:col-start-1 md:row-start-1",
          !isLeft && "md:col-start-2"
        )}
      >
        <article
          className={cn(
            "rounded-xl border border-border bg-card p-6 transition-colors hover:border-foreground/25",
            isLeft && "md:text-right"
          )}
        >
          {/* Company row */}
          <div
            className={cn(
              "flex items-center gap-3",
              isLeft && "md:flex-row-reverse"
            )}
          >
            <div
              className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-sm font-bold text-white"
              aria-hidden
            >
              {experience.companyInitials}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold leading-snug text-foreground">
                {experience.company}
              </h3>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <MapPin aria-hidden className="size-3" />
                  {experience.location}
                </span>
                <span className="card-surface rounded-full px-2 py-0.5 text-[10px] tracking-wide text-foreground/80">
                  {experience.locationType}
                </span>
              </p>
            </div>
          </div>

          {/* Role + period */}
          <h4 className="mt-4 text-lg font-semibold text-foreground">{t(experience.role)}</h4>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-primary">
            <span>
              {experience.period.start} — {experience.period.end ?? t("Present")}
            </span>
            {experience.period.current && (
              <span className="inline-flex items-center gap-2 text-success">
                <span className="relative flex size-2" aria-hidden>
                  {!reducedMotion && (
                    <span className="absolute inline-flex size-full  rounded-full bg-success opacity-60" />
                  )}
                  <span className="relative inline-flex size-2 rounded-full bg-success" />
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-widest">
                  {t("Current")}
                </span>
              </span>
            )}
          </p>

          {/* Summary */}
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {t(experience.summary)}
          </p>

          {/* Responsibilities */}
          <ul
            className={cn(
              "mt-4 list-disc space-y-1.5 pl-4 marker:text-primary",
              isLeft && "md:list-inside md:pl-0"
            )}
          >
            {experience.responsibilities.map((responsibility) => (
              <li key={responsibility} className="text-sm leading-relaxed text-muted-foreground">
                {t(responsibility)}
              </li>
            ))}
          </ul>

          {/* Tech */}
          <ul
            className={cn(
              "mt-5 flex flex-wrap gap-2",
              isLeft && "md:justify-end"
            )}
            aria-label={t("Technologies used in this role")}
          >
            {experience.tech.slice(0, MAX_VISIBLE_TECH).map((tech) => (
              <li key={tech}>
                <TechBadge name={tech} />
              </li>
            ))}
          </ul>
        </article>
      </FadeIn>
    </li>
  );
}

export default function ExperienceView(): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { t } = useLanguage();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.8", "end 0.65"],
  });
  const progressScale = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div className="relative mx-auto w-full max-w-6xl px-4 pb-20 pt-28 sm:px-6 sm:pb-28 sm:pt-32">
      <PageHeader
        eyebrow={t("Career")}
        title={t("Work Experience")}
        description={t("Roles and responsibilities that shaped how I build software.")}
      />

      <div ref={containerRef} className="relative mt-16 sm:mt-20">
        {/* Base rail: left on mobile, centered on desktop */}
        <span
          aria-hidden
          className="absolute bottom-0 left-5 top-0 w-px bg-border md:left-1/2 md:-translate-x-1/2"
        />
        {/* Gradient progress line (skipped entirely for reduced motion) */}
        {!reducedMotion && (
          <motion.span
            aria-hidden
            style={{ scaleY: progressScale }}
            className="absolute bottom-0 left-5 top-0 w-px origin-top bg-primary md:left-1/2 md:-translate-x-1/2"
          />
        )}

        <ol className="space-y-12 md:space-y-16">
          {experiences.map((experience, index) => (
            <TimelineEntry key={experience.id} experience={experience} index={index} />
          ))}
        </ol>
      </div>
    </div>
  );
}
