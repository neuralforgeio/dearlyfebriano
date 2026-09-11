"use client";

import { ArrowRight } from "lucide-react";
import type { JSX } from "react";
import { Button } from "@/components/ui/button";
import FadeIn from "@/dearlyfebriano/components/animations/FadeIn";
import {
  StaggerContainer,
  StaggerItem,
} from "@/dearlyfebriano/components/animations/StaggerChildren";
import { SectionHeading } from "@/dearlyfebriano/components/ui/SectionHeading";
import { TechIcon } from "@/dearlyfebriano/components/ui/TechIcon";
import { profile } from "@/dearlyfebriano/data/profile";
import { useLanguage } from "@/dearlyfebriano/i18n/language-context";
import { useUIStore } from "@/dearlyfebriano/store/ui-store";

/* ============================================================
 * AboutPreview — short bio + pseudo-code "currently" card +
 * hoverable tech icon strip.
 * ============================================================ */

const TECH_STRIP = [
  "React",
  "Next.js",
  "TypeScript",
  "Tailwind CSS",
  "Node.js",
  "PostgreSQL",
  "Prisma",
  "Docker",
  "GraphQL",
  "Git",
];

export default function AboutPreview(): JSX.Element {
  const navigate = useUIStore((state) => state.navigate);
  const { t } = useLanguage();

  return (
    <section id="about-preview" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow={t("About Me")}
          title={t("Crafting code with purpose")}
          description={t(profile.bioShort)}
        />

        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <FadeIn className="flex flex-col items-start gap-5">
            <p className="line-clamp-4 leading-relaxed text-muted-foreground">{t(profile.bio[0])}</p>
            <p className="line-clamp-4 leading-relaxed text-muted-foreground">{t(profile.bio[1])}</p>
            <Button
              variant="link"
              onClick={() => navigate("about")}
              className="group h-auto self-start p-0 text-sm"
            >
              {t("Learn more about me")}
              <ArrowRight
                aria-hidden
                className="size-4 transition-transform duration-300"
              />
            </Button>
          </FadeIn>

          <FadeIn delay={0.15} x={16} y={0}>
            <div className="card-surface rounded-lg p-6 font-mono text-sm leading-7">
              <p className="text-muted-foreground">{"// currently"}</p>
              <p className="text-muted-foreground">{"{"}</p>
              <p className="pl-4">
                <span className="text-foreground">"role"</span>
                <span className="text-muted-foreground">{": "}</span>
                <span className="text-primary">"{t(profile.roles[0])}"</span>
                <span className="text-muted-foreground">,</span>
              </p>
              <p className="pl-4">
                <span className="text-foreground">"focus"</span>
                <span className="text-muted-foreground">{": ["}</span>
                <span className="text-primary">"SaaS analytics"</span>
                <span className="text-muted-foreground">{", "}</span>
                <span className="text-primary">"DX tooling"</span>
                <span className="text-muted-foreground">{"]"}</span>
                <span className="text-muted-foreground">,</span>
              </p>
              <p className="pl-4">
                <span className="text-foreground">"status"</span>
                <span className="text-muted-foreground">{": "}</span>
                <span className="text-primary">"{t(profile.availability)}"</span>
              </p>
              <p className="text-muted-foreground">{"}"}</p>
            </div>
          </FadeIn>
        </div>

        <StaggerContainer className="mt-14 flex flex-wrap gap-3" stagger={0.04}>
          {TECH_STRIP.map((name) => (
            <StaggerItem
              key={name}
              className="grid size-12 place-items-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:border-foreground/25 hover:text-foreground"
            >
              <TechIcon name={name} className="size-6" />
              <span className="sr-only">{name}</span>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
