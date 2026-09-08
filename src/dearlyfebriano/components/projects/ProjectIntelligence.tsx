"use client";

import {
  BarChart3,
  GitBranch,
  GitCommitHorizontal,
  Layers3,
  LoaderCircle,
  RefreshCw,
  Sparkles,
  Clock3,
} from "lucide-react";

import { useCallback, useEffect, useState, type JSX } from "react";

import FadeIn from "@/dearlyfebriano/components/animations/FadeIn";

import GlowCard from "@/dearlyfebriano/components/animations/GlowCard";

import { useLanguage } from "@/dearlyfebriano/i18n/language-context";

import type {
  IntelligenceMetric,
  IntelligenceTimeline,
  ProjectIntelligence as ProjectIntelligenceData,
} from "@/dearlyfebriano/lib/project-intelligence/types";

interface ProjectIntelligenceProps {
  slug: string;
}

export default function ProjectIntelligence({
  slug,
}: ProjectIntelligenceProps): JSX.Element | null {
  const { t } = useLanguage();

  const [intelligence, setIntelligence] =
    useState<ProjectIntelligenceData | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/project-intelligence?slug=${encodeURIComponent(slug)}`,
        {
          cache: "no-store",
        },
      );

      const result = (await response.json()) as
        | ProjectIntelligenceData
        | {
            error?: string;
          };

      if (!response.ok || !("metrics" in result)) {
        throw new Error(
          "error" in result && result.error
            ? result.error
            : "Unable to analyze project.",
        );
      }

      setIntelligence(result);
    } catch (loadError) {
      console.error("[ProjectIntelligence]", loadError);

      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to analyze project.",
      );
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <section className="mt-14">
        <GlowCard className="rounded-3xl border border-border/70 bg-card/50">
          <div className="flex min-h-[220px] flex-col items-center justify-center p-6 text-center">
            <div className="relative">
              <span className="absolute -inset-3 animate-ping rounded-full bg-primary/10" />

              <LoaderCircle
                className="relative size-8 animate-spin text-primary"
                strokeWidth={1.5}
                aria-hidden
              />
            </div>

            <p className="mt-5 text-sm font-medium text-foreground">
              {t("Analyzing project...")}
            </p>

            <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
              {t(
                "Reading repository structure, source modules, and recent Git history.",
              )}
            </p>
          </div>
        </GlowCard>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mt-14">
        <GlowCard className="rounded-3xl border border-border/70 bg-card/50">
          <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-amber-500">
                {t("Project intelligence")}
              </p>

              <h2 className="mt-1 text-lg font-semibold text-foreground">
                {t("Automatic analysis unavailable")}
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            </div>

            <button
              type="button"
              onClick={() => void load()}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-border/70 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/40"
            >
              <RefreshCw className="size-4" aria-hidden />

              {t("Retry")}
            </button>
          </div>
        </GlowCard>
      </section>
    );
  }

  if (!intelligence) {
    return null;
  }

  return (
    <section aria-label={t("Project intelligence")} className="mt-14">
      {/* ======================================================
       * Header
       * ====================================================== */}

      <FadeIn>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
              {t("Automatic analysis")}
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              {t("Project intelligence")}
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {t("Generated directly from the project's GitHub repository.")}
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5">
            <Sparkles className="size-3.5 text-primary" aria-hidden />

            <span className="font-mono text-[10px] uppercase tracking-widest text-primary">
              GitHub
            </span>
          </div>
        </div>
      </FadeIn>

      {/* ======================================================
       * Metrics
       * ====================================================== */}

      <FadeIn delay={0.05} className="mt-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {intelligence.metrics.map((metric, index) => (
            <IntelligenceMetricCard
              key={`${metric.label}-${index}`}
              metric={metric}
            />
          ))}
        </div>
      </FadeIn>

      {/* ======================================================
       * Tech stack
       * ====================================================== */}

      {intelligence.techStack.length > 0 && (
        <FadeIn delay={0.1} className="mt-6">
          <GlowCard className="rounded-2xl border border-border/70 bg-card/50 p-5">
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                <Layers3 className="size-4" aria-hidden />
              </div>

              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-primary">
                  {t("Detected stack")}
                </p>

                <p className="mt-1 text-sm font-semibold text-foreground">
                  {intelligence.techStack.join(" · ")}
                </p>
              </div>
            </div>
          </GlowCard>
        </FadeIn>
      )}

      {/* ======================================================
       * Architecture
       * ====================================================== */}

      <FadeIn delay={0.15} className="mt-6">
        <GlowCard className="overflow-hidden rounded-3xl border border-border/70 bg-card/50">
          <div className="border-b border-border/70 p-5">
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                <GitBranch className="size-4" aria-hidden />
              </div>

              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-primary">
                  {t("Generated architecture")}
                </p>

                <p className="mt-1 text-sm font-semibold text-foreground">
                  {intelligence.architecture.nodes.length} {t("modules")} ·{" "}
                  {intelligence.architecture.edges.length} {t("connections")}
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[760px] p-6">
              <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-border/60 bg-background/60">
                <svg
                  aria-hidden="true"
                  className="absolute inset-0 size-full"
                  viewBox="0 0 1000 560"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <marker
                      id={`auto-arrow-${slug}`}
                      markerWidth="8"
                      markerHeight="8"
                      refX="6"
                      refY="4"
                      orient="auto"
                    >
                      <path
                        d="M0,0 L8,4 L0,8 z"
                        fill="hsl(var(--primary) / 0.55)"
                      />
                    </marker>
                  </defs>

                  {intelligence.architecture.edges.map((edge, index) => {
                    const from = intelligence.architecture.nodes.find(
                      (node) => node.id === edge.from,
                    );

                    const to = intelligence.architecture.nodes.find(
                      (node) => node.id === edge.to,
                    );

                    if (!from || !to) {
                      return null;
                    }

                    const x1 = (from.x / 100) * 1000;

                    const y1 = (from.y / 100) * 560;

                    const x2 = (to.x / 100) * 1000;

                    const y2 = (to.y / 100) * 560;

                    const midX = (x1 + x2) / 2;

                    return (
                      <path
                        key={`${edge.from}-${edge.to}-${index}`}
                        d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                        fill="none"
                        stroke="hsl(var(--primary) / 0.35)"
                        strokeWidth="2"
                        strokeDasharray="7 6"
                        markerEnd={`url(#auto-arrow-${slug})`}
                        vectorEffect="non-scaling-stroke"
                      />
                    );
                  })}
                </svg>

                {intelligence.architecture.nodes.map((node) => (
                  <div
                    key={node.id}
                    className="absolute -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border/80 bg-card/90 px-4 py-3 shadow-lg backdrop-blur-xl"
                    style={{
                      left: `${node.x}%`,
                      top: `${node.y}%`,
                      width: "180px",
                    }}
                  >
                    <p className="font-mono text-[9px] uppercase tracking-widest text-primary">
                      {node.category ?? t("Module")}
                    </p>

                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {node.label}
                    </p>

                    <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-muted-foreground">
                      {node.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GlowCard>
      </FadeIn>

      {/* ======================================================
       * Timeline
       * ====================================================== */}

      {intelligence.timeline.length > 0 && (
        <FadeIn delay={0.2} className="mt-6">
          <GlowCard className="rounded-3xl border border-border/70 bg-card/50 p-5 sm:p-7">
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                <Clock3 className="size-4" aria-hidden />
              </div>

              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-primary">
                  {t("Git history")}
                </p>

                <p className="mt-1 text-sm font-semibold text-foreground">
                  {t("Engineering timeline")}
                </p>
              </div>
            </div>

            <div className="relative mt-6">
              <div
                aria-hidden
                className="absolute bottom-4 left-[15px] top-4 w-px bg-gradient-to-b from-primary/60 via-primary/20 to-transparent"
              />

              <ol className="space-y-5">
                {intelligence.timeline.map((item, index) => (
                  <TimelineItem
                    key={`${item.title}-${index}`}
                    item={item}
                    index={index}
                    total={intelligence.timeline.length}
                  />
                ))}
              </ol>
            </div>
          </GlowCard>
        </FadeIn>
      )}

      <div className="mt-3 text-right">
        <span className="font-mono text-[9px] text-muted-foreground">
          {t("Generated automatically from GitHub repository data")}
        </span>
      </div>
    </section>
  );
}

function IntelligenceMetricCard({
  metric,
}: {
  metric: IntelligenceMetric;
}): JSX.Element {
  return (
    <GlowCard className="rounded-2xl border border-border/70 bg-card/50 p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <BarChart3 className="size-4 text-primary" aria-hidden />

        <span className="font-mono text-[10px] uppercase tracking-widest">
          {metric.label}
        </span>
      </div>

      <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">
        {metric.value}
      </p>

      {metric.description && (
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          {metric.description}
        </p>
      )}
    </GlowCard>
  );
}

function TimelineItem({
  item,
  index,
  total,
}: {
  item: IntelligenceTimeline;
  index: number;
  total: number;
}): JSX.Element {
  return (
    <li className="relative grid grid-cols-[32px_1fr] gap-4">
      <div className="relative z-10 grid size-8 place-items-center rounded-full border border-border/80 bg-background">
        {index === total - 1 ? (
          <Sparkles className="size-3.5 text-primary" aria-hidden />
        ) : (
          <GitCommitHorizontal
            className="size-3.5 text-muted-foreground"
            aria-hidden
          />
        )}
      </div>

      <article className="rounded-2xl border border-border/70 bg-background/30 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold text-foreground">{item.title}</h3>

          {item.date && (
            <span className="font-mono text-[10px] text-primary">
              {item.date}
            </span>
          )}
        </div>

        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {item.description}
        </p>
      </article>
    </li>
  );
}
