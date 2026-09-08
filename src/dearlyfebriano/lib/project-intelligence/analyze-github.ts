import type {
  IntelligenceEdge,
  IntelligenceMetric,
  IntelligenceNode,
  IntelligenceTimeline,
  ProjectIntelligence,
} from "./types";

const API_VERSION = "2022-11-28";

const IGNORE_DIRECTORIES = new Set([
  ".git",
  ".next",
  "node_modules",
  "dist",
  "build",
  "out",
  "coverage",
  ".turbo",
  ".cache",
  ".vercel",
  ".vscode",
  ".idea",
  "__pycache__",
  ".venv",
  "venv",
  "target",
  "vendor",
]);

const SOURCE_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".vue",
  ".svelte",
  ".py",
  ".go",
  ".rs",
  ".java",
  ".kt",
  ".swift",
  ".dart",
  ".php",
  ".rb",
  ".cs",
  ".cpp",
  ".cc",
  ".c",
  ".h",
  ".hpp",
]);

const CODE_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".vue",
  ".svelte",
  ".py",
  ".go",
  ".rs",
  ".java",
  ".kt",
  ".swift",
  ".dart",
  ".php",
  ".rb",
  ".cs",
  ".cpp",
  ".cc",
  ".c",
]);

const TEST_PATTERNS = [
  /\.test\.[^.]+$/i,
  /\.spec\.[^.]+$/i,
];

interface GitHubTreeItem {
  path: string;
  type: "blob" | "tree";
  size?: number;
}

interface GitHubTreeResponse {
  tree: GitHubTreeItem[];
  truncated: boolean;
}

interface GitHubRepositoryResponse {
  name: string;
  full_name: string;
  default_branch: string;
  html_url: string;
}

interface GitHubCommitItem {
  sha: string;
  commit: {
    message: string;
    author?: {
      date?: string;
    } | null;
  };
}

interface GitHubCommitsResponse extends Array<GitHubCommitItem> {}

interface GitHubContentResponse {
  content?: string;
  encoding?: string;
}

function githubHeaders(
  token?: string,
): HeadersInit {
  return {
    Accept:
      "application/vnd.github+json",
    "X-GitHub-Api-Version":
      API_VERSION,
    ...(token
      ? {
          Authorization:
            `Bearer ${token}`,
        }
      : {}),
  };
}

async function githubFetch<T>(
  url: string,
  token?: string,
): Promise<T> {
  const response = await fetch(
    url,
    {
      headers:
        githubHeaders(token),
      next: {
        revalidate: 3600,
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `GitHub API ${response.status}: ${url}`,
    );
  }

  return (await response.json()) as T;
}

export function parseGitHubUrl(
  value: string,
): {
  owner: string;
  repo: string;
} | null {
  try {
    const url =
      new URL(value);

    if (
      url.protocol !==
        "https:" ||
      url.hostname.toLowerCase() !==
        "github.com"
    ) {
      return null;
    }

    const parts =
      url.pathname
        .split("/")
        .filter(Boolean);

    if (parts.length < 2) {
      return null;
    }

    return {
      owner: parts[0],
      repo: parts[1].replace(
        /\.git$/i,
        "",
      ),
    };
  } catch {
    return null;
  }
}

function extensionOf(
  filePath: string,
): string {
  const index =
    filePath.lastIndexOf(".");

  if (index === -1) {
    return "";
  }

  return filePath
    .slice(index)
    .toLowerCase();
}

function isIgnored(
  filePath: string,
): boolean {
  return filePath
    .split("/")
    .some((part) =>
      IGNORE_DIRECTORIES.has(
        part,
      ),
    );
}

function isTestFile(
  filePath: string,
): boolean {
  const normalized =
    filePath.replace(
      /\\/g,
      "/",
    );

  if (
    normalized
      .split("/")
      .includes(
        "__tests__",
      )
  ) {
    return true;
  }

  if (
    normalized
      .split("/")
      .includes("tests")
  ) {
    return true;
  }

  if (
    normalized
      .split("/")
      .includes("test")
  ) {
    return true;
  }

  return TEST_PATTERNS.some(
    (pattern) =>
      pattern.test(
        normalized,
      ),
  );
}

function isComponentFile(
  filePath: string,
): boolean {
  return (
    /\.(tsx|jsx)$/.test(
      filePath,
    ) &&
    (
      filePath.includes(
        "/components/",
      ) ||
      /\/[A-Z][A-Za-z0-9_-]*\.(tsx|jsx)$/.test(
        filePath,
      )
    )
  );
}

function topLevelModule(
  filePath: string,
): string {
  const normalized =
    filePath.replace(
      /\\/g,
      "/",
    );

  const withoutSrc =
    normalized.startsWith(
      "src/",
    )
      ? normalized.slice(4)
      : normalized;

  const parts =
    withoutSrc.split("/");

  if (parts.length <= 1) {
    return "root";
  }

  return parts[0];
}

function prettyLabel(
  value: string,
): string {
  return value
    .replace(
      /[-_]+/g,
      " ",
    )
    .split(" ")
    .filter(Boolean)
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1),
    )
    .join(" ");
}

