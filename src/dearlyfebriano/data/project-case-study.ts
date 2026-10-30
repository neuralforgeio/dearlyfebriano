export interface ProjectCaseStudyTradeoff {
  decision: string;
  rationale: string;
  tradeOff: string;
}

export interface ProjectCaseStudy {
  role: string;
  responsibilities: string[];
  tradeoffs: ProjectCaseStudyTradeoff[];
  lessonsLearned: string[];
}

export const projectCaseStudies: Record<string, ProjectCaseStudy> = {
  /* ==========================================================
   * FINORA
   * ========================================================== */

  finora: {
    role: "Product Engineer & System Designer",

    responsibilities: [
      "Designed the connected workflow between sales, accounting, collections, payments, and analytics.",
      "Built a shared data model to keep business operations synchronized across modules.",
      "Implemented centralized currency formatting and integer-based IDR money calculations.",
      "Developed deterministic demo data to make the complete financial workflow reproducible.",
    ],

    tradeoffs: [
      {
        decision: "One shared financial data model",

        rationale:
          "Every financial module reads from a consistent source of truth instead of maintaining separate representations of the same business event.",

        tradeOff:
          "The initial modeling and state-management work becomes more demanding, but cross-module inconsistencies are easier to prevent.",
      },
      {
        decision: "Frontend-first deterministic workspace",

        rationale:
          "The complete financial workflow can be demonstrated without depending on external services or unpredictable data.",

        tradeOff:
          "This makes the demonstration reproducible, but it does not independently validate a production backend or real financial integrations.",
      },
    ],

    lessonsLearned: [
      "Business workflows should be modeled as connected events instead of isolated screens.",
      "Financial calculations need consistent numeric semantics across the entire application.",
      "A centralized source of truth reduces synchronization problems between modules.",
    ],
  },

  /* ==========================================================
   * INSTANT RESUME
   * ========================================================== */

  "instant-resume": {
    role: "Freelance Software Engineer",

    responsibilities: [
      "Developed the guided CV creation experience using React.",
      "Implemented template-driven document layouts and automatic formatting.",
      "Separated document content management from the PDF rendering process.",
      "Built the workflow for generating professional CV documents.",
    ],

    tradeoffs: [
      {
        decision: "Template-controlled document styling",

        rationale:
          "Users can focus on their information without having to understand typography, margins, or document layout.",

        tradeOff:
          "Users have less freedom to customize individual visual elements, but the resulting documents remain consistent.",
      },
      {
        decision: "Separate PDF rendering pipeline",

        rationale:
          "Document generation is isolated from the editing interface so that the exported output can follow a predictable layout.",

        tradeOff:
          "The application has an additional rendering boundary to maintain, but the editor becomes easier to reason about.",
      },
    ],

    lessonsLearned: [
      "A good user experience can come from removing unnecessary decisions.",
      "Document rendering should be treated as a separate engineering concern.",
      "Consistent templates can make complex formatting accessible to non-technical users.",
    ],
  },

  /* ==========================================================
   * AKUMA JOKI
   * ========================================================== */

  "akumajoki-store": {
    role: "Full-stack Developer",

    responsibilities: [
      "Developed the customer-facing Roblox service storefront.",
      "Implemented multi-item cart handling and grouped Order ID workflows.",
      "Built order tracking and customer order recovery functionality.",
      "Developed the administrative dashboard and GitHub-backed content synchronization.",
      "Implemented smart search, loyalty, wishlist, and customer interaction features.",
    ],

    tradeoffs: [
      {
        decision: "GitHub-backed JSON content synchronization",

        rationale:
          "Store content can be versioned and synchronized through GitHub without introducing a traditional CMS.",

        tradeOff:
          "The synchronization workflow needs additional validation and fallback handling when remote content is unavailable.",
      },
      {
        decision: "WhatsApp checkout handoff",

        rationale:
          "Customers can continue their order through a familiar communication channel without requiring a complete payment gateway integration.",

        tradeOff:
          "The customer leaves the storefront to complete the conversation, so the transition between application state and manual operations must be handled carefully.",
      },
    ],

    lessonsLearned: [
      "Commerce applications must account for the customer journey beyond the shopping cart.",
      "Orders containing multiple products need a consistent grouping model.",
      "Administrative workflows are just as important as the customer-facing storefront.",
    ],
  },

  /* ==========================================================
   * TROMINO DIGITAL
   * ========================================================== */

  "tromino-digital": {
    role: "Design System Engineer",

    responsibilities: [
      "Designed and developed a custom React component library.",
      "Built hand-rolled interaction primitives for focus management, keyboard navigation, typeahead, and overlays.",
      "Implemented accessible component behavior following WAI-ARIA interaction patterns.",
      "Developed behavior-first tests using React Testing Library, user-event, and axe.",
      "Created the documentation website with interactive component playgrounds.",
    ],

    tradeoffs: [
      {
        decision: "Hand-rolled interaction primitives",

        rationale:
          "The component library keeps direct control over its behavior and avoids runtime dependencies on existing UI frameworks.",

        tradeOff:
          "More engineering work is required for keyboard behavior, accessibility, focus management, and long-term maintenance.",
      },
      {
        decision: "Behavior-first testing",

        rationale:
          "Component correctness is validated through actual interaction contracts rather than relying only on visual inspection.",

        tradeOff:
          "The initial development process requires more testing effort, but behavioral regressions become easier to detect.",
      },
    ],

    lessonsLearned: [
      "A component library is defined by its behavior, not only by its visual appearance.",
      "Accessibility needs to be designed into interaction primitives from the beginning.",
      "Reusable abstractions should have clear behavioral contracts.",
    ],
  },

  /* ==========================================================
   * ARUS LEDGER
   * ========================================================== */

  "arus-ledger": {
    role: "Frontend & PWA Engineer",

    responsibilities: [
      "Designed the local-first application architecture using IndexedDB and Dexie.",
      "Implemented transaction, account, category, and budgeting workflows.",
      "Built custom SVG-based financial visualizations.",
      "Developed PDF reporting and spreadsheet export functionality.",
      "Implemented the offline-capable Progressive Web App experience.",
    ],

    tradeoffs: [
      {
        decision: "Local-first data storage",

        rationale:
          "Personal financial records remain on the user's device instead of being transferred to an application server.",

        tradeOff:
          "The application does not automatically provide cross-device synchronization or centralized cloud backups.",
      },
      {
        decision: "Custom SVG charts",

        rationale:
          "Visualizations can be tailored to the application's needs without adding a production charting-library dependency.",

        tradeOff:
          "Chart drawing, interaction behavior, and maintenance become responsibilities of the application itself.",
      },
    ],

    lessonsLearned: [
      "Data ownership and privacy can be architectural decisions rather than optional settings.",
      "Offline-first applications require careful persistence and recovery design.",
      "Custom visualizations provide flexibility but also introduce implementation responsibilities.",
    ],
  },

  /* ==========================================================
   * BLIYU
   * ========================================================== */

  bliyu: {
    role: "Frontend Engineer & Commerce System Designer",

    responsibilities: [
      "Designed the zero-backend marketplace architecture.",
      "Implemented the product catalog, seller data, cart, and checkout workflows.",
      "Built a custom path-based router using the History API.",
      "Developed integer-IDR monetary calculations and checkout validation.",
      "Implemented voucher, shipping, flash-sale, and product comparison logic.",
    ],

    tradeoffs: [
      {
        decision: "Deterministic local fixtures instead of a backend",

        rationale:
          "The complete marketplace experience can be explored without depending on a deployed backend or external data source.",

        tradeOff:
          "The application is useful as a self-contained product demonstration, but does not provide real multi-user persistence.",
      },
      {
        decision: "Custom path-based navigation",

        rationale:
          "The application can control its navigation behavior while maintaining clean URLs and deep-link support.",

        tradeOff:
          "Routing, history synchronization, and navigation edge cases become additional responsibilities.",
      },
    ],

    lessonsLearned: [
      "A frontend-only application can still contain substantial business logic.",
      "Monetary calculations should avoid floating-point inconsistencies.",
      "Routing and checkout state must remain synchronized throughout the customer journey.",
    ],
  },

  /* ==========================================================
   * LINKPULSE
   * ========================================================== */

  linkpulse: {
    role: "Backend & Full-stack Developer",

    responsibilities: [
      "Designed the modular monolith architecture using Go.",
      "Developed backend packages for authentication, links, analytics, API keys, and audit logging.",
      "Implemented asynchronous click tracking using an in-memory buffer and batch worker.",
      "Designed privacy-conscious analytics using salted IP hashes.",
      "Implemented multi-tenant workspaces, role-based access, and scoped API keys.",
      "Developed the Next.js dashboard and PostgreSQL data layer.",
    ],

    tradeoffs: [
      {
        decision: "Modular monolith instead of microservices",

        rationale:
          "Related backend domains can remain separated internally while sharing a simpler deployment and operational model.",

        tradeOff:
          "Modules cannot be deployed or scaled independently without changing the architecture.",
      },
      {
        decision: "Asynchronous click analytics",

        rationale:
          "Redirect requests should not wait for analytics persistence before returning the HTTP redirect response.",

        tradeOff:
          "The application needs reliable buffer management, batch processing, and graceful-shutdown flushing.",
      },
      {
        decision: "Hashed API keys at rest",

        rationale:
          "The database can verify API keys without storing their original plaintext values.",

        tradeOff:
          "A key cannot be retrieved in plaintext later, so it must be presented securely when first created.",
      },
    ],

    lessonsLearned: [
      "Latency-sensitive operations should be separated from non-critical background work.",
      "Security should be part of the system design rather than added after implementation.",
      "A modular monolith can provide clear domain boundaries without introducing distributed-system complexity.",
    ],
  },

  /* ==========================================================
   * UMKM OS
   * ========================================================== */

  "umkm-os": {
    role: "Full-stack Developer & System Designer",

    responsibilities: [
      "Designed the Dockerized monorepo and service boundaries.",
      "Developed the cashier POS and owner management dashboard using Next.js.",
      "Implemented atomic checkout, stock validation, and inventory ledger transactions.",
      "Built integer-sen monetary calculations and server-side price validation.",
      "Integrated a read-only FastAPI forecasting service with PostgreSQL.",
      "Implemented authentication, role-based access, and product image management.",
    ],

    tradeoffs: [
      {
        decision: "Next.js as the single database writer",

        rationale:
          "All transactional mutations pass through one application boundary, while the forecasting service receives read-only database access.",

        tradeOff:
          "The main application remains responsible for all writes, but the data consistency boundary becomes easier to understand.",
      },
      {
        decision: "Atomic checkout transactions",

        rationale:
          "Receipt creation, stock decrements, and stock-ledger movements must succeed or fail together.",

        tradeOff:
          "The checkout implementation requires more careful transaction and concurrency handling than independent database writes.",
      },
      {
        decision: "Integer-sen monetary calculations",

        rationale:
          "Money calculations avoid floating-point arithmetic while remaining compatible with precise database decimal values.",

        tradeOff:
          "The application must consistently convert and format amounts at the boundaries between database, business logic, and UI.",
      },
    ],

    lessonsLearned: [
      "The server must recompute sensitive monetary values instead of trusting browser calculations.",
      "Inventory consistency requires transaction boundaries and concurrency guards.",
      "A read-only analytics or ML service can be isolated from transactional writes.",
    ],
  },
};

/**
 * Returns case-study information for a project.
 * Projects without a configured case study return null.
 */
export function getProjectCaseStudy(slug: string): ProjectCaseStudy | null {
  return projectCaseStudies[slug] ?? null;
}
