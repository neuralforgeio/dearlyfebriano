"use client";

import Image from "next/image";

import {
  useState,
  type JSX,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

import {
  ArrowRight,
  ArrowUpRight,
  ExternalLink,
  Github,
  ImageOff,
  LoaderCircle,
} from "lucide-react";

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
 * ProjectsPreview
 *
 * Featured project cards for homepage.
 *
 * Preview priority:
 *
 * 1. liveUrl
 *    -> automatic screenshot via /api/project-preview
 *
 * 2. thumbnail
 *    -> manual fallback
 *
 * 3. placeholder
 *    -> no preview available
 *
 * Loading:
 * - Circular loading indicator while image loads
 * - Automatically disappears after successful load
 * - Screenshot failure falls back to thumbnail
 * ============================================================ */

const MAX_VISIBLE_TECH = 4;

/* ============================================================
 * Project Preview
 * ============================================================ */

interface ProjectPreviewProps {
  project: Project;
}

function ProjectPreview({
  project,
}: ProjectPreviewProps): JSX.Element {
  const [isLoading, setIsLoading] =
    useState(true);

  const [
    screenshotFailed,
    setScreenshotFailed,
  ] = useState(false);

  const [
    thumbnailFailed,
    setThumbnailFailed,
  ] = useState(false);

  /* ----------------------------------------------------------
   * Automatic screenshot URL
   * ---------------------------------------------------------- */

  const automaticPreviewUrl = project.liveUrl
    ? `/api/project-preview?url=${encodeURIComponent(
        project.liveUrl
      )}`
    : undefined;

  /* ----------------------------------------------------------
   * Determine preview source
   * ---------------------------------------------------------- */

  const shouldUseScreenshot =
    Boolean(
      automaticPreviewUrl &&
        !screenshotFailed
    );

  const shouldUseThumbnail =
    Boolean(
      !shouldUseScreenshot &&
        project.thumbnail &&
        !thumbnailFailed
    );

  const hasNoPreview =
    !shouldUseScreenshot &&
    !shouldUseThumbnail;

  /* ==========================================================
   * AUTOMATIC SCREENSHOT
   * ========================================================== */

  if (shouldUseScreenshot) {
    return (
      <div className="relative aspect-video overflow-hidden bg-muted">
        {/* Loading */}

        {isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/70 backdrop-blur-[2px]">
            <div className="relative flex items-center justify-center">
              <div className="absolute size-16 animate-ping rounded-full bg-primary/10" />

              <LoaderCircle
                aria-hidden
                className="relative size-10 animate-spin text-primary"
                strokeWidth={1.5}
              />

              <span className="absolute size-2 rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary)/0.9)]" />
            </div>
          </div>
        )}

        {/* Screenshot */}

        <Image
          src={automaticPreviewUrl}
          alt={`${project.title} preview`}
          fill
          sizes="(min-width: 1024px) 368px, (min-width: 640px) 50vw, 100vw"
          className={[
            "object-cover transition-opacity duration-500",
            isLoading
              ? "opacity-0"
              : "opacity-100",
            "transition-transform duration-500",
            "group-hover:scale-105",
          ].join(" ")}
          onLoad={() => {
            setIsLoading(false);
          }}
          onError={() => {
            setIsLoading(false);
            setScreenshotFailed(true);
          }}
        />

        {/* Overlay */}

        {!isLoading && (
          <>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent"
            />

            <div className="absolute bottom-3 left-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/60 px-2.5 py-1 font-mono text-[10px] font-medium text-white backdrop-blur-md">
                <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
                Live Preview
              </span>
            </div>
          </>
        )}

        {/* Status */}

        <StatusBadge
          status={project.status}
          className="absolute left-3 top-3"
        />

        {/* Category */}

        <span className="glass absolute right-3 top-3 rounded-full px-2.5 py-0.5 font-mono text-[11px] capitalize text-muted-foreground">
          {project.category}
        </span>
      </div>
    );
  }

  /* ==========================================================
   * MANUAL THUMBNAIL FALLBACK
   * ========================================================== */

  if (shouldUseThumbnail) {
    return (
      <div className="relative aspect-video overflow-hidden bg-muted">
        {/* Loading */}

        {isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/70 backdrop-blur-[2px]">
            <div className="relative flex items-center justify-center">
              <div className="absolute size-16 animate-ping rounded-full bg-primary/10" />

              <LoaderCircle
                aria-hidden
                className="relative size-10 animate-spin text-primary"
                strokeWidth={1.5}
              />

              <span className="absolute size-2 rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary)/0.9)]" />
            </div>
          </div>
        )}

        {/* Thumbnail */}

        <Image
          src={project.thumbnail}
          alt={`${project.title} preview`}
          fill
          sizes="(min-width: 1024px) 368px, (min-width: 640px) 50vw, 100vw"
          className={[
            "object-cover transition-opacity duration-500",
            isLoading
              ? "opacity-0"
              : "opacity-100",
            "transition-transform duration-500",
            "group-hover:scale-105",
          ].join(" ")}
          onLoad={() => {
            setIsLoading(false);
          }}
          onError={() => {
            setIsLoading(false);
            setThumbnailFailed(true);
          }}
        />

        {!isLoading && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent"
          />
        )}

        <StatusBadge
          status={project.status}
          className="absolute left-3 top-3"
        />

        <span className="glass absolute right-3 top-3 rounded-full px-2.5 py-0.5 font-mono text-[11px] capitalize text-muted-foreground">
          {project.category}
        </span>
      </div>
    );
  }

  /* ==========================================================
   * NO PREVIEW
   * ========================================================== */

  if (hasNoPreview) {
    return (
      <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-muted">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <ImageOff
            aria-hidden
            className="size-8 opacity-30"
          />

          <span className="font-mono text-xs">
            Preview unavailable
          </span>
        </div>

        <StatusBadge
          status={project.status}
          className="absolute left-3 top-3"
        />

        <span className="glass absolute right-3 top-3 rounded-full px-2.5 py-0.5 font-mono text-[11px] capitalize text-muted-foreground">
          {project.category}
        </span>
      </div>
    );
  }

  return (
    <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-muted">
      <ImageOff
        aria-hidden
        className="size-8 text-muted-foreground/30"
      />
    </div>
  );
}

