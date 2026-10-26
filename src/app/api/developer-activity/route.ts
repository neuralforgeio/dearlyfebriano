import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type WakaItem = {
  name: string;
  text?: string;
  digital?: string;
  percent?: number;
  total_seconds?: number;
};

type WakaStats = {
  username?: string;
  total_seconds?: number;
  digital?: string;
  decimal?: string;
  human_readable_total?: string;
  human_readable_daily_average?: string;
  is_up_to_date?: boolean;
  percent_calculated?: number;
  modified_at?: string;
  best_day?: {
    date: string;
    text: string;
    total_seconds: number;
  };
  languages?: WakaItem[];
  editors?: WakaItem[];
  projects?: WakaItem[];
};

type WakaEnvelope<T> = {
  data?: T;
  error?: string;
  errors?: { message: string }[];
};

type GitHubDay = {
  date: string;
  contributionCount: number;
  contributionLevel:
    | "NONE"
    | "FIRST_QUARTILE"
    | "SECOND_QUARTILE"
    | "THIRD_QUARTILE"
    | "FOURTH_QUARTILE";
};

type GitHubUser = {
  createdAt: string;
  followers: { totalCount: number };
  contributionsCollection: {
    totalCommitContributions: number;
    totalIssueContributions: number;
    totalPullRequestContributions: number;
    totalPullRequestReviewContributions: number;
    contributionCalendar: {
      totalContributions: number;
      weeks: { contributionDays: GitHubDay[] }[];
    };
  };
};

type GitHubResponse = {
  data?: { user: GitHubUser | null };
  errors?: { message: string }[];
};

function formatSeconds(seconds?: number): string {
  if (seconds === undefined || !Number.isFinite(seconds) || seconds < 0) {
    return "—";
  }

  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  if (hours > 0) return `${hours} hrs ${minutes} mins`;
  if (minutes > 0) return `${minutes} mins`;
  return `${secs} secs`;
}

function normalizeItems(items: WakaItem[] = []) {
  return items.slice(0, 6).map((item) => ({
    name: item.name,
    time: item.text ?? item.digital ?? "—",
    percent: item.percent ?? 0,
    totalSeconds: item.total_seconds ?? 0,
  }));
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });

  const raw = await response.text();

  let body: unknown;

  try {
    body = raw ? JSON.parse(raw) : null;
  } catch {
    throw new Error(
      `${new URL(url).hostname}: respons bukan JSON (HTTP ${response.status})`,
    );
  }

  if (!response.ok) {
    const obj = body as {
      error?: string;
      message?: string;
      errors?: { message: string }[];
    };

    const message =
      obj?.errors?.map((item) => item.message).join("; ") ||
      obj?.error ||
      obj?.message ||
      "";

    throw new Error(
      `${new URL(url).hostname}: HTTP ${response.status}` +
        (message ? ` - ${message.slice(0, 200)}` : ""),
    );
  }

  if (body === null) {
    throw new Error(`${new URL(url).hostname}: respons kosong`);
  }

  return body as T;
}

