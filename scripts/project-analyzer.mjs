#!/usr/bin/env node

/**
 * ============================================================
 * Dearly Febriano Portfolio
 * Project Intelligence Analyzer
 * ============================================================
 *
 * Purpose:
 *
 *   Analyze a local project or GitHub repository and generate:
 *
 *   - Project metrics
 *   - Architecture graph
 *   - Engineering timeline
 *
 * Output:
 *
 *   src/dearlyfebriano/data/generated-project-intelligence.json
 *
 * Examples:
 *
 *   npm run project:analyze -- ./my-project
 *
 *   npm run project:analyze -- "https://github.com/user/repo"
 *
 *   npm run project:analyze -- "https://github.com/user/repo" \
 *     --slug my-project \
 *     --name "My Project"
 *
 * ============================================================
 */

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import process from "node:process";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

/* ============================================================
 * Paths
 * ============================================================ */

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(
  __dirname,
  "..",
);

const OUTPUT_DIR = path.join(
  ROOT_DIR,
  "src",
  "dearlyfebriano",
  "data",
);

const OUTPUT_FILE = path.join(
  OUTPUT_DIR,
  "generated-project-intelligence.json",
);

const TEMP_DIR = path.join(
  os.tmpdir(),
  "dearlyfebriano-project-analyzer",
);

/* ============================================================
 * Configuration
 * ============================================================ */

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
  ".idea",
  ".vscode",
  "__pycache__",
  ".pytest_cache",
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
  ".css",
  ".scss",
  ".sass",
  ".less",
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
  /^test\.[^.]+$/i,
  /^tests?[-_]/i,
];

const MAX_FILES_FOR_ANALYSIS = 5000;

/* ============================================================
 * Helpers
 * ============================================================ */

function log(message = "") {
  process.stdout.write(`${message}\n`);
}

function fail(message) {
  process.stderr.write(`\n✖ ${message}\n`);
  process.exitCode = 1;
}

function ensureDirectory(dir) {
  fs.mkdirSync(dir, {
    recursive: true,
  });
}

function readJson(file) {
  try {
    return JSON.parse(
      fs.readFileSync(
        file,
        "utf8",
      ),
    );
  } catch {
    return null;
  }
}

function writeJson(file, value) {
  ensureDirectory(
    path.dirname(file),
  );

  fs.writeFileSync(
    file,
    `${JSON.stringify(
      value,
      null,
      2,
    )}\n`,
    "utf8",
  );
}

function normalizePath(value) {
  return value.split(
    path.sep,
  ).join("/");
}

function safeRead(file) {
  try {
    return fs.readFileSync(
      file,
      "utf8",
    );
  } catch {
    return "";
  }
}

function isDirectory(file) {
  try {
    return fs.statSync(
      file,
    ).isDirectory();
  } catch {
    return false;
  }
}

function isFile(file) {
  try {
    return fs.statSync(
      file,
    ).isFile();
  } catch {
    return false;
  }
}

function fileExists(file) {
  return fs.existsSync(file);
}

function parseArgs(argv) {
  const positional = [];
  const options = {};

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];

    if (current.startsWith("--")) {
      const key = current.slice(2);

      const next =
        argv[index + 1];

      if (
        next &&
        !next.startsWith("--")
      ) {
        options[key] = next;
        index += 1;
      } else {
        options[key] = true;
      }
    } else {
      positional.push(current);
    }
  }

  return {
    input: positional[0] ?? ".",
    options,
  };
}

function slugify(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function prettyLabel(value) {
  const normalized =
    value
      .replace(/[-_]+/g, " ")
      .trim();

  if (!normalized) {
    return "Root";
  }

  return normalized
    .split(/\s+/)
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1),
    )
    .join(" ");
}

function relativeToRoot(
  file,
  projectRoot,
) {
  return normalizePath(
    path.relative(
      projectRoot,
      file,
    ),
  );
}

function lineCount(text) {
  if (!text) {
    return 0;
  }

  return text.split(
    /\r?\n/,
  ).length;
}

function command(
  executable,
  args,
  cwd,
) {
  try {
    return execFileSync(
      executable,
      args,
      {
        cwd,
        encoding: "utf8",
        stdio: [
          "ignore",
          "pipe",
          "pipe",
        ],
      },
    ).trim();
  } catch {
    return "";
  }
}

function isGitRepository(dir) {
  return (
    fileExists(
      path.join(
        dir,
        ".git",
      ),
    ) ||
    command(
      "git",
      [
        "rev-parse",
        "--is-inside-work-tree",
      ],
      dir,
    ) === "true"
  );
}

