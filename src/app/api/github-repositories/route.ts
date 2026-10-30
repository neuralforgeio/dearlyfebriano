import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface GitHubApiRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  updated_at: string;
  pushed_at: string;
  topics: string[];
  fork: boolean;
  archived: boolean;
  private: boolean;
  default_branch: string;
  license: {
    name: string;
    spdx_id: string | null;
  } | null;
}

export async function GET(request: NextRequest) {
  const token = process.env.GITHUB_TOKEN;
  const username = (process.env.GITHUB_USERNAME ?? "neuralforgeio").trim();

  const forceRefresh = request.nextUrl.searchParams.get("refresh") === "1";

  if (!token) {
    return NextResponse.json(
      { error: "GITHUB_TOKEN belum dikonfigurasi." },
      { status: 500 },
    );
  }

  if (!username) {
    return NextResponse.json(
      { error: "GITHUB_USERNAME tidak boleh kosong." },
      { status: 500 },
    );
  }

  const url =
    `https://api.github.com/users/${encodeURIComponent(username)}/repos` +
    "?type=owner&sort=updated&per_page=100";

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "DearlyFebriano-Portfolio",
      },

      ...(forceRefresh
        ? { cache: "no-store" as const }
        : { next: { revalidate: 300 } }),

      signal: AbortSignal.timeout(10000),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("GitHub repositories API error:", {
        status: response.status,
        message: result.message,
      });

      return NextResponse.json(
        {
          error: "Gagal mengambil repository dari GitHub.",
          details: result.message ?? `HTTP ${response.status}`,
        },
        { status: 502 },
      );
    }

    if (!Array.isArray(result)) {
      return NextResponse.json(
        { error: "Format respons GitHub tidak valid." },
        { status: 502 },
      );
    }

    const repositories = (result as GitHubApiRepository[])
      // PENTING: Jangan pernah kirim private repository ke frontend.
      .filter((repo) => repo.private !== true)
      .map((repo) => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        url: repo.html_url,
        homepage: repo.homepage,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        openIssues: repo.open_issues_count,
        updatedAt: repo.updated_at,
        pushedAt: repo.pushed_at,
        topics: repo.topics ?? [],
        isFork: repo.fork,
        isArchived: repo.archived,
        defaultBranch: repo.default_branch,
        license: repo.license?.spdx_id ?? null,
      }));

    return NextResponse.json(
      {
        username,
        totalRepositories: repositories.length,
        repositories,
        updatedAt: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": forceRefresh
            ? "private, no-store"
            : "public, s-maxage=300, stale-while-revalidate=600",
        },
      },
    );
  } catch (error) {
    console.error("GitHub repositories request failed:", error);

    return NextResponse.json(
      {
        error: "Tidak dapat terhubung ke GitHub.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 502 },
    );
  }
}
