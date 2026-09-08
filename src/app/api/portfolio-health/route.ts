import { NextRequest } from "next/server";

import { projects } from "@/dearlyfebriano/data/projects";

/* ============================================================
 * Portfolio Health API
 *
 * GET:
 *   /api/portfolio-health
 *
 * Purpose:
 * - Scan every project registered in projects.ts.
 * - Check live URLs.
 * - Check GitHub repositories.
 * - Report metadata completeness.
 *
 * Security:
 * - URLs are taken ONLY from trusted projects.ts data.
 * - Browser cannot provide an arbitrary target URL.
 *
 * ============================================================ */

export const runtime = "nodejs";

const REQUEST_TIMEOUT_MS = 8000;

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

interface PortfolioHealthResponse {
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
 * Response helper
 * ============================================================ */

function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,

    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}

/* ============================================================
 * Fetch with timeout
 * ============================================================ */

async function fetchWithTimeout(
  url: string,
  init?: RequestInit,
): Promise<{
  response: Response;
  latencyMs: number;
}> {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  const startedAt = performance.now();

  try {
    const response = await fetch(url, {
      ...init,

      signal: controller.signal,

      redirect: "follow",

      headers: {
        "User-Agent": "Dearly-Febriano-Portfolio-Health-Scanner",

        ...(init?.headers ?? {}),
      },
    });

    return {
      response,

      latencyMs: Math.round(performance.now() - startedAt),
    };
  } finally {
    clearTimeout(timeout);
  }
}

/* ============================================================
 * Live URL
 * ============================================================ */

async function checkLiveUrl(url: string | undefined) {
  if (!url) {
    return {
      configured: false,

      available: false,

      status: null,

      latencyMs: null,

      error: null,
    };
  }

  try {
    let result = await fetchWithTimeout(url, {
      method: "HEAD",

      cache: "no-store",
    });

    /*
     * Some hosts don't implement HEAD.
     *
     * Retry with GET in that case.
     */

    if (result.response.status === 405 || result.response.status === 501) {
      result = await fetchWithTimeout(url, {
        method: "GET",

        cache: "no-store",
      });
    }

    return {
      configured: true,

      available: result.response.ok,

      status: result.response.status,

      latencyMs: result.latencyMs,

      error: result.response.ok ? null : `HTTP ${result.response.status}`,
    };
  } catch (error) {
    return {
      configured: true,

      available: false,

      status: null,

      latencyMs: null,

      error: error instanceof Error ? error.message : "Request failed.",
    };
  }
}

/* ============================================================
 * GitHub
 * ============================================================ */

function parseGitHubUrl(url: string): {
  owner: string;
  repo: string;
} | null {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.toLowerCase() !== "github.com") {
      return null;
    }

    const parts = parsed.pathname.split("/").filter(Boolean);

    if (parts.length < 2) {
      return null;
    }

    return {
      owner: parts[0],

      repo: parts[1].replace(/\.git$/i, ""),
    };
  } catch {
    return null;
  }
}

async function checkGitHub(url: string | undefined) {
  if (!url) {
    return {
      configured: false,

      available: false,

      status: null,

      error: null,
    };
  }

  const parsed = parseGitHubUrl(url);

  if (!parsed) {
    return {
      configured: true,

      available: false,

      status: null,

      error: "Invalid GitHub repository URL.",
    };
  }

  const apiUrl = `https://api.github.com/repos/${encodeURIComponent(
    parsed.owner,
  )}/${encodeURIComponent(parsed.repo)}`;

  try {
    const token = process.env.GITHUB_TOKEN;

    const result = await fetchWithTimeout(apiUrl, {
      method: "GET",

      cache: "no-store",

      headers: {
        Accept: "application/vnd.github+json",

        "X-GitHub-Api-Version": "2022-11-28",

        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },
    });

    return {
      configured: true,

      available: result.response.ok,

      status: result.response.status,

      error: result.response.ok
        ? null
        : `GitHub HTTP ${result.response.status}`,
    };
  } catch (error) {
    return {
      configured: true,

      available: false,

      status: null,

      error: error instanceof Error ? error.message : "GitHub request failed.",
    };
  }
}

/* ============================================================
 * Preview availability
 *
 * A project is considered preview-ready when it has either:
 *
 * - liveUrl -> automatic ScreenshotOne preview
 * - thumbnail -> manual fallback
 * ============================================================ */

function checkPreview(project: (typeof projects)[number]) {
  return {
    available: Boolean(project.liveUrl || project.thumbnail),
  };
}

/* ============================================================
 * Profile completeness
 * ============================================================ */

function checkProfile(project: (typeof projects)[number]) {
  const missing: string[] = [];

  if (!project.slug) {
    missing.push("slug");
  }

  if (!project.title) {
    missing.push("title");
  }

  if (!project.shortDesc) {
    missing.push("shortDesc");
  }

  if (!project.longDesc) {
    missing.push("longDesc");
  }

  if (!project.techStack || project.techStack.length === 0) {
    missing.push("techStack");
  }

  if (!project.category) {
    missing.push("category");
  }

  if (!project.status) {
    missing.push("status");
  }

  if (!project.features || project.features.length === 0) {
    missing.push("features");
  }

  if (!project.challenges || project.challenges.length === 0) {
    missing.push("challenges");
  }

  if (!project.startDate) {
    missing.push("startDate");
  }

  return {
    complete: missing.length === 0,

    missing,
  };
}

/* ============================================================
 * GET
 * ============================================================ */

export async function GET(_request: NextRequest): Promise<Response> {
  try {
    /*
     * Run all project checks concurrently.
     *
     * This avoids:
     *
     * Project 1 -> wait
     * Project 2 -> wait
     * Project 3 -> wait
     *
     * and instead does:
     *
     * Project 1 ┐
     * Project 2 ├─ parallel
     * Project 3 ┘
     */

    const projectResults = await Promise.all(
      projects.map(async (project): Promise<HealthProject> => {
        const [live, github] = await Promise.all([
          checkLiveUrl(project.liveUrl),

          checkGitHub(project.githubUrl),
        ]);

        const preview = checkPreview(project);

        const profile = checkProfile(project);

        return {
          slug: project.slug,

          title: project.title,

          live,

          github,

          preview,

          profile,
        };
      }),
    );

    /* ========================================================
     * Summary
     * ======================================================== */

    const totalProjects = projectResults.length;

    const liveProjects = projectResults.filter(
      (project) => project.live.available,
    ).length;

    const githubProjects = projectResults.filter(
      (project) => project.github.available,
    ).length;

    const previewProjects = projectResults.filter(
      (project) => project.preview.available,
    ).length;

    const completeProfiles = projectResults.filter(
      (project) => project.profile.complete,
    ).length;

    const issues = projectResults.filter(
      (project) =>
        (project.live.configured && !project.live.available) ||
        (project.github.configured && !project.github.available) ||
        !project.preview.available ||
        !project.profile.complete,
    ).length;

    const result: PortfolioHealthResponse = {
      generatedAt: new Date().toISOString(),

      summary: {
        totalProjects,

        liveProjects,

        githubProjects,

        previewProjects,

        completeProfiles,

        issues,
      },

      projects: projectResults,
    };

    return json(result);
  } catch (error) {
    console.error("[Portfolio Health]", error);

    return json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Portfolio health scan failed.",
      },
      500,
    );
  }
}