/* ============================================================
 * Project Card
 * ============================================================ */

interface ProjectCardProps {
  project: Project;
  onOpen: () => void;
}

function ProjectCard({
  project,
  onOpen,
}: ProjectCardProps): JSX.Element {
  const { t } = useLanguage();

  const handleKeyDown = (
    event: ReactKeyboardEvent<HTMLElement>
  ): void => {
    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      onOpen();
    }
  };

  const extraTech =
    Math.max(
      0,
      project.techStack.length -
        MAX_VISIBLE_TECH
    );

  /*
   * Key forces ProjectPreview to remount when
   * the project or its preview source changes.
   *
   * This replaces the previous useEffect-based
   * state reset and keeps eslint happy.
   */
  const previewKey = [
    project.slug,
    project.liveUrl ?? "",
    project.thumbnail ?? "",
  ].join("|");

  return (
    <StaggerItem
      className="h-full"
      y={30}
    >
      <GlowCard className="h-full cursor-pointer overflow-hidden rounded-2xl border border-border/70 bg-card/60 transition-all duration-300 hover:-translate-y-2 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10">
        <div
          role="link"
          tabIndex={0}
          aria-label={`${t(
            "View"
          )} ${project.title} ${t(
            "details"
          )}`}
          onClick={onOpen}
          onKeyDown={handleKeyDown}
          className="flex h-full flex-col outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/70"
        >
          <ProjectPreview
            key={previewKey}
            project={project}
          />

          <div className="flex flex-1 flex-col gap-3 p-5">
            <h3 className="text-lg font-semibold transition-colors group-hover:text-primary">
              {project.title}
            </h3>

            <p className="line-clamp-2 text-sm text-muted-foreground">
              {t(project.shortDesc)}
            </p>

            <div className="mt-auto flex flex-wrap items-center gap-2">
              {project.techStack
                .slice(
                  0,
                  MAX_VISIBLE_TECH
                )
                .map((tech) => (
                  <TechBadge
                    key={tech}
                    name={tech}
                  />
                ))}

              {extraTech > 0 && (
                <span className="font-mono text-xs text-muted-foreground">
                  +{extraTech}{" "}
                  {t("more")}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-border/60 pt-4">
              <div className="flex items-center gap-4">
                {project.liveUrl && (
                  <a
                    href={
                      project.liveUrl
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(event) =>
                      event.stopPropagation()
                    }
                    aria-label={`${project.title} ${t(
                      "live demo"
                    )} (${t(
                      "opens in new tab"
                    )})`}
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
                  >
                    <ExternalLink
                      aria-hidden
                      className="size-3.5"
                    />

                    {t("Live")}
                  </a>
                )}

                {project.githubUrl && (
                  <a
                    href={
                      project.githubUrl
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(event) =>
                      event.stopPropagation()
                    }
                    aria-label={`${project.title} ${t(
                      "source code"
                    )} (${t(
                      "opens in new tab"
                    )})`}
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
                  >
                    <Github
                      aria-hidden
                      className="size-3.5"
                    />

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

/* ============================================================
 * Main Featured Projects Section
 * ============================================================ */

export default function ProjectsPreview(): JSX.Element {
  const navigate =
    useUIStore(
      (state) => state.navigate
    );

  const { t } =
    useLanguage();

  return (
    <section
      id="featured-projects"
      className="py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow={t(
            "Portfolio"
          )}
          title={t(
            "Featured Projects"
          )}
          description={t(
            "A selection of work I'm proud of — from e-commerce platforms to developer tooling."
          )}
        />

        <StaggerContainer
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          stagger={0.12}
        >
          {featuredProjects.map(
            (project) => (
              <ProjectCard
                key={project.slug}
                project={project}
                onOpen={() =>
                  navigate(
                    "project-detail",
                    project.slug
                  )
                }
              />
            )
          )}
        </StaggerContainer>

      <FadeIn
          delay={0.1}
          className="mt-12 flex justify-center"
        >
          <MagneticButton>
            <Button
              variant="outline"
              size="lg"
              onClick={() =>
                navigate(
                  "projects"
                )
              }
              className="group"
            >
              {t(
                "View All Projects"
              )}

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
