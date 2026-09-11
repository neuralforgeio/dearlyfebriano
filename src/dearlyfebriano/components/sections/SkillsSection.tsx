"use client";

import { useState } from "react";
import type { JSX } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SectionHeading } from "@/dearlyfebriano/components/ui/SectionHeading";
import { TechIcon } from "@/dearlyfebriano/components/ui/TechIcon";
import { skillGroups } from "@/dearlyfebriano/data/skills";
import { useLanguage } from "@/dearlyfebriano/i18n/language-context";
import { cn } from "@/lib/utils";

/* ============================================================
 * SkillsSection — custom pill tabs (layoutId sliding pill) +
 * animated skill bars grouped by stack layer.
 * ============================================================ */

export default function SkillsSection(): JSX.Element {
  const [activeId, setActiveId] = useState(skillGroups[0]?.id ?? "");
  const reducedMotion = useReducedMotion();
  const { t } = useLanguage();
  const activeGroup = skillGroups.find((group) => group.id === activeId);

  return (
    <section id="skills" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow={t("Skills")}
          title={t("My tech toolbox")}
          description={t("Technologies I use daily, grouped by layer of the stack.")}
        />

        <div role="tablist" aria-label={t("Skill categories")} className="mb-10 flex flex-wrap gap-2">
          {skillGroups.map((group) => {
            const isActive = group.id === activeId;
            return (
              <button
                key={group.id}
                type="button"
                role="tab"
                id={`skill-tab-${group.id}`}
                aria-selected={isActive}
                aria-controls="skills-panel"
                onClick={() => setActiveId(group.id)}
                className={cn(
                  "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "text-primary-foreground"
                    : "border border-border text-muted-foreground hover:border-foreground/25 hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.span
                    aria-hidden
                    layoutId="skills-active-tab"
                    className="absolute inset-0 rounded-full bg-primary shadow-md"
                    transition={
                      reducedMotion
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 320, damping: 30 }
                    }
                  />
                )}
                <span className="relative z-10">{t(group.label)}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {activeGroup && (
            <motion.div
              key={activeGroup.id}
              role="tabpanel"
              id="skills-panel"
              aria-labelledby={`skill-tab-${activeGroup.id}`}
              initial={{ opacity: 0, y: reducedMotion ? 0 : 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reducedMotion ? 0 : -14 }}
              transition={{ duration: reducedMotion ? 0 : 0.25, ease: "easeOut" }}
              className="grid gap-x-8 gap-y-5 sm:grid-cols-2"
            >
              {activeGroup.skills.map((skill, index) => (
                <div key={skill.name}>
                  <div className="flex items-center gap-3">
                    <TechIcon name={skill.name} className="size-5 text-muted-foreground" />
                    <span className="flex-1 text-sm font-medium">{skill.name}</span>
                    <span className="font-mono text-xs text-muted-foreground">{skill.level}%</span>
                  </div>
                  <div
                    role="progressbar"
                    aria-label={`${skill.name} ${t("proficiency")}`}
                    aria-valuenow={skill.level}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary"
                  >
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      initial={{ width: "0%" }}
                      whileInView={{ width: `${skill.level}%` }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{
                        duration: reducedMotion ? 0 : 0.8,
                        ease: "easeOut",
                        delay: reducedMotion ? 0 : 0.1 + index * 0.05,
                      }}
                    />
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
