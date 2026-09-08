import { NextRequest } from "next/server";

/* ============================================================
 * Types
 * ============================================================ */

interface GitHubRepository {
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;

  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;

  default_branch: string;

  private: boolean;

  pushed_at: string | null;
  updated_at: string | null;
}

interface GitHubCommit {
  sha: string;
  html_url: string;

  commit: {
    message: string;

    author: {
      name: string | null;
      date: string | null;
    } | null;
  };
}

/* ============================================================
 * JSON helper
 * ============================================================ */

function jsonResponse(
  data: unknown,
  status = 200,
): Response {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        "Content-Type":
          "application/json; charset=utf-8",

        "Cache-Control":
          "private, no-store",
      },
    },
  );
}

/* ============================================================
 * Parse GitHub URL
 * ============================================================ */

function parseGitHubRepository(
  rawUrl: string,
): {
  owner: string;
  repo: string;
} | null {
  try {
    const url = new URL(rawUrl);

    if (
      url.protocol !== "https:" ||
      url.hostname.toLowerCase() !==
        "github.com"
    ) {
      return null;
    }

    const parts = url.pathname
      .split("/")
      .filter(Boolean);

    if (parts.length < 2) {
      return null;
    }

    const owner = parts[0];

    const repo = parts[1]
      .replace(/\.git$/i, "")
      .trim();

    if (!owner || !repo) {
      return null;
    }

    return {
      owner,
      repo,
    };
  } catch {
    return null;
  }
}

/* ============================================================
 * GitHub fetch helper
 * ============================================================ */

async function githubFetch<T>(
  url: string,
  token: string,
): Promise<{
  ok: boolean;
  status: number;
  data: T | null;
  headers: Headers;
}> {
  const response = await fetch(
    url,
    {
      headers: {
        Accept:
          "application/vnd.github+json",

        Authorization:
          `Bearer ${token}`,

        "X-GitHub-Api-Version":
          "2022-11-28",

        "User-Agent":
          "dearlyfebriano-portfolio",
      },

      next: {
        revalidate: 3600,
      },
    },
  );

  let data: T | null = null;

  try {
    data =
      (await response.json()) as T;
  } catch {
    data = null;
  }

  return {
    ok: response.ok,
    status: response.status,
    data,
    headers: response.headers,
  };
}

/* ============================================================
 * GET /api/github/project
 *
 * Example:
 *
 * /api/github/project?url=
 * https://github.com/neuralforgeio/FlowCanvas
 * ============================================================ */

export async function GET(
  request: NextRequest,
): Promise<Response> {
  /* ==========================================================
   * Environment check
   * ========================================================== */

  const token =
    process.env.GITHUB_TOKEN;

  if (!token) {
    return jsonResponse(
      {
        error:
          "GITHUB_TOKEN is not configured on the server.",
      },
      500,
    );
  }

  /* ==========================================================
   * Read URL
   * ========================================================== */

  const rawUrl =
    request.nextUrl.searchParams.get(
      "url",
    );

  if (!rawUrl) {
    return jsonResponse(
      {
        error:
          "Missing GitHub repository URL.",
      },
      400,
    );
  }

  /* ==========================================================
   * Parse repository
   * ========================================================== */

  const repository =
    parseGitHubRepository(
      rawUrl,
    );

  if (!repository) {
    return jsonResponse(
      {
        error:
          "Invalid GitHub repository URL.",
      },
      400,
    );
  }

  const {
    owner,
    repo,
  } = repository;

  const repositoryApiUrl =
    `https://api.github.com/repos/${encodeURIComponent(
      owner,
    )}/${encodeURIComponent(repo)}`;

  try {
    /* ========================================================
     * Fetch repository
     * ======================================================== */

    const repositoryResult =
      await githubFetch<GitHubRepository>(
        repositoryApiUrl,
        token,
      );

    /* ========================================================
     * Handle repository errors
     * ======================================================== */

    if (
      !repositoryResult.ok
    ) {
      const remaining =
        repositoryResult.headers.get(
          "x-ratelimit-remaining",
        );

      const reset =
        repositoryResult.headers.get(
          "x-ratelimit-reset",
        );

      let message =
        "GitHub repository could not be fetched.";

      if (
        repositoryResult.status ===
        401
      ) {
        message =
          "GitHub authentication failed. Check GITHUB_TOKEN.";
      } else if (
        repositoryResult.status ===
        403
      ) {
        message =
          "GitHub API access was forbidden or rate limited.";
      } else if (
        repositoryResult.status ===
        404
      ) {
        message =
          "GitHub repository was not found.";
      }

      return jsonResponse(
        {
          error: message,
          status:
            repositoryResult.status,

          rateLimitRemaining:
            remaining,

          rateLimitReset:
            reset,
        },
        repositoryResult.status ===
          404
          ? 404
          : repositoryResult.status ===
              401
            ? 401
            : 502,
      );
    }

    const repoData =
      repositoryResult.data;

    if (!repoData) {
      return jsonResponse(
        {
          error:
            "GitHub returned an empty repository response.",
        },
        502,
      );
    }

    /* ========================================================
     * Fetch latest commit
     * ======================================================== */

    const commitsApiUrl =
      `${repositoryApiUrl}/commits?per_page=1`;

    const commitsResult =
      await githubFetch<
        GitHubCommit[]
      >(
        commitsApiUrl,
        token,
      );

    let latestCommit:
      | {
          sha: string;
          shortSha: string;
          message: string;
          url: string;
          author:
            | string
            | null;
          date:
            | string
            | null;
        }
      | null = null;

    if (
      commitsResult.ok &&
      commitsResult.data
    ) {
      const commit =
        commitsResult.data[0];

      if (commit) {
        latestCommit = {
          sha:
            commit.sha,

          shortSha:
            commit.sha.slice(
              0,
              7,
            ),

          message:
            commit.commit.message
              .split("\n")[0]
              .trim(),

          url:
            commit.html_url,

          author:
            commit.commit.author
              ?.name ?? null,

          date:
            commit.commit.author
              ?.date ?? null,
        };
      }
    }

    /* ========================================================
     * Response
     * ======================================================== */

    return new Response(
      JSON.stringify({
        repository: {
          name:
            repoData.name,

          fullName:
            repoData.full_name,

          url:
            repoData.html_url,

          description:
            repoData.description,

          stars:
            repoData.stargazers_count,

          forks:
            repoData.forks_count,

          openIssues:
            repoData.open_issues_count,

          defaultBranch:
            repoData.default_branch,

          private:
            repoData.private,

          updatedAt:
            repoData.updated_at,

          pushedAt:
            repoData.pushed_at,
        },

        latestCommit,

        meta: {
          authenticated: true,

          rateLimitRemaining:
            repositoryResult.headers.get(
              "x-ratelimit-remaining",
            ),

          rateLimitLimit:
            repositoryResult.headers.get(
              "x-ratelimit-limit",
            ),

          rateLimitReset:
            repositoryResult.headers.get(
              "x-ratelimit-reset",
            ),
        },
      }),
      {
        status: 200,

        headers: {
          "Content-Type":
            "application/json; charset=utf-8",

          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch (error) {
    console.error(
      "[GitHub Verification]",
      error,
    );

    return jsonResponse(
      {
        error:
          "Failed to connect to GitHub.",
      },
      500,
    );
  }
}
