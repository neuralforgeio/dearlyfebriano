import { NextRequest } from "next/server";

import { getProjectBySlug, projects } from "@/dearlyfebriano/data/projects";

/* ============================================================
 * Project Health API
 *
 * GET:
 *   /api/project-health?slug=flowcanvas
 *
 * Important:
 * - URL target TIDAK diterima langsung dari browser.
 * - Hanya URL yang berasal dari projects.ts yang boleh diperiksa.
 * - Server melakukan request ke liveUrl.
 * - GitHub repository juga diverifikasi bila tersedia.
 *
 * Cache:
 * - 5 minutes
 * ============================================================ */

export const runtime = "nodejs";

const HEALTH_TIMEOUT_MS = 8000;

interface HealthResult {
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

function responseJson(data: unknown, status = 200): Response {
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
  }, HEALTH_TIMEOUT_MS);

  const startedAt = performance.now();

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,

      redirect: "follow",

      headers: {
        "User-Agent": "Dearly-Febriano-Portfolio-Health-Checker",
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
 * Live site health
 * ============================================================ */

async function checkLiveUrl(url: string | undefined) {
  const checkedAt = new Date().toISOString();

  if (!url) {
    return {
      available: false,
      status: null,
      latencyMs: null,
      checkedAt,
      url: null,
      error: "No live URL configured.",
    };
  }

  try {
    /*
     * HEAD is preferred because we do not need the entire page.
     * Some hosts do not support HEAD, so we fall back to GET.
     */

    let result = await fetchWithTimeout(url, {
      method: "HEAD",
      cache: "no-store",
    });

    if (result.response.status === 405 || result.response.status === 501) {
      result = await fetchWithTimeout(url, {
        method: "GET",
        cache: "no-store",
      });
    }

    const ok = result.response.ok;

    return {
      available: ok,
      status: result.response.status,
      latencyMs: result.latencyMs,
      checkedAt,
      url,
      error: ok ? null : `HTTP ${result.response.status}`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Request failed.";

    return {
      available: false,
      status: null,
      latencyMs: null,
      checkedAt,
      url,
      error: message.includes("aborted") ? "Request timed out." : message,
    };
  }
}

/* ============================================================
 * GitHub repository health
 * ============================================================ */

async function checkGitHubUrl(url: string | undefined) {
  const checkedAt = new Date().toISOString();

  if (!url) {
    return {
      available: false,
      status: null,
      checkedAt,
      url: null,
      error: "No GitHub repository configured.",
    };
  }

  try {
    const parsed = new URL(url);

    if (parsed.hostname.toLowerCase() !== "github.com") {
      return {
        available: false,
        status: null,
        checkedAt,
        url,
        error: "Not a GitHub URL.",
      };
    }

    const parts = parsed.pathname.split("/").filter(Boolean);

    if (parts.length < 2) {
      return {
        available: false,
        status: null,
        checkedAt,
        url,
        error: "Invalid repository URL.",
      };
    }

    const owner = parts[0];

    const repo = parts[1].replace(/\.git$/i, "");

    const apiUrl = `https://api.github.com/repos/${encodeURIComponent(
      owner,
    )}/${encodeURIComponent(repo)}`;

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
      available: result.response.ok,

      status: result.response.status,

      checkedAt,

      url,

      error: result.response.ok
        ? null
        : `GitHub HTTP ${result.response.status}`,
    };
  } catch (error) {
    return {
      available: false,
      status: null,
      checkedAt,
      url,
      error: error instanceof Error ? error.message : "GitHub request failed.",
    };
  }
}

/* ============================================================
 * GET
 * ============================================================ */

export async function GET(request: NextRequest): Promise<Response> {
  const slug = request.nextUrl.searchParams.get("slug");

  if (!slug) {
    return responseJson(
      {
        error: "Missing project slug.",
      },
      400,
    );
  }

  /*
   * Resolve the slug ONLY against projects.ts.
   *
   * This prevents the API from becoming an arbitrary URL
   * proxy / SSRF endpoint.
   */

  const project = getProjectBySlug(slug);

  if (!project) {
    return responseJson(
      {
        error: "Project not found.",
      },
      404,
    );
  }

  if (!projects.some((item) => item.slug === project.slug)) {
    return responseJson(
      {
        error: "Project is not allowed for health checks.",
      },
      403,
    );
  }

  const [live, github] = await Promise.all([
    checkLiveUrl(project.liveUrl),

    checkGitHubUrl(project.githubUrl),
  ]);

  const result: HealthResult = {
    slug: project.slug,

    live,

    github,
  };

  return responseJson(result);
}
