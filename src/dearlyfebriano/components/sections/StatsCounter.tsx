"use client";

import { Award, Briefcase, FolderGit2, Users } from "lucide-react";

import type { LucideIcon } from "lucide-react";

import { useEffect, useState, type JSX } from "react";

import CountUp from "@/dearlyfebriano/components/animations/CountUp";

import {
  StaggerContainer,
  StaggerItem,
} from "@/dearlyfebriano/components/animations/StaggerChildren";

import { projects } from "@/dearlyfebriano/data/projects";

import { stats } from "@/dearlyfebriano/data/profile";

import { useLanguage } from "@/dearlyfebriano/i18n/language-context";

/* ============================================================
 * StatsCounter
 *
 * Dynamic statistics:
 *
 * Projects
 *   -> projects.length
 *
 * Certificates
 *   -> /api/certificates
 *   -> certificates.length
 *
 * Years Experience
 *   -> profile.ts
 *
 * Happy Clients
 *   -> profile.ts
 *
 * ============================================================ */

interface StatItem {
  label: string;
  value: number;
  icon: LucideIcon;
}

/* ============================================================
 * Component
 * ============================================================ */

export default function StatsCounter(): JSX.Element {
  const { t } = useLanguage();

  /* ----------------------------------------------------------
   * Certificates fetched from the same API used by
   * CertificatesView.
   *
   * Start from the static profile value so the UI does not
   * briefly show zero before the Google Drive request finishes.
   * ---------------------------------------------------------- */

  const [certificateCount, setCertificateCount] = useState(stats.certificates);

  /* ==========================================================
   * Sync certificate count
   *
   * The eslint rule in the current project rejects synchronous
   * state updates directly inside effects. The actual state
   * update happens asynchronously after fetch completes, but
   * Next/React's rule can still flag this pattern.
   *
   * We intentionally suppress only this single effect line
   * rather than disabling the rule globally.
   * ========================================================== */

  useEffect(() => {
    let cancelled = false;

    const syncCertificateCount = async (): Promise<void> => {
      try {
        const response = await fetch("/api/certificates", {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as {
          certificates?: unknown[];
        };

        if (cancelled || !Array.isArray(data.certificates)) {
          return;
        }

        /*
         * Keep the count based on the exact same certificate
         * collection that CertificatesView receives.
         */

        setCertificateCount(data.certificates.length);
      } catch {
        /*
         * Keep the static profile value as a graceful
         * fallback when Google Drive/API is unavailable.
         */
      }
    };

    void syncCertificateCount();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ==========================================================
   * Dynamic statistics
   *
   * Projects is always derived directly from the source data.
   * No hardcoded number.
   * ========================================================== */

  const statItems: StatItem[] = [
    {
      label: "Projects",

      value: projects.length,

      icon: FolderGit2,
    },

    {
      label: "Certificates",

      value: certificateCount,

      icon: Award,
    },

    {
      label: "Years Experience",

      value: stats.years,

      icon: Briefcase,
    },

    {
      label: "Happy Clients",

      value: stats.clients,

      icon: Users,
    },
  ];

  /* ==========================================================
   * Render
   * ========================================================== */

  return (
    <section id="stats" className="border-y border-border/60 bg-card/30">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <StaggerContainer
          className="grid grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-border/40"
          stagger={0.1}
          delay={0.05}
        >
          {statItems.map((stat) => {
            const Icon = stat.icon;

            return (
              <StaggerItem
                key={stat.label}
                className="flex flex-col items-center gap-3 px-4 py-8 text-center sm:py-10"
              >
                {/* Icon */}

                <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Icon aria-hidden className="size-5" />
                </span>

                {/* Number */}

                <span className="font-mono text-3xl font-bold text-foreground sm:text-4xl">
                  <CountUp value={stat.value} />
                </span>

                {/* Label */}

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
