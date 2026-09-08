import type { ProjectTimeline } from "@/dearlyfebriano/types";
import generatedIntelligence from "./generated-project-intelligence.json";

/* ============================================================
 * PROJECT ENGINEERING TIMELINES
 *
 * Timeline disimpan terpisah dari projects.ts.
 *
 * Setiap milestone:
 * - date     -> optional, bebas berupa "2026-09", "Phase 2",
 *               "Production", dan sebagainya.
 * - title    -> nama milestone
 * - description -> penjelasan engineering
 *
 * Jangan mengisi tanggal yang tidak benar-benar diketahui.
 * ============================================================ */

interface GeneratedProjectIntelligence {
  projects?: Record<
    string,
    {
      timeline?: ProjectTimeline[];
    }
  >;
}

export const projectTimelines: Record<string, ProjectTimeline[]> = {
  /* ==========================================================
   * OPENFORGE
   * ========================================================== */

  openforge: [
    {
      date: "2026-01",
      title: "Project Foundation",
      description:
        "Started the local-first AI agent foundation with privacy, offline execution, and full local control as core principles.",
    },
    {
      date: "Phase 2",
      title: "Agent Core",
      description:
        "Designed the agent execution loop around task understanding, planning, and verifiable step-by-step execution.",
    },
    {
      date: "Phase 3",
      title: "Local Tooling",
      description:
        "Expanded the agent around local tools, offline information retrieval, software building assistance, and workflow automation.",
    },
    {
      date: "Ongoing",
      title: "Continuous Development",
      description:
        "Continuing development of the local AI agent system while maintaining the offline-first and privacy-first architecture.",
    },
  ],

  /* ==========================================================
   * INSTANT RESUME
   * ========================================================== */

  "instant-resume": [
    {
      date: "2023-01",
      title: "Project Start",
      description:
        "Started development of the CV builder platform as a freelance software engineering engagement.",
    },
    {
      date: "Development",
      title: "CV Editor",
      description:
        "Built the guided CV creation experience so users can focus on entering content instead of manually styling documents.",
    },
    {
      date: "Development",
      title: "Document Rendering",
      description:
        "Implemented the rendering pipeline responsible for producing consistent, professional resume layouts.",
    },
    {
      date: "2023-12",
      title: "Delivery",
      description:
        "Completed the freelance engagement and delivered the production-ready CV builder experience.",
    },
  ],

  /* ==========================================================
   * AKUMA JOKI
   * ========================================================== */

  "akumajoki-store": [
    {
      date: "2026-07",
      title: "Storefront Foundation",
      description:
        "Established the full-stack storefront foundation, product catalog structure, and retro pixel-art visual system.",
    },
    {
      date: "Development",
      title: "Commerce Flow",
      description:
        "Built the multi-item cart, grouped Order ID model, WhatsApp checkout handoff, order tracking, and customer recovery flow.",
    },
    {
      date: "Development",
      title: "Admin & Data Sync",
      description:
        "Added the GitHub-backed data synchronization layer and the administrative dashboard for products, orders, reviews, FAQ, reports, and settings.",
    },
    {
      date: "Development",
      title: "Customer Experience",
      description:
        "Expanded the storefront with loyalty, achievements, wishlist, reviews, seller chat, smart search, and personalized local state.",
    },
    {
      date: "Ongoing",
      title: "Production Iteration",
      description:
        "Continuing refinement of the storefront, deployment behavior, synchronization, and customer experience.",
    },
  ],

  /* ==========================================================
   * TROMINO DIGITAL
   * ========================================================== */

  "tromino-digital": [
    {
      date: "2026-09",
      title: "Design System Foundation",
      description:
        "Established the component architecture, token system, interaction primitives, and zero-runtime-UI-dependency approach.",
    },
    {
      date: "Development",
      title: "Component Library",
      description:
        "Built the 29-component library across core, overlay, and showcase tiers.",
    },
    {
      date: "Development",
      title: "Interaction Primitives",
      description:
        "Implemented hand-rolled primitives such as focus trap, roving tabindex, typeahead, fuzzy scoring, anchored positioning, dismissable layers, and scroll lock.",
    },
    {
      date: "Development",
      title: "Accessibility & Testing",
      description:
        "Expanded behavior-first testing with RTL, user-event, and axe while validating WAI-ARIA interaction patterns.",
    },
    {
      date: "Production",
      title: "Living Documentation",
      description:
        "Shipped the documentation site with live playgrounds, token export tooling, responsive previews, accessibility contracts, changelog, and roadmap.",
    },
  ],

  /* ==========================================================
   * ARUS LEDGER
   * ========================================================== */

  "arus-ledger": [
    {
      date: "2026-09",
      title: "Local-First Foundation",
      description:
        "Established the application around IndexedDB, Dexie, and a zero-backend architecture so financial data remains on the device.",
    },
    {
      date: "Development",
      title: "Transaction System",
      description:
        "Built transaction, account, category, budget, and derived balance flows with integer-IDR money semantics.",
    },
    {
      date: "Development",
      title: "Visualization Layer",
      description:
        "Implemented six custom chart types directly with SVG primitives without relying on a production charting library.",
    },
    {
      date: "Development",
      title: "Reporting Engine",
      description:
        "Built the four-page PDF report, spreadsheet export, CSV export, and digital signature pipeline.",
    },
    {
      date: "Production",
      title: "Offline PWA",
      description:
        "Completed the responsive PWA shell with service-worker support, offline fallback, installation flow, and route-per-tab navigation.",
    },
  ],

  /* ==========================================================
   * BLIYU
   * ========================================================== */

  bliyu: [
    {
      date: "2026-09",
      title: "Marketplace Foundation",
      description:
        "Established the zero-backend marketplace around deterministic local fixtures, product catalogs, seller data, and the responsive m-commerce shell.",
    },
    {
      date: "Development",
      title: "Routing Migration",
      description:
        "Migrated the application from hash-based navigation to clean path-based routes using the History API and a Next.js catch-all route.",
    },
    {
      date: "Development",
      title: "Commerce Engine",
      description:
        "Built the five-step checkout, voucher validation, per-seller shipping rules, variant handling, flash-sale sessions, and order state logic.",
    },
    {
      date: "Development",
      title: "Customer Features",
      description:
        "Added seller chat, wishlist, reviews, comparison, frequently-bought-together behavior, and persistent client state.",
    },
    {
      date: "Production",
      title: "Quality & Deployment",
      description:
        "Verified routing, image fallbacks, accessibility behavior, error recovery, and production deployment stability.",
    },
  ],

  /* ==========================================================
   * FLOWCANVAS
   * ========================================================== */

  flowcanvas: [
    {
      date: "2026-09",
      title: "Canvas Architecture",
      description:
        "Designed the local-first document model, object system, and hand-rolled infinite canvas engine.",
    },
    {
      date: "Development",
      title: "Canvas Interaction",
      description:
        "Implemented pointer capture, zoom-at-pointer, grid snapping, smart guides, marquee selection, minimap navigation, rotation, resizing, and drag-and-drop.",
    },
    {
      date: "Development",
      title: "Workflow Engine",
      description:
        "Added the 64-node type registry, typed ports, deterministic simulation, variables, condition operators, and a 500-step execution guard.",
    },
    {
      date: "Development",
      title: "Validation & Recovery",
      description:
        "Implemented pure-function validation, undo/redo with gesture coalescing, draft recovery, autosave, and malformed-import protection.",
    },
    {
      date: "Production",
      title: "Export & Presentation",
      description:
        "Completed JSON, SVG, and PNG exports along with frame-based presentation mode and production deployment.",
    },
  ],
};

/* ============================================================
 * GET TIMELINE
 * ============================================================ */

export function getProjectTimeline(slug: string): ProjectTimeline[] {
  const manual = projectTimelines[slug];

  if (manual && manual.length > 0) {
    return manual;
  }

  const generated = (generatedIntelligence as GeneratedProjectIntelligence)
    .projects?.[slug]?.timeline;

  return generated ?? [];
}
