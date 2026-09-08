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
import ServicesSection from "@/dearlyfebriano/components/sections/ServiceSection";
import TechStackExplorer from "./TechStackExplorer";
import ResumePreview from "./ResumePreview";

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
        {/* PERF: setiap section bawah-fold dibungkus cv-auto —
            browser skip layout/paint saat section di luar viewport
            (halaman home panjang; render & scroll jauh lebih ringan). */}
        <div className="cv-auto">
          <StatsCounter />
        </div>
        <div className="cv-auto">
          <AboutPreview />
        </div>
        <Divider />
        <div className="cv-auto">
          <ProjectsPreview />
        </div>
        <Divider />
        <div className="cv-auto">
          <ServicesSection />
        </div>
        <Divider />
        <div className="cv-auto">
          <TechStackExplorer />
        </div>
        <Divider />
        <div className="cv-auto">
          <ResumePreview />
        </div>
        <Divider />
        <div className="cv-auto">
          <NotesPreview />
        </div>
        <Divider />
        <div className="cv-auto">
          <SkillsSection />
        </div>
        <Divider />
        <div className="cv-auto">
          <TestimonialsSection />
        </div>
        <div className="cv-auto">
          <CTASection />
        </div>
      </div>
    </div>
  );
}
