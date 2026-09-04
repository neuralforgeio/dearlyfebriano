"use client";

import Image from "next/image";
import { ArrowRight, ArrowUpRight, ExternalLink, Github } from "lucide-react";
import type { JSX, KeyboardEvent as ReactKeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import FadeIn from "@/dearlyfebriano/components/animations/FadeIn";
import GlowCard from "@/dearlyfebriano/components/animations/GlowCard";
import MagneticButton from "@/dearlyfebriano/components/animations/MagneticButton";
import {
  StaggerContainer,
  StaggerItem,
} from "@/dearlyfebriano/components/animations/StaggerChildren";
import { SectionHeading } from "@/dearlyfebriano/components/ui/SectionHeading";
import { StatusBadge } from "@/dearlyfebriano/components/ui/StatusBadge";
import { TechBadge } from "@/dearlyfebriano/components/ui/TechIcon";
import { featuredProjects } from "@/dearlyfebriano/data/projects";
import { useLanguage } from "@/dearlyfebriano/i18n/language-context";
import { useUIStore } from "@/dearlyfebriano/store/ui-store";
import type { Project } from "@/dearlyfebriano/types";

/* ============================================================
 * ProjectsPreview — 3 featured project cards + "view all" CTA.
 * Whole card opens the project detail view; live/code anchors
 * stop propagation.
 * ============================================================ */

const MAX_VISIBLE_TECH = 4;

interface ProjectCardProps {
  project: Project;
  onOpen: () => void;
}

function ProjectCard({ project, onOpen }: ProjectCardProps): JSX.Element {
  const { t } = useLanguage();
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen();
    }
  };

  const extraTech = project.techStack.length - MAX_VISIBLE_TECH;

  return (
    <StaggerItem className="h-full" y={30}>
      <GlowCard className="h-full cursor-pointer overflow-hidden rounded-2xl border border-border/70 bg-card/60 transition-all duration-300 hover:-translate-y-2 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10">
        <div
          role="link"
          tabIndex={0}
          aria-label={`${t("View")} ${project.title} ${t("details")}`}
          onClick={onOpen}
          onKeyDown={handleKeyDown}
          className="flex h-full flex-col outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/70"
        >
          <div className="relative aspect-video overflow-hidden">
            <Image
              src={project.thumbnail}
              alt={`${project.title} ${t("preview")}`}
              fill
              sizes="(min-width: 1024px) 368px, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent"
            />
            <StatusBadge status={project.status} className="absolute left-3 top-3" />
            <span className="glass absolute right-3 top-3 rounded-full px-2.5 py-0.5 font-mono text-[11px] capitalize text-muted-foreground">
              {project.category}
            </span>
          </div>

          <div className="flex flex-1 flex-col gap-3 p-5">
            <h3 className="text-lg font-semibold transition-colors group-hover:text-primary">
              {project.title}
            </h3>
            <p className="line-clamp-2 text-sm text-muted-foreground">{t(project.shortDesc)}</p>

            <div className="mt-auto flex flex-wrap items-center gap-2">
              {project.techStack.slice(0, MAX_VISIBLE_TECH).map((tech) => (
                <TechBadge key={tech} name={tech} />
              ))}
              {extraTech > 0 && (
                <span className="font-mono text-xs text-muted-foreground">+{extraTech} {t("more")}</span>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-border/60 pt-4">
              <div className="flex items-center gap-4">
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(event) => event.stopPropagation()}
                    aria-label={`${project.title} ${t("live demo")} (${t("opens in new tab")})`}
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
                  >
                    <ExternalLink aria-hidden className="size-3.5" />
                    {t("Live")}
                  </a>
                )}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(event) => event.stopPropagation()}
                    aria-label={`${project.title} ${t("source code")} (${t("opens in new tab")})`}
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
                  >
                    <Github aria-hidden className="size-3.5" />
                    {t("Code")}
                  </a>
                )}
              </div>
              <ArrowUpRight
                aria-hidden
                className="-translate-x-1 size-5 text-primary opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
              />
            </div>
          </div>
        </div>
      </GlowCard>
    </StaggerItem>
  );
}

export default function ProjectsPreview(): JSX.Element {
  const navigate = useUIStore((state) => state.navigate);
  const { t } = useLanguage();

  return (
    <section id="featured-projects" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow={t("Portfolio")}
          title={t("Featured Projects")}
          description={t("A selection of work I'm proud of — from e-commerce platforms to developer tooling.")}
        />

        <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.12}>
          {featuredProjects.map((project) => (
            <ProjectCard
              key={project.slug}
              project={project}
              onOpen={() => navigate("project-detail", project.slug)}
            />
          ))}
        </StaggerContainer>

        <FadeIn delay={0.1} className="mt-12 flex justify-center">
          <MagneticButton>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("projects")}
              className="group"
            >
              {t("View All Projects")}
              <ArrowRight
                aria-hidden
                className="size-4 transition-transform duration-300 group-hover:translate-x-1"
              />
            </Button>
          </MagneticButton>
        </FadeIn>
      </div>
    </section>
  );
}
