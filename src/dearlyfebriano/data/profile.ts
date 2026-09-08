import { Coffee, Gamepad2, BookOpen, Plane, Music4, Camera } from "lucide-react";
import type { Education, FunFact } from "@/dearlyfebriano/types";
import { projects } from "./projects";

/* ============================================================
 * CENTRAL PROFILE DATA
 * ------------------------------------------------------------
 * GANTI SEMUA DATA DI BAWAH INI DENGAN DATA ASLI ANDA.
 * Semua informasi personal (nama, email, nomor WA, lokasi, dll)
 * terpusat di file ini agar mudah diedit.
 * ============================================================ */

export const profile = {
  name: "Dearly",
  fullName: "Dearly Febriano Irwansyah",
  initials: "DF",
  roles: ["Full Stack Developer", "Problem Solver", "AI Agent Developer"],
  tagline:
    "Programmer and problem solver — I build fast web apps, scalable backends, and offline-first AI agents that turn complex problems into clean, working software.",
  bioShort:
    "Fullstack developer and AI agent builder from Surabaya. I research global tech advancements in-depth, ship trending projects, and love taking ideas from database schema to the final pixel.",
  bio: [
    "I'm Dearly Febriano Irwansyah, a programmer with a keen interest in technology. I frequently conduct in-depth research into global technological advancements — and as the times evolve, I work on trending projects and keep learning new things, constantly broadening and sharpening my skill set.",
    "As a full-stack developer and problem solver, I build products end-to-end: from Instant Resume — a platform that speeds up CV creation without manual styling — to OpenForge, a local AI agent system that helps users complete tasks, search for information offline, build software, automate workflows, and manage device security with an offline-first approach.",
    "These days I focus on web engineering, backend & scalable systems, and AI agent development: designing agents that prioritize privacy, performance, and full control over user data. Always learning, always shipping.",
  ],
  email: "dearlyfebrianoi@gmail.com",
  phone: "+62 838-5443-6555",
  whatsappNumber: "6283854436555",
  location: "Mulyorejo Tengah, Surabaya, Jawa Timur, Indonesia",
  locationShort: "Surabaya, Indonesia",
  availability: "Available for Freelance",
  avatar: "/images/profile/avatar.jpg",
  resumeUrl: "/resume.pdf", // CV asli: "CV DEARLY FEBRIANO IRWANSYAH.pdf"
  siteUrl: "https://dearlyfebriano.vercel.app",
};

export const stats = {
  projects: projects.length,
  certificates: 5,
  years: 3,
  clients: 5,
};

export const funFacts: FunFact[] = [
  {
    icon: Coffee,
    label: "Coffee Lover",
    description: "5 cups a day keeps the bugs away.",
  },
  {
    icon: Gamepad2,
    label: "Casual Gamer",
    description: "Valorant & Zelda on weekends.",
  },
  {
    icon: BookOpen,
    label: "Avid Reader",
    description: "Tech blogs & sci-fi novels.",
  },
  {
    icon: Plane,
    label: "Travel Enthusiast",
    description: "12 cities and counting.",
  },
  {
    icon: Music4,
    label: "Lo-fi Listener",
    description: "Coding with chill beats.",
  },
  {
    icon: Camera,
    label: "Amateur Photographer",
    description: "Street & landscape shots.",
  },
];

export const education: Education[] = [
  {
    degree: "Senior High School",
    school: "Dr. Soetomo Senior High School, Surabaya",
    period: "2023 — 2026",
    description:
      "Recent graduate with a keen interest in technology. Spent the school years doing in-depth research into global tech advancements, freelancing as a software engineer, and building AI agent projects on the side.",
  },
];
