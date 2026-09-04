import type { SkillGroup } from "@/dearlyfebriano/types";

/* ============================================================
 * SKILLS DATA — level 0-100, ganti sesuai kemampuan asli Anda.
 * Icon tiap skill dirender otomatis oleh komponen TechIcon
 * berdasarkan nama (lihat components/ui/TechIcon.tsx).
 * ============================================================ */

export const skillGroups: SkillGroup[] = [
  {
    id: "ai-agents",
    label: "AI & Agents",
    skills: [
      { name: "AI Agent Development", level: 88 },
      { name: "LLM Tooling", level: 85 },
      { name: "Prompt Engineering", level: 86 },
      { name: "Local LLMs", level: 82 },
      { name: "Workflow Automation", level: 84 },
    ],
  },
  {
    id: "frontend",
    label: "Frontend",
    skills: [
      { name: "React", level: 90 },
      { name: "Next.js", level: 90 },
      { name: "TypeScript", level: 88 },
      { name: "Tailwind CSS", level: 90 },
      { name: "Framer Motion", level: 84 },
      { name: "Redux", level: 78 },
      { name: "React Native", level: 72 },
    ],
  },
  {
    id: "backend",
    label: "Backend",
    skills: [
      { name: "Node.js", level: 88 },
      { name: "Express", level: 86 },
      { name: "NestJS", level: 74 },
      { name: "GraphQL", level: 76 },
      { name: "REST API Design", level: 88 },
      { name: "WebSockets", level: 80 },
    ],
  },
  {
    id: "database",
    label: "Database",
    skills: [
      { name: "PostgreSQL", level: 85 },
      { name: "Prisma", level: 88 },
      { name: "MongoDB", level: 78 },
      { name: "Redis", level: 72 },
      { name: "MySQL", level: 80 },
    ],
  },
  {
    id: "devops",
    label: "DevOps",
    skills: [
      { name: "Docker", level: 75 },
      { name: "Vercel", level: 92 },
      { name: "CI/CD", level: 72 },
      { name: "Nginx", level: 65 },
      { name: "AWS", level: 62 },
    ],
  },
  {
    id: "tools",
    label: "Tools",
    skills: [
      { name: "Git", level: 93 },
      { name: "Figma", level: 82 },
      { name: "Postman", level: 88 },
      { name: "Linux", level: 75 },
      { name: "Jest", level: 78 },
    ],
  },
];
