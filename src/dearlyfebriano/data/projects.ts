import type { Project } from "@/dearlyfebriano/types";

/* ============================================================
 * PROJECTS DATA — diambil dari CV asli
 * "CV DEARLY FEBRIANO IRWANSYAH.pdf":
 * - OpenForge (AI Agent) — AI Development, 2026
 * - CV Builder (Instant Resume) — freelance, 2023
 * Ditambah website portfolio ini sebagai project live.
 * Gambar thumbnail ada di /public/images/projects/
 * ============================================================ */

export const projects: Project[] = [
  {
    slug: "openforge",
    title: "OpenForge",
    shortDesc:
      "A local AI agent system that helps users complete tasks, search information offline, build software, and automate workflows — privacy-first.",
    longDesc:
      "OpenForge is a local AI agent system designed to help users complete various tasks, search for information offline, build software, automate workflows, manage systems, and enhance device security. With an offline-first approach, OpenForge prioritizes privacy, performance, and full control over user data — everything runs locally, nothing silently leaves the machine.",
    thumbnail: "/images/projects/openforgewebsite.png",
    images: [],
    techStack: [
      "TypeScript",
      "Node.js",
      "LLM Tooling",
      "AI Agents",
      "Automation",
      "Local-First",
    ],
    category: "opensource",
    status: "in-progress",
    liveUrl: "https://openforge-website.vercel.app/",
    githubUrl: "https://github.com/neuralforgeio/openforge",
    features: [
      "Task completion agent — understands a goal and executes it step by step",
      "Offline information search across local files and knowledge bases",
      "Software building assistance — scaffolds, writes, and refactors code",
      "Workflow automation for repetitive system tasks",
      "System management and device security enhancements",
      "Offline-first architecture: privacy, performance, and full control over user data",
    ],
    challenges: [
      {
        title: "Running capable AI fully offline",
        description:
          "Cloud LLMs contradict the privacy goal. I structured the agent around local models and offline knowledge retrieval, so core workflows — search, task execution, automation — keep working with zero network calls.",
      },
      {
        title: "Reliable autonomous task execution",
        description:
          "An agent that does the wrong thing quickly is worse than no agent. I built the execution loop with explicit step planning and verifiable checkpoints, so every automated action can be traced and trusted.",
      },
    ],
    startDate: "2026-01",
    endDate: undefined,
    duration: "Ongoing",
    featured: true,
  },
  {
    slug: "instant-resume",
    title: "Instant Resume",
    shortDesc:
      "CV Builder platform that makes it easy for anyone to create a professional CV — speeding up resume creation without manual styling.",
    longDesc:
      "Instant Resume is a CV builder platform built as a freelance software engineering engagement in 2023. It exists for one reason: creating a CV should take minutes, not an afternoon. Users fill in their details and the platform handles layout, typography, and formatting automatically — producing a polished, ready-to-send resume without touching a style setting.",
    thumbnail: "/images/projects/instantresume.png",
    images: [],
    techStack: ["JavaScript", "React", "Node.js", "PDF Generation"],
    category: "web",
    status: "live",
    liveUrl: "https://instantresume-builder.vercel.app/",
    githubUrl: "https://github.com/neuralforgeio",
    features: [
      "Guided CV creation flow — fill in content, never fight with styling",
      "Automatic layout and typography: consistent, professional output every time",
      "Instant PDF export, ready to send to recruiters",
      "Dramatically faster CV creation compared to manual document editing",
    ],
    challenges: [
      {
        title: "Pixel-consistent PDF output",
        description:
          "Rendering CVs to PDF reliably across browsers is deceptively hard. I isolated the rendering pipeline from the editor UI so what the user previews is exactly what lands in the exported file.",
      },
      {
        title: "Zero learning curve",
        description:
          "The target user has no design background. Every styling decision — margins, hierarchy, spacing — is encoded into templates instead of exposed as options, which is exactly what 'without manual styling' means in practice.",
      },
    ],
    startDate: "2023-01",
    endDate: "2023-12",
    duration: "Freelance, 2023",
    featured: true,
  },
  {
    slug: "akumajoki-store",
    title: "Akuma Joki",
    shortDesc:
      "A full-stack Roblox joki & storefront platform with a retro pixel-art interface, multi-item checkout, order tracking, customer loyalty, wishlist, reviews, smart search, and a GitHub-synced admin dashboard.",
    longDesc:
      "A full-stack Roblox joki and digital storefront platform built around a retro pixel-art aesthetic, designed to handle the complete customer journey from browsing game-specific services to checkout, order tracking, reviews, wishlist management, loyalty rewards, and post-order recovery. The storefront supports multiple game catalogs including Blox Fruits, Expedition Antarctica, and Retail Tycoon 2, with category-based products, pricing, requirements, difficulty levels, promotional tags, and contextual game notices. Customers can add up to five services into a single order, receive one shared Order ID, and continue the transaction through a WhatsApp-integrated checkout flow while the order is simultaneously recorded for administrative tracking. The platform also includes a dedicated order-tracking experience that groups every item belonging to the same Order ID and calculates an overall status across mixed, processing, completed, or cancelled items. On top of the storefront, the project ships with a large admin dashboard covering games, products, orders, reports, FAQ, announcements, settings, live chat, game analytics, developer tools, deployment controls, security/debug tooling, and maintenance mode. Content such as games, reviews, FAQs, announcements, about-page statistics, customer reports, and store settings can be synchronized through GitHub-backed JSON data so deployed instances stay aligned across environments. A smart-search API interprets natural-language-style queries such as cheapest or most expensive services, identifies relevant games, filters matching products, ranks the results, and returns a compact result set without requiring an external AI SDK. The client experience is further extended with persistent Zustand state for carts and selected orders, wishlist and recently-viewed data, loyalty points and tier progression, achievement badges, multilingual UI, responsive navigation, PWA installation handling, animated interactions, notification utilities, and a pixel-styled component system tailored specifically to the brand.",
    thumbnail: "/images/projects/akumajoki.png",
    images: [],
    techStack: [
      "Next.js",
      "TypeScript",
      "React",
      "Tailwind CSS",
      "Framer Motion",
      "Zustand",
      "Prisma",
      "SQLite",
      "Radix UI",
      "Lucide React",
      "GitHub API",
      "WhatsApp",
      "Vercel",
    ],
    category: "web",
    status: "live",
    liveUrl: undefined,
    githubUrl: "https://github.com/neuralforgeio/akuma-joki",
    features: [
      "Full Roblox storefront with multiple game catalogs, service categories, prices, requirements, difficulty levels, promotional tags, and game-specific notices.",
      "Multi-item cart and checkout supporting up to five services under one shared Order ID, with grouped order records and a WhatsApp handoff containing every selected item.",
      "Customer order tracking that aggregates all items belonging to the same Order ID, exposes individual item statuses, and derives an overall order state for mixed, processing, completed, or cancelled orders.",
      "Admin dashboard for managing games, products, orders, reports, announcements, FAQ, about content, settings, templates, live chat, analytics, and developer tooling.",
      "GitHub-backed content synchronization using admin-data.json as a deployed source of truth, allowing games, reviews, FAQs, announcements, settings, and reports to stay synchronized across deployments.",
      "Smart search API with intent parsing for queries such as cheapest or most expensive services, game detection, keyword matching, fallback matching, relevance filtering, and ranked results without an external AI SDK.",
      "Persistent customer experience powered by Zustand for cart state, selected orders, wishlist, recently viewed items, loyalty points, achievement badges, and other local-first interaction state.",
      "Loyalty and achievement system with Bronze through Diamond tiers, points earned from customer activity, and unlockable badges for milestones such as first order, repeat orders, reviews, wishlist usage, cart size, and loyalty progression.",
      "Review system migrated from localStorage to GitHub-synchronized admin data so customer reviews can persist beyond a single browser or device.",
      "Responsive retro pixel-art UI with animated interactions, theme support, language switching, toast notifications, skeleton loading states, back-to-top controls, network status, and reusable Radix-based interface primitives.",
      "Order recovery workflow with local order history, copyable Order IDs, success-state badges, and quick reorder functionality that can reconstruct previous multi-item orders.",
      "Maintenance/takedown mode that can redirect the complete application to a dedicated maintenance page through a single configuration switch.",
      "PWA-oriented experience with installation prompts, cache/service-worker recovery handling, and automated synchronization helpers designed for production deployments.",
    ],

    challenges: [
      {
        title: "Fixing production blank-page failures",
        description:
          "The application went through several production rendering failures caused by hydration and runtime behavior rather than the visual UI itself. A persisted Zustand/i18n hydration path could leave the application stuck in an incomplete state, while an old service worker could continue serving a cached blank page even after a successful deployment. The solution required removing skipHydration-based gating, simplifying the root layout metadata, splitting client-only synchronization and floating behavior out of the main layout, and adding self-healing cleanup for previously registered service workers and cached content.",
      },
      {
        title: "Grouping multi-item orders correctly",
        description:
          "Supporting multi-item checkout introduced a consistency problem across three separate surfaces: WhatsApp order messages, the customer tracking page, and the admin order manager. A shared Order ID could represent several services, so treating an order as a single item caused incomplete messages and incorrect progress states. The implementation was redesigned around grouped order collections, making every surface resolve all records sharing the same Order ID, calculate aggregate status, show per-item progress, and provide bulk or individual status controls in the admin dashboard.",
      },
      {
        title: "Building cross-device content synchronization",
        description:
          "The original review flow relied on browser-local state, which meant customer-generated content was isolated to one device. The system was reworked so reviews and other editable business data are stored in a synchronized admin-data.json representation and pushed through GitHub, with deployed instances consuming that synchronized source as the latest content layer while retaining sensible defaults as fallback data.",
      },
      {
        title: "Keeping admin and storefront data consistent",
        description:
          "The storefront contains editable business data such as game services, difficulty levels, promotional labels, contact information, FAQs, announcements, statistics, and reports. Maintaining separate hardcoded values risked the public site and dashboard drifting apart. The architecture therefore introduced synchronized data resolution: deployed data overrides defaults when valid, while the original definitions remain as a safe fallback, giving the application both editability and resilience.",
      },
      {
        title: "Replacing an external AI dependency with deterministic search",
        description:
          "The smart-search feature needed to understand useful customer phrases without adding a heavyweight AI runtime or SDK. Instead of making every search dependent on an LLM, the API parses intent locally, recognizes game aliases, extracts meaningful keywords, filters catalog data, falls back to broader text matching, applies price sorting when requested, and returns the best five results. This keeps the feature lightweight, predictable, and directly tied to the actual storefront catalog.",
      },
      {
        title: "Resolving routing conflicts in Next.js App Router",
        description:
          "A default page generated by the development environment was unintentionally taking precedence over the intended homepage route, causing the deployed site to display the wrong content. The conflicting root page and associated default assets were removed so the grouped main route could correctly own the / route and render the actual Akuma Joki application.",
      },
    ],

    startDate: "2026-07",
    endDate: undefined,
    duration: "Ongoing",
    featured: true,
  },
  {
    slug: "tromino-digital",
    title: "Tromino Digital",
    shortDesc:
      "A 29-component React design system with hand-rolled interaction primitives — zero UI dependencies — plus its own living docs site with live playgrounds.",
    longDesc:
      "A design system I built from scratch: 29 components in three tiers (core, overlay, showcase) sitting on hand-rolled interaction primitives — focus trap, roving tabindex, typeahead, fuzzy scoring, anchored positioning, dismissable layer, scroll lock — with zero runtime UI dependencies (no Radix, no HeadlessUI, no MUI, no cmdk) and 528 behavior-first tests (RTL + user-event + axe) enforcing the WAI-ARIA APG patterns. It ships with its own docs site: a single-route, hash-navigated Next.js app where every component gets a live playground with deep-linkable props and a device-width preview (pin to 390/768px), a three-tier token reference with a live export API (CSS, flat JSON, W3C Design Tokens format — parsed from the real stylesheet at runtime), a bundle-size dashboard, accessibility contract, changelog and roadmap.",
    thumbnail: "/images/projects/trominodigital.png",
    images: [],
    techStack: [
      "Next.js",
      "TypeScript",
      "React",
      "Tailwind CSS",
      "Vitest",
      "Storybook",
      "Prisma",
      "Bun",
    ],
    category: "web",
    status: "live",
    liveUrl: "https://tromino-digital.vercel.app",
    githubUrl: "https://github.com/neuralforgeio/tromino-digital",
    features: [
      "29 components in three tiers, every one implementing its WAI-ARIA APG pattern with a keyboard table in the docs",
      "Hand-rolled interaction primitives: focus trap, roving tabindex, typeahead, fuzzy scoring, anchored positioning, dismissable layer, scroll lock",
      "Zero runtime UI dependencies — the command palette even runs its own in-repo fuzzy scorer",
      "528 behavior-first tests (RTL + user-event + axe) with a ≤3kB gzip budget per component",
      "Live playgrounds with props encoded in the URL hash, plus a device-width preview mode that deep-links (d=phone)",
      "Token system in three tiers with a live export API — CSS, flat JSON, and W3C Design Tokens format",
      "Three-shape responsive shell: desktop sidebar → tablet icon rail → phone drawer, audited 19 routes × 4 widths to zero horizontal overflow",
      "Dark mode as a pure token swap (never invert) and every motion path honors prefers-reduced-motion",
    ],
    challenges: [
      {
        title: "Fitting the docs header into 320px",
        description:
          "A scripted sweep across 19 routes at phone widths revealed the header overflowed every single page below 350px — full wordmark, segmented theme control, and two 44px buttons simply cannot fit 320px. I rebuilt the phone header with a compact wordmark and a single theme-cycle button (the tri-state control stays one drawer-tap away), then re-measured until the overflow count hit exactly zero.",
      },
      {
        title: "One icon axis across two sidebar shapes",
        description:
          "When the sidebar collapses to a tablet icon rail, every button must share one visual center line. The search trigger broke that contract — a fixed square button hugging the left padding put its icon at 28px while everything else sat at the 37.5px axis. I rebuilt it as a dual-form component (centered square icon when collapsed, full pill when expanded) and verified with in-browser geometry measurement: all icon centers now report a single axis.",
      },
      {
        title: "A library bug hiding behind a weak test",
        description:
          "The bare Drawer.Close button had rendered in the wrong position since v1.0.0 — a cn() argument-order slip let the variant base's 'relative' win twMerge's last-wins conflict against 'absolute'. The test suite never caught it because toContain('absolute') happily passes on 'before:absolute'. I fixed the merge order in the library, removed the consumer workaround, and documented the assertion hole so future tests assert geometry, not substrings.",
      },
    ],
    startDate: "2026-09",
    endDate: undefined,
    duration: "Ongoing",
    featured: true,
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
