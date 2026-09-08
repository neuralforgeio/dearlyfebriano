import type { ProjectMetric } from "@/dearlyfebriano/types";
import generatedIntelligence from "./generated-project-intelligence.json";

/* ============================================================
 * PROJECT METRICS
 *
 * Angka/hasil yang ditampilkan pada halaman detail project.
 *
 * Data dipisahkan dari projects.ts agar:
 * - projects.ts tetap fokus pada data utama project
 * - metrics mudah diedit
 * - project tanpa metrics tetap valid
 * - tidak perlu mengubah struktur project besar-besaran
 * ============================================================ */

interface GeneratedProjectIntelligence {
  projects?: Record<
    string,
    {
      metrics?: ProjectMetric[];
    }
  >;
}

export const projectMetrics: Record<string, ProjectMetric[]> = {
  /* ==========================================================
   * FLOWCANVAS
   * ========================================================== */

  flowcanvas: [
    {
      label: "Node Types",
      value: "64",
      description: "Across 8 categories",
    },
    {
      label: "Categories",
      value: "8",
      description: "General to architecture",
    },
    {
      label: "Templates",
      value: "10",
      description: "Fully editable starters",
    },
    {
      label: "Simulation Guard",
      value: "500",
      description: "Maximum simulation steps",
    },
  ],

  /* ==========================================================
   * TROMINO DIGITAL
   * ========================================================== */

  "tromino-digital": [
    {
      label: "Components",
      value: "29",
      description: "Across 3 component tiers",
    },
    {
      label: "Behavior Tests",
      value: "528",
      description: "RTL + user-event + axe",
    },
    {
      label: "Runtime UI Dependencies",
      value: "0",
      description: "Hand-rolled primitives",
    },
    {
      label: "Component Budget",
      value: "≤3kB",
      description: "Gzip per component",
    },
  ],

  /* ==========================================================
   * BLIYU
   * ========================================================== */

  bliyu: [
    {
      label: "Products",
      value: "122",
      description: "Deterministic local fixtures",
    },
    {
      label: "Categories",
      value: "24",
      description: "Product categories",
    },
    {
      label: "Routes",
      value: "29",
      description: "Clean application routes",
    },
    {
      label: "Image Slots",
      value: "515",
      description: "Deterministic product images",
    },
  ],

  /* ==========================================================
   * ARUS LEDGER
   * ========================================================== */

  "arus-ledger": [
    {
      label: "Chart Types",
      value: "6",
      description: "Built with raw SVG",
    },
    {
      label: "PDF Pages",
      value: "4",
      description: "Formal financial report",
    },
    {
      label: "Excel Sheets",
      value: "3",
      description: "Structured spreadsheet export",
    },
    {
      label: "Backend",
      value: "0",
      description: "Local-first architecture",
    },
  ],

  /* ==========================================================
   * AKUMA JOKI
   * ========================================================== */

  "akumajoki-store": [
    {
      label: "Checkout Items",
      value: "5",
      description: "Maximum services per order",
    },
    {
      label: "Game Catalogs",
      value: "3",
      description: "Blox Fruits, Expedition Antarctica, Retail Tycoon 2",
    },
    {
      label: "Order ID",
      value: "1",
      description: "Shared ID across multi-item orders",
    },
    {
      label: "Sync Source",
      value: "GitHub",
      description: "Content synchronization",
    },
  ],
};

/* ============================================================
 * GET METRICS
 * ============================================================ */

export function getProjectMetrics(slug: string): ProjectMetric[] {
  const manual = projectMetrics[slug];

  if (manual && manual.length > 0) {
    return manual;
  }

  const generated = (generatedIntelligence as GeneratedProjectIntelligence)
    .projects?.[slug]?.metrics;

  return generated ?? [];
}
