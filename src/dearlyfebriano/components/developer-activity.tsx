"use client";

import { useEffect, useState } from "react";

type ActivityItem = {
  name: string;
  time: string;
  percent: number;
  totalSeconds: number;
};

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

type ActivityPayload = {
  generatedAt: string;
  wakatime: {
    status: "ok" | "partial" | "error";
    diagnostics: {
      errors: {
        allTime: string | null;
        last7Days: string | null;
        last30Days: string | null;
      };
      username: string | null;
      allTimePercentCalculated: number | null;
      last7DaysPercentCalculated: number | null;
      last30DaysPercentCalculated: number | null;
    };
    totalTime: string | null;
    last7Days: string;
    dailyAverage: string;
    bestDay: { date: string; time: string } | null;
    isUpToDate: boolean | null;
    languages: ActivityItem[];
    editors: ActivityItem[];
    projects: ActivityItem[];
  };
  github: {
    username: string;
    joinedAt: string;
    followers: number;
    contributionsLastYear: number;
    commits: number;
    issues: number;
    pullRequests: number;
    reviews: number;
    weeks: ContributionDay[][];
  };
};

const contributionColors: Record<ContributionDay["contributionLevel"], string> =
  {
    NONE: "bg-muted",
    FIRST_QUARTILE: "bg-emerald-950/70",
    SECOND_QUARTILE: "bg-emerald-800",
    THIRD_QUARTILE: "bg-emerald-600",
    FOURTH_QUARTILE: "bg-emerald-400",
  };