/* ============================================================
 * GitHub URL handling
 * ============================================================ */

function isGitHubUrl(value) {
  try {
    const url =
      new URL(value);

    return (
      url.protocol ===
        "https:" &&
      url.hostname
        .toLowerCase() ===
        "github.com"
    );
  } catch {
    return false;
  }
}

function repositoryNameFromGitHubUrl(
  value,
) {
  try {
    const url =
      new URL(value);

    const parts =
      url.pathname
        .split("/")
        .filter(Boolean);

    if (parts.length < 2) {
      return null;
    }

    return parts[1].replace(
      /\.git$/i,
      "",
    );
  } catch {
    return null;
  }
}

function prepareProject(
  input,
  slug,
) {
  if (
    !isGitHubUrl(
      input,
    )
  ) {
    const resolved =
      path.resolve(
        ROOT_DIR,
        input,
      );

    if (
      !isDirectory(
        resolved,
      )
    ) {
      throw new Error(
        `Project directory not found: ${resolved}`,
      );
    }

    return {
      root: resolved,
      cleanup: () => {},
      repositoryUrl:
        null,
    };
  }

  ensureDirectory(
    TEMP_DIR,
  );

  const cloneDir =
    path.join(
      TEMP_DIR,
      `${slug}-${Date.now()}`,
    );

  log(
    "→ Cloning repository...",
  );

  execFileSync(
    "git",
    [
      "clone",
      "--depth",
      "200",
      input,
      cloneDir,
    ],
    {
      cwd: ROOT_DIR,
      stdio: "inherit",
    },
  );

  return {
    root: cloneDir,

    repositoryUrl:
      input,

    cleanup: () => {
      fs.rmSync(
        cloneDir,
        {
          recursive:
            true,
          force: true,
        },
      );
    },
  };
}

/* ============================================================
 * File discovery
 * ============================================================ */

function collectFiles(
  root,
) {
  const output = [];

  function walk(dir) {
    if (
      output.length >=
      MAX_FILES_FOR_ANALYSIS
    ) {
      return;
    }

    let entries;

    try {
      entries =
        fs.readdirSync(
          dir,
          {
            withFileTypes:
              true,
          },
        );
    } catch {
      return;
    }

    for (const entry of entries) {
      if (
        output.length >=
        MAX_FILES_FOR_ANALYSIS
      ) {
        return;
      }

      if (
        IGNORE_DIRECTORIES.has(
          entry.name,
        )
      ) {
        continue;
      }

      const fullPath =
        path.join(
          dir,
          entry.name,
        );

      if (
        entry.isDirectory()
      ) {
        walk(fullPath);
        continue;
      }

      if (
        !entry.isFile()
      ) {
        continue;
      }

      const extension =
        path.extname(
          entry.name,
        ).toLowerCase();

      if (
        SOURCE_EXTENSIONS.has(
          extension,
        ) ||
        entry.name ===
          "package.json"
      ) {
        output.push(
          fullPath,
        );
      }
    }
  }

  walk(root);

  return output;
}

/* ============================================================
 * Package analysis
 * ============================================================ */

function analyzePackage(
  root,
) {
  const packageFile =
    path.join(
      root,
      "package.json",
    );

  const pkg =
    readJson(packageFile);

  if (!pkg) {
    return {
      exists: false,
      name: null,
      dependencies: 0,
      devDependencies: 0,
      totalDependencies: 0,
      scripts: [],
      manager: detectPackageManager(
        root,
      ),
    };
  }

  const dependencies =
    Object.keys(
      pkg.dependencies ??
        {},
    );

  const devDependencies =
    Object.keys(
      pkg.devDependencies ??
        {},
    );

  return {
    exists: true,

    name:
      typeof pkg.name ===
      "string"
        ? pkg.name
        : null,

    dependencies:
      dependencies.length,

    devDependencies:
      devDependencies.length,

    totalDependencies:
      dependencies.length +
      devDependencies.length,

    scripts: Object.keys(
      pkg.scripts ?? {},
    ),

    manager:
      detectPackageManager(
        root,
      ),
  };
}

function detectPackageManager(
  root,
) {
  if (
    fileExists(
      path.join(
        root,
        "pnpm-lock.yaml",
      ),
    )
  ) {
    return "pnpm";
  }

  if (
    fileExists(
      path.join(
        root,
        "yarn.lock",
      ),
    )
  ) {
    return "yarn";
  }

  if (
    fileExists(
      path.join(
        root,
        "bun.lock",
      ),
    ) ||
    fileExists(
      path.join(
        root,
        "bun.lockb",
      ),
    )
  ) {
    return "bun";
  }

  if (
    fileExists(
      path.join(
        root,
        "package-lock.json",
      ),
    )
  ) {
    return "npm";
  }

  return null;
}