function inferCategory(
  moduleName: string,
): string {
  const value =
    moduleName.toLowerCase();

  if (
    [
      "app",
      "components",
      "pages",
      "views",
      "ui",
    ].includes(value)
  ) {
    return "Presentation";
  }

  if (
    [
      "api",
      "services",
      "server",
      "lib",
    ].includes(value)
  ) {
    return "Service";
  }

  if (
    [
      "store",
      "state",
      "context",
    ].includes(value)
  ) {
    return "State";
  }

  if (
    [
      "data",
      "db",
      "database",
      "models",
    ].includes(value)
  ) {
    return "Data";
  }

  if (
    [
      "types",
      "schemas",
      "contracts",
    ].includes(value)
  ) {
    return "Contracts";
  }

  if (
    [
      "hooks",
      "utils",
      "helpers",
    ].includes(value)
  ) {
    return "Shared";
  }

  return "Module";
}

function extractImports(
  content: string,
): string[] {
  const imports =
    new Set<string>();

  const patterns = [
    /import\s+(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/g,
    /export\s+(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/g,
    /import\s*\(\s*["']([^"']+)["']\s*\)/g,
    /require\s*\(\s*["']([^"']+)["']\s*\)/g,
  ];

  for (const pattern of patterns) {
    let match: RegExpExecArray | null;

    while (
      (match =
        pattern.exec(
          content,
        ))
    ) {
      if (match[1]) {
        imports.add(
          match[1],
        );
      }
    }
  }

  return [...imports];
}

function resolveImportModule(
  importer: string,
  importPath: string,
  moduleSet: Set<string>,
): string | null {
  if (
    importPath.startsWith(
      "http://",
    ) ||
    importPath.startsWith(
      "https://",
    )
  ) {
    return null;
  }

  if (
    importPath.startsWith("@/")
  ) {
    const target =
      importPath
        .slice(2)
        .split("/")[0];

    return moduleSet.has(
      target,
    )
      ? target
      : null;
  }

  if (
    importPath.startsWith(
      ".",
    )
  ) {
    const importerParts =
      importer.split("/");

    importerParts.pop();

    const importParts =
      importPath.split("/");

    const resolved =
      [...importerParts];

    for (const part of importParts) {
      if (!part || part === ".") {
        continue;
      }

      if (part === "..") {
        resolved.pop();
        continue;
      }

      resolved.push(part);
    }

    const module =
      resolved[0];

    return module &&
      moduleSet.has(module)
      ? module
      : null;
  }

  return null;
}

function decodeGitHubContent(
  content: string,
  encoding: string,
): string {
  if (
    encoding !==
    "base64"
  ) {
    return content;
  }

  return Buffer.from(
    content,
    "base64",
  ).toString("utf8");
}

async function readGitHubFile(
  owner: string,
  repo: string,
  filePath: string,
  token?: string,
): Promise<string> {
  const url =
    `https://api.github.com/repos/${encodeURIComponent(
      owner,
    )}/${encodeURIComponent(
      repo,
    )}/contents/${filePath}`;

  const result =
    await githubFetch<GitHubContentResponse>(
      url,
      token,
    );

  if (
    !result.content
  ) {
    return "";
  }

  return decodeGitHubContent(
    result.content,
    result.encoding ??
      "base64",
  );
}

function detectTechnologies(
  files: string[],
  packageJson: string,
): string[] {
  const tech = new Set<string>();

  const packageData =
    (() => {
      try {
        return JSON.parse(
          packageJson,
        ) as {
          dependencies?: Record<
            string,
            string
          >;
          devDependencies?: Record<
            string,
            string
          >;
        };
      } catch {
        return null;
      }
    })();

  const deps = [
    ...Object.keys(
      packageData?.dependencies ??
        {},
    ),
    ...Object.keys(
      packageData?.devDependencies ??
        {},
    ),
  ].map((value) =>
    value.toLowerCase(),
  );

  if (
    deps.includes("next")
  ) {
    tech.add("Next.js");
  }

  if (
    deps.includes("react")
  ) {
    tech.add("React");
  }

  if (
    deps.includes("typescript")
  )
  {
    tech.add("TypeScript");
  }

  if (
    deps.includes(
      "tailwindcss",
    )
  ) {
    tech.add(
      "Tailwind CSS",
    );
  }

  if (
    deps.includes("zustand")
  ) {
    tech.add("Zustand");
  }

  if (
    deps.includes(
      "framer-motion",
    )
  ) {
    tech.add(
      "Framer Motion",
    );
  }

  if (
    deps.includes("prisma")
  ) {
    tech.add("Prisma");
  }

  if (
    deps.includes("drizzle-orm")
  ) {
    tech.add("Drizzle");
  }

  if (
    files.some((file) =>
      file.endsWith(
        ".py",
      ),
    )
  ) {
    tech.add("Python");
  }

  if (
    files.some((file) =>
      file.endsWith(
        ".go",
      ),
    )
  ) {
    tech.add("Go");
  }

  if (
    files.some((file) =>
      file.endsWith(
        ".rs",
      ),
    )
  ) {
    tech.add("Rust");
  }

  return [...tech];
}

function buildArchitecture(
  files: string[],
  sourceContents: Map<
    string,
    string
  >,
) {
  const modules =
    new Set<string>();

  for (const file of files) {
    modules.add(
      topLevelModule(file),
    );
  }

  const edges =
    new Map<
      string,
      number
    >();

  for (const file of files) {
    const importer =
      topLevelModule(file);

    const content =
      sourceContents.get(
        file,
      ) ?? "";

    for (const importPath of extractImports(
      content,
    )) {
      const target =
        resolveImportModule(
          file,
          importPath,
          modules,
        );

      if (
        !target ||
        target === importer
      ) {
        continue;
      }

      const key =
        `${importer}->${target}`;

      edges.set(
        key,
        (edges.get(key) ??
          0) + 1,
      );
    }
  }

  const ordered =
    [...modules].sort(
      (a, b) => {
        const aScore =
          [...edges]
            .filter(
              ([key]) =>
                key.startsWith(
                  `${a}->`,
                ) ||
                key.endsWith(
                  `->${a}`,
                ),
            )
            .reduce(
              (sum, [, count]) =>
                sum +
                count,
              0,
            );

        const bScore =
          [...edges]
            .filter(
              ([key]) =>
                key.startsWith(
                  `${b}->`,
                ) ||
                key.endsWith(
                  `->${b}`,
                ),
            )
            .reduce(
              (sum, [, count]) =>
                sum +
                count,
              0,
            );

        return (
          bScore -
            aScore ||
          a.localeCompare(
            b,
          )
        );
      },
    )
    .slice(0, 10);

  const columns =
    ordered.length <=
    2
      ? ordered.length
      : 3;

  const nodes: IntelligenceNode[] =
    ordered.map(
      (
        moduleName,
        index,
      ) => {
        const row =
          Math.floor(
            index / columns,
          );

        const col =
          index % columns;

        const x =
          columns === 1
            ? 50
            : 18 +
              col * 32;

        const y =
          12 +
          row * 30;

        return {
          id: moduleName,
          label:
            prettyLabel(
              moduleName,
            ),
          description:
            `Detected source module: ${prettyLabel(
              moduleName,
            )}.`,
          category:
            inferCategory(
              moduleName,
            ),
          x,
          y,
        };
      },
    );

  const allowed =
    new Set(
      ordered,
    );

  const normalizedEdges: IntelligenceEdge[] =
    [...edges.entries()]
      .filter(
        ([key]) => {
          const [
            from,
            to,
          ] =
            key.split(
              "->",
            );

          return (
            allowed.has(
              from,
            ) &&
            allowed.has(
              to,
            )
          );
        },
      )
      .sort(
        (
          [, a],
          [, b],
        ) => b - a,
      )
      .slice(0, 24)
      .map(
        ([key]) => {
          const [
            from,
            to,
          ] =
            key.split(
              "->",
            );

          return {
            from,
            to,
          };
        },
      );

  return {
    nodes,
    edges:
      normalizedEdges,
  };
}

function classifyCommit(
  message: string,
): string {
  const value =
    message.toLowerCase();

  if (
    /(^|\s)(feat|feature)\b/.test(
      value,
    )
  ) {
    return "Feature development";
  }

  if (
    /(^|\s)(fix|bug|patch)\b/.test(
      value,
    )
  ) {
    return "Bug fixing";
  }

  if (
    /refactor|architecture|cleanup/.test(
      value,
    )
  ) {
    return "Architecture & refactoring";
  }

  if (
    /test|coverage|spec/.test(
      value,
    )
  ) {
    return "Testing & quality";
  }

  if (
    /perf|performance/.test(
      value,
    )
  ) {
    return "Performance work";
  }

  if (
    /docs|documentation/.test(
      value,
    )
  ) {
    return "Documentation";
  }

  return "General development";
}

function buildTimeline(
  commits: GitHubCommitItem[],
): IntelligenceTimeline[] {
  if (
    commits.length === 0
  ) {
    return [];
  }

  const chronological =
    [...commits].reverse();

  const buckets = 5;

  const bucketSize =
    Math.max(
      1,
      Math.ceil(
        chronological.length /
          buckets,
      ),
    );

  const timeline: IntelligenceTimeline[] =
    [];

  for (
    let index = 0;
    index <
    chronological.length;
    index += bucketSize
  ) {
    const bucket =
      chronological.slice(
        index,
        index +
          bucketSize,
      );

    if (
      bucket.length ===
      0
    ) {
      continue;
    }

    const categories =
      new Map<
        string,
        number
      >();

    for (const commit of bucket) {
      const category =
        classifyCommit(
          commit.commit
            .message,
        );

      categories.set(
        category,
        (categories.get(
          category,
        ) ?? 0) + 1,
      );
    }

    const dominant =
      [...categories.entries()].sort(
        (a, b) =>
          b[1] -
          a[1],
      )[0]?.[0] ??
      "General development";

    const firstDate =
      bucket[0]?.commit
        .author?.date
        ?.slice(0, 10);

    const lastDate =
      bucket[
        bucket.length - 1
      ]?.commit.author?.date
        ?.slice(0, 10);

    timeline.push({
      date:
        firstDate ===
        lastDate
          ? firstDate
          : `${firstDate ?? ""} → ${
              lastDate ?? ""
            }`,
      title:
        index === 0
          ? "Project foundation"
          : index +
                bucketSize >=
              chronological.length
            ? "Recent development"
            : dominant,
      description:
        `${bucket.length} commits analyzed. Dominant activity: ${dominant.toLowerCase()}.`,
    });
  }

  return timeline.slice(
    0,
    5,
  );
}

function countRoutes(
  files: string[],
) {
  let routes = 0;
  let apiRoutes = 0;

  for (const file of files) {
    if (
      /(^|\/)page\.(tsx|ts|jsx|js)$/.test(
        file,
      )
    ) {
      routes += 1;
    }

    if (
      /(^|\/)route\.(tsx|ts|jsx|js)$/.test(
        file,
      ) &&
      file.includes(
        "/api/",
      )
    ) {
      apiRoutes += 1;
    }
  }

  return {
    routes,
    apiRoutes,
  };
}

export async function analyzeGitHubRepository(
  repositoryUrl: string,
  {
    slug,
    title,
    token,
  }: {
    slug: string;
    title: string;
    token?: string;
  },
): Promise<ProjectIntelligence> {
  const parsed =
    parseGitHubUrl(
      repositoryUrl,
    );

  if (!parsed) {
    throw new Error(
      "Invalid GitHub repository URL.",
    );
  }

  const {
    owner,
    repo,
  } = parsed;

  const repository =
    await githubFetch<GitHubRepositoryResponse>(
      `https://api.github.com/repos/${encodeURIComponent(
        owner,
      )}/${encodeURIComponent(
        repo,
      )}`,
      token,
    );

  const tree =
    await githubFetch<GitHubTreeResponse>(
      `https://api.github.com/repos/${encodeURIComponent(
        owner,
      )}/${encodeURIComponent(
        repo,
      )}/git/trees/${encodeURIComponent(
        repository.default_branch,
      )}?recursive=1`,
      token,
    );

  const files =
    tree.tree
      .filter(
        (item) =>
          item.type ===
          "blob",
      )
      .map(
        (item) =>
          item.path,
      )
      .filter(
        (file) =>
          !isIgnored(file),
      );

  const sourceFiles =
    files.filter(
      (file) =>
        SOURCE_EXTENSIONS.has(
          extensionOf(file),
        ),
    );

  const codeFiles =
    files.filter(
      (file) =>
        CODE_EXTENSIONS.has(
          extensionOf(file),
        ),
    );

  const testFiles =
    sourceFiles.filter(
      isTestFile,
    );

  const componentCount =
    sourceFiles.filter(
      isComponentFile,
    ).length;

  const routeCounts =
    countRoutes(
      files,
    );

  const importantFiles =
    sourceFiles
      .filter(
        (file) =>
          file ===
            "package.json" ||
          file ===
            "README.md" ||
          file.endsWith(
            "next.config.ts",
          ) ||
          file.endsWith(
            "next.config.js",
          ) ||
          file.includes(
            "/app/",
          ) ||
          file.includes(
            "/components/",
          ) ||
          file.includes(
            "/services/",
          ) ||
          file.includes(
            "/store/",
          ),
      )
      .slice(0, 80);

  const sourceContents =
    new Map<
      string,
      string
    >();

  let codeLines = 0;

  await Promise.all(
    importantFiles.map(
      async (file) => {
        try {
          const content =
            await readGitHubFile(
              owner,
              repo,
              file,
              token,
            );

          sourceContents.set(
            file,
            content,
          );

          if (
            CODE_EXTENSIONS.has(
              extensionOf(
                file,
              ),
            )
          ) {
            codeLines +=
              content.split(
                /\r?\n/,
              ).length;
          }
        } catch {
          /* Individual files may fail; analysis continues. */
        }
      },
    ),
  );

  const packageJson =
    sourceContents.get(
      "package.json",
    ) ?? "";

  const techStack =
    detectTechnologies(
      files,
      packageJson,
    );

  const commits =
    await githubFetch<GitHubCommitsResponse>(
      `https://api.github.com/repos/${encodeURIComponent(
        owner,
      )}/${encodeURIComponent(
        repo,
      )}/commits?per_page=100`,
      token,
    );

  const architecture =
    buildArchitecture(
      sourceFiles,
      sourceContents,
    );

  const timeline =
    buildTimeline(
      commits,
    );

  const metrics: IntelligenceMetric[] =
    [
      {
        label: "Source Files",
        value:
          sourceFiles.length.toLocaleString(
            "en-US",
          ),
        description:
          "Source files detected in the repository.",
      },
      {
        label: "Code Files",
        value:
          codeFiles.length.toLocaleString(
            "en-US",
          ),
        description:
          "Code-oriented files detected.",
      },
      {
        label: "Components",
        value:
          componentCount.toLocaleString(
            "en-US",
          ),
        description:
          "React-style component files detected.",
      },
      {
        label: "Test Files",
        value:
          testFiles.length.toLocaleString(
            "en-US",
          ),
        description:
          "Test and specification files detected.",
      },
      {
        label: "Routes",
        value:
          routeCounts.routes.toLocaleString(
            "en-US",
          ),
        description:
          "Application routes detected.",
      },
      {
        label: "API Routes",
        value:
          routeCounts.apiRoutes.toLocaleString(
            "en-US",
          ),
        description:
          "API route handlers detected.",
      },
      {
        label: "Commits",
        value:
          commits.length.toLocaleString(
            "en-US",
          ),
        description:
          "Recent commits included in analysis.",
      },
      {
        label: "Architecture Modules",
        value:
          architecture.nodes.length.toLocaleString(
            "en-US",
          ),
        description:
          "Top-level source modules detected.",
      },
    ];

  return {
    version: 1,

    generatedAt:
      new Date().toISOString(),

    source: {
      type: "github",
      repositoryUrl,
    },

    project: {
      slug,
      title,
    },

    metrics,

    architecture,

    timeline,

    techStack,

    raw: {
      fileCount:
        files.length,

      sourceFiles:
        sourceFiles.length,

      codeFiles:
        codeFiles.length,

      testFiles:
        testFiles.length,

      codeLines,

      componentCount,

      routeCount:
        routeCounts.routes,

      apiRouteCount:
        routeCounts.apiRoutes,

      commitCount:
        commits.length,

      moduleCount:
        architecture.nodes.length,

      connectionCount:
        architecture.edges.length,
    },
  };
}
