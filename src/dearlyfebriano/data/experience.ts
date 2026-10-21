import type { ExperienceItem } from "@/dearlyfebriano/types";

/* ============================================================
 * EXPERIENCE DATA — diambil dari CV asli
 * "CV DEARLY FEBRIANO IRWANSYAH.pdf" (Work Experience: CV Builder
 * (Instant Resume), Software Engineer (Freelance), 2023).
 * ============================================================ */

export const experiences: ExperienceItem[] = [
  {
    id: "cv-builder-freelance",
    role: "Software Engineer (Freelance)",
    company: "CV Builder Instant Resume",
    companyInitials: "IR",
    location: "Surabaya, Indonesia",
    locationType: "Remote",
    period: { start: "2023", end: "2023", current: false },
    summary:
      "Freelance engagement: built a platform that makes it easier for others to create a CV — speeding up CV creation without manual styling.",
    responsibilities: [
      "Built a platform that lets anyone generate a polished CV without wrestling with manual styling",
      "Automated layout, typography, and formatting so a complete resume comes together in minutes",
      "Owned the full cycle solo: requirements, design, build, and delivery",
    ],
    tech: ["JavaScript", "React", "Node.js", "PDF Generation"],
  },
];
