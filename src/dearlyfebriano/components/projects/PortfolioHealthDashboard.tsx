"use client";

import {
  AlertTriangle,
  Check,
  CheckCircle2,
  CircleX,
  Clock3,
  ExternalLink,
  Github,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Wifi,
  WifiOff,
} from "lucide-react";

import { useCallback, useEffect, useState, type JSX } from "react";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

import GlowCard from "@/dearlyfebriano/components/animations/GlowCard";

import FadeIn from "@/dearlyfebriano/components/animations/FadeIn";

import { useLanguage } from "@/dearlyfebriano/i18n/language-context";

/* ============================================================
 * Types
 * ============================================================ */

interface HealthProject {
  slug: string;

  title: string;

  live: {
    configured: boolean;

    available: boolean;

    status: number | null;

    latencyMs: number | null;

    error: string | null;
  };

  github: {
    configured: boolean;

    available: boolean;

    status: number | null;

    error: string | null;
  };

  preview: {
    available: boolean;
  };

  profile: {
    complete: boolean;

    missing: string[];
  };
}

interface PortfolioHealthData {
  generatedAt: string;

  summary: {
    totalProjects: number;

    liveProjects: number;

    githubProjects: number;

    previewProjects: number;

    completeProfiles: number;

    issues: number;
  };

  projects: HealthProject[];
}

/* ============================================================
 * Component
 * ============================================================ */

