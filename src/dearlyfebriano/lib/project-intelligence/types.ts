export interface IntelligenceMetric {
  label: string;
  value: string;
  description?: string;
}

export interface IntelligenceNode {
  id: string;
  label: string;
  description?: string;
  category?: string;
  x: number;
  y: number;
}

export interface IntelligenceEdge {
  from: string;
  to: string;
}

export interface IntelligenceTimeline {
  date?: string;
  title: string;
  description: string;
}

export interface ProjectIntelligence {
  version: 1;

  generatedAt: string;

  source: {
    type: "github" | "local";
    repositoryUrl?: string;
  };

  project: {
    slug: string;
    title: string;
  };

  metrics: IntelligenceMetric[];

  architecture: {
    nodes: IntelligenceNode[];
    edges: IntelligenceEdge[];
  };

  timeline: IntelligenceTimeline[];

  techStack: string[];

  raw: {
    fileCount: number;
    sourceFiles: number;
    codeFiles: number;
    testFiles: number;
    codeLines: number;
    componentCount: number;
    routeCount: number;
    apiRouteCount: number;
    commitCount: number;
    moduleCount: number;
    connectionCount: number;
  };
}