function ActivityBars({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Belum ada aktivitas yang tercatat pada periode ini.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.name}>
          <div className="mb-2 flex items-center justify-between gap-3 text-sm">
            <span className="truncate font-medium text-foreground">
              {item.name}
            </span>
            <span className="shrink-0 text-muted-foreground">{item.time}</span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-500"
              style={{
                width: `${Math.min(100, Math.max(0, item.percent))}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DeveloperActivity() {
  const [data, setData] = useState<ActivityPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadActivity() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/developer-activity", {
          cache: "no-store",
          signal: controller.signal,
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.details ?? result.error ?? "Activity API request failed.",
          );
        }

        setData(result as ActivityPayload);
      } catch (cause) {
        if (cause instanceof Error && cause.name === "AbortError") {
          return;
        }

        setError(
          cause instanceof Error
            ? cause.message
            : "Data aktivitas belum bisa dimuat.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadActivity();

    return () => controller.abort();
  }, []);

  if (loading && !data) {
    return (
      <section aria-label="Developer activity" className="mt-20 sm:mt-24">
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="font-medium text-foreground">Developer Activity</p>
          <p className="mt-2 text-sm text-muted-foreground" role="status">
            Mengambil statistik WakaTime dan GitHub...
          </p>
        </div>
      </section>
    );
  }

  if (error && !data) {
    return (
      <section aria-label="Developer activity" className="mt-20 sm:mt-24">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold text-foreground">Developer Activity</h2>
          <p className="mt-3 text-sm text-red-500" role="alert">
            {error}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted"
          >
            Coba lagi
          </button>
        </div>
      </section>
    );
  }

  if (!data) return null;

  const { wakatime, github } = data;

  const joinedDate = new Date(github.joinedAt).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  const metrics = [
    {
      label: "Total coding time",
      value: wakatime.totalTime ?? "Belum tersedia",
      detail: "Seluruh waktu yang tercatat",
    },
    {
      label: "Coding · 7 hari",
      value: wakatime.last7Days,
      detail: `Rata-rata harian: ${wakatime.dailyAverage}`,
    },
    {
      label: "GitHub member since",
      value: joinedDate,
      detail: `${github.followers.toLocaleString("id-ID")} followers`,
    },
    {
      label: "Contributions · 1 tahun",
      value: github.contributionsLastYear.toLocaleString("id-ID"),
      detail: "Aktivitas pada kalender GitHub",
    },
  ];

  const diagnostics = wakatime.diagnostics;
  const wakaHasError = Object.values(diagnostics.errors).some(Boolean);
  const noCodingData =
    wakatime.totalTime === "0:00" ||
    wakatime.totalTime === "0 secs" ||
    wakatime.totalTime === "0:00:00";

  return (
    <section aria-label="Developer activity" className="mt-20 sm:mt-24">
      <div className="mb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Developer telemetry
        </p>

        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Developer Activity
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Coding time, programming languages, and GitHub contributions in one
          place.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <article
            key={metric.label}
            className="min-w-0 rounded-xl border border-border bg-card p-5 transition-colors hover:border-foreground/25"
          >
            <p className="text-sm text-muted-foreground">{metric.label}</p>
            <p className="mt-3 break-words text-xl font-semibold tracking-tight text-foreground">
              {metric.value}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {metric.detail}
            </p>
          </article>
        ))}
      </div>

      <article className="mt-4 rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="font-semibold text-foreground">
              GitHub contribution activity
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Aktivitas selama satu tahun terakhir.
            </p>
          </div>

          <a
            href={`https://github.com/${github.username}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-primary hover:underline"
          >
            View GitHub profile ↗
          </a>
        </div>

        <div
          className="mt-5 flex gap-1 overflow-x-auto pb-3"
          aria-label="GitHub contribution heatmap"
        >
          {github.weeks.map((week, index) => (
            <div
              key={week[0]?.date ?? index}
              className="grid shrink-0 grid-rows-7 gap-1"
            >
              {week.map((day) => (
                <span
                  key={day.date}
                  title={`${day.contributionCount} contributions on ${day.date}`}
                  aria-label={`${day.contributionCount} contributions on ${day.date}`}
                  className={`size-2.5 rounded-[3px] ${
                    contributionColors[day.contributionLevel]
                  }`}
                />
              ))}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
          <span>{github.commits.toLocaleString("id-ID")} commits</span>
          <span>{github.issues.toLocaleString("id-ID")} issues</span>
          <span>{github.pullRequests.toLocaleString("id-ID")} PRs</span>
          <span>{github.reviews.toLocaleString("id-ID")} reviews</span>
        </div>
      </article>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <h3 className="font-semibold text-foreground">
            Programming languages
          </h3>
          <p className="mb-6 mt-1 text-sm text-muted-foreground">
            Waktu penggunaan selama 30 hari terakhir.
          </p>
          <ActivityBars items={wakatime.languages} />
        </article>

        <article className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <h3 className="font-semibold text-foreground">Projects tracked</h3>
          <p className="mb-6 mt-1 text-sm text-muted-foreground">
            Project dengan waktu coding terbanyak.
          </p>

          <ActivityBars items={wakatime.projects} />

          <div className="mt-6 border-t border-border pt-5">
            <h4 className="mb-3 text-sm font-medium text-foreground">
              Editors used
            </h4>

            <div className="flex flex-wrap gap-2">
              {wakatime.editors.length > 0 ? (
                wakatime.editors.map((editor) => (
                  <span
                    key={editor.name}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted-foreground"
                  >
                    {editor.name}
                    <span className="ml-2 text-foreground">{editor.time}</span>
                  </span>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Belum ada data editor.
                </p>
              )}
            </div>
          </div>
        </article>
      </div>

      <article className="mt-4 rounded-xl border border-border bg-card p-5">
        <h3 className="font-semibold text-foreground">WakaTime diagnostics</h3>

        <p className="mt-2 text-sm text-muted-foreground">
          Status API: {wakatime.status}
          {diagnostics.username ? ` · Akun: ${diagnostics.username}` : ""}
        </p>

        {noCodingData && !wakaHasError && (
          <p className="mt-3 text-sm text-amber-600">
            API berhasil diakses, tetapi WakaTime melaporkan waktu coding nol.
            Periksa plugin WakaTime pada editor dan pastikan heartbeat
            benar-benar terkirim ke akun yang sama.
          </p>
        )}

        {Object.entries(diagnostics.errors).map(([endpoint, message]) =>
          message ? (
            <p key={endpoint} className="mt-2 break-words text-sm text-red-500">
              {endpoint}: {message}
            </p>
          ) : null,
        )}

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
          <span>
            All-time calculation:{" "}
            {diagnostics.allTimePercentCalculated ?? "N/A"}%
          </span>
          <span>
            7-day calculation: {diagnostics.last7DaysPercentCalculated ?? "N/A"}
            %
          </span>
          <span>
            30-day calculation:{" "}
            {diagnostics.last30DaysPercentCalculated ?? "N/A"}%
          </span>
        </div>
      </article>

      <div className="mt-4 flex flex-col gap-2 rounded-xl border border-border p-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          {wakatime.bestDay
            ? `Best coding day: ${wakatime.bestDay.date} · ${wakatime.bestDay.time}`
            : "Data hari terproduktif belum tersedia."}
        </p>

        <p>
          {wakatime.isUpToDate === false
            ? "WakaTime sedang memperbarui data."
            : "Data berasal dari WakaTime dan GitHub."}
        </p>
      </div>
    </section>
  );
}
