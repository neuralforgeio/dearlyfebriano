"use client";

import {
  CheckCircle2,
  ExternalLink,
  GitBranch,
  GitCommitHorizontal,
  Github,
  GitPullRequest,
  LoaderCircle,
  Star,
  TriangleAlert,
} from "lucide-react";

import { useState, type JSX } from "react";

import FadeIn from "@/dearlyfebriano/components/animations/FadeIn";

import GlowCard from "@/dearlyfebriano/components/animations/GlowCard";

import { useLanguage } from "@/dearlyfebriano/i18n/language-context";

/* ============================================================
 * Types
 * ============================================================ */

interface GitHubRepositoryData {
  name: string;
  fullName: string;
  url: string;
  description: string | null;

  stars: number;
  forks: number;
  openIssues: number;

  defaultBranch: string;

  private: boolean;

  updatedAt: string | null;
  pushedAt: string | null;
}

interface GitHubCommitData {
  sha: string;
  shortSha: string;
  message: string;
  url: string;
  author: string | null;
  date: string | null;
}

interface GitHubApiResponse {
  repository: GitHubRepositoryData;
  latestCommit: GitHubCommitData | null;
}

interface ProjectGithubProps {
  githubUrl?: string;
}

/* ============================================================
 * Helpers
 * ============================================================ */

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatDate(value: string | null): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

/* ============================================================
 * Component
 * ============================================================ */

