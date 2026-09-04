"use client";

import type { JSX } from "react";
import { useReducedMotion } from "framer-motion";
import { TechIcon } from "@/dearlyfebriano/components/ui/TechIcon";
import { useLanguage } from "@/dearlyfebriano/i18n/language-context";

/* ============================================================
 * TechTicker — strip teknologi berjalan horizontal (marquee)
 * di antara Hero dan Stats. Duplikasi list x2 untuk loop mulus.
 * Pause saat hover. Reduced motion → strip statis scrollable.
 * ============================================================ */

const TECHS = [
  "React",
  "Next.js",
  "TypeScript",
  "Node.js",
  "Tailwind CSS",
  "PostgreSQL",
  "Prisma",
  "GraphQL",
  "Docker",
  "Redis",
  "Express",
  "NestJS",
  "MongoDB",
  "Vercel",
  "Framer Motion",
  "Git",
  "Figma",
  "AWS",
  "Stripe",
  "Zustand",
];

function TickerRow({ ariaHidden = false }: { ariaHidden?: boolean }) {
  return (
    <div
      aria-hidden={ariaHidden || undefined}
      className="flex w-max shrink-0 items-center gap-3 pr-3"
    >
      {TECHS.map((tech) => (
        <span
          key={tech}
          className="glass-flat flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <TechIcon name={tech} className="size-3.5 text-primary" />
          {tech}
        </span>
      ))}
    </div>
  );
}

export default function TechTicker(): JSX.Element {
  const reducedMotion = useReducedMotion();
  const { t } = useLanguage();

  if (reducedMotion) {
    return (
      <section
        aria-label={t("Technologies I work with")}
        className="relative overflow-x-auto border-y border-border/60 bg-card/30 py-4"
      >
        <div className="flex items-center gap-3 px-4">
          <TickerRow />
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label={t("Technologies I work with")}
      className="group relative overflow-hidden border-y border-border/60 bg-card/30 py-4"
    >
      {/* Edge fade masks */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent"
      />

      <div className="flex w-full animate-marquee group-hover:[animation-play-state:paused] motion-reduce:animate-none">
        <TickerRow />
        <TickerRow ariaHidden />
      </div>
    </section>
  );
}
