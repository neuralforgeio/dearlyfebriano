"use client";

import { useEffect, useState } from "react";
import {
  Github,
  RefreshCw,
  GitCommit,
  CalendarDays,
  Flame,
  Trophy,
} from "lucide-react";

type ContributionDay = {
  date: string;
  contributionCount: number;
  contributionLevel:
    | "NONE"
    | "FIRST_QUARTILE"
    | "SECOND_QUARTILE"
    | "THIRD_QUARTILE"
    | "FOURTH_QUARTILE";
};

type GitHubActivityData = {
  username: string;
  totalContributions: number;
  weeks: ContributionDay[][];
  updatedAt: string;
};

const colors: Record<ContributionDay["contributionLevel"], string> = {
  NONE: "bg-muted",
  FIRST_QUARTILE: "bg-emerald-950",
  SECOND_QUARTILE: "bg-emerald-800",
  THIRD_QUARTILE: "bg-emerald-600",
  FOURTH_QUARTILE: "bg-emerald-400",
};

function calculateInsights(data: GitHubActivityData) {
  const days = data.weeks.flat().sort((a, b) => a.date.localeCompare(b.date));

  const activeDays = days.filter((day) => day.contributionCount > 0).length;

  let currentStreak = 0;
  let longestStreak = 0;

  for (const day of days) {
    if (day.contributionCount > 0) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  const bestDay = days.reduce<ContributionDay | null>((best, day) => {
    if (!best || day.contributionCount > best.contributionCount) {
      return day;
    }

    return best;
  }, null);

  const bestDayDate = bestDay
    ? new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(`${bestDay.date}T00:00:00Z`))
    : "Belum ada aktivitas";

  return {
    activeDays,
    longestStreak,
    bestDay,
    bestDayDate,
  };
}

export function GitHubActivity() {
  const [data, setData] = useState<GitHubActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadActivity() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/github-activity", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          [result.error, result.details].filter(Boolean).join(" — ") ||
            "Gagal mengambil data GitHub.",
        );
      }

      setData(result as GitHubActivityData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadActivity();
  }, []);

  const insights = data ? calculateInsights(data) : null;

  const stats =
    data && insights
      ? [
          {
            label: "Total Contributions",
            value: data.totalContributions.toLocaleString("id-ID"),
            description: "Dalam 12 bulan terakhir",
            icon: GitCommit,
          },
          {
            label: "Active Days",
            value: insights.activeDays.toLocaleString("id-ID"),
            description: "Hari dengan kontribusi",
            icon: CalendarDays,
          },
          {
            label: "Longest Streak",
            value: `${insights.longestStreak} days`,
            description: "Kontribusi berturut-turut",
            icon: Flame,
          },
          {
            label: "Best Day",
            value: (insights.bestDay?.contributionCount ?? 0).toLocaleString(
              "id-ID",
            ),
            description: insights.bestDayDate,
            icon: Trophy,
          },
        ]
      : [];

  return (
    <section aria-label="GitHub developer activity" className="mt-16 sm:mt-20">
      {/* Section header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-50" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>

            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Live Developer
            </p>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            GitHub Contributions
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            An overview of my development activity and consistency.
          </p>
        </div>

        <a
          href="https://github.com/dearlyfebriano"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
        >
          <Github className="size-4" />
          View GitHub
        </a>
      </div>

      {/* Loading */}
      {loading && (
        <div
          className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground"
          role="status"
        >
          Memuat aktivitas GitHub...
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-destructive">{error}</p>

          <button
            type="button"
            onClick={() => void loadActivity()}
            className="mt-3 inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <RefreshCw className="size-4" />
            Coba lagi
          </button>
        </div>
      )}

      {/* Dashboard */}
      {!loading && data && insights && (
        <>
          {/* Statistics */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <article
                  key={stat.label}
                  className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-emerald-500/40 sm:p-5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-muted-foreground sm:text-sm">
                      {stat.label}
                    </span>

                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 transition-colors group-hover:bg-emerald-500/15">
                      <Icon className="size-4" />
                    </div>
                  </div>

                  <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    {stat.value}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </article>
              );
            })}
          </div>

          {/* Contribution calendar */}
          <article className="mt-4 rounded-xl border border-border bg-card p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-foreground">
                  Contribution activity
                </h3>

                <p className="mt-1 text-xs text-muted-foreground">
                  Daily development activity over the last 12 months
                </p>
              </div>

              <button
                type="button"
                onClick={() => void loadActivity()}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
              >
                <RefreshCw className="size-3.5" />
                Refresh
              </button>
            </div>

            {/* Month labels and heatmap */}
            <div className="mt-6 overflow-x-auto pb-3">
              <div className="min-w-max">
                <div className="mb-2 flex gap-1">
                  {data.weeks.map((week, index) => {
                    const firstOfMonth = week.find(
                      (day) => day.date.slice(-2) === "01",
                    );

                    const monthLabel = firstOfMonth
                      ? new Intl.DateTimeFormat("en", {
                          month: "short",
                          timeZone: "UTC",
                        }).format(new Date(`${firstOfMonth.date}T00:00:00Z`))
                      : "";

                    return (
                      <div
                        key={week[0]?.date ?? index}
                        className="w-3 shrink-0 text-[10px] text-muted-foreground sm:w-3.5"
                      >
                        {monthLabel}
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-1">
                  {data.weeks.map((week, index) => (
                    <div
                      key={week[0]?.date ?? index}
                      className="grid grid-rows-7 gap-1"
                    >
                      {week.map((day) => (
                        <div
                          key={day.date}
                          title={`${day.contributionCount} contributions on ${day.date}`}
                          aria-label={`${day.contributionCount} contributions on ${day.date}`}
                          className={`size-3 rounded-[3px] transition-transform hover:scale-125 sm:size-3.5 ${colors[day.contributionLevel]}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>Each square represents one day.</span>

              <div className="flex items-center gap-1.5">
                <span>Less</span>

                {(
                  [
                    "NONE",
                    "FIRST_QUARTILE",
                    "SECOND_QUARTILE",
                    "THIRD_QUARTILE",
                    "FOURTH_QUARTILE",
                  ] as const
                ).map((level) => (
                  <span
                    key={level}
                    className={`size-3 rounded-[3px] ${colors[level]}`}
                  />
                ))}

                <span>More</span>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
              <span>@{data.username}</span>

              <span>
                Last updated: {new Date(data.updatedAt).toLocaleString("id-ID")}
              </span>
            </div>
          </article>
        </>
      )}
    </section>
  );
}
