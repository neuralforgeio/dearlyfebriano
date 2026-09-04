import type { Testimonial } from "@/dearlyfebriano/types";

/* ============================================================
 * TESTIMONIALS DATA — masih placeholder ringan (nama generik),
 * tapi konteksnya kini selaras dengan pengalaman nyata di CV
 * (Instant Resume, OpenForge, freelance). Ganti dengan testimonial
 * asli dari klien/kolaborator Anda begitu ada.
 * ============================================================ */

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    quote:
      "I needed a CV the same evening — with Instant Resume I filled in my details, and a polished, professional document came out in minutes. No fighting with fonts or margins.",
    name: "Rania S.",
    role: "Job Seeker",
    company: "Instant Resume user",
    initials: "RS",
  },
  {
    id: "t2",
    quote:
      "Dearly delivered our freelance project end-to-end: requirements, build, deployment. Clear communication, on-time delivery, and the code was easy for our team to take over.",
    name: "Bagus P.",
    role: "Small Business Owner",
    company: "Freelance client",
    initials: "BP",
  },
  {
    id: "t3",
    quote:
      "Watching OpenForge complete tasks fully offline sold me. No data leaves the machine, the automations just work — it feels like having a private assistant that actually respects your privacy.",
    name: "Kevin A.",
    role: "Early User",
    company: "OpenForge beta",
    initials: "KA",
  },
  {
    id: "t4",
    quote:
      "What stands out is how fast he learns. Hand him a trending stack he hasn't touched and a week later he's shipping production-quality code with it.",
    name: "Dimas A.",
    role: "Collaborator",
    company: "Side project team",
    initials: "DA",
  },
];
