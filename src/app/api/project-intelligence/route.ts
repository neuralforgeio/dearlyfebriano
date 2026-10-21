import { NextRequest } from "next/server";

import {
  analyzeGitHubRepository,
} from "@/dearlyfebriano/lib/project-intelligence/analyze-github";

import {
  getGeneratedProjectIntelligence,
} from "@/dearlyfebriano/lib/project-intelligence/from-generated";

import {
  getProjectBySlug,
} from "@/dearlyfebriano/data/projects";

export const runtime =
  "nodejs";

export async function GET(
  request: NextRequest,
): Promise<Response> {
  const slug =
    request.nextUrl.searchParams.get(
      "slug",
    );

  if (!slug) {
    return Response.json(
      {
        error:
          "Missing project slug.",
      },
      {
        status: 400,
      },
    );
  }

  const project =
    getProjectBySlug(
      slug,
    );

  if (!project) {
    return Response.json(
      {
        error:
          "Project not found.",
      },
      {
        status: 404,
      },
    );
  }

  if (!project.githubUrl) {
    return Response.json(
      {
        error:
          "This project does not have a GitHub repository.",
      },
      {
        status: 404,
      },
    );
  }

  const token =
    process.env.GITHUB_TOKEN;

  const cached =
    getGeneratedProjectIntelligence(
      project.slug,
      project.title,
      project.githubUrl,
    );

  try {
    const intelligence =
      await analyzeGitHubRepository(
        project.githubUrl,
        {
          slug:
            project.slug,

          title:
            project.title,

          token,
        },
      );

    return Response.json(
      intelligence,
      {
        status: 200,

        headers: {
          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch (error) {
    if (cached) {
      return Response.json(
        cached,
        {
          status: 200,

          headers: {
            "Cache-Control":
              "public, s-maxage=300, stale-while-revalidate=86400",
          },
        },
      );
    }

    return Response.json(
      {
        error:
          error instanceof
          Error
            ? error.message
            : "Failed to analyze repository.",
      },
      {
        status: 502,
      },
    );
  }
}
