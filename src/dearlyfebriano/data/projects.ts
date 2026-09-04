import type { Project } from "@/dearlyfebriano/types";

/* ============================================================
 * PROJECTS DATA — ganti dengan project asli Anda.
 * Gambar thumbnail ada di /public/images/projects/
 * ============================================================ */

export const projects: Project[] = [
  {
    slug: "luxestore",
    title: "LuxeStore",
    shortDesc:
      "A high-performance e-commerce platform with real-time inventory, personalized recommendations, and a frictionless checkout flow.",
    longDesc:
      "LuxeStore is a full-featured e-commerce platform serving 10k+ monthly active users. It features a headless storefront built with Next.js App Router, a powerful admin dashboard, real-time stock synchronization via Server-Sent Events, and an recommendation engine that lifted average order value by 23%. The entire checkout was optimized to complete in under 30 seconds on 3G connections.",
    thumbnail: "/images/projects/luxestore.png",
    images: ["/images/projects/luxestore-detail.png"],
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL", "Prisma", "Stripe"],
    category: "web",
    status: "live",
    githubUrl: "https://github.com/neuralforgeio/luxestore",
    features: [
      "Headless storefront with ISR for 95+ Lighthouse performance score",
      "Real-time inventory sync via Server-Sent Events",
      "AI-powered product recommendations with A/B testing",
      "One-page checkout with Stripe & Midtrans integration",
      "Admin dashboard with sales analytics and CSV export",
      "Automated abandoned-cart recovery emails",
    ],
    challenges: [
      {
        title: "Checkout latency on slow networks",
        description:
          "Bundle analysis revealed heavy form libraries. I replaced them with native validation + server actions, cutting checkout JS payload by 62% and completion time nearly in half on 3G.",
      },
      {
        title: "Race conditions on stock updates",
        description:
          "Flash sales caused overselling. I moved stock decrements into a single serialized transaction with optimistic UI rollback, eliminating oversells during a 12k-order flash sale.",
      },
    ],
    startDate: "2024-01",
    endDate: "2024-06",
    duration: "6 months",
    featured: true,
  },
  {
    slug: "foodfleet",
    title: "FoodFleet",
    shortDesc:
      "On-demand food delivery mobile app with live courier tracking, smart batching, and in-app payments.",
    longDesc:
      "FoodFleet connects 150+ restaurants with couriers and customers across Indonesia. The React Native app streams courier locations over WebSockets, renders live routes on Mapbox, and batches nearby orders to maximize courier earnings. A custom order-state machine keeps menus, kitchens, and customers perfectly in sync.",
    thumbnail: "/images/projects/foodfleet.png",
    images: ["/images/projects/foodfleet-detail.png"],
    techStack: ["React Native", "Node.js", "Socket.io", "MongoDB", "Mapbox", "Redis"],
    category: "mobile",
    status: "live",
    githubUrl: "https://github.com/neuralforgeio/foodfleet",
    features: [
      "Live courier tracking with 1s update interval over WebSockets",
      "Smart order batching engine (max +38% courier trips/hour)",
      "In-app payments with GoPay, OVO, and virtual accounts",
      "Restaurant Partner Mode for menu & availability management",
      "Push notifications with deep linking",
    ],
    challenges: [
      {
        title: "Battery drain from constant location streaming",
        description:
          "Naive 1s GPS polling drained 18%/hour. I implemented adaptive intervals based on courier speed and distance to the customer, cutting battery usage to 6%/hour without visible tracking loss.",
      },
      {
        title: "Map re-renders killing frame rates",
        description:
          "Re-rendering 40+ courier markers caused jank on low-end Android. Memoizing markers and moving route polylines to an overlay layer restored a stable 60fps.",
      },
    ],
    startDate: "2023-08",
    endDate: "2024-01",
    duration: "5 months",
    featured: true,
  },
  {
    slug: "paywave-api",
    title: "PayWave API",
    shortDesc:
      "A payment gateway aggregator API unifying 6 Indonesian payment providers behind one clean REST interface.",
    longDesc:
      "PayWave API lets startups accept payments through a single integration instead of six. It wraps BCA, Mandiri, Permata, GoPay, OVO, and QRIS behind a consistent REST + webhook interface, with idempotency keys, automatic retries, circuit breakers per provider, and a reconciliation engine that matches settlements daily.",
    thumbnail: "/images/projects/paywave.png",
    images: ["/images/projects/paywave-detail.png"],
    techStack: ["Node.js", "Express", "PostgreSQL", "Redis", "Docker", "Jest"],
    category: "api",
    status: "live",
    githubUrl: "https://github.com/neuralforgeio/paywave-api",
    features: [
      "Unified REST API across 6 payment providers",
      "Idempotent charge endpoints safe for client retries",
      "Signed webhooks with automatic replay & DLQ",
      "Per-provider circuit breakers with health dashboard",
      "Daily settlement reconciliation with discrepancy alerts",
      "95% test coverage including provider sandbox simulation",
    ],
    challenges: [
      {
        title: "Inconsistent provider callbacks",
        description:
          "Each provider fires webhooks differently — some twice, some never. I built a normalizer layer plus an active poller fallback, achieving 99.98% payment status accuracy.",
      },
      {
        title: "Double-charging on network retries",
        description:
          "Timeout + retry duplicated charges. Idempotency keys stored in Redis with a 24h TTL made every retry safe, and the reconciliation engine catches provider-side anomalies.",
      },
    ],
    startDate: "2023-02",
    endDate: "2023-07",
    duration: "6 months",
    featured: true,
  },
  {
    slug: "devcollab",
    title: "DevCollab",
    shortDesc:
      "Real-time collaborative code editor with CRDT sync, shared terminals, and syntax-aware multiplayer cursors.",
    longDesc:
      "DevCollab is a pair-programming playground in the browser. Multiple developers edit the same files with conflict-free replication (Yjs CRDTs), see each other's cursors and selections in real time, run code in sandboxed containers, and chat over WebRTC. It's the tool our team now uses daily for interviews and mentoring.",
    thumbnail: "/images/projects/devcollab.png",
    images: [],
    techStack: ["Next.js", "Yjs", "WebSocket", "Docker", "Monaco", "Redis"],
    category: "web",
    status: "in-progress",
    githubUrl: "https://github.com/neuralforgeio/devcollab",
    features: [
      "CRDT-based conflict-free collaborative editing",
      "Live multiplayer cursors with name labels",
      "Sandboxed code execution in isolated containers",
      "Shared terminal sessions with permission control",
      "Persistent rooms with document history playback",
    ],
    challenges: [
      {
        title: "CRDT memory bloat in long sessions",
        description:
          "Documents grew unbounded during 3h+ sessions. Periodic snapshotting plus tombstone GC shrank memory footprint by 70% while keeping merge history intact.",
      },
    ],
    startDate: "2024-07",
    endDate: undefined,
    duration: "Ongoing",
    featured: false,
  },
  {
    slug: "snipvault",
    title: "SnipVault",
    shortDesc:
      "An open-source snippet manager with fuzzy search, syntax highlighting for 40+ languages, and team sharing.",
    longDesc:
      "SnipVault is an open-source developer tool to store, search, and share code snippets. It ships as both a web app and a CLI, syncs through a self-hostable server, and indexes snippets for instant fuzzy search. 800+ GitHub stars and 20+ community contributors.",
    thumbnail: "/images/projects/snipvault.png",
    images: [],
    techStack: ["Next.js", "TypeScript", "SQLite", "Prisma", "Cmdk"],
    category: "opensource",
    status: "live",
    githubUrl: "https://github.com/neuralforgeio/snipvault",
    features: [
      "Instant fuzzy search across thousands of snippets",
      "Syntax highlighting for 40+ languages via Shiki",
      "CLI + web app with end-to-end sync",
      "Team workspaces with role-based sharing",
      "Self-hostable with a single Docker command",
    ],
    challenges: [
      {
        title: "Search latency with large libraries",
        description:
          "Naive substring search lagged past 2k snippets. Building a pre-scored index cut p95 search latency from 480ms to 12ms.",
      },
    ],
    startDate: "2023-05",
    endDate: "2023-08",
    duration: "3 months",
    featured: false,
  },
  {
    slug: "taskflow",
    title: "TaskFlow",
    shortDesc:
      "A kanban-style project management tool with drag-and-drop, burndown analytics, and Slack integration.",
    longDesc:
      "TaskFlow was my first serious SaaS attempt — a Trello-style project manager with a custom drag-and-drop engine, sprint burndown charts, WIP limits, and two-way Slack sync. It reached 1,200 users before I sunset it to focus on client work, and taught me more about product trade-offs than any course ever could.",
    thumbnail: "/images/projects/taskflow.png",
    images: [],
    techStack: ["React", "Redux", "Node.js", "MongoDB", "D3.js"],
    category: "web",
    status: "archived",
    githubUrl: "https://github.com/neuralforgeio/taskflow",
    features: [
      "Custom drag-and-drop engine with keyboard support",
      "Sprint burndown & velocity analytics with D3",
      "Two-way Slack integration for board updates",
      "WIP limits with per-column policies",
    ],
    challenges: [
      {
        title: "Drag-and-drop accessibility",
        description:
          "Pointer-only DnD excluded keyboard users. I designed a full keyboard interaction model (space to lift, arrows to move, enter to drop) that later passed an accessibility audit with zero critical issues.",
      },
    ],
    startDate: "2022-01",
    endDate: "2022-06",
    duration: "6 months",
    featured: false,
  },
];

export const featuredProjects = projects.filter((p) => p.featured);

export const getProjectBySlug = (slug: string) =>
  projects.find((p) => p.slug === slug);

export const getAdjacentProjects = (slug: string) => {
  const index = projects.findIndex((p) => p.slug === slug);
  const prev = index > 0 ? projects[index - 1] : null;
  const next = index < projects.length - 1 ? projects[index + 1] : null;
  return { prev, next };
};

/**
 * Projects most similar to the given one — scored by shared
 * category (+3) and overlapping tech stack (+1 per shared tech).
 */
export const getRelatedProjects = (slug: string, count = 2): Project[] => {
  const current = getProjectBySlug(slug);
  if (!current) return [];
  return projects
    .filter((p) => p.slug !== slug)
    .map((p) => ({
      project: p,
      score:
        (p.category === current.category ? 3 : 0) +
        p.techStack.filter((tech) => current.techStack.includes(tech)).length,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(({ project }) => project);
};