export default function PortfolioHealthDashboard(): JSX.Element {
  const { t } = useLanguage();

  const [data, setData] = useState<PortfolioHealthData | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [scanning, setScanning] = useState(false);

  /* ==========================================================
   * Load health
   * ========================================================== */

  const loadHealth = useCallback(async (refresh = false): Promise<void> => {
    if (refresh) {
      setScanning(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const response = await fetch(
        `/api/portfolio-health${refresh ? "?refresh=1" : ""}`,
        {
          cache: "no-store",
        },
      );

      const result = (await response.json()) as
        | PortfolioHealthData
        | {
            error?: string;
          };

      if (!response.ok || !("summary" in result)) {
        throw new Error(
          "error" in result && result.error
            ? result.error
            : "Unable to scan portfolio health.",
        );
      }

      setData(result);
    } catch (loadError) {
      console.error("[PortfolioHealthDashboard]", loadError);

      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to scan portfolio health.",
      );
    } finally {
      setLoading(false);

      setScanning(false);
    }
  }, []);

  /* ==========================================================
   * Initial load
   * ========================================================== */

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadHealth();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadHealth]);

  /* ==========================================================
   * Loading state
   * ========================================================== */

  if (loading) {
    return (
      <section aria-label={t("Portfolio health")} className="mt-10">
        <GlowCard className="overflow-hidden rounded-3xl border border-border/70 bg-card/50">
          <div className="flex min-h-[220px] flex-col items-center justify-center p-6 text-center">
            <div className="relative">
              <div className="absolute -inset-3 animate-ping rounded-full bg-primary/10" />

              <LoaderCircle
                className="relative size-9 animate-spin text-primary"
                strokeWidth={1.5}
                aria-hidden
              />
            </div>

            <p className="mt-5 text-sm font-semibold text-foreground">
              {t("Scanning portfolio health...")}
            </p>

            <p className="mt-1 max-w-md text-xs leading-relaxed text-muted-foreground">
              {t(
                "Checking project websites, repositories, previews, and portfolio metadata.",
              )}
            </p>
          </div>
        </GlowCard>
      </section>
    );
  }

  /* ==========================================================
   * Error state
   * ========================================================== */

  if (error || !data) {
    return (
      <section aria-label={t("Portfolio health")} className="mt-10">
        <GlowCard className="rounded-3xl border border-border/70 bg-card/50 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-amber-500">
                <AlertTriangle className="size-5" aria-hidden />
              </div>

              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-amber-500">
                  {t("Portfolio health")}
                </p>

                <h2 className="mt-1 text-lg font-semibold text-foreground">
                  {t("Health scan unavailable")}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {error ?? t("Unable to scan the portfolio.")}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void loadHealth(true)}
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

  const { summary, projects, generatedAt } = data;

  const allHealthy = summary.issues === 0;

  return (
    <section aria-label={t("Portfolio health")} className="mt-10">
      {/* ======================================================
       * Header
       * ====================================================== */}

      <FadeIn>
        <GlowCard className="overflow-hidden rounded-3xl border border-border/70 bg-card/50">
          <div className="border-b border-border/70 bg-background/20 p-5 sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "grid size-11 shrink-0 place-items-center rounded-xl",
                    allHealthy
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-amber-500/10 text-amber-500",
                  )}
                >
                  {allHealthy ? (
                    <ShieldCheck className="size-5" aria-hidden />
                  ) : (
                    <AlertTriangle className="size-5" aria-hidden />
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                      {t("Automated monitoring")}
                    </p>

                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider",
                        allHealthy
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-amber-500/10 text-amber-500",
                      )}
                    >
                      {allHealthy
                        ? t("Healthy")
                        : `${summary.issues} ${t("issues")}`}
                    </span>
                  </div>

                  <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
                    {t("Portfolio Health")}
                  </h2>

                  <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    {t(
                      "An automatic health overview of the projects published in this portfolio.",
                    )}
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={scanning}
                onClick={() => void loadHealth(true)}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-border/70 bg-background/40 px-4 py-2.5 text-xs font-medium text-foreground transition-all hover:border-primary/40 hover:bg-card disabled:cursor-not-allowed disabled:opacity-50"
              >
                {scanning ? (
                  <LoaderCircle className="size-3.5 animate-spin" aria-hidden />
                ) : (
                  <RefreshCw className="size-3.5" aria-hidden />
                )}

                {scanning ? t("Scanning...") : t("Refresh Scan")}
              </button>
            </div>
          </div>

          {/* ====================================================
           * Summary cards
           * ==================================================== */}

          <div className="grid grid-cols-2 divide-x divide-y divide-border/60 border-b border-border/70 sm:grid-cols-3 lg:grid-cols-6 lg:divide-y-0">
            <HealthSummaryCard
              value={summary.totalProjects}
              label={t("Projects")}
              healthy
            />

            <HealthSummaryCard
              value={summary.liveProjects}
              label={t("Live")}
              healthy={summary.liveProjects === summary.totalProjects}
            />

            <HealthSummaryCard
              value={summary.githubProjects}
              label={t("GitHub")}
              healthy={summary.githubProjects === summary.totalProjects}
            />

            <HealthSummaryCard
              value={summary.previewProjects}
              label={t("Previews")}
              healthy={summary.previewProjects === summary.totalProjects}
            />

            <HealthSummaryCard
              value={summary.completeProfiles}
              label={t("Complete Profiles")}
              healthy={summary.completeProfiles === summary.totalProjects}
            />

            <HealthSummaryCard
              value={summary.issues}
              label={t("Issues")}
              healthy={summary.issues === 0}
              danger={summary.issues > 0}
            />
          </div>

          {/* ====================================================
           * Project rows
           * ==================================================== */}

          <div className="divide-y divide-border/60">
            {projects.map((project, index) => (
              <motion.div
                key={project.slug}
                initial={{
                  opacity: 0,
                  y: 8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: index * 0.035,
                }}
                className="p-4 sm:p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  {/* Project identity */}

                  <div className="flex min-w-0 items-start gap-3">
                    <HealthDot project={project} />

                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">
                        {project.title}
                      </p>

                      <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                        /{project.slug}
                      </p>
                    </div>
                  </div>

                  {/* Health signals */}

                  <div className="flex flex-wrap items-center gap-2">
                    <HealthSignal
                      icon={project.live.available ? Wifi : WifiOff}
                      label={
                        project.live.configured
                          ? project.live.available
                            ? t("Live")
                            : t("Offline")
                          : t("No Live URL")
                      }
                      good={project.live.available}
                    />

                    <HealthSignal
                      icon={project.github.available ? Github : CircleX}
                      label={
                        project.github.available
                          ? t("GitHub")
                          : t("GitHub issue")
                      }
                      good={project.github.available}
                    />

                    <HealthSignal
                      icon={project.preview.available ? CheckCircle2 : CircleX}
                      label={
                        project.preview.available
                          ? t("Preview")
                          : t("No Preview")
                      }
                      good={project.preview.available}
                    />

                    <HealthSignal
                      icon={project.profile.complete ? Check : AlertTriangle}
                      label={
                        project.profile.complete
                          ? t("Profile")
                          : `${project.profile.missing.length} ${t("missing")}`
                      }
                      good={project.profile.complete}
                    />

                    {project.live.latencyMs !== null && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/30 px-2.5 py-1 font-mono text-[9px] text-muted-foreground">
                        <Clock3 className="size-3" aria-hidden />
                        {project.live.latencyMs} ms
                      </span>
                    )}
                  </div>
                </div>

                {/* Missing profile details */}

                {!project.profile.complete && (
                  <div className="mt-3 rounded-xl border border-amber-500/15 bg-amber-500/5 px-3 py-2">
                    <p className="text-xs leading-relaxed text-amber-600 dark:text-amber-400">
                      {t("Missing project fields:")}{" "}
                      <span className="font-mono">
                        {project.profile.missing.join(", ")}
                      </span>
                    </p>
                  </div>
                )}

                {/* Errors */}

                {(project.live.error || project.github.error) && (
                  <div className="mt-3 rounded-xl border border-red-500/15 bg-red-500/5 px-3 py-2">
                    <p className="text-xs leading-relaxed text-red-600 dark:text-red-400">
                      {project.live.error ?? project.github.error}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* ====================================================
           * Footer
           * ==================================================== */}

          <div className="border-t border-border/70 bg-background/20 px-5 py-3">
            <div className="flex flex-col gap-2 text-[9px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <span className="inline-flex items-center gap-1.5 font-mono uppercase tracking-wider">
                <Sparkles className="size-3 text-primary" aria-hidden />

                {t("Automated portfolio diagnostics")}
              </span>

              <span className="font-mono">
                {t("Last scan")} {formatTimestamp(generatedAt)}
              </span>
            </div>
          </div>
        </GlowCard>
      </FadeIn>
    </section>
  );
}

/* ============================================================
 * Summary card
 * ============================================================ */

function HealthSummaryCard({
  value,
  label,
  healthy,
  danger = false,
}: {
  value: number;
  label: string;
  healthy: boolean;
  danger?: boolean;
}): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center px-3 py-5 text-center sm:py-6">
      <span
        className={cn(
          "text-2xl font-bold tracking-tight",
          danger
            ? "text-red-500"
            : healthy
              ? "text-foreground"
              : "text-amber-500",
        )}
      >
        {value}
      </span>

      <span className="mt-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

/* ============================================================
 * Health dot
 * ============================================================ */

function HealthDot({ project }: { project: HealthProject }): JSX.Element {
  const healthy =
    project.live.available &&
    project.github.available &&
    project.preview.available &&
    project.profile.complete;

  return (
    <span
      className={cn(
        "mt-1.5 size-2.5 shrink-0 rounded-full",
        healthy
          ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.45)]"
          : "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.45)]",
      )}
      aria-hidden
    />
  );
}

/* ============================================================
 * Signal
 * ============================================================ */

function HealthSignal({
  icon: Icon,
  label,
  good,
}: {
  icon: typeof Check;
  label: string;
  good: boolean;
}): JSX.Element {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider",
        good
          ? "border-emerald-500/15 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400"
          : "border-red-500/15 bg-red-500/5 text-red-600 dark:text-red-400",
      )}
    >
      <Icon className="size-3" aria-hidden />

      {label}
    </span>
  );
}

/* ============================================================
 * Timestamp
 * ============================================================ */

function formatTimestamp(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
