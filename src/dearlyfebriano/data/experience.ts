import type { ExperienceItem } from "@/dearlyfebriano/types";

/* ============================================================
 * EXPERIENCE DATA — ganti dengan pengalaman kerja asli Anda.
 * ============================================================ */

export const experiences: ExperienceItem[] = [
  {
    id: "technova-senior",
    role: "Senior Full Stack Developer",
    company: "TechNova Solutions",
    companyInitials: "TN",
    location: "Surabaya, Indonesia",
    locationType: "Remote",
    period: { start: "Jan 2023", end: null, current: true },
    summary:
      "Leading a 5-person squad building a multi-tenant SaaS analytics platform used by 200+ B2B clients across Southeast Asia.",
    responsibilities: [
      "Architected the migration from a monolith to Next.js App Router + modular services, cutting p95 page load from 4.2s to 1.1s",
      "Designed the public REST API consumed by 40+ integration partners, with OpenAPI docs and sandbox keys",
      "Introduced end-to-end typesafety (tRPC → REST codegen) and raised test coverage from 34% to 81%",
      "Mentored 3 junior developers through structured code reviews and pairing sessions",
    ],
    tech: ["Next.js", "TypeScript", "PostgreSQL", "Prisma", "AWS", "Docker"],
  },
  {
    id: "digitalkreasi-fullstack",
    role: "Full Stack Developer",
    company: "PT Digital Kreasi Indonesia",
    companyInitials: "DK",
    location: "Surabaya, Indonesia",
    locationType: "Hybrid",
    period: { start: "Jun 2021", end: "Dec 2022", current: false },
    summary:
      "Built and shipped 12 client projects — company profiles, e-commerce, and internal tools — for retail and fintech clients.",
    responsibilities: [
      "Delivered an e-commerce revamp that grew client conversion rate by 31% in the first quarter after launch",
      "Built a multi-vendor order management system processing 5k+ orders daily",
      "Standardized the team's starter kit (Next.js + Prisma + CI), reducing project setup from days to hours",
      "Owned the performance budget: every release shipped with Lighthouse 90+ on key pages",
    ],
    tech: ["React", "Node.js", "Express", "MongoDB", "Redis", "Tailwind CSS"],
  },
  {
    id: "startuplab-intern",
    role: "Frontend Developer Intern",
    company: "StartupLab Accelerator",
    companyInitials: "SL",
    location: "Surabaya, Indonesia",
    locationType: "Onsite",
    period: { start: "Jan 2021", end: "Jun 2021", current: false },
    summary:
      "Joined the incubator's product team to prototype MVPs for early-stage startups during a 6-month program.",
    responsibilities: [
      "Shipped 4 MVP prototypes in 16 weeks, two of which successfully raised seed funding",
      "Built reusable component libraries in React with Storybook documentation",
      "Collaborated daily with founders to translate napkin sketches into clickable products",
    ],
    tech: ["React", "JavaScript", "Tailwind CSS", "Storybook"],
  },
  {
    id: "freelance-dev",
    role: "Freelance Web Developer",
    company: "Self-employed",
    companyInitials: "SE",
    location: "Remote",
    locationType: "Remote",
    period: { start: "2020", end: "2021", current: false },
    summary:
      "Started freelancing while in university — landing pages, school systems, and small business tools.",
    responsibilities: [
      "Delivered 20+ projects with 100% on-time completion and recurring retainers from 6 clients",
      "Learned the full cycle solo: requirements, design, build, deploy, invoice",
    ],
    tech: ["JavaScript", "PHP", "MySQL", "jQuery"],
  },
];
