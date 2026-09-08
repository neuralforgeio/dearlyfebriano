"use client";

import { ChevronDown, Code2, ExternalLink } from "lucide-react";

import { useMemo, useState, type JSX } from "react";

import FadeIn from "@/dearlyfebriano/components/animations/FadeIn";
import GlowCard from "@/dearlyfebriano/components/animations/GlowCard";
import { SectionHeading } from "@/dearlyfebriano/components/ui/SectionHeading";
import { TechBadge } from "@/dearlyfebriano/components/ui/TechIcon";

import { projects } from "@/dearlyfebriano/data/projects";
import { useLanguage } from "@/dearlyfebriano/i18n/language-context";
import { useUIStore } from "@/dearlyfebriano/store/ui-store";

interface TechUsage {
  name: string;
  count: number;
  projects: typeof projects;
}

function buildTechUsage(): TechUsage[] {
  const map = new Map<string, Set<string>>();

  for (const project of projects) {
    for (const tech of project.techStack) {
      if (!map.has(tech)) {
        map.set(tech, new Set());
      }

      map.get(tech)?.add(project.slug);
    }
  }

  return Array.from(map.entries())
    .map(([name, slugSet]) => ({
      name,
      count: slugSet.size,
      projects: projects.filter((project) => slugSet.has(project.slug)),
    }))
    .sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }

      return a.name.localeCompare(b.name);
    });
}

export default function TechStackExplorer(): JSX.Element {
  const { t } = useLanguage();

  const navigate = useUIStore((state) => state.navigate);

  const [selectedTech, setSelectedTech] = useState<string | null>(null);

  const techUsage = useMemo(() => buildTechUsage(), []);

  const selected = techUsage.find((tech) => tech.name === selectedTech);

  return (
    <section id="tech-stack-explorer" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow={t("Technology")}
          title={t("Tech Stack Explorer")}
          description={t(
            "Explore the technologies I use and see which projects are built with each one.",
          )}
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          {/* ==================================================
           * TECH LIST
           * ================================================== */}

          <FadeIn x={-20}>
            <GlowCard className="rounded-2xl border border-border/70 bg-card/50 p-5">
              <div className="mb-5 flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Code2 className="size-5" aria-hidden />
                </div>

                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {t("Technologies")}
                  </p>

                  <p className="text-sm font-semibold text-foreground">
                    {techUsage.length} {t("technologies")}
                  </p>
                </div>
              </div>

              <div
                className="grid gap-2 sm:grid-cols-2"
                role="list"
                aria-label={t("Technologies used across projects")}
              >
                {techUsage.map((tech) => {
                  const isSelected = selectedTech === tech.name;

                  return (
                    <button
                      key={tech.name}
                      type="button"
                      onClick={() =>
                        setSelectedTech(isSelected ? null : tech.name)
                      }
                      aria-pressed={isSelected}
                      className={[
                        "flex items-center justify-between rounded-xl border px-3 py-2.5 text-left transition-all",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                        isSelected
                          ? "border-primary/50 bg-primary/10"
                          : "border-border/60 bg-background/40 hover:border-primary/30 hover:bg-card",
                      ].join(" ")}
                    >
                      <TechBadge name={tech.name} />

                      <span className="font-mono text-[10px] text-muted-foreground">
                        {tech.count}{" "}
                        {tech.count === 1 ? t("project") : t("projects")}
                      </span>
                    </button>
                  );
                })}
              </div>
            </GlowCard>
          </FadeIn>

          {/* ==================================================
           * PROJECT USAGE
           * ================================================== */}

          <FadeIn x={20} delay={0.1}>
            <GlowCard className="min-h-full rounded-2xl border border-border/70 bg-card/50 p-5">
              {!selected ? (
                <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
                  <div className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <Code2 className="size-6" aria-hidden />
                  </div>

                  <h3 className="mt-4 text-lg font-semibold text-foreground">
                    {t("Select a technology")}
                  </h3>

                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                    {t("Click a technology to see which projects use it.")}
                  </p>

                  <ChevronDown
                    className="mt-5 size-5 animate-bounce text-primary"
                    aria-hidden
                  />
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                        {t("Used across projects")}
                      </p>

                      <h3 className="mt-1 text-xl font-semibold text-foreground">
                        {selected.name}
                      </h3>
                    </div>

                    <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 font-mono text-xs text-primary">
                      {selected.count}{" "}
                      {selected.count === 1 ? t("project") : t("projects")}
                    </span>
                  </div>

                  <div className="mt-5 space-y-3">
                    {selected.projects.map((project) => (
                      <button
                        key={project.slug}
                        type="button"
                        onClick={() => navigate("project-detail", project.slug)}
                        className="group flex w-full items-center justify-between rounded-xl border border-border/60 bg-background/40 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card/80"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-foreground transition-colors group-hover:text-primary">
                            {project.title}
                          </p>

                          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                            {t(project.shortDesc)}
                          </p>
                        </div>

                        <ExternalLink
                          className="ml-4 size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
                          aria-hidden
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </GlowCard>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
