"use client";

/* ============================================================
 * GitHubStatsBadge
 *
 * Live stats repository GitHub (stars, forks, last commit)
 * yang diambil dari /api/github/project dan ditampilkan:
 * 1. Compact  -> pill kecil di project card (stars + forks)
 * 2. Full     -> blok stats lengkap di halaman detail project
 *    (stars, forks, last commit message + relative time)
 *
 * Pola sama seperti ProjectHealthBadge:
 * - client-side cache per repo (TTL 30 menit)
 * - graceful fallback bila API gagal
 * - tidak memblokir render (badge merosot kecil)
 * ============================================================ */

import { GitFork, Star, GitCommitHorizontal, LoaderCircle } from "lucide-react";

import { useCallback, useEffect, useRef, useState, type JSX } from "react";

import { cn } from "@/lib/utils";

import { useLanguage } from "@/dearlyfebriano/i18n/language-context";

/* ============================================================
 * Types — sesuai respons /api/github/project
 * ============================================================ */

interface GitHubProjectStats {
  repository: {
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
  };

  latestCommit: {
    sha: string;
    shortSha: string;
    message: string;
    url: string;
    author: string | null;
    date: string | null;
  } | null;
}

interface GitHubStatsBadgeProps {
  /** Repository URL, mis. https://github.com/neuralforgeio/LinkPulse */
  repoUrl: string;

  /** Pill ringkas untuk card (default) atau blok lengkap untuk detail page */
  variant?: "compact" | "full";
}

/* ============================================================
 * Client-side cache
 * ============================================================ */

const statsCache = new Map<
  string,
  {
    data: GitHubProjectStats;
    expiresAt: number;
  }
>();

const CACHE_TTL = 30 * 60 * 1000;

/* ============================================================
 * Helpers
 * ============================================================ */

function formatCount(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;
  }

  return String(value);
}

function relativeTime(iso: string | null, t: (key: string) => string): string {
  if (!iso) {
    return t("Unknown");
  }

  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();

  if (Number.isNaN(diffMs)) {
    return t("Unknown");
  }

  const minutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);

  if (minutes < 1) {
    return t("Just now");
  }

  if (minutes < 60) {
    return `${minutes} ${t("minutes ago")}`;
  }

  if (hours < 24) {
    return `${hours} ${hours === 1 ? t("hour ago") : t("hours ago")}`;
  }

  if (days < 30) {
    return `${days} ${days === 1 ? t("day ago") : t("days ago")}`;
  }

  return `${months} ${months === 1 ? t("month ago") : t("months ago")}`;
}

/* ============================================================
 * Component
 * ============================================================ */

export default function GitHubStatsBadge({
  repoUrl,
  variant = "compact",
}: GitHubStatsBadgeProps): JSX.Element | null {
  const { t } = useLanguage();

  const [stats, setStats] = useState<GitHubProjectStats | null>(null);

  const [loading, setLoading] = useState(true);

  const [failed, setFailed] = useState(false);

  const mountedRef = useRef(true);

  const loadStats = useCallback(async (): Promise<void> => {
    setLoading(true);
    setFailed(false);

    const cached = statsCache.get(repoUrl);

    if (cached && cached.expiresAt > Date.now()) {
      setStats(cached.data);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `/api/github/project?url=${encodeURIComponent(repoUrl)}`,
        {
          cache: "no-store",
        },
      );

      const data = (await response.json()) as
        | GitHubProjectStats
        | { error?: string };

      if (!response.ok || !("repository" in data)) {
        throw new Error(
          "error" in data && data.error
            ? data.error
            : "GitHub stats request failed.",
        );
      }

      statsCache.set(repoUrl, {
        data,
        expiresAt: Date.now() + CACHE_TTL,
      });

      if (mountedRef.current) {
        setStats(data);
      }
    } catch {
      // Gagal fetch stats tidak boleh merusak kartu — cukup sembunyikan.
      if (mountedRef.current) {
        setFailed(true);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [repoUrl]);

  useEffect(() => {
    mountedRef.current = true;

    const timer = window.setTimeout(() => {
      void loadStats();
    }, 0);

    return () => {
      mountedRef.current = false;

      window.clearTimeout(timer);
    };
  }, [loadStats]);

  /* ==========================================================
   * Loading / failed -> jangan render apa pun yang mengganggu
   * ========================================================== */

  if (loading || failed || !stats) {
    if (variant === "full") {
      return (
        <div
          aria-busy={loading}
          className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
        >
          {loading && <LoaderCircle className="size-3 animate-spin" aria-hidden />}

          <span>{loading ? t("Loading repository stats") : ""}</span>
        </div>
      );
    }

    return null;
  }

  const { repository, latestCommit } = stats;

  /* ==========================================================
   * Compact pill — untuk project cards
   * ========================================================== */

  if (variant === "compact") {
    return (
      <a
        href={repository.url}
        target="_blank"
        rel="noopener noreferrer"
        title={`${repository.fullName} — ${t("view on GitHub")}`}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-black/70 px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-muted-foreground transition-colors hover:border-foreground/25 hover:text-foreground"
      >
        <span className="inline-flex items-center gap-1">
          <Star className="size-3 text-amber-300" aria-hidden />

          <span className="tabular-nums">
            {formatCount(repository.stars)}
          </span>
        </span>

        <span className="opacity-40" aria-hidden>
          ·
        </span>

        <span className="inline-flex items-center gap-1">
          <GitFork className="size-3" aria-hidden />

          <span className="tabular-nums">
            {formatCount(repository.forks)}
          </span>
        </span>
      </a>
    );
  }

  /* ==========================================================
   * Full block — untuk halaman detail project
   * ========================================================== */

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
      {/* Stars */}

      <a
        href={repository.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        title={t("Stars on GitHub")}
      >
        <Star className="size-4 text-amber-300" aria-hidden />

        <span className="tabular-nums font-medium text-foreground">
          {formatCount(repository.stars)}
        </span>

        <span className="sr-only">{t("stars")}</span>
      </a>

      {/* Forks */}

      <a
        href={repository.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        title={t("Forks on GitHub")}
      >
        <GitFork className="size-4" aria-hidden />

        <span className="tabular-nums font-medium text-foreground">
          {formatCount(repository.forks)}
        </span>

        <span className="sr-only">{t("forks")}</span>
      </a>

      {/* Open issues */}

      <span
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground"
        title={t("Open issues on GitHub")}
      >
        <span className="tabular-nums font-medium text-foreground">
          {repository.openIssues}
        </span>

        {t("open issues")}
      </span>

      {/* Latest commit */}

      {latestCommit && (
        <a
          href={latestCommit.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-w-0 max-w-full items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          title={`${latestCommit.message} (${latestCommit.shortSha})`}
        >
          <GitCommitHorizontal
            className="size-4 shrink-0 text-primary"
            aria-hidden
          />

          <span className="truncate font-mono text-xs text-foreground">
            {latestCommit.shortSha}
          </span>

          <span className="truncate text-xs">
            {latestCommit.message} · {relativeTime(latestCommit.date, t)}
          </span>
        </a>
      )}
    </div>
  );
}
