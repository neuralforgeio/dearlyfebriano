import generatedIntelligence from "@/dearlyfebriano/data/generated-project-intelligence.json";

import type { ProjectIntelligence } from "./types";

interface GeneratedProject {
  slug?: string;
  title?: string;
  repositoryUrl?: string | null;
  analyzedAt?: string;
  metrics?: ProjectIntelligence["metrics"];
  architecture?: ProjectIntelligence["architecture"];
  timeline?: ProjectIntelligence["timeline"];
  draft?: {
    techStack?: string[];
  };
  raw?: {
    metrics?: {
      sourceFiles?: number;
      codeFiles?: number;
      testFiles?: number;
      totalLines?: number;
      codeLines?: number;
      routes?: number;
      apiRoutes?: number;
      components?: number;
    };
    architecture?: {
      moduleCount?: number;
      connectionCount?: number;
    };
    timeline?: {
      commitCount?: number;
    };
    git?: {
      commitCount?: number;
    };
    frameworks?: string[];
  };
}

function generatedProjects(): Record<string, GeneratedProject> {
  return (
    generatedIntelligence as {
      projects?: Record<string, GeneratedProject>;
    }
  ).projects ?? {};
}

export function getGeneratedProjectIntelligence(
  slug: string,
  title: string,
  repositoryUrl?: string,
): ProjectIntelligence | null {
  const projects = generatedProjects();

  const bySlug = projects[slug];

  const normalizedUrl = repositoryUrl?.replace(/\.git$/i, "").toLowerCase();

  const byUrl = normalizedUrl
    ? Object.values(projects).find((project) => {
        const url = project.repositoryUrl?.replace(/\.git$/i, "").toLowerCase();

        return url === normalizedUrl;
      })
    : undefined;

  const generated = bySlug ?? byUrl;

  if (!generated?.metrics?.length || !generated.architecture) {
    return null;
  }

  const rawMetrics = generated.raw?.metrics;
  const architecture = generated.architecture;
  const techStack =
    generated.draft?.techStack ?? generated.raw?.frameworks ?? [];

  return {
    version: 1,
    generatedAt: generated.analyzedAt ?? new Date().toISOString(),
    source: {
      type: "local",
      repositoryUrl: generated.repositoryUrl ?? repositoryUrl,
    },
    project: {
      slug,
      title: generated.title ?? title,
    },
    metrics: generated.metrics,
    architecture: {
      nodes: architecture.nodes,
      edges: architecture.edges ?? [],
    },
    timeline: generated.timeline ?? [],
    techStack,
    raw: {
      fileCount: rawMetrics?.sourceFiles ?? 0,
      sourceFiles: rawMetrics?.sourceFiles ?? 0,
      codeFiles: rawMetrics?.codeFiles ?? 0,
      testFiles: rawMetrics?.testFiles ?? 0,
      codeLines: rawMetrics?.codeLines ?? 0,
      componentCount: rawMetrics?.components ?? 0,
      routeCount: rawMetrics?.routes ?? 0,
      apiRouteCount: rawMetrics?.apiRoutes ?? 0,
      commitCount:
        generated.raw?.git?.commitCount ??
        generated.raw?.timeline?.commitCount ??
        0,
      moduleCount:
        generated.raw?.architecture?.moduleCount ?? architecture.nodes.length,
      connectionCount:
        generated.raw?.architecture?.connectionCount ??
        architecture.edges?.length ??
        0,
    },
  };
}