export default function ProjectGithub({
  githubUrl,
}: ProjectGithubProps): JSX.Element | null {
  const { t } = useLanguage();

  const [data, setData] = useState<GitHubApiResponse | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  /* ==========================================================
   * No GitHub repository
   * ========================================================== */

  if (!githubUrl) {
    return null;
  }

  /* ==========================================================
   * Load repository
   *
   * Intentionally triggered by user interaction instead of
   * useEffect so the component does not create an additional
   * render cycle just for initial state synchronization.
   * ========================================================== */

  const loadRepository = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/github/project?url=${encodeURIComponent(githubUrl)}`,
        {
          cache: "no-store",
        },
      );

      const result = (await response.json()) as
        | GitHubApiResponse
        | {
            error?: string;
          };

      if (!response.ok || !("repository" in result)) {
        throw new Error(
          "error" in result && result.error
            ? result.error
            : "GitHub repository could not be loaded.",
        );
      }

      setData(result);
    } catch (loadError) {
      console.error("[ProjectGithub]", loadError);

      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load GitHub repository.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  /* ==========================================================
   * Initial state
   * ========================================================== */

  if (!data && !error && !isLoading) {
    return (
      <section aria-label={t("GitHub verification")} className="mt-14">
        <FadeIn>
          <GlowCard className="overflow-hidden rounded-3xl border border-border/70 bg-card/50">
            <div className="p-5 sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Github className="size-5" aria-hidden />
                  </div>

                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                      {t("Verification")}
                    </p>

                    <h2 className="mt-1 text-xl font-semibold text-foreground">
                      {t("GitHub repository")}
                    </h2>

                    <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
                      {t(
                        "Verify the repository activity, project scale, and latest commit directly from GitHub.",
                      )}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={loadRepository}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-accent px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary/20 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
                >
                  <Github className="size-4" aria-hidden />

                  {t("Verify Repository")}
                </button>
              </div>
            </div>
          </GlowCard>
        </FadeIn>
      </section>
    );
  }

  /* ==========================================================
   * Loading
   * ========================================================== */

  if (isLoading) {
    return (
      <section aria-label={t("GitHub verification")} className="mt-14">
        <FadeIn>
          <GlowCard className="rounded-3xl border border-border/70 bg-card/50">
            <div className="flex min-h-[180px] flex-col items-center justify-center p-6 text-center">
              <div className="relative grid size-14 place-items-center">
                <span className="absolute size-14 animate-ping rounded-full bg-primary/10" />

                <LoaderCircle
                  className="relative size-8 animate-spin text-primary"
                  strokeWidth={1.5}
                  aria-hidden
                />
              </div>

              <p className="mt-4 text-sm font-medium text-foreground">
                {t("Verifying GitHub repository...")}
              </p>

              <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                github.com
              </p>
            </div>
          </GlowCard>
        </FadeIn>
      </section>
    );
  }

  /* ==========================================================
   * Error
   * ========================================================== */

  if (error) {
    return (
      <section aria-label={t("GitHub verification")} className="mt-14">
        <FadeIn>
          <GlowCard className="rounded-3xl border border-amber-500/20 bg-amber-500/5">
            <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="flex items-start gap-4">
                <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-amber-500">
                  <TriangleAlert className="size-5" aria-hidden />
                </div>

                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-500">
                    {t("Verification")}
                  </p>

                  <h2 className="mt-1 text-lg font-semibold text-foreground">
                    {t("GitHub data unavailable")}
                  </h2>

                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {error}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={loadRepository}
                  className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-background/50 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40"
                >
                  {t("Retry")}
                </button>

                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                >
                  <ExternalLink className="size-4" aria-hidden />
                  GitHub
                </a>
              </div>
            </div>
          </GlowCard>
        </FadeIn>
      </section>
    );
  }

  if (!data) {
    return null;
  }

  const { repository, latestCommit } = data;

  /* ==========================================================
   * Verified repository
   * ========================================================== */

  return (
    <section aria-label={t("GitHub verification")} className="mt-14">
      <FadeIn>
        <GlowCard className="overflow-hidden rounded-3xl border border-border/70 bg-card/50">
          {/* ==================================================
           * Header
           * ================================================== */}

          <div className="border-b border-border/70 bg-background/30 p-5 sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Github className="size-6" aria-hidden />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                      {t("Verified repository")}
                    </p>

                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2 py-0.5 text-[10px] font-medium text-emerald-500">
                      <span className="size-1.5 rounded-full bg-emerald-500" />

                      {t("Public")}
                    </span>
                  </div>

                  <h2 className="mt-1 break-all text-xl font-semibold text-foreground">
                    {repository.fullName}
                  </h2>

                  {repository.description && (
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                      {repository.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <button
                  type="button"
                  onClick={loadRepository}
                  className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-background/50 px-3.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  {t("Refresh")}
                </button>

                <a
                  href={repository.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-accent px-3.5 py-2 text-xs font-medium text-white hover:opacity-90"
                >
                  <ExternalLink className="size-3.5" aria-hidden />

                  {t("View Repository")}
                </a>
              </div>
            </div>
          </div>

          {/* ==================================================
           * Metrics
           * ================================================== */}

          <div className="grid gap-px border-b border-border/70 bg-border/50 sm:grid-cols-2 lg:grid-cols-4">
            <Metric
              icon={<Star className="size-4" aria-hidden />}
              label={t("Stars")}
              value={formatNumber(repository.stars)}
            />

            <Metric
              icon={<GitBranch className="size-4" aria-hidden />}
              label={t("Forks")}
              value={formatNumber(repository.forks)}
            />

            <Metric
              icon={<GitPullRequest className="size-4" aria-hidden />}
              label={t("Open Issues")}
              value={formatNumber(repository.openIssues)}
            />

            <Metric
              icon={<GitCommitHorizontal className="size-4" aria-hidden />}
              label={t("Last Push")}
              value={formatDate(repository.pushedAt)}
            />
          </div>

          {/* ==================================================
           * Latest commit
           * ================================================== */}

          <div className="p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-secondary text-muted-foreground">
                <GitCommitHorizontal className="size-4" aria-hidden />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {t("Latest commit")}
                </p>

                {latestCommit ? (
                  <>
                    <a
                      href={latestCommit.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block truncate text-sm font-medium text-foreground transition-colors hover:text-primary"
                      title={latestCommit.message}
                    >
                      {latestCommit.message}
                    </a>

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] text-muted-foreground">
                      <span>{latestCommit.shortSha}</span>

                      {latestCommit.author && (
                        <span>{latestCommit.author}</span>
                      )}

                      {latestCommit.date && (
                        <span>{formatDate(latestCommit.date)}</span>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("No commit information available.")}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ==================================================
           * Repository metadata
           * ================================================== */}

          <div className="border-t border-border/70 bg-background/20 px-5 py-4 sm:px-6">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[10px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2
                  className="size-3.5 text-emerald-500"
                  aria-hidden
                />

                {t("Source available")}
              </span>

              <span>
                {t("Default branch")}:{" "}
                <strong className="font-medium text-foreground">
                  {repository.defaultBranch}
                </strong>
              </span>

              <span>
                {t("Updated")}: {formatDate(repository.updatedAt)}
              </span>
            </div>
          </div>
        </GlowCard>
      </FadeIn>
    </section>
  );
}

/* ============================================================
 * Metric
 * ============================================================ */

interface MetricProps {
  icon: JSX.Element;
  label: string;
  value: string;
}

function Metric({ icon, label, value }: MetricProps): JSX.Element {
  return (
    <div className="bg-card/70 p-4 sm:p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <span className="text-primary">{icon}</span>

        <span className="font-mono text-[10px] uppercase tracking-[0.14em]">
          {label}
        </span>
      </div>

      <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
        {value}
      </p>
    </div>
  );
}
