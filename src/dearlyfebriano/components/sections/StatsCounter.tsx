"use client";

import { Award, Briefcase, FolderGit2, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { JSX } from "react";
import CountUp from "@/dearlyfebriano/components/animations/CountUp";
import {
  StaggerContainer,
  StaggerItem,
} from "@/dearlyfebriano/components/animations/StaggerChildren";
import { stats } from "@/dearlyfebriano/data/profile";
import { useLanguage } from "@/dearlyfebriano/i18n/language-context";

/* ============================================================
 * StatsCounter — compact band with animated counters.
 * ============================================================ */

interface StatItem {
  label: string;
  value: number;
  icon: LucideIcon;
}

const STAT_ITEMS: StatItem[] = [
  { label: "Projects", value: stats.projects, icon: FolderGit2 },
  { label: "Certificates", value: stats.certificates, icon: Award },
  { label: "Years Experience", value: stats.years, icon: Briefcase },
  { label: "Happy Clients", value: stats.clients, icon: Users },
];

export default function StatsCounter(): JSX.Element {
  const { t } = useLanguage();
  return (
    <section id="stats" className="border-y border-border/60 bg-card/30">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <StaggerContainer
          className="grid grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-border/40"
          stagger={0.1}
          delay={0.05}
        >
          {STAT_ITEMS.map((stat) => {
            const Icon = stat.icon;
            return (
              <StaggerItem
                key={stat.label}
                className="flex flex-col items-center gap-3 px-4 py-8 text-center sm:py-10"
              >
                <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Icon aria-hidden className="size-5" />
                </span>
                <span className="font-mono text-3xl font-bold text-foreground sm:text-4xl">
                  <CountUp value={stat.value} suffix="+" />
                </span>
                <span className="text-xs uppercase tracking-widest text-muted-foreground">
                  {t(stat.label)}
                </span>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
