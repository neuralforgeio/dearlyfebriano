import { Coffee, Gamepad2, BookOpen, Plane, Music4, Camera } from "lucide-react";
import type { Education, FunFact } from "@/dearlyfebriano/types";

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
  roles: ["Full Stack Developer", "UI/UX Enthusiast", "Problem Solver"],
  tagline:
    "I design and build fast, accessible, and delightful web experiences — from database schema to the last pixel.",
  bioShort:
    "Full Stack Developer based in Surabaya who loves shipping products end-to-end. I turn complex problems into clean, maintainable code and interfaces people genuinely enjoy using.",
  bio: [
    "I'm Dearly Febriano Irwansyah, a Full Stack Developer with 3+ years of experience building web applications from scratch. My journey started with curiosity about how websites work, and it grew into a career crafting products used by thousands of people.",
    "On the frontend, I live in the React ecosystem — Next.js, TypeScript, and Tailwind CSS are my daily tools, and I obsess over animation details, accessibility, and performance budgets. On the backend, I design REST & GraphQL APIs, model databases, and keep things observable and reliable.",
    "When I'm not coding, I explore UI design trends, contribute to open source, mentor junior developers, and hunt for the perfect cup of coffee. I believe great software is built at the intersection of engineering discipline and empathy for the user.",
  ],
  email: "dearlyfebrianoi@gmail.com",
  phone: "+62 838-5443-6555",
  whatsappNumber: "6283854436555",
  location: "Mulyorejo Tengah, Surabaya, Jawa Timur, Indonesia",
  locationShort: "Surabaya, Indonesia",
  availability: "Available for Freelance",
  avatar: "/images/profile/avatar.jpg",
  resumeUrl: "/resume.pdf", // TODO: ganti dengan CV asli Anda (letakkan file di public/resume.pdf)
  siteUrl: "https://github.com/neuralforgeio/dearlyfebriano", // TODO: ganti dengan domain Anda setelah deploy
};

export const stats = {
  projects: 24,
  certificates: 5,
  years: 3,
  clients: 18,
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
    degree: "B.Sc. in Computer Science",
    school: "Universitas Indonesia",
    period: "2017 — 2021",
    description:
      "Focused on software engineering, databases, and distributed systems. Active member of the campus developer community and led two student tech events.",
  },
  {
    degree: "Full Stack Web Development Bootcamp",
    school: "Hacktiv8 Indonesia",
    period: "2020",
    description:
      "Intensive 12-week program covering JavaScript, React, Node.js, Express, and PostgreSQL. Built 4 group projects with agile workflows.",
  },
];
