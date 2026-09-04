"use client";

import Image from "next/image";
import { ArrowRight, GraduationCap } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import FadeIn from "@/dearlyfebriano/components/animations/FadeIn";
import MagneticButton from "@/dearlyfebriano/components/animations/MagneticButton";
import {
  StaggerContainer,
  StaggerItem,
} from "@/dearlyfebriano/components/animations/StaggerChildren";
import { SectionHeading } from "@/dearlyfebriano/components/ui/SectionHeading";
import { experiences } from "@/dearlyfebriano/data/experience";
import { education, funFacts, profile } from "@/dearlyfebriano/data/profile";
import { skillGroups } from "@/dearlyfebriano/data/skills";
import { useUIStore } from "@/dearlyfebriano/store/ui-store";
import { useLanguage } from "@/dearlyfebriano/i18n/language-context";
import { cn } from "@/lib/utils";
import type { JSX, ReactNode } from "react";

/* ============================================================
 * AboutView — "The story so far": bio, journey timeline,
 * fun facts, education, proficiency stack, and a CTA.
 * ============================================================ */

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  children?: ReactNode;
}

function PageHeader({ eyebrow, title, description, children }: PageHeaderProps): JSX.Element {
  return (
    <FadeIn y={20} className="flex flex-col gap-4">
      <span className="font-mono text-xs uppercase tracking-[0.25em] text-primary">{eyebrow}</span>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
        {title}
      </h1>
      {description && (
        <p className="max-w-2xl leading-relaxed text-muted-foreground">{description}</p>
      )}
      {children}
    </FadeIn>
  );
}

/** Derive a proficiency label from a 0–100 skill level. */
function levelLabel(level: number): string {
  if (level < 40) return "Beginner";
  if (level < 60) return "Intermediate";
  if (level < 80) return "Advanced";
  return "Expert";
}

function levelClass(level: number): string {
  if (level >= 80) return "text-gradient";
  if (level >= 60) return "text-primary";
  if (level >= 40) return "text-violet-400";
  return "text-muted-foreground";
}

