"use client";

import {
  Boxes,
  ExternalLink,
  GitBranch,
  Layers3,
  Sparkles,
} from "lucide-react";

import { useMemo, useState, type JSX } from "react";

import FadeIn from "@/dearlyfebriano/components/animations/FadeIn";

import GlowCard from "@/dearlyfebriano/components/animations/GlowCard";

import { projects } from "@/dearlyfebriano/data/projects";

import { useLanguage } from "@/dearlyfebriano/i18n/language-context";

import { useUIStore } from "@/dearlyfebriano/store/ui-store";

import { TechBadge } from "@/dearlyfebriano/components/ui/TechIcon";

import { cn } from "@/lib/utils";

/* ============================================================
 * Types
 * ============================================================ */

interface TechNode {
  id: string;
  name: string;
  count: number;
  projects: typeof projects;
  x: number;
  y: number;
  radius: number;
}

interface ProjectNode {
  id: string;
  slug: string;
  title: string;
  x: number;
  y: number;
  radius: number;
  tech: string[];
}

interface TechStackGraphProps {
  selectedTech?: string | null;
  onSelectTech?: (tech: string | null) => void;
}

/* ============================================================
 * Constants
 * ============================================================ */

const MAX_TECH_NODES = 18;

const CANVAS_WIDTH = 1000;

const CANVAS_HEIGHT = 620;

/* ============================================================
 * Build graph data
 * ============================================================ */

function buildGraphData(): {
  technologies: TechNode[];
  projects: ProjectNode[];
} {
  const usage = new Map<string, Set<string>>();

  for (const project of projects) {
    for (const tech of project.techStack) {
      if (!usage.has(tech)) {
        usage.set(tech, new Set());
      }

      usage.get(tech)?.add(project.slug);
    }
  }

  const ranked = Array.from(usage.entries())
    .map(([name, slugSet]) => ({
      name,
      count: slugSet.size,
    }))
    .sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }

      return a.name.localeCompare(b.name);
    })
    .slice(0, MAX_TECH_NODES);

  const technologies: TechNode[] = ranked.map((item, index) => {
    const columns = ranked.length <= 6 ? 3 : 4;

    const row = Math.floor(index / columns);

    const column = index % columns;

    // fix this bug
    const x = columns === 1 ? 50 : 13 + column * (74 / Math.max(1, columns - 1));

    const y = ranked.length <= 6 ? 25 + row * 48 : 16 + row * 31;

    const radius = 24 + Math.min(item.count * 5, 24);

    return {
      id: item.name,
      name: item.name,
      count: item.count,
      projects: projects.filter((project) =>
        project.techStack.includes(item.name),
      ),
      x,
      y,
      radius,
    };
  });

  const projectNodes: ProjectNode[] = projects.map((project, index) => {
    const total = projects.length;

    const angle = (Math.PI * 2 * index) / Math.max(1, total) - Math.PI / 2;

    const normalizedRadius = total <= 4 ? 30 : 35;

    return {
      id: project.slug,
      slug: project.slug,
      title: project.title,
      x: 50 + Math.cos(angle) * normalizedRadius,
      y: 50 + Math.sin(angle) * normalizedRadius,
      radius: 34,
      tech: project.techStack,
    };
  });

  return {
    technologies,
    projects: projectNodes,
  };
}

/* ============================================================
 * Component
 * ============================================================ */

