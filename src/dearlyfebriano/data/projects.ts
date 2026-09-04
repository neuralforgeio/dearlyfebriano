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
    thumbnail: "/images/projects/openforge.png",
    images: [],
    techStack: ["TypeScript", "Node.js", "LLM Tooling", "AI Agents", "Automation", "Local-First"],
    category: "opensource",
    status: "in-progress",
    githubUrl: "https://github.com/neuralforgeio",
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
    thumbnail: "/images/projects/instant-resume.png",
    images: [],
    techStack: ["JavaScript", "React", "Node.js", "PDF Generation"],
    category: "web",
    status: "live",
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
    slug: "dearlyfebriano-portfolio",
    title: "This Portfolio",
    shortDesc:
      "My personal portfolio — a single-page app with EN/ID auto-translate, a guestbook, live-synced certificates, and a 60fps animation system.",
    longDesc:
      "The site you're reading is a project of its own: a fully responsive single-page application built with Next.js, TypeScript, and Tailwind CSS. It ships with automatic English/Indonesian translation across the whole UI, a guestbook with an admin-managed message store, certificates that live-sync from Google Drive, a command palette (Ctrl+K), and a performance-first animation system — canvas particles that pause off-screen, compositor-only transforms, and lazy-loaded views.",
    thumbnail: "/images/projects/portfolio.png",
    images: [],
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "Zustand"],
    category: "web",
    status: "live",
    liveUrl: "https://dearlyfebriano.vercel.app",
    githubUrl: "https://github.com/neuralforgeio/dearlyfebriano",
    features: [
      "Hash-routed SPA views with animated page transitions",
      "Automatic EN → ID translation (server-cached, client-cached, with English fallback)",
      "Guestbook + contact message inbox with owner-managed moderation",
      "Certificates synced live from a public Google Drive folder",
      "Command palette, Konami-code easter egg, custom cursor — all reduced-motion aware",
      "Performance-tuned: code-split views, GPU-friendly animations, off-screen canvas pausing",
    ],
    challenges: [
      {
        title: "Smooth 60fps on low-end laptops",
        description:
          "Heavy visual effects (backdrop blur, animated blurs, canvas particles) can choke integrated GPUs. I replaced filter-based glows with radial gradients, removed backdrop-blur from moving elements, and pause the particle canvas when it scrolls out of view — the look stays, the jank goes.",
      },
    ],
    startDate: "2025-11",
    endDate: undefined,
    duration: "Ongoing",
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
