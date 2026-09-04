"use client";

import type { JSX } from "react";
import AboutPreview from "@/dearlyfebriano/components/sections/AboutPreview";
import CTASection from "@/dearlyfebriano/components/sections/CTASection";
import HeroSection from "@/dearlyfebriano/components/sections/HeroSection";
import NotesPreview from "@/dearlyfebriano/components/sections/NotesPreview";
import ProjectsPreview from "@/dearlyfebriano/components/sections/ProjectsPreview";
import SkillsSection from "@/dearlyfebriano/components/sections/SkillsSection";
import StatsCounter from "@/dearlyfebriano/components/sections/StatsCounter";
import TechTicker from "@/dearlyfebriano/components/sections/TechTicker";
import TestimonialsSection from "@/dearlyfebriano/components/sections/TestimonialsSection";

/* ============================================================
 * HomeView — assembles all home sections. Each section
 * component owns its <section id="..."> root.
 * A very subtle grid layer sits behind the stats → CTA region.
 * ============================================================ */

/** Pemisah dekoratif antar section (garis gradient + diamond). */
function Divider(): JSX.Element {
  return (
    <div className="section-divider" aria-hidden="true">
      <span />
      <span />
    </div>
  );
}

export default function HomeView(): JSX.Element {
  return (
    <div className="relative">
      <HeroSection />
      <TechTicker />

      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-30 [mask-image:linear-gradient(to_bottom,transparent_0%,black_12%,black_88%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_12%,black_88%,transparent_100%)]"
        />
        <StatsCounter />
        <AboutPreview />
        <Divider />
        <ProjectsPreview />
        <Divider />
        <NotesPreview />
        <Divider />
        <SkillsSection />
        <Divider />
        <TestimonialsSection />
        <CTASection />
      </div>
    </div>
  );
}
