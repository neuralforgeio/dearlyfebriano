import type { ProjectArchitecture } from "@/dearlyfebriano/types";
import generatedIntelligence from "./generated-project-intelligence.json";

/* ============================================================
 * PROJECT ARCHITECTURES
 *
 * Diagram data is intentionally kept separate from projects.ts.
 * This keeps the main project dataset manageable.
 *
 * x/y positions are percentages:
 * 0   = left/top
 * 50  = center
 * 100 = right/bottom
 * ============================================================ */

interface GeneratedProjectIntelligence {
  projects?: Record<
    string,
    {
      architecture?: ProjectArchitecture;
    }
  >;
}

export const projectArchitectures: Record<string, ProjectArchitecture> = {
  /* ==========================================================
   * FLOWCANVAS
   * ========================================================== */

  flowcanvas: {
    nodes: [
      {
        id: "ui",
        label: "React UI",
        description: "Canvas, panels, command palette, presentation mode",
        category: "Presentation",
        x: 50,
        y: 10,
      },
      {
        id: "canvas",
        label: "Canvas Engine",
        description: "Pointer events, zoom, selection, snapping",
        category: "Core",
        x: 22,
        y: 38,
      },
      {
        id: "store",
        label: "Zustand",
        description: "Document and application state",
        category: "State",
        x: 50,
        y: 38,
      },
      {
        id: "simulation",
        label: "Simulation Engine",
        description: "Deterministic graph execution",
        category: "Engine",
        x: 78,
        y: 38,
      },
      {
        id: "validation",
        label: "Validation Engine",
        description: "Cycles, orphan nodes, dangling edges, port validation",
        category: "Engine",
        x: 22,
        y: 67,
      },
      {
        id: "indexeddb",
        label: "IndexedDB",
        description: "Local documents, snapshots and settings",
        category: "Storage",
        x: 50,
        y: 67,
      },
      {
        id: "export",
        label: "Export Pipeline",
        description: "JSON, SVG and PNG generated from document data",
        category: "Output",
        x: 78,
        y: 67,
      },
      {
        id: "browser",
        label: "Browser",
        description: "Zero-backend local-first runtime",
        category: "Runtime",
        x: 50,
        y: 91,
      },
    ],

    edges: [
      {
        from: "ui",
        to: "canvas",
      },
      {
        from: "ui",
        to: "store",
      },
      {
        from: "canvas",
        to: "store",
      },
      {
        from: "store",
        to: "simulation",
      },
      {
        from: "store",
        to: "validation",
      },
      {
        from: "store",
        to: "indexeddb",
      },
      {
        from: "store",
        to: "export",
      },
      {
        from: "simulation",
        to: "browser",
      },
      {
        from: "export",
        to: "browser",
      },
      {
        from: "indexeddb",
        to: "browser",
      },
    ],
  },

  /* ==========================================================
   * TROMINO DIGITAL
   * ========================================================== */

  "tromino-digital": {
    nodes: [
      {
        id: "docs",
        label: "Docs Site",
        description: "Single-route documentation and playground experience",
        category: "Presentation",
        x: 50,
        y: 10,
      },
      {
        id: "components",
        label: "29 Components",
        description: "Core, overlay and showcase components",
        category: "UI",
        x: 22,
        y: 38,
      },
      {
        id: "primitives",
        label: "Interaction Primitives",
        description: "Focus trap, roving tabindex, typeahead, positioning",
        category: "Core",
        x: 50,
        y: 38,
      },
      {
        id: "tokens",
        label: "Token System",
        description: "Three-tier tokens and export formats",
        category: "Design",
        x: 78,
        y: 38,
      },
      {
        id: "tests",
        label: "Behavior Tests",
        description: "RTL, user-event and axe coverage",
        category: "Quality",
        x: 22,
        y: 67,
      },
      {
        id: "playground",
        label: "Live Playgrounds",
        description: "URL-driven component demos",
        category: "Docs",
        x: 50,
        y: 67,
      },
      {
        id: "responsive",
        label: "Responsive Shell",
        description: "Desktop sidebar, tablet rail and phone drawer",
        category: "Layout",
        x: 78,
        y: 67,
      },
      {
        id: "browser",
        label: "Browser",
        description: "Rendered docs and component system",
        category: "Runtime",
        x: 50,
        y: 91,
      },
    ],

    edges: [
      {
        from: "docs",
        to: "components",
      },
      {
        from: "docs",
        to: "playground",
      },
      {
        from: "components",
        to: "primitives",
      },
      {
        from: "components",
        to: "tokens",
      },
      {
        from: "components",
        to: "tests",
      },
      {
        from: "playground",
        to: "components",
      },
      {
        from: "responsive",
        to: "components",
      },
      {
        from: "tests",
        to: "browser",
      },
      {
        from: "tokens",
        to: "browser",
      },
    ],
  },

  /* ==========================================================
   * BLIYU
   * ========================================================== */

  bliyu: {
    nodes: [
      {
        id: "shop",
        label: "Marketplace UI",
        description: "Product, category, cart and checkout experience",
        category: "Frontend",
        x: 50,
        y: 10,
      },
      {
        id: "router",
        label: "Custom Router",
        description: "History API and useSyncExternalStore",
        category: "Navigation",
        x: 22,
        y: 38,
      },
      {
        id: "zustand",
        label: "Zustand",
        description: "Persistent client state",
        category: "State",
        x: 50,
        y: 38,
      },
      {
        id: "commerce",
        label: "Commerce Logic",
        description: "Cart, voucher, shipping, checkout and reviews",
        category: "Domain",
        x: 78,
        y: 38,
      },
      {
        id: "fixtures",
        label: "Local Fixtures",
        description: "122 products and 24 categories",
        category: "Data",
        x: 22,
        y: 67,
      },
      {
        id: "images",
        label: "Image Pipeline",
        description: "Deterministic product images and SVG fallback",
        category: "Media",
        x: 50,
        y: 67,
      },
      {
        id: "search",
        label: "Search Engine",
        description: "Intent parsing, filtering and ranking",
        category: "Search",
        x: 78,
        y: 67,
      },
      {
        id: "browser",
        label: "Browser",
        description: "Zero-backend application runtime",
        category: "Runtime",
        x: 50,
        y: 91,
      },
    ],

    edges: [
      {
        from: "shop",
        to: "router",
      },
      {
        from: "shop",
        to: "zustand",
      },
      {
        from: "shop",
        to: "commerce",
      },
      {
        from: "router",
        to: "browser",
      },
      {
        from: "zustand",
        to: "commerce",
      },
      {
        from: "commerce",
        to: "fixtures",
      },
      {
        from: "commerce",
        to: "search",
      },
      {
        from: "fixtures",
        to: "images",
      },
      {
        from: "images",
        to: "browser",
      },
      {
        from: "search",
        to: "browser",
      },
    ],
  },

  /* ==========================================================
   * ARUS LEDGER
   * ========================================================== */

  "arus-ledger": {
    nodes: [
      {
        id: "ui",
        label: "Next.js UI",
        description: "M-banking style responsive interface",
        category: "Frontend",
        x: 50,
        y: 10,
      },
      {
        id: "state",
        label: "App State",
        description: "Application and local settings state",
        category: "State",
        x: 22,
        y: 38,
      },
      {
        id: "dexie",
        label: "Dexie / IndexedDB",
        description: "Transactions, accounts, categories and budgets",
        category: "Storage",
        x: 50,
        y: 38,
      },
      {
        id: "charts",
        label: "SVG Charts",
        description: "Six custom chart types",
        category: "Visualization",
        x: 78,
        y: 38,
      },
      {
        id: "reports",
        label: "Report Engine",
        description: "Four-page PDF and spreadsheet exports",
        category: "Reporting",
        x: 22,
        y: 67,
      },
      {
        id: "signature",
        label: "Signature Pad",
        description: "Canvas signature embedded into reports",
        category: "Export",
        x: 50,
        y: 67,
      },
      {
        id: "pwa",
        label: "PWA Runtime",
        description: "Offline-first service worker and install flow",
        category: "Runtime",
        x: 78,
        y: 67,
      },
      {
        id: "browser",
        label: "Device",
        description: "Data remains on the user's device",
        category: "Runtime",
        x: 50,
        y: 91,
      },
    ],

    edges: [
      {
        from: "ui",
        to: "state",
      },
      {
        from: "ui",
        to: "charts",
      },
      {
        from: "state",
        to: "dexie",
      },
      {
        from: "dexie",
        to: "reports",
      },
      {
        from: "reports",
        to: "signature",
      },
      {
        from: "signature",
        to: "browser",
      },
      {
        from: "charts",
        to: "browser",
      },
      {
        from: "pwa",
        to: "browser",
      },
    ],
  },

  /* ==========================================================
   * OPENFORGE
   * ========================================================== */

  openforge: {
    nodes: [
      {
        id: "user",
        label: "User",
        description: "Task and software-building requests",
        category: "Input",
        x: 50,
        y: 8,
      },
      {
        id: "agent",
        label: "Agent Core",
        description: "Task understanding and execution loop",
        category: "Agent",
        x: 50,
        y: 30,
      },
      {
        id: "planner",
        label: "Planner",
        description: "Breaks goals into executable steps",
        category: "Reasoning",
        x: 22,
        y: 54,
      },
      {
        id: "tools",
        label: "Tool Router",
        description: "Routes tasks to local capabilities",
        category: "Tools",
        x: 50,
        y: 54,
      },
      {
        id: "memory",
        label: "Memory",
        description: "Local knowledge and context",
        category: "Memory",
        x: 78,
        y: 54,
      },
      {
        id: "automation",
        label: "Automation",
        description: "System and workflow execution",
        category: "Execution",
        x: 22,
        y: 77,
      },
      {
        id: "local",
        label: "Local Runtime",
        description: "Offline-first execution environment",
        category: "Runtime",
        x: 50,
        y: 77,
      },
      {
        id: "llm",
        label: "Local LLM",
        description: "Local model inference",
        category: "AI",
        x: 78,
        y: 77,
      },
      {
        id: "machine",
        label: "User Device",
        description: "Private local machine",
        category: "Runtime",
        x: 50,
        y: 94,
      },
    ],

    edges: [
      {
        from: "user",
        to: "agent",
      },
      {
        from: "agent",
        to: "planner",
      },
      {
        from: "agent",
        to: "tools",
      },
      {
        from: "agent",
        to: "memory",
      },
      {
        from: "planner",
        to: "tools",
      },
      {
        from: "tools",
        to: "automation",
      },
      {
        from: "tools",
        to: "local",
      },
      {
        from: "memory",
        to: "local",
      },
      {
        from: "llm",
        to: "agent",
      },
      {
        from: "automation",
        to: "machine",
      },
      {
        from: "local",
        to: "machine",
      },
    ],
  },
};

/* ============================================================
 * GET ARCHITECTURE
 * ============================================================ */

export function getProjectArchitecture(
  slug: string,
): ProjectArchitecture | null {
  const manual = projectArchitectures[slug];

  if (manual) {
    return manual;
  }

  const generated = (generatedIntelligence as GeneratedProjectIntelligence)
    .projects?.[slug]?.architecture;

  return generated ?? null;
}