export default function TechStackGraph({
  selectedTech: controlledSelectedTech,
  onSelectTech,
}: TechStackGraphProps): JSX.Element {
  const { t } = useLanguage();

  const navigate = useUIStore((state) => state.navigate);

  const [internalSelectedTech, setInternalSelectedTech] = useState<
    string | null
  >(null);

  const selectedTech = controlledSelectedTech ?? internalSelectedTech;

  const graph = useMemo(() => buildGraphData(), []);

  const selectedProjects = selectedTech
    ? projects.filter((project) => project.techStack.includes(selectedTech))
    : [];

  const handleSelectTech = (tech: string | null): void => {
    if (controlledSelectedTech === undefined) {
      setInternalSelectedTech(tech);
    }

    onSelectTech?.(tech);
  };

  const isTechActive = (tech: TechNode): boolean => {
    if (!selectedTech) {
      return true;
    }

    return tech.name === selectedTech;
  };

  const isProjectConnected = (project: ProjectNode): boolean => {
    if (!selectedTech) {
      return false;
    }

    return project.tech.includes(selectedTech);
  };

  return (
    <div className="space-y-5">
      {/* ======================================================
       * Graph
       * ====================================================== */}

      <GlowCard className="overflow-hidden rounded-3xl border border-border/70 bg-card/50">
        <div className="border-b border-border/70 bg-background/30 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <GitBranch className="size-5" aria-hidden />
              </div>

              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                  {t("Interactive graph")}
                </p>

                <h3 className="mt-1 text-xl font-semibold text-foreground">
                  {t("Technology relationships")}
                </h3>

                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {t(
                    "Explore how technologies connect to the projects I build.",
                  )}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5">
              <Sparkles className="size-3.5 text-primary" aria-hidden />

              <span className="font-mono text-[10px] uppercase tracking-widest text-primary">
                {graph.technologies.length} {t("technologies")}
              </span>
            </div>
          </div>
        </div>

        {/* ====================================================
         * SVG CANVAS
         * ==================================================== */}

        <div className="overflow-x-auto">
          <div className="min-w-[760px] p-4 sm:p-6">
            <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-background/50">
              {/* Grid */}

              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, hsl(var(--border) / 0.18) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border) / 0.18) 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />

              <svg
                viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
                className="relative z-10 block h-auto w-full"
                role="img"
                aria-label={t("Interactive technology relationship graph")}
              >
                <defs>
                  <filter
                    id="tech-glow"
                    x="-100%"
                    y="-100%"
                    width="300%"
                    height="300%"
                  >
                    <feGaussianBlur stdDeviation="5" result="blur" />

                    <feMerge>
                      <feMergeNode in="blur" />

                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>

                  <linearGradient
                    id="graph-line-gradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="hsl(var(--primary) / 0.5)" />

                    <stop
                      offset="100%"
                      stopColor="hsl(var(--primary) / 0.08)"
                    />
                  </linearGradient>
                </defs>

                {/* ==================================================
                 * CONNECTIONS
                 * ================================================== */}

                {graph.projects.map((project) => {
                  return project.tech.map((techName) => {
                    const tech = graph.technologies.find(
                      (item) => item.name === techName,
                    );

                    if (!tech) {
                      return null;
                    }

                    const active = !selectedTech || selectedTech === techName;

                    const connected = isProjectConnected(project);

                    const visible = !selectedTech || active || connected;

                    if (!visible) {
                      return null;
                    }

                    return (
                      <line
                        key={`${project.slug}-${techName}`}
                        x1={tech.x * 10}
                        y1={tech.y * 6.2}
                        x2={project.x * 10}
                        y2={project.y * 6.2}
                        stroke={
                          selectedTech === techName
                            ? "hsl(var(--primary) / 0.65)"
                            : "url(#graph-line-gradient)"
                        }
                        strokeWidth={selectedTech === techName ? 2.5 : 1.25}
                        strokeLinecap="round"
                        strokeDasharray={
                          selectedTech === techName ? undefined : "6 7"
                        }
                        opacity={
                          selectedTech &&
                          !connected &&
                          selectedTech !== techName
                            ? 0.08
                            : 0.9
                        }
                      />
                    );
                  });
                })}

                {/* ==================================================
                 * PROJECT NODES
                 * ================================================== */}

                {graph.projects.map((project) => {
                  const connected = isProjectConnected(project);

                  const muted = Boolean(selectedTech && !connected);

                  return (
                    <g
                      key={project.id}
                      className="cursor-pointer"
                      onClick={() => navigate("project-detail", project.slug)}
                      role="link"
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();

                          navigate("project-detail", project.slug);
                        }
                      }}
                    >
                      <circle
                        cx={project.x * 10}
                        cy={project.y * 6.2}
                        r={project.radius}
                        fill="hsl(var(--card) / 0.96)"
                        stroke={
                          connected
                            ? "hsl(var(--primary) / 0.7)"
                            : "hsl(var(--border) / 0.6)"
                        }
                        strokeWidth={connected ? 2.5 : 1.5}
                        opacity={muted ? 0.25 : 1}
                      />

                      <text
                        x={project.x * 10}
                        y={project.y * 6.2 - 2}
                        textAnchor="middle"
                        className="fill-foreground text-[17px] font-semibold"
                        opacity={muted ? 0.2 : 1}
                      >
                        {truncateSvgText(project.title, 17)}
                      </text>

                      <text
                        x={project.x * 10}
                        y={project.y * 6.2 + 15}
                        textAnchor="middle"
                        className="fill-muted-foreground text-[10px]"
                        opacity={muted ? 0.15 : 0.9}
                      >
                        {t("Project")}
                      </text>
                    </g>
                  );
                })}

                {/* ==================================================
                 * TECHNOLOGY NODES
                 * ================================================== */}

                {graph.technologies.map((tech) => {
                  const active = isTechActive(tech);

                  const selected = selectedTech === tech.name;

                  return (
                    <g
                      key={tech.id}
                      className="cursor-pointer"
                      onClick={() =>
                        handleSelectTech(selected ? null : tech.name)
                      }
                      role="button"
                      tabIndex={0}
                      aria-label={`${tech.name} — ${tech.count} ${t(
                        tech.count === 1 ? "project" : "projects",
                      )}`}
                      aria-pressed={selected}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();

                          handleSelectTech(selected ? null : tech.name);
                        }
                      }}
                    >
                      {selected && (
                        <circle
                          cx={tech.x * 10}
                          cy={tech.y * 6.2}
                          r={tech.radius + 9}
                          fill="none"
                          stroke="hsl(var(--primary) / 0.25)"
                          strokeWidth="2"
                          filter="url(#tech-glow)"
                        />
                      )}

                      <circle
                        cx={tech.x * 10}
                        cy={tech.y * 6.2}
                        r={tech.radius}
                        fill={
                          selected
                            ? "hsl(var(--primary) / 0.18)"
                            : "hsl(var(--card) / 0.95)"
                        }
                        stroke={
                          selected
                            ? "hsl(var(--primary) / 0.8)"
                            : "hsl(var(--border) / 0.7)"
                        }
                        strokeWidth={selected ? 2.5 : 1.5}
                        opacity={active ? 1 : 0.22}
                      />

                      <text
                        x={tech.x * 10}
                        y={tech.y * 6.2 - 2}
                        textAnchor="middle"
                        className="fill-foreground text-[12px] font-medium"
                        opacity={active ? 1 : 0.2}
                      >
                        {truncateSvgText(tech.name, 19)}
                      </text>

                      <text
                        x={tech.x * 10}
                        y={tech.y * 6.2 + 14}
                        textAnchor="middle"
                        className="fill-primary text-[9px] font-mono"
                        opacity={active ? 1 : 0.15}
                      >
                        {tech.count}{" "}
                        {tech.count === 1 ? t("project") : t("projects")}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>

        {/* ======================================================
         * Legend
         * ====================================================== */}

        <div className="border-t border-border/70 bg-background/20 p-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <span className="size-2 rounded-full bg-primary" />

              {t("Technology")}
            </span>

            <span className="inline-flex items-center gap-2">
              <span className="size-2 rounded-full border border-border bg-card" />

              {t("Project")}
            </span>

            <span className="inline-flex items-center gap-2">
              <span className="h-px w-6 border-t border-dashed border-primary/40" />

              {t("Relationship")}
            </span>

            <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {t("Click a technology to focus")}
            </span>
          </div>
        </div>
      </GlowCard>

      {/* ======================================================
       * Selected technology details
       * ====================================================== */}

      {selectedTech && (
        <FadeIn y={12} className="mt-5">
          <GlowCard className="rounded-2xl border border-primary/25 bg-primary/5 p-5">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Layers3 className="size-4 text-primary" aria-hidden />

                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                    {t("Selected technology")}
                  </p>
                </div>

                <h3 className="mt-2 text-xl font-semibold text-foreground">
                  {selectedTech}
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedProjects.length}{" "}
                  {selectedProjects.length === 1 ? t("project") : t("projects")}{" "}
                  {t("use this technology")}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleSelectTech(null)}
                className="inline-flex shrink-0 items-center justify-center rounded-xl border border-border/70 bg-background/50 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
              >
                {t("Clear selection")}
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {selectedProjects.map((project) => (
                <button
                  key={project.slug}
                  type="button"
                  onClick={() => navigate("project-detail", project.slug)}
                  className="group flex items-center justify-between rounded-xl border border-border/70 bg-background/50 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-foreground transition-colors group-hover:text-primary">
                      {project.title}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {project.techStack
                        .filter((tech) => tech === selectedTech)
                        .map((tech) => (
                          <TechBadge key={tech} name={tech} />
                        ))}
                    </div>
                  </div>

                  <ExternalLink
                    className="ml-4 size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
                    aria-hidden
                  />
                </button>
              ))}
            </div>
          </GlowCard>
        </FadeIn>
      )}
    </div>
  );
}

/* ============================================================
 * SVG text helper
 * ============================================================ */

function truncateSvgText(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}…`;
}