async function fetchWaka<T>(
  token: string,
  resource: string,
): Promise<WakaEnvelope<T>> {
  const url = new URL(
    `https://api.wakatime.com/api/v1/users/current/${resource}`,
  );

  return fetchJson<WakaEnvelope<T>>(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
}

export async function GET() {
  const wakaToken = process.env.WAKATIME_ACCESS_TOKEN?.trim();
  const githubToken = process.env.GITHUB_TOKEN?.trim();
  const githubUsername = process.env.GITHUB_USERNAME?.trim();

  if (!wakaToken || !githubToken || !githubUsername) {
    return NextResponse.json(
      {
        error: "Konfigurasi developer activity belum lengkap.",
        hint: "Periksa WAKATIME_ACCESS_TOKEN, GITHUB_TOKEN, dan GITHUB_USERNAME di .env.local.",
      },
      { status: 500 },
    );
  }

  const now = new Date();
  const from = new Date(now);
  from.setUTCFullYear(from.getUTCFullYear() - 1);

  const query = `
    query DeveloperActivity(
      $login: String!
      $from: DateTime!
      $to: DateTime!
    ) {
      user(login: $login) {
        createdAt
        followers {
          totalCount
        }
        contributionsCollection(from: $from, to: $to) {
          totalCommitContributions
          totalIssueContributions
          totalPullRequestContributions
          totalPullRequestReviewContributions
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                contributionLevel
              }
            }
          }
        }
      }
    }
  `;

  try {
    // Setiap endpoint WakaTime memiliki hasil dan error sendiri.
    const [allTimeResult, sevenResult, thirtyResult, github] =
      await Promise.all([
        fetchWaka<{
          digital?: string;
          decimal?: string;
          total_seconds?: number;
          is_up_to_date?: boolean;
          percent_calculated?: number;
        }>(wakaToken, "all_time_since_today").then(
          (result) => ({ result, error: null as string | null }),
          (error: unknown) => ({
            result: null,
            error: error instanceof Error ? error.message : "Unknown error",
          }),
        ),

        fetchWaka<WakaStats>(wakaToken, "stats/last_7_days").then(
          (result) => ({ result, error: null as string | null }),
          (error: unknown) => ({
            result: null,
            error: error instanceof Error ? error.message : "Unknown error",
          }),
        ),

        fetchWaka<WakaStats>(wakaToken, "stats/last_30_days").then(
          (result) => ({ result, error: null as string | null }),
          (error: unknown) => ({
            result: null,
            error: error instanceof Error ? error.message : "Unknown error",
          }),
        ),

        fetchJson<GitHubResponse>("https://api.github.com/graphql", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${githubToken}`,
            "Content-Type": "application/json",
            "X-GitHub-Api-Version": "2022-11-28",
          },
          body: JSON.stringify({
            query,
            variables: {
              login: githubUsername,
              from: from.toISOString(),
              to: now.toISOString(),
            },
          }),
        }),
      ]);

    const allTime = allTimeResult.result?.data;
    const seven = sevenResult.result?.data;
    const thirty = thirtyResult.result?.data;

    const githubUser = github.data?.user;

    if (github.errors?.length || !githubUser) {
      throw new Error(
        github.errors?.map((item) => item.message).join("; ") ||
          "GitHub user tidak ditemukan.",
      );
    }

    // API bisa merespons HTTP 200 tetapi tidak menyediakan data.
    const wakaErrors = {
      allTime: allTimeResult.error ?? allTimeResult.result?.error ?? null,
      last7Days: sevenResult.error ?? sevenResult.result?.error ?? null,
      last30Days: thirtyResult.error ?? thirtyResult.result?.error ?? null,
    };

    const wakaSuccessCount = [allTimeResult, sevenResult, thirtyResult].filter(
      (item) => item.result?.data != null,
    ).length;

    const collection = githubUser.contributionsCollection;
    const calendar = collection.contributionCalendar;

    return NextResponse.json(
      {
        generatedAt: now.toISOString(),

        wakatime: {
          status:
            wakaSuccessCount === 3
              ? "ok"
              : wakaSuccessCount > 0
                ? "partial"
                : "error",

          diagnostics: {
            errors: wakaErrors,
            username: seven?.username ?? thirty?.username ?? null,
            allTimePercentCalculated: allTime?.percent_calculated ?? null,
            last7DaysPercentCalculated: seven?.percent_calculated ?? null,
            last30DaysPercentCalculated: thirty?.percent_calculated ?? null,
          },

          totalTime:
            allTime?.digital ??
            allTime?.decimal ??
            (allTime?.total_seconds !== undefined
              ? formatSeconds(allTime.total_seconds)
              : null),

          last7Days:
            seven?.human_readable_total ??
            (seven?.total_seconds !== undefined
              ? formatSeconds(seven.total_seconds)
              : "—"),

          dailyAverage: seven?.human_readable_daily_average ?? "—",

          bestDay: seven?.best_day
            ? {
                date: seven.best_day.date,
                time: seven.best_day.text,
              }
            : null,

          isUpToDate:
            thirty?.is_up_to_date ??
            seven?.is_up_to_date ??
            allTime?.is_up_to_date ??
            null,

          languages: normalizeItems(thirty?.languages),
          editors: normalizeItems(thirty?.editors),
          projects: normalizeItems(thirty?.projects),
        },

        github: {
          username: githubUsername,
          joinedAt: githubUser.createdAt,
          followers: githubUser.followers.totalCount,
          contributionsLastYear: calendar.totalContributions,
          commits: collection.totalCommitContributions,
          issues: collection.totalIssueContributions,
          pullRequests: collection.totalPullRequestContributions,
          reviews: collection.totalPullRequestReviewContributions,
          weeks: calendar.weeks.map((week) => week.contributionDays),
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown API error";

    console.error("[developer-activity]", message);

    return NextResponse.json(
      {
        error: "Unable to load developer activity.",
        ...(process.env.NODE_ENV === "development" ? { details: message } : {}),
      },
      {
        status: 502,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
