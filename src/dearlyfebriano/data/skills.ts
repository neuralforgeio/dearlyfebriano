import type { SkillGroup } from "@/dearlyfebriano/types";

/* ============================================================
 * SKILLS DATA — level 0-100, ganti sesuai kemampuan asli Anda.
 * Icon tiap skill dirender otomatis oleh komponen TechIcon
 * berdasarkan nama (lihat components/ui/TechIcon.tsx).
 * ============================================================ */

export const skillGroups: SkillGroup[] = [
  {
    id: "frontend",
    label: "Frontend",
    skills: [
      { name: "React", level: 95 },
      { name: "Next.js", level: 92 },
      { name: "TypeScript", level: 90 },
      { name: "Tailwind CSS", level: 93 },
      { name: "Framer Motion", level: 86 },
      { name: "Redux", level: 80 },
      { name: "React Native", level: 78 },
    ],
  },
  {
    id: "backend",
    label: "Backend",
    skills: [
      { name: "Node.js", level: 90 },
      { name: "Express", level: 88 },
      { name: "NestJS", level: 76 },
      { name: "GraphQL", level: 78 },
      { name: "REST API Design", level: 90 },
      { name: "WebSockets", level: 82 },
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