/* ============================================================
 * Framework detection
 * ============================================================ */

function detectFrameworks(
  root,
  files,
  packageInfo,
) {
  const text =
    [
      packageInfo.name ?? "",
      ...readPackageDependencies(
        root,
      ),
    ].join(" ");

  const frameworks = [];

  const checks = [
    [
      /\bnext\b/i,
      "Next.js",
    ],
    [
      /\breact\b/i,
      "React",
    ],
    [
      /\bvue\b/i,
      "Vue",
    ],
    [
      /\bsvelte\b/i,
      "Svelte",
    ],
    [
      /\bangular\b/i,
      "Angular",
    ],
    [
      /\bexpress\b/i,
      "Express",
    ],
    [
      /\bfastify\b/i,
      "Fastify",
    ],
    [
      /\bprisma\b/i,
      "Prisma",
    ],
    [
      /\bdrizzle\b/i,
      "Drizzle",
    ],
    [
      /\btailwind\b/i,
      "Tailwind CSS",
    ],
    [
      /\bzustand\b/i,
      "Zustand",
    ],
    [
      /\bframer-motion\b/i,
      "Framer Motion",
    ],
  ];

  for (const [
    pattern,
    name,
  ] of checks) {
    if (
      pattern.test(
        text,
      )
    ) {
      frameworks.push(
        name,
      );
    }
  }

  if (
    files.some((file) =>
      file.endsWith(
        ".tsx",
      ),
    )
  ) {
    if (
      !frameworks.includes(
        "TypeScript",
      )
    ) {
      frameworks.push(
        "TypeScript",
      );
    }
  }

  return frameworks;
}

function readPackageDependencies(
  root,
) {
  const packageFile =
    path.join(
      root,
      "package.json",
    );

  const pkg =
    readJson(
      packageFile,
    );

  if (!pkg) {
    return [];
  }

  return [
    ...Object.keys(
      pkg.dependencies ??
        {},
    ),
    ...Object.keys(
      pkg.devDependencies ??
        {},
    ),
  ];
}

/* ============================================================
 * Metrics
 * ============================================================ */

function isTestFile(
  file,
) {
  const normalized =
    normalizePath(
      file,
    );

  return (
    TEST_PATTERNS.some(
      (pattern) =>
        pattern.test(
          path.basename(
            normalized,
          ),
        ),
    ) ||
    normalized
      .split("/")
      .includes(
        "__tests__",
      ) ||
    normalized
      .split("/")
      .includes(
        "tests",
      ) ||
    normalized
      .split("/")
      .includes(
        "test",
      )
  );
}

function isComponentFile(
  file,
) {
  const normalized =
    normalizePath(
      file,
    );

  return (
    /\.(tsx|jsx)$/.test(
      normalized,
    ) &&
    (
      normalized
        .includes(
          "/components/",
        ) ||
      /\/[A-Z][A-Za-z0-9_-]*\.(tsx|jsx)$/.test(
        normalized,
      )
    )
  );
}

