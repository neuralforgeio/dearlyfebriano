import { NextRequest } from "next/server";

import {
  analyzeGitHubRepository,
} from "@/dearlyfebriano/lib/project-intelligence/analyze-github";

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
    console.error(
      "[Project Intelligence]",
      error,
    );

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