export default function AboutView(): JSX.Element {
  const navigate = useUIStore((state) => state.navigate);
  const { t } = useLanguage();
  const reducedMotion = useReducedMotion();

  return (
    <div className="relative mx-auto w-full max-w-6xl px-4 pb-20 pt-28 sm:px-6 sm:pb-28 sm:pt-32">
      <PageHeader eyebrow={t("About Me")} title={t("The story so far")} description={t(profile.bioShort)} />

      {/* ---------- Bio: avatar + paragraphs ---------- */}
      <section aria-label={t("Biography")} className="mt-16 sm:mt-20">
        <div className="grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Avatar card */}
          <FadeIn x={-24} className="relative mx-auto w-full max-w-sm lg:mx-0">
            <div
              aria-hidden
              className="bg-gradient-accent absolute -inset-5 rounded-[2.5rem] opacity-25 blur-3xl"
            />
            <div className="relative rounded-3xl border border-border/70 bg-card/60 p-3">
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl">
                <Image
                  src={profile.avatar}
                  alt={`${profile.fullName} — ${t("portrait illustration")}`}
                  fill
                  priority
                  sizes="(min-width: 1024px) 384px, (min-width: 640px) 60vw, 90vw"
                  className="object-cover"
                />
              </div>
            </div>
            <div className="glass absolute -bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium text-foreground">
              <span className="relative flex size-2" aria-hidden>
                {!reducedMotion && (
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                )}
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              {t(profile.availability)}
            </div>
          </FadeIn>

          {/* Bio paragraphs */}
          <StaggerContainer className="space-y-4" stagger={0.12}>
            {profile.bio.map((paragraph, index) => (
              <StaggerItem key={index}>
                <p className="leading-relaxed text-muted-foreground">{t(paragraph)}</p>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ---------- Journey timeline (compact) ---------- */}
      <section aria-label={t("Career journey")} className="mt-20 sm:mt-24">
        <SectionHeading
          eyebrow={t("Timeline")}
          title={t("My journey")}
          description={t("The roles that shaped how I build software — the detailed version lives on the experience page.")}
        />
        <ol className="relative space-y-8 pl-8">
          <span
            aria-hidden
            className="absolute bottom-2 left-[7px] top-2 w-px bg-border"
          />
          {experiences.map((experience) => (
            <li key={experience.id} className="relative">
              <span
                aria-hidden
                className="absolute -left-8 top-1 size-[15px] rounded-full border-2 border-primary bg-background"
              />
              <FadeIn x={-16} delay={0.05}>
                <p className="font-mono text-xs text-primary">
                  {experience.period.start} — {experience.period.end ?? t("Present")}
                </p>
                <p className="mt-1 font-semibold text-foreground">{t(experience.role)}</p>
                <p className="text-sm text-muted-foreground">{experience.company}</p>
                <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  {t(experience.summary)}
                </p>
              </FadeIn>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- Fun facts ---------- */}
      <section aria-label={t("Fun facts")} className="mt-20 sm:mt-24">
        <SectionHeading
          eyebrow={t("Off the clock")}
          title={t("Beyond the code")}
          description={t("A few things that keep me inspired when the editor is closed.")}
        />
        <StaggerContainer className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {funFacts.map((fact) => {
            const Icon = fact.icon;
            return (
              <StaggerItem key={fact.label} className="h-full">
                <div className="group h-full rounded-2xl border border-border/70 bg-card/60 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40">
                  <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <p className="mt-4 font-medium text-foreground">{t(fact.label)}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {t(fact.description)}
                  </p>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </section>

      {/* ---------- Education ---------- */}
      <section aria-label={t("Education")} className="mt-20 sm:mt-24">
        <SectionHeading eyebrow={t("Academics")} title={t("Education")} />
        <StaggerContainer className="grid gap-4 md:grid-cols-2">
          {education.map((item) => (
            <StaggerItem key={item.degree} className="h-full">
              <article className="h-full rounded-2xl border border-border/70 bg-card/60 p-6 transition-colors hover:border-primary/40">
                <div className="flex items-center gap-4">
                  <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <GraduationCap className="size-5" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold leading-snug text-foreground">{t(item.degree)}</h3>
                    <p className="text-sm text-muted-foreground">{item.school}</p>
                  </div>
                </div>
                <p className="mt-4 font-mono text-xs text-primary">{item.period}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t(item.description)}
                </p>
              </article>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* ---------- Stack & proficiency ---------- */}
      <section aria-label={t("Tech stack and proficiency")} className="mt-20 sm:mt-24">
        <SectionHeading
          eyebrow={t("Toolbox")}
          title={t("Stack & proficiency")}
          description={t("The technologies I reach for daily, honestly rated.")}
        />
        <div className="space-y-8">
          {skillGroups.map((group, groupIndex) => (
            <FadeIn key={group.id} delay={groupIndex * 0.05}>
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                {t(group.label)}
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <li
                    key={skill.name}
                    className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3 py-1 transition-colors hover:border-primary/40"
                  >
                    <span className="text-sm text-foreground">{skill.name}</span>
                    <span
                      className={cn("font-mono text-[11px]", levelClass(skill.level))}
                      aria-label={`${t("Proficiency:")} ${t(levelLabel(skill.level))}`}
                    >
                      {t(levelLabel(skill.level))}
                    </span>
                  </li>
                ))}
              </ul>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section aria-label={t("Contact call to action")} className="mt-20 sm:mt-24">
        <FadeIn>
          <motion.div
            className="glass flex flex-col items-start justify-between gap-5 rounded-2xl p-6 sm:flex-row sm:items-center sm:p-8"
            whileHover={reducedMotion ? undefined : { y: -2 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
          >
            <div>
              <h2 className="text-lg font-semibold text-foreground sm:text-xl">
                {t("Want the full story?")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("The fastest way to get to know me is a direct conversation.")}
              </p>
            </div>
            <MagneticButton className="shrink-0">
              <Button
                type="button"
                size="lg"
                onClick={() => navigate("contact")}
                className="bg-gradient-accent text-white shadow-lg shadow-primary/25 hover:opacity-90"
              >
                {t("Let's talk")}
                <ArrowRight className="size-4" aria-hidden />
              </Button>
            </MagneticButton>
          </motion.div>
        </FadeIn>
      </section>
    </div>
  );
}