function countNextRoutes(
  root,
  files,
) {
  let routes = 0;
  let apiRoutes = 0;

  for (const file of files) {
    const rel =
      relativeToRoot(
        file,
        root,
      );

    const normalized =
      `/${rel}`;

    if (
      /\/app\/.*\/?page\.(tsx|ts|jsx|js)$/.test(
        normalized,
      ) ||
      /\/app\/page\.(tsx|ts|jsx|js)$/.test(
        normalized,
      )
    ) {
      routes += 1;
    }

    if (
      /\/app\/.*\/?route\.(tsx|ts|jsx|js)$/.test(
        normalized,
      ) &&
      normalized.includes(
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

function calculateMetrics(
  root,
  files,
  packageInfo,
  frameworks,
) {
  let sourceFiles = 0;
  let codeFiles = 0;
  let testFiles = 0;

  let totalLines = 0;
  let codeLines = 0;
  let testLines = 0;

  const extensionCounts =
    new Map();

  let componentCount = 0;

  for (const file of files) {
    const extension =
      path.extname(
        file,
      ).toLowerCase();

    if (
      !SOURCE_EXTENSIONS.has(
        extension,
      )
    ) {
      continue;
    }

    sourceFiles += 1;

    extensionCounts.set(
      extension,
      (extensionCounts.get(
        extension,
      ) ?? 0) + 1,
    );

    const text =
      safeRead(file);

    const lines =
      lineCount(text);

    totalLines +=
      lines;

    if (
      CODE_EXTENSIONS.has(
        extension,
      )
    ) {
      codeFiles += 1;
      codeLines +=
        lines;
    }

    if (
      isTestFile(file)
    ) {
      testFiles += 1;
      testLines +=
        lines;
    }

    if (
      isComponentFile(
        file,
      )
    ) {
      componentCount +=
        1;
    }
  }

  const routes =
    countNextRoutes(
      root,
      files,
    );

  const git =
    analyzeGit(root);

  const metrics = [
    {
      label: "Source Files",
      value: String(
        sourceFiles,
      ),
      description:
        "Tracked source files included in the scan",
    },
    {
      label: "Code Lines",
      value: formatInteger(
        codeLines,
      ),
      description:
        "Lines across code-oriented source files",
    },
    {
      label: "Components",
      value: String(
        componentCount,
      ),
      description:
        "Detected React-style component files",
    },
    {
      label: "Test Files",
      value: String(
        testFiles,
      ),
      description:
        `${formatInteger(
          testLines,
        )} lines detected in test sources`,
    },
    {
      label: "Routes",
      value: String(
        routes.routes,
      ),
      description:
        "Next.js App Router pages detected",
    },
    {
      label: "API Routes",
      value: String(
        routes.apiRoutes,
      ),
      description:
        "Next.js API route handlers detected",
    },
    {
      label: "Dependencies",
      value: String(
        packageInfo.totalDependencies,
      ),
      description:
        `Runtime + development dependencies`,
    },
    {
      label: "Commits",
      value: String(
        git.commitCount,
      ),
      description:
        "Commits available in local git history",
    },
  ];

  return {
    metrics,
    raw: {
      sourceFiles,
      codeFiles,
      testFiles,
      totalLines,
      codeLines,
      testLines,
      extensions:
        Object.fromEntries(
          extensionCounts,
        ),
      routes:
        routes.routes,
      apiRoutes:
        routes.apiRoutes,
      components:
        componentCount,
      frameworks,
    },
  };
}

function formatInteger(
  value,
) {
  return new Intl.NumberFormat(
    "en-US",
  ).format(value);
}

/* ============================================================
 * Architecture
 * ============================================================ */

function getSourceRoot(
  root,
) {
  const src =
    path.join(
      root,
      "src",
    );

  if (
    isDirectory(src)
  ) {
    return src;
  }

  return root;
}

function topLevelModule(
  file,
  root,
) {
  const sourceRoot =
    getSourceRoot(
      root,
    );

  const relative =
    normalizePath(
      path.relative(
        sourceRoot,
        file,
      ),
    );

  const parts =
    relative.split(
      "/",
    );

  if (
    parts.length <= 1
  ) {
    return "root";
  }

  return parts[0];
}

function topLevelModuleFromImport(
  importer,
  importPath,
  root,
) {
  const normalized =
    importPath.replace(
      /\\/g,
      "/",
    );

  if (
    normalized.startsWith(
      "http:",
    ) ||
    normalized.startsWith(
      "https:",
    )
  ) {
    return null;
  }

  const importerModule =
    topLevelModule(
      importer,
      root,
    );

  const sourceRoot =
    getSourceRoot(
      root,
    );

  /* ----------------------------------------------------------
   * Alias imports
   * ---------------------------------------------------------- */

  if (
    normalized.startsWith(
      "@/",
    )
  ) {
    const target =
      normalized.slice(2);

    const parts =
      target.split(
        "/",
      );

    if (
      parts.length === 0
    ) {
      return null;
    }

    return parts[0];
  }

  /* ----------------------------------------------------------
   * Relative imports
   * ---------------------------------------------------------- */

  if (
    normalized.startsWith(
      ".",
    )
  ) {
    const importerDir =
      path.dirname(
        importer,
      );

    const resolved =
      path.resolve(
        importerDir,
        normalized,
      );

    return topLevelModule(
      resolved,
      root,
    );
  }

  return importerModule;
}

function extractImportPaths(
  text,
) {
  const imports =
    new Set();

  const importPatterns = [
    /import\s+(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/g,
    /export\s+(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/g,
    /import\s*\(\s*["']([^"']+)["']\s*\)/g,
    /require\s*\(\s*["']([^"']+)["']\s*\)/g,
  ];

  for (const pattern of importPatterns) {
    let match;

    while (
      (match =
        pattern.exec(
          text,
        ))
    ) {
      if (match[1]) {
        imports.add(
          match[1],
        );
      }
    }
  }

  return [
    ...imports,
  ];
}

function architectureDescription(
  name,
) {
  const descriptions = {
    app: "Application routes, pages, layouts, API handlers, and framework entry points.",
    components:
      "Reusable UI components and presentation logic.",
    hooks:
      "Reusable React hooks and client-side behavior.",
    lib:
      "Shared utilities, services, integrations, and infrastructure code.",
    data:
      "Static or generated application data.",
    store:
      "Client or application state management.",
    types:
      "Shared TypeScript types and domain contracts.",
    i18n:
      "Internationalization and language resources.",
    styles:
      "Application styling and visual design primitives.",
    utils:
      "Reusable helper functions and pure utilities.",
    services:
      "Application services and external integrations.",
    api:
      "API clients or server-side API integration.",
    config:
      "Application configuration.",
  };

  return (
    descriptions[
      name
        .toLowerCase()
    ] ??
    `Source module: ${prettyLabel(
      name,
    )}.`
  );
}

function calculateArchitecture(
  root,
  files,
) {
  const sourceFiles =
    files.filter(
      (file) => {
        const ext =
          path.extname(
            file,
          ).toLowerCase();

        return CODE_EXTENSIONS.has(
          ext,
        );
      },
    );

  const moduleNames =
    new Set();

  for (const file of sourceFiles) {
    moduleNames.add(
      topLevelModule(
        file,
        root,
      ),
    );
  }

  const edges =
    new Map();

  for (const file of sourceFiles) {
    const importerModule =
      topLevelModule(
        file,
        root,
      );

    const text =
      safeRead(file);

    const imports =
      extractImportPaths(
        text,
      );

    for (const importPath of imports) {
      const targetModule =
        topLevelModuleFromImport(
          file,
          importPath,
          root,
        );

      if (
        !targetModule ||
        targetModule ===
          importerModule
      ) {
        continue;
      }

      if (
        !moduleNames.has(
          targetModule,
        )
      ) {
        continue;
      }

      const key =
        `${importerModule}->${targetModule}`;

      edges.set(
        key,
        {
          from:
            importerModule,
          to:
            targetModule,
          weight:
            (edges.get(
              key,
            )?.weight ??
              0) + 1,
        },
      );
    }
  }

  let orderedModules =
    [
      ...moduleNames,
    ];

  orderedModules =
    orderedModules.sort(
      (a, b) => {
        const aEdge =
          [...edges.values()]
            .filter(
              (edge) =>
                edge.from ===
                  a ||
                edge.to ===
                  a,
            )
            .reduce(
              (
                sum,
                edge,
              ) =>
                sum +
                edge.weight,
              0,
            );

        const bEdge =
          [...edges.values()]
            .filter(
              (edge) =>
                edge.from ===
                  b ||
                edge.to ===
                  b,
            )
            .reduce(
              (
                sum,
                edge,
              ) =>
                sum +
                edge.weight,
              0,
            );

        if (
          bEdge !==
          aEdge
        ) {
          return (
            bEdge -
            aEdge
          );
        }

        return a.localeCompare(
          b,
        );
      },
    );

  /*
   * Keep the graph readable. Very large repositories can have
   * dozens of top-level directories, so only keep the most
   * connected modules.
   */

  if (
    orderedModules.length >
    10
  ) {
    orderedModules =
      orderedModules.slice(
        0,
        10,
      );
  }

  const nodeCount =
    orderedModules.length;

  const nodes =
    orderedModules.map(
      (
        moduleName,
        index,
      ) => {
        const columns =
          nodeCount <= 4
            ? nodeCount
            : 3;

        const row =
          Math.floor(
            index /
              columns,
          );

        const column =
          index % columns;

        const horizontalSpacing =
          columns === 1
            ? 50
            : columns === 2
              ? 28
              : 22;

        const x =
          columns ===
          nodeCount
            ? 50 +
              (column -
                (columns -
                  1) /
                  2) *
                horizontalSpacing
            : 18 +
              column *
                32;

        const y =
          15 +
          row * 30;

        return {
          id: moduleName,
          label:
            prettyLabel(
              moduleName,
            ),
          description:
            architectureDescription(
              moduleName,
            ),
          category:
            inferArchitectureCategory(
              moduleName,
            ),
          x: clamp(
            x,
            10,
            90,
          ),
          y: clamp(
            y,
            8,
            90,
          ),
        };
      },
    );

  const allowed =
    new Set(
      orderedModules,
    );

  const normalizedEdges =
    [...edges.values()]
      .filter(
        (edge) =>
          allowed.has(
            edge.from,
          ) &&
          allowed.has(
            edge.to,
          ),
      )
      .sort(
        (a, b) =>
          b.weight -
          a.weight,
      )
      .slice(0, 24)
      .map(
        (edge) => ({
          from:
            edge.from,
          to:
            edge.to,
        }),
      );

  return {
    nodes,
    edges:
      normalizedEdges,
    raw: {
      moduleCount:
        orderedModules.length,
      connectionCount:
        normalizedEdges.length,
    },
  };
}

function inferArchitectureCategory(
  moduleName,
) {
  const value =
    moduleName.toLowerCase();

  if (
    [
      "app",
      "components",
      "pages",
      "views",
      "ui",
    ].includes(
      value,
    )
  ) {
    return "Presentation";
  }

  if (
    [
      "api",
      "services",
      "server",
      "lib",
    ].includes(
      value,
    )
  ) {
    return "Service";
  }

  if (
    [
      "store",
      "state",
      "context",
    ].includes(
      value,
    )
  ) {
    return "State";
  }

  if (
    [
      "data",
      "db",
      "database",
      "models",
    ].includes(
      value,
    )
  ) {
    return "Data";
  }

  if (
    [
      "types",
      "schemas",
      "contracts",
    ].includes(
      value,
    )
  ) {
    return "Contracts";
  }

  if (
    [
      "hooks",
      "utils",
      "helpers",
    ].includes(
      value,
    )
  ) {
    return "Shared";
  }

  return "Module";
}

function clamp(
  value,
  minimum,
  maximum,
) {
  return Math.min(
    maximum,
    Math.max(
      minimum,
      value,
    ),
  );
}

/* ============================================================
 * Git analysis
 * ============================================================ */

function analyzeGit(
  root,
) {
  if (
    !isGitRepository(
      root,
    )
  ) {
    return {
      available:
        false,
      commitCount: 0,
      firstCommit:
        null,
      latestCommit:
        null,
      commits: [],
    };
  }

  const countRaw =
    command(
      "git",
      [
        "rev-list",
        "--count",
        "HEAD",
      ],
      root,
    );

  const commitCount =
    Number.parseInt(
      countRaw,
      10,
    ) || 0;

  const logRaw =
    command(
      "git",
      [
        "log",
        "-n",
        "200",
        "--date=short",
        "--format=%H%x09%ad%x09%s",
      ],
      root,
    );

  const commits =
    logRaw
      ? logRaw
          .split(
            /\r?\n/,
          )
          .map(
            (line) => {
              const [
                hash,
                date,
                message,
              ] =
                line.split(
                  "\t",
                );

              return {
                hash,
                date,
                message:
                  message ??
                  "",
              };
            },
          )
          .filter(
            (item) =>
              item.date,
          )
      : [];

  const oldest =
    [...commits].reverse();

  return {
    available:
      true,
    commitCount,
    firstCommit:
      oldest[0] ??
      null,
    latestCommit:
      commits[0] ??
      null,
    commits,
  };
}

function classifyCommit(
  message,
) {
  const normalized =
    message
      .trim()
      .toLowerCase();

  const conventional =
    normalized.match(
      /^(feat|fix|refactor|test|docs|chore|perf|style|build|ci|revert)(?:\([^)]*\))?:/,
    );

  if (
    conventional
  ) {
    const kind =
      conventional[1];

    const names = {
      feat: "Feature development",
      fix: "Bug fixing",
      refactor:
        "Architecture & refactoring",
      test: "Testing & quality",
      docs: "Documentation",
      chore:
        "Maintenance & tooling",
      perf: "Performance work",
      style:
        "Styling & presentation",
      build:
        "Build & dependency work",
      ci: "CI & automation",
      revert:
        "Change reversal",
    };

    return (
      names[kind] ??
      "General development"
    );
  }

  if (
    /\btest\b|\bspec\b|\bcoverage\b/.test(
      normalized,
    )
  ) {
    return "Testing & quality";
  }

  if (
    /\bfix\b|\bbug\b|\bissue\b|\bpatch\b/.test(
      normalized,
    )
  ) {
    return "Bug fixing";
  }

  if (
    /\brefactor\b|\bcleanup\b|\barchitecture\b/.test(
      normalized,
    )
  ) {
    return "Architecture & refactoring";
  }

  if (
    /\bfeat\b|\badd\b|\bimplement\b|\bcreate\b/.test(
      normalized,
    )
  ) {
    return "Feature development";
  }

  return "General development";
}

function buildTimeline(
  git,
) {
  if (
    !git.available ||
    git.commits.length ===
      0
  ) {
    return {
      timeline: [
        {
          date:
            "Source snapshot",
          title:
            "Repository analysis",
          description:
            "No Git history was available, so this timeline is based on the current source snapshot.",
        },
      ],
      raw: {
        available: false,
      },
    };
  }

  const chronological =
    [...git.commits].reverse();

  /*
   * Split the commit history into up to five chronological
   * windows. This gives a useful timeline without inventing
   * semantic milestones.
   */

  const desiredWindows = 5;

  const windowCount =
    Math.min(
      desiredWindows,
      chronological.length,
    );

  const windowSize =
    Math.ceil(
      chronological.length /
        windowCount,
    );

  const windows = [];

  for (
    let index = 0;
    index <
    chronological.length;
    index += windowSize
  ) {
    windows.push(
      chronological.slice(
        index,
        index +
          windowSize,
      ),
    );
  }

  const timeline =
    windows.map(
      (
        window,
        index,
      ) => {
        const counts =
          new Map();

        for (const commit of window) {
          const kind =
            classifyCommit(
              commit.message,
            );

          counts.set(
            kind,
            (counts.get(
              kind,
            ) ?? 0) + 1,
          );
        }

        const dominant =
          [...counts.entries()]
            .sort(
              (a, b) =>
                b[1] -
                a[1],
            )[0]?.[0] ??
          "General development";

        const first =
          window[0];

        const last =
          window[
            window.length -
              1
          ];

        const date =
          first.date ===
          last.date
            ? first.date
            : `${first.date} → ${last.date}`;

        return {
          date,
          title:
            index ===
            windows.length -
              1
              ? "Recent development"
              : dominant,
          description:
            `${window.length} commits in this phase. Dominant activity: ${dominant.toLowerCase()}.`,
        };
      },
    );

  return {
    timeline,
    raw: {
      available: true,
      commitsAnalyzed:
        git.commits.length,
      commitCount:
        git.commitCount,
    },
  };
}

/* ============================================================
 * Project draft
 * ============================================================ */

function createProjectDraft(
  {
    slug,
    name,
    repositoryUrl,
    liveUrl,
    packageInfo,
    frameworks,
  },
) {
  return {
    slug,
    title:
      name ||
      prettyLabel(
        slug,
      ),
    shortDesc:
      "Project summary",
    longDesc:
      "Project description generated from the repository analysis. Review this text before publishing.",
    images: [],
    techStack:
      frameworks,
    category:
      "web",
    status:
      liveUrl
        ? "live"
        : "in-progress",
    ...(liveUrl
      ? {
          liveUrl,
        }
      : {}),
    ...(repositoryUrl
      ? {
          githubUrl:
            repositoryUrl,
        }
      : {}),
    features: [],
    challenges: [],
    startDate: "",
    featured: false,
    __notes: [
      `Package manager: ${
        packageInfo.manager ??
        "unknown"
      }`,
      "Review generated data before publication.",
    ],
  };
}

/* ============================================================
 * Existing generated data
 * ============================================================ */

function loadGeneratedData() {
  if (
    !fileExists(
      OUTPUT_FILE,
    )
  ) {
    return {
      version: 1,
      projects: {},
    };
  }

  const existing =
    readJson(
      OUTPUT_FILE,
    );

  if (
    !existing ||
    typeof existing !==
      "object"
  ) {
    return {
      version: 1,
      projects: {},
    };
  }

  if (
    !existing.projects ||
    typeof existing.projects !==
      "object"
  ) {
    existing.projects =
      {};
  }

  return existing;
}

/* ============================================================
 * Main
 * ============================================================ */

function main() {
  const {
    input,
    options,
  } = parseArgs(
    process.argv.slice(
      2,
    ),
  );

  const sourceName =
    options.name ||
    repositoryNameFromGitHubUrl(
      input,
    ) ||
    path.basename(
      path.resolve(
        ROOT_DIR,
        input,
      ),
    );

  const slug =
    slugify(
      options.slug ||
        sourceName,
    );

  const liveUrl =
    typeof options.live ===
    "string"
      ? options.live
      : null;

  log("");
  log(
    "╭──────────────────────────────────────────────╮",
  );
  log(
    "│ Dearly Portfolio · Project Intelligence      │",
  );
  log(
    "╰──────────────────────────────────────────────╯",
  );
  log("");

  log(
    `Project: ${sourceName}`,
  );
  log(
    `Slug:    ${slug}`,
  );
  log(
    `Source:  ${input}`,
  );
  log("");

  let prepared =
    null;

  try {
    prepared =
      prepareProject(
        input,
        slug,
      );

    const projectRoot =
      prepared.root;

    log(
      "→ Scanning files...",
    );

    const files =
      collectFiles(
        projectRoot,
      );

    log(
      `  ✓ ${files.length} files discovered`,
    );

    if (
      files.length >=
      MAX_FILES_FOR_ANALYSIS
    ) {
      log(
        `  ! Scan capped at ${MAX_FILES_FOR_ANALYSIS} files`,
      );
    }

    log(
      "→ Reading package metadata...",
    );

    const packageInfo =
      analyzePackage(
        projectRoot,
      );

    const frameworks =
      detectFrameworks(
        projectRoot,
        files,
        packageInfo,
      );

    log(
      `  ✓ ${frameworks.length} technologies detected`,
    );

    log(
      "→ Calculating metrics...",
    );

    const metricAnalysis =
      calculateMetrics(
        projectRoot,
        files,
        packageInfo,
        frameworks,
      );

    log(
      `  ✓ ${metricAnalysis.metrics.length} metrics generated`,
    );

    log(
      "→ Building architecture graph...",
    );

    const architecture =
      calculateArchitecture(
        projectRoot,
        files,
      );

    log(
      `  ✓ ${architecture.nodes.length} nodes · ${architecture.edges.length} connections`,
    );

    log(
      "→ Analyzing git history...",
    );

    const git =
      analyzeGit(
        projectRoot,
      );

    log(
      `  ✓ ${git.commitCount} commits found`,
    );

    log(
      "→ Building engineering timeline...",
    );

    const timeline =
      buildTimeline(
        git,
      );

    log(
      `  ✓ ${timeline.timeline.length} timeline milestones`,
    );

    const generated =
      loadGeneratedData();

    generated.version = 1;

    generated.generatedAt =
      new Date().toISOString();

    generated.generator =
      "scripts/project-analyzer.mjs";

    generated.projects[
      slug
    ] = {
      slug,

      title:
        sourceName,

      repositoryUrl:
        prepared.repositoryUrl,

      liveUrl,

      analyzedAt:
        new Date().toISOString(),

      provenance: {
        metrics:
          "deterministic",
        architecture:
          "deterministic-import-analysis",
        timeline:
          "git-history",
      },

      metrics:
        metricAnalysis.metrics,

      architecture: {
        nodes:
          architecture.nodes,
        edges:
          architecture.edges,
      },

      timeline:
        timeline.timeline,

      raw: {
        metrics:
          metricAnalysis.raw,

        architecture:
          architecture.raw,

        timeline:
          timeline.raw,

        git: {
          commitCount:
            git.commitCount,

          firstCommit:
            git.firstCommit,

          latestCommit:
            git.latestCommit,
        },

        package:
          packageInfo,

        frameworks,
      },

      draft: createProjectDraft(
        {
          slug,
          name: sourceName,
          repositoryUrl:
            prepared.repositoryUrl,
          liveUrl,
          packageInfo,
          frameworks,
        },
      ),
    };

    writeJson(
      OUTPUT_FILE,
      generated,
    );

    log("");

    log(
      "✓ Project intelligence generated successfully.",
    );

    log("");

    log(
      `Output: ${normalizePath(
        path.relative(
          ROOT_DIR,
          OUTPUT_FILE,
        ),
      )}`,
    );

    log("");

    log(
      "Generated:",
    );

    log(
      `  ✓ ${metricAnalysis.metrics.length} metrics`,
    );

    log(
      `  ✓ ${architecture.nodes.length} architecture nodes`,
    );

    log(
      `  ✓ ${timeline.timeline.length} timeline milestones`,
    );

    log("");

    log(
      "Next:",
    );

    log(
      `  1. Add the project itself to projects.ts`,
    );

    log(
      `  2. Review generated intelligence if needed`,
    );

    log(
      `  3. Run npm run build`,
    );

    log("");

    if (
      options.print ===
      true
    ) {
      log(
        "Generated project draft:",
      );

      log(
        JSON.stringify(
          generated.projects[
            slug
          ].draft,
          null,
          2,
        ),
      );
    }
  } catch (error) {
    fail(
      error instanceof Error
        ? error.message
        : String(error),
    );
  } finally {
    if (
      prepared?.cleanup
    ) {
      prepared.cleanup();
    }
  }
}

main();
