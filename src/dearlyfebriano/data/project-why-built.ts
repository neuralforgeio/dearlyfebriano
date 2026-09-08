export interface ProjectWhyBuilt {
  problem: string;
  motivation: string;
  approach: string;
  outcome: string;
  decisions: string[];
}

/* ============================================================
 * WHY I BUILT THIS
 *
 * Purpose:
 * - Menjelaskan alasan project dibuat.
 * - Fokus pada problem, motivation, approach, outcome.
 * - Tidak mencampur data ini ke projects.ts.
 *
 * Semua copy tetap dapat melewati `t()` dari language context.
 * ============================================================ */

export const projectWhyBuilt: Record<string, ProjectWhyBuilt> = {
  /* ==========================================================
   * FINORA
   * ========================================================== */

  finora: {
    problem:
      "Financial operations often become fragmented across separate tools and screens. Accounting, sales, collections, payments, and analytics can each have their own source of truth, making even simple business events difficult to track consistently.",

    motivation:
      "I wanted to explore what a finance workspace would look like when the business flow is treated as one connected system instead of a collection of isolated modules.",

    approach:
      "Finora was structured around a shared deterministic data model where business events flow through the same underlying state. The focus was not on adding more screens, but on making every screen agree on the same financial reality, including currency presentation, payment state, receivables, reconciliation, and analytics.",

    outcome:
      "The result is a frontend-first financial workspace that demonstrates how sales, accounting, collections, cash flow, and reporting can remain synchronized while preserving precise integer-based money semantics.",

    decisions: [
      "One shared data model across sales, accounting, collections, and analytics.",
      "Integer-based IDR money semantics to avoid floating-point inconsistencies.",
      "Centralized currency presentation instead of module-specific formatting.",
      "Deterministic demo data so the complete financial workflow remains reproducible.",
    ],
  },

  /* ==========================================================
   * OPENFORGE
   * ========================================================== */

  openforge: {
    problem:
      "Most AI assistants depend heavily on remote infrastructure, which creates trade-offs around privacy, data ownership, availability, and control.",

    motivation:
      "I wanted to explore an AI agent model where the user remains in control of the environment and core workflows can continue without silently sending personal data to external services.",

    approach:
      "OpenForge is designed around a local-first execution model. The architecture emphasizes local models, offline information retrieval, task planning, automation, and explicit execution checkpoints so the agent can remain useful without requiring every operation to leave the machine.",

    outcome:
      "The project became a foundation for experimenting with privacy-first autonomous workflows, local AI tooling, software-building assistance, and offline task execution.",

    decisions: [
      "Local-first execution as the default architectural principle.",
      "Explicit task planning instead of blind autonomous actions.",
      "Offline knowledge retrieval for core information workflows.",
      "Verifiable execution checkpoints for safer automation.",
    ],
  },

  /* ==========================================================
   * INSTANT RESUME
   * ========================================================== */

  "instant-resume": {
    problem:
      "Creating a professional resume manually can take far more time than actually writing the content. Users often end up spending their time adjusting margins, typography, spacing, and layout instead of improving the information itself.",

    motivation:
      "I wanted to reduce resume creation to the part that actually matters: entering good information. The system should handle the repetitive visual decisions automatically.",

    approach:
      "Instant Resume separates content creation from document styling. Users provide structured information while the application controls hierarchy, spacing, typography, and document rendering through templates.",

    outcome:
      "The result is a faster CV creation workflow that can produce consistent, polished output without requiring users to understand document design.",

    decisions: [
      "Content-first editing instead of manual document formatting.",
      "Template-controlled layout and typography.",
      "Dedicated rendering pipeline for predictable PDF output.",
      "Minimal configuration to keep the learning curve low.",
    ],
  },

  /* ==========================================================
   * AKUMA JOKI
   * ========================================================== */

  "akumajoki-store": {
    problem:
      "A digital gaming service storefront needs to handle more than a simple product list. Customers need a reliable journey from browsing game-specific services to checkout, order tracking, reviews, loyalty, and post-order recovery, while the operator needs a manageable admin system behind it.",

    motivation:
      "I wanted to build a storefront that felt like a real product rather than a static catalog, while also exploring how far a modern full-stack commerce experience could be pushed with lightweight synchronization and a strong frontend architecture.",

    approach:
      "The system combines a retro pixel-art brand with a full customer journey: multi-item checkout, grouped Order IDs, WhatsApp handoff, tracking, wishlist, loyalty, reviews, search, and a large admin dashboard. Business data can synchronize through GitHub-backed JSON while defaults remain available as a resilient fallback.",

    outcome:
      "The result is a production-oriented Roblox service storefront with both a customer-facing commerce experience and an operator-focused management layer.",

    decisions: [
      "Grouped Order ID model for multi-service purchases.",
      "GitHub-backed content synchronization without introducing a traditional CMS.",
      "Deterministic smart search instead of making every search request depend on an external AI service.",
      "Persistent client state for cart, wishlist, loyalty, and order recovery.",
    ],
  },

  /* ==========================================================
   * TROMINO DIGITAL
   * ========================================================== */

  "tromino-digital": {
    problem:
      "A UI component library can become difficult to trust when behavior, accessibility, documentation, and interaction rules are scattered across different abstractions or inherited from many runtime dependencies.",

    motivation:
      "I wanted to build a design system from the ground up and understand the engineering cost of recreating the interaction patterns that mature UI libraries normally provide.",

    approach:
      "Tromino Digital uses hand-rolled interaction primitives for focus management, keyboard navigation, typeahead, fuzzy scoring, anchored positioning, dismissable layers, and scroll locking. Components are backed by behavior-first testing and a living documentation experience.",

    outcome:
      "The project demonstrates a dependency-light design system with explicit interaction contracts, accessible behavior, live component playgrounds, and documentation tied closely to the implementation.",

    decisions: [
      "Zero runtime UI framework dependency.",
      "Behavior-first testing around accessibility contracts.",
      "Hand-rolled interaction primitives instead of opaque abstractions.",
      "Documentation built as part of the product rather than as an afterthought.",
    ],
  },

  /* ==========================================================
   * BLIYU
   * ========================================================== */

  bliyu: {
    problem:
      "A marketplace normally depends on backend infrastructure for products, sellers, orders, search, and checkout. That makes it harder to experiment with the entire shopping experience as a deterministic frontend system.",

    motivation:
      "I wanted to explore how complete a modern e-commerce experience could become while intentionally removing the backend and keeping every interaction deterministic and local.",

    approach:
      "BliYu models products, sellers, cart state, checkout, vouchers, shipping, reviews, flash sales, comparison, and search with local fixtures and client state. The application also uses a hand-rolled route system over Next.js so the frontend can still behave like a real multi-route commerce product.",

    outcome:
      "The result is a full shopping experience that can be explored without a live backend while still demonstrating real commerce logic, state management, routing, and accessibility concerns.",

    decisions: [
      "Zero-backend architecture with deterministic local fixtures.",
      "Integer-IDR semantics for every monetary calculation.",
      "Custom path-based navigation layered over Next.js App Router.",
      "Derived shipping, voucher, and checkout state instead of duplicated sources of truth.",
    ],
  },

  /* ==========================================================
   * FLOWCANVAS
   * ========================================================== */

  flowcanvas: {
    problem:
      "Workflow and diagram editors often rely on backend services, heavyweight canvas libraries, or browser DOM state that makes export, persistence, and deterministic execution harder to control.",

    motivation:
      "I wanted to build a serious visual editor entirely in the browser and learn how much of the canvas, workflow, validation, persistence, simulation, and export stack could be designed from first principles.",

    approach:
      "FlowCanvas is built around a local document model persisted in IndexedDB. The editor uses a hand-rolled infinite canvas, structured node definitions, deterministic simulation, pure-function validation, command-pattern history, and export pipelines that operate directly on document data.",

    outcome:
      "The result is a local-first workflow editor that behaves like a real application while keeping documents private, execution deterministic, and exports independent from DOM screenshots.",

    decisions: [
      "Local-first document storage with IndexedDB.",
      "Hand-rolled canvas interaction using Pointer Events.",
      "Structured condition operators instead of eval().",
      "Pure-function validation and document-data-based exports.",
      "Command-pattern undo/redo with gesture coalescing.",
    ],
  },

  /* ==========================================================
   * PORTFOLIO
   * ========================================================== */

  dearlyfebriano: {
    problem:
      "A software engineer portfolio can easily become a static collection of screenshots and technology lists without showing how the work was actually engineered.",

    motivation:
      "I wanted the portfolio itself to demonstrate engineering thinking: architecture, project metrics, repository verification, development history, technical decisions, and a real client inquiry workflow.",

    approach:
      "The portfolio was built as an interactive engineering showcase with live project previews, GitHub verification, generated project intelligence, technology exploration, bilingual content, live certificate synchronization, and a structured hiring workflow.",

    outcome:
      "The portfolio acts as both a professional profile and a living demonstration of how I design software systems, document technical decisions, and turn projects into verifiable case studies.",

    decisions: [
      "Project data separated from presentation components.",
      "GitHub used as a verification layer for technical work.",
      "Dynamic statistics instead of manually maintained portfolio counts.",
      "Interactive project views instead of static screenshot galleries.",
      "Smart inquiry workflow for converting visitors into qualified conversations.",
    ],
  },
};
