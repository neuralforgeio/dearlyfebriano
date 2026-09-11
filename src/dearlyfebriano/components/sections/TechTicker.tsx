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
      className="flex w-max shrink-0 items-center gap-2 pr-2"
    >
      {TECHS.map((tech) => (
        <span
          key={tech}
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <TechIcon name={tech} className="size-3.5" />
          {tech}
          <span aria-hidden className="ml-2 opacity-40">·</span>
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
        className="relative overflow-x-auto border-y border-border py-4"
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
      className="group relative overflow-hidden border-y border-border py-4 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]"
    >
      <div className="flex w-full animate-marquee group-hover:[animation-play-state:paused] motion-reduce:animate-none">
        <TickerRow />
        <TickerRow ariaHidden />
      </div>
    </section>
  );
}
