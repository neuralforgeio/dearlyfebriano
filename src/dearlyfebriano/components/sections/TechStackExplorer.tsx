"use client";

import { ChevronDown, Code2, GitBranch, ListFilter } from "lucide-react";

import { useMemo, useState, type JSX } from "react";

import FadeIn from "@/dearlyfebriano/components/animations/FadeIn";


import { SectionHeading } from "@/dearlyfebriano/components/ui/SectionHeading";

import { TechBadge } from "@/dearlyfebriano/components/ui/TechIcon";

import { projects } from "@/dearlyfebriano/data/projects";

import { useLanguage } from "@/dearlyfebriano/i18n/language-context";

import { useUIStore } from "@/dearlyfebriano/store/ui-store";

import TechStackGraph from "./TechStackGraph";

/* ============================================================
 * Types
 * ============================================================ */

interface TechUsage {
  name: string;
  count: number;
  projects: typeof projects;
}

type ExplorerMode = "list" | "graph";

/* ============================================================
 * Build technology usage
 * ============================================================ */

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

/* ============================================================
 * Component
 * ============================================================ */

export default function TechStackExplorer(): JSX.Element {
  const { t } = useLanguage();

  const navigate = useUIStore((state) => state.navigate);

  const [mode, setMode] = useState<ExplorerMode>("list");

  const [selectedTech, setSelectedTech] = useState<string | null>(null);

  const techUsage = useMemo(() => buildTechUsage(), []);

  const selected = techUsage.find((tech) => tech.name === selectedTech);

  return (
    <section id="tech-stack-explorer" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* ==================================================
         * HEADER
         * ================================================== */}

        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow={t("Technology")}
            title={t("Tech Stack Explorer")}
            description={t(
              "Explore the technologies I use and see which projects are built with each one.",
            )}
          />

          {/* =================================================
           * View switch
           * ================================================= */}

          <FadeIn delay={0.05} className="shrink-0">
            <div
              className="inline-flex items-center rounded-xl border border-border bg-card p-1"
              role="group"
              aria-label={t("Technology explorer view")}
            >
              <button
                type="button"
                onClick={() => setMode("list")}
                aria-pressed={mode === "list"}
                className={[
                  "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all",
                  mode === "list"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                <ListFilter className="size-3.5" aria-hidden />

                {t("List")}
              </button>

              <button
                type="button"
                onClick={() => setMode("graph")}
                aria-pressed={mode === "graph"}
                className={[
                  "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all",
                  mode === "graph"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                <GitBranch className="size-3.5" aria-hidden />

                {t("Graph")}
              </button>
            </div>
          </FadeIn>
        </div>

        {/* ==================================================
         * GRAPH MODE
         * ================================================== */}

        {mode === "graph" && (
          <FadeIn delay={0.08} className="mt-10">
            <TechStackGraph
              selectedTech={selectedTech}
              onSelectTech={setSelectedTech}
            />
          </FadeIn>
        )}

        {/* ==================================================
         * LIST MODE
         * ================================================== */}

        {mode === "list" && (
          <div className="mt-10 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            {/* =================================================
             * TECH LIST
             * ================================================= */}

            <FadeIn x={-20}>
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="mb-5 flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Code2 className="size-5" aria-hidden />
                  </div>

                  <div>
                    <p className="eyebrow">
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
                            : "border-border bg-background/40 hover:border-foreground/25 hover:bg-card",
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
              </div>
            </FadeIn>

            {/* =================================================
             * PROJECT USAGE
             * ================================================= */}

            <FadeIn x={20} delay={0.1}>
              <div className="min-h-full rounded-xl border border-border bg-card p-5">
                {!selected ? (
                  <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
                    <div className="grid size-14 place-items-center rounded-xl bg-primary/10 text-primary">
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
                        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-primary">
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
                          onClick={() =>
                            navigate("project-detail", project.slug)
                          }
                          className="group flex w-full items-center justify-between rounded-xl border border-border bg-background/40 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-foreground/25 hover:bg-card/80"
                        >
                          <div className="min-w-0">
                            <p className="font-medium text-foreground transition-colors group-hover:text-primary">
                              {project.title}
                            </p>

                            <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                              {t(project.shortDesc)}
                            </p>
                          </div>

                          <span className="font-mono text-[10px] text-primary opacity-0 transition-opacity group-hover:opacity-100">
                            {t("Open")} →
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </FadeIn>
          </div>
        )}
      </div>
    </section>
  );
}
