"use client";

import {
  CheckCircle2,
  CircleAlert,
  Clock3,
  Github,
  LoaderCircle,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react";

import { useCallback, useEffect, useRef, useState, type JSX } from "react";

import { cn } from "@/lib/utils";

import { useLanguage } from "@/dearlyfebriano/i18n/language-context";

/* ============================================================
 * Types
 * ============================================================ */

interface ProjectHealth {
  slug: string;

  live: {
    available: boolean;
    status: number | null;
    latencyMs: number | null;
    checkedAt: string;
    url: string | null;
    error: string | null;
  };

  github: {
    available: boolean;
    status: number | null;
    checkedAt: string;
    url: string | null;
    error: string | null;
  };
}

interface ProjectHealthBadgeProps {
  slug: string;
  compact?: boolean;
}

/* ============================================================
 * Small client-side cache
 *
 * Prevents repeated navigation/renders from immediately
 * issuing the same request again.
 * ============================================================ */

const healthCache = new Map<
  string,
  {
    data: ProjectHealth;
    expiresAt: number;
  }
>();

const CACHE_TTL = 5 * 60 * 1000;

/* ============================================================
 * Helper
 * ============================================================ */

function getHealthLevel(
  health: ProjectHealth,
): "live" | "degraded" | "offline" | "unknown" {
  if (health.live.available) {
    if (health.live.latencyMs !== null && health.live.latencyMs > 1500) {
      return "degraded";
    }

    return "live";
  }

  if (health.live.status !== null || health.live.error) {
    return "offline";
  }

  return "unknown";
}

/* ============================================================
 * Component
 * ============================================================ */

export default function ProjectHealthBadge({
  slug,
  compact = false,
}: ProjectHealthBadgeProps): JSX.Element {
  const { t } = useLanguage();

  const [health, setHealth] = useState<ProjectHealth | null>(null);

  const [loading, setLoading] = useState(true);

  const [failed, setFailed] = useState(false);

  const mountedRef = useRef(true);

  const loadHealth = useCallback(
    async (force = false): Promise<void> => {
      setLoading(true);
      setFailed(false);

      const cached = healthCache.get(slug);

      if (!force && cached && cached.expiresAt > Date.now()) {
        setHealth(cached.data);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/project-health?slug=${encodeURIComponent(slug)}`,
          {
            cache: "no-store",
          },
        );

        const data = (await response.json()) as
          | ProjectHealth
          | {
              error?: string;
            };

        if (!response.ok || !("live" in data)) {
          throw new Error(
            "error" in data && data.error ? data.error : "Health check failed.",
          );
        }

        healthCache.set(slug, {
          data,
          expiresAt: Date.now() + CACHE_TTL,
        });

        if (mountedRef.current) {
          setHealth(data);
        }
      } catch (error) {
        console.error("[ProjectHealthBadge]", error);

        if (mountedRef.current) {
          setFailed(true);
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [slug],
  );

  useEffect(() => {
    mountedRef.current = true;

    const timer = window.setTimeout(() => {
      void loadHealth();
    }, 0);

    return () => {
      mountedRef.current = false;

      window.clearTimeout(timer);
    };
  }, [loadHealth]);

  /* ==========================================================
   * Loading
   * ========================================================== */

  if (loading) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-black/50 px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-muted-foreground backdrop-blur-md",
          compact && "px-2 py-0.5",
        )}
      >
        <LoaderCircle className="size-3 animate-spin" aria-hidden />

        {!compact && t("Checking")}
      </span>
    );
  }

  /* ==========================================================
   * Failed to fetch health API
   * ========================================================== */

  if (failed || !health) {
    return (
      <button
        type="button"
        onClick={() => void loadHealth(true)}
        title={t("Retry project health check")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-black/50 px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-muted-foreground backdrop-blur-md transition-colors hover:border-primary/40 hover:text-foreground",
          compact && "px-2 py-0.5",
        )}
      >
        <RefreshCw className="size-3" aria-hidden />

        {!compact && t("Unavailable")}
      </button>
    );
  }

  const level = getHealthLevel(health);

  const githubAvailable = health.github.available;

  const latency = health.live.latencyMs;

  /* ==========================================================
   * LIVE
   * ========================================================== */

  if (level === "live") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-black/55 px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-emerald-300 backdrop-blur-md",
          compact && "px-2 py-0.5",
        )}
        title={latency !== null ? `${t("Response")}: ${latency}ms` : t("Live")}
      >
        <Wifi className="size-3" aria-hidden />

        {!compact && <span>{t("Live")}</span>}

        {!compact && latency !== null && (
          <>
            <span className="opacity-40">·</span>

            <span className="tabular-nums">{latency}ms</span>
          </>
        )}

        {githubAvailable && (
          <Github className="ml-0.5 size-3" aria-label={t("GitHub verified")} />
        )}
      </div>
    );
  }

  /* ==========================================================
   * DEGRADED
   * ========================================================== */

  if (level === "degraded") {
    return (
      <button
        type="button"
        onClick={() => void loadHealth(true)}
        title={`${t("Slow response")}${
          latency !== null ? ` · ${latency}ms` : ""
        }`}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-amber-400/25 bg-black/55 px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-amber-300 backdrop-blur-md transition-colors hover:border-amber-300/40",
          compact && "px-2 py-0.5",
        )}
      >
        <Clock3 className="size-3" aria-hidden />

        {!compact && <span>{t("Slow")}</span>}

        {latency !== null && <span className="tabular-nums">{latency}ms</span>}
      </button>
    );
  }

  /* ==========================================================
   * OFFLINE
   * ========================================================== */

  return (
    <button
      type="button"
      onClick={() => void loadHealth(true)}
      title={health.live.error ?? t("Project is currently unavailable")}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-red-400/20 bg-black/55 px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-red-300 backdrop-blur-md transition-colors hover:border-red-300/40",
        compact && "px-2 py-0.5",
      )}
    >
      <WifiOff className="size-3" aria-hidden />

      {!compact && <span>{t("Offline")}</span>}

      {githubAvailable && (
        <Github
          className="ml-0.5 size-3 text-emerald-300"
          aria-label={t("GitHub verified")}
        />
      )}
    </button>
  );
}
