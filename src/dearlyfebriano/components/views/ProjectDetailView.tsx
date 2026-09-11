"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Compass,
  ExternalLink,
  Github,
  ImageOff,
  Link2,
  LoaderCircle,
  Maximize2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import FadeIn from "@/dearlyfebriano/components/animations/FadeIn";
import TiltCard from "@/dearlyfebriano/components/animations/TiltCard";

import { SectionHeading } from "@/dearlyfebriano/components/ui/SectionHeading";
import { StatusBadge } from "@/dearlyfebriano/components/ui/StatusBadge";
import { TechBadge } from "@/dearlyfebriano/components/ui/TechIcon";

import Lightbox from "@/dearlyfebriano/components/common/Lightbox";

import ProjectMetrics from "@/dearlyfebriano/components/sections/ProjectMetrics";

import { getProjectMetrics } from "@/dearlyfebriano/data/project-metrics";

import ProjectGithub from "@/dearlyfebriano/components/projects/ProjectGithub";
import GitHubStatsBadge from "@/dearlyfebriano/components/projects/GitHubStatsBadge";

import {
  getAdjacentProjects,
  getProjectBySlug,
  getRelatedProjects,
} from "@/dearlyfebriano/data/projects";

import ProjectArchitecture from "@/dearlyfebriano/components/sections/ProjectArchitecture";

import { getProjectArchitecture } from "@/dearlyfebriano/data/project-architecture";

import ProjectTimeline from "@/dearlyfebriano/components/projects/ProjectTimeline";

import ProjectIntelligence from "@/dearlyfebriano/components/projects/ProjectIntelligence";

import { getProjectTimeline } from "@/dearlyfebriano/data/project-timeline";

import { useUIStore } from "@/dearlyfebriano/store/ui-store";
import { useLanguage } from "@/dearlyfebriano/i18n/language-context";

import { formatTimeline } from "@/dearlyfebriano/lib/helpers";

import { cn } from "@/lib/utils";

import type { JSX } from "react";
import { projectArchitectures } from "@/dearlyfebriano/data/project-architecture";
import ProjectWhyBuilt from "@/dearlyfebriano/components/projects/ProjectWhyBuilt";
import { projectWhyBuilt } from "@/dearlyfebriano/data/project-why-built";

/* ============================================================
 * ProjectDetailView
 *
 * Deep dive for one project:
 * - Hero
 * - Project metadata
 * - Automatic website screenshot
 * - Manual thumbnail fallback
 * - Gallery
 * - Lightbox
 * - Features
 * - Challenges
 * - Related projects
 * - Previous / next navigation
 * ============================================================ */

interface LightboxState {
  images: {
    src: string;
    alt: string;
    caption: string;
  }[];
  index: number;
}

/* ============================================================
 * Utilities
 * ============================================================ */

/**
 * Detect whether the user is currently typing.
 * Keyboard shortcuts should not fire inside inputs.
 */
function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tag = target.tagName.toLowerCase();

  return (
    tag === "input" ||
    tag === "textarea" ||
    tag === "select" ||
    target.isContentEditable
  );
}

/**
 * Returns the preview URL for a project.
 *
 * Priority:
 *
 * 1. liveUrl -> automatic screenshot endpoint
 * 2. thumbnail -> manual fallback
 * 3. undefined -> no preview available
 */
function getProjectPreviewUrl(
  project: NonNullable<ReturnType<typeof getProjectBySlug>>,
): string | undefined {
  if (project.liveUrl) {
    return `/api/project-preview?url=${encodeURIComponent(project.liveUrl)}`;
  }

  if (project.thumbnail) {
    return project.thumbnail;
  }

  return undefined;
}

/**
 * Build the gallery from the project.
 *
 * Only valid image URLs are inserted.
 */
function buildGalleryImages(
  project: NonNullable<ReturnType<typeof getProjectBySlug>>,
): {
  src: string;
  alt: string;
  caption: string;
}[] {
  const gallery: {
    src: string;
    alt: string;
    caption: string;
  }[] = [];

  const previewUrl = getProjectPreviewUrl(project);

  if (previewUrl) {
    gallery.push({
      src: previewUrl,
      alt: `${project.title} — main preview`,
      caption: `${project.title} — main preview`,
    });
  }

  project.images.forEach((image, index) => {
    if (!image) {
      return;
    }

    gallery.push({
      src: image,
      alt: `${project.title} — screenshot ${index + 2}`,
      caption: `${project.title} — screenshot ${index + 2}`,
    });
  });

  return gallery;
}

function galleryImagesCount(
  project: NonNullable<ReturnType<typeof getProjectBySlug>>,
): number {
  return buildGalleryImages(project).length;
}

/* ============================================================
 * Preview media
 *
 * Used by hero and related project cards.
 * ============================================================ */

interface PreviewMediaProps {
  project: NonNullable<ReturnType<typeof getProjectBySlug>>;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
  aspectClassName?: string;
  showCategory?: boolean;
  showStatus?: boolean;
}

function PreviewMedia({
  project,
  alt,
  sizes,
  className,
  priority = false,
  aspectClassName = "aspect-video",
  showCategory = false,
  showStatus = false,
}: PreviewMediaProps): JSX.Element {
  const reducedMotion = useReducedMotion();

  const { t } = useLanguage();

  /* ============================================================
   * Image state
   * ============================================================ */

  const [imageLoading, setImageLoading] = useState(true);

  const [screenshotFailed, setScreenshotFailed] = useState(false);

  /* ============================================================
   * Preview URL
   *
   * liveUrl -> automatic screenshot
   * thumbnail -> fallback
   * none -> unavailable
   * ============================================================ */

  const automaticPreviewUrl = project.liveUrl
    ? `/api/project-preview?url=${encodeURIComponent(project.liveUrl)}`
    : undefined;

  const useAutomaticPreview = Boolean(automaticPreviewUrl && !screenshotFailed);

  const fallbackThumbnail = project.thumbnail;

  /* ============================================================
   * Reset loading state when project changes
   * ============================================================ */

  useEffect(() => {
    setImageLoading(true);
    setScreenshotFailed(false);
  }, [project.slug, project.liveUrl, project.thumbnail]);

  /* ============================================================
   * Automatic screenshot
   * ============================================================ */

  if (useAutomaticPreview) {
    return (
      <div
        className={cn(
          "relative w-full overflow-hidden bg-muted",
          aspectClassName,
        )}
      >
        {/* Loading overlay */}

        {imageLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/70 backdrop-blur-[2px]">
            <div className="relative flex items-center justify-center">
              {/* Outer glow */}

              <div className="absolute size-16 animate-ping rounded-full bg-primary/10" />

              {/* Spinner */}

              <LoaderCircle
                aria-hidden
                className={cn(
                  "relative size-10 text-primary",
                  !reducedMotion && "animate-spin",
                )}
                strokeWidth={1.5}
              />

              {/* Center dot */}

              <span className="absolute size-2 rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary)/0.8)]" />
            </div>
          </div>
        )}

        <Image
          src={automaticPreviewUrl}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={cn(
            "object-cover transition-opacity duration-500",
            imageLoading ? "opacity-0" : "opacity-100",
            !reducedMotion &&
              "transition-transform duration-700 group-hover:scale-[1.03]",
            className,
          )}
          onLoad={() => {
            setImageLoading(false);
          }}
          onError={() => {
            setImageLoading(false);
            setScreenshotFailed(true);
          }}
        />

        {/* Gradient overlay */}

        {!imageLoading && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent"
          />
        )}

        {/* Live Preview badge */}

        {!imageLoading && (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/60 px-2.5 py-1 font-mono text-[10px] font-medium text-white backdrop-blur-md">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
            {t("Live Preview")}
          </span>
        )}

        {/* Status */}

        {showStatus && (
          <StatusBadge
            status={project.status}
            className="absolute left-3 top-3"
          />
        )}

        {/* Category */}

        {showCategory && (
          <span className="glass absolute right-3 top-3 rounded-full px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider text-foreground">
            {project.category}
          </span>
        )}
      </div>
    );
  }

  /* ============================================================
   * Manual thumbnail fallback
   * ============================================================ */

  if (fallbackThumbnail) {
    return (
      <div
        className={cn(
          "relative w-full overflow-hidden bg-muted",
          aspectClassName,
        )}
      >
        {imageLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/70 backdrop-blur-[2px]">
            <div className="relative flex items-center justify-center">
              <div className="absolute size-16 animate-ping rounded-full bg-primary/10" />

              <LoaderCircle
                aria-hidden
                className={cn(
                  "relative size-10 text-primary",
                  !reducedMotion && "animate-spin",
                )}
                strokeWidth={1.5}
              />

              <span className="absolute size-2 rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary)/0.8)]" />
            </div>
          </div>
        )}

        <Image
          src={fallbackThumbnail}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={cn(
            "object-cover transition-opacity duration-500",
            imageLoading ? "opacity-0" : "opacity-100",
            !reducedMotion &&
              "transition-transform duration-700 group-hover:scale-[1.03]",
            className,
          )}
          onLoad={() => {
            setImageLoading(false);
          }}
          onError={() => {
            setImageLoading(false);
          }}
        />

        {!imageLoading && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent"
          />
        )}

        {showStatus && (
          <StatusBadge
            status={project.status}
            className="absolute left-3 top-3"
          />
        )}

        {showCategory && (
          <span className="glass absolute right-3 top-3 rounded-full px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider text-foreground">
            {project.category}
          </span>
        )}
      </div>
    );
  }

  /* ============================================================
   * No preview available
   * ============================================================ */

  return (
    <div
      className={cn(
        "relative flex w-full items-center justify-center overflow-hidden bg-muted",
        aspectClassName,
      )}
    >
      <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
        <ImageOff aria-hidden className="size-10 opacity-30" />

        <span className="font-mono text-xs">{t("Preview unavailable")}</span>
      </div>

      {showStatus && (
        <StatusBadge
          status={project.status}
          className="absolute left-3 top-3"
        />
      )}

      {showCategory && (
        <span className="glass absolute right-3 top-3 rounded-full px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider text-foreground">
          {project.category}
        </span>
      )}
    </div>
  );
}

/* ============================================================
 * Main component
 * ============================================================ */

export default function ProjectDetailView(): JSX.Element {
  const projectSlug = useUIStore((state) => state.projectSlug);

  const navigate = useUIStore((state) => state.navigate);

  const { t } = useLanguage();

  const reducedMotion = useReducedMotion();

  const [lightbox, setLightbox] = useState<LightboxState | null>(null);

  /* ---------------------------------------------
   * Find current project
   * --------------------------------------------- */

  const project = projectSlug ? getProjectBySlug(projectSlug) : undefined;

  /* ---------------------------------------------
   * Scroll to top whenever project changes
   * --------------------------------------------- */

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "auto",
    });
  }, [projectSlug]);

  /* ---------------------------------------------
   * Keyboard shortcut: G
   * --------------------------------------------- */

  useEffect(() => {
    if (!project || galleryImagesCount(project) < 1) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key.toLowerCase() !== "g") {
        return;
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (isTypingTarget(event.target)) {
        return;
      }

      event.preventDefault();

      setLightbox(
        (state) =>
          state ?? {
            images: buildGalleryImages(project),
            index: 0,
          },
      );
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [project]);

  /* ---------------------------------------------
   * Share project
   * --------------------------------------------- */

  const shareProject = useCallback(async (): Promise<void> => {
    const url = `${
      window.location.origin
    }${window.location.pathname}#projects/${project?.slug ?? ""}`;

    try {
      await navigator.clipboard.writeText(url);

      toast.success(t("Project link copied to clipboard"));
    } catch {
      toast.error(t("Could not copy the link."));
    }
  }, [project, t]);

  /* ---------------------------------------------
   * Project missing
   * --------------------------------------------- */

  if (!project) {
    return (
      <div className="relative mx-auto w-full max-w-6xl px-4 pb-20 pt-28 sm:px-6 sm:pb-28 sm:pt-32">
        <FadeIn className="py-20 text-center sm:py-28">
          <Compass
            aria-hidden
            className="mx-auto size-12 text-muted-foreground/50"
          />

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
            {t("Project not found")}
          </h1>

          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {t(
              "The project you are looking for doesn't exist or has been moved.",
            )}
          </p>

          <Button
            type="button"
            onClick={() => navigate("projects")}
            className="mt-8 bg-gradient-accent text-white shadow-lg shadow-primary/25 hover:opacity-90"
          >
            <ArrowLeft className="size-4" aria-hidden />
            {t("Back to projects")}
          </Button>
        </FadeIn>
      </div>
    );
  }

  /* ---------------------------------------------
   * Derived project data
   * --------------------------------------------- */

  const { prev, next } = getAdjacentProjects(project.slug);

  const relatedProjects = getRelatedProjects(project.slug, 2);

  const galleryImages = buildGalleryImages(project);

  const metrics = getProjectMetrics(project.slug);

  const architecture = getProjectArchitecture(project.slug);

  const previewUrl = getProjectPreviewUrl(project);

  const timeline = getProjectTimeline(project.slug);

  const whyBuilt = projectWhyBuilt[project.slug] ?? null;

  const period = `${formatTimeline(project.startDate)} — ${
    project.endDate ? formatTimeline(project.endDate) : t("Present")
  }`;

  /* ---------------------------------------------
   * Render
   * --------------------------------------------- */

  return (
    <div className="relative mx-auto w-full max-w-6xl px-4 pb-20 pt-28 sm:px-6 sm:pb-28 sm:pt-32">
      {/* ========================================
       * Breadcrumb
       * ======================================== */}

      <nav
        aria-label="Breadcrumb"
        className="font-mono text-xs text-muted-foreground"
      >
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <button
              type="button"
              onClick={() => navigate("projects")}
              className="transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {t("projects")}
            </button>
          </li>

          <li aria-hidden>/</li>

          <li className="text-primary" aria-current="page">
            {project.title}
          </li>
        </ol>
      </nav>

      {/* ========================================
       * Hero text
       * ======================================== */}

      <FadeIn y={20} delay={0.05} className="mt-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          {project.title}
        </h1>

        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">
          {t(project.longDesc)}
        </p>
      </FadeIn>

      {/* ========================================
       * Meta bar
       * ======================================== */}

      <FadeIn delay={0.1} className="mt-8">
        <div className="glass flex flex-wrap gap-x-8 gap-y-3 rounded-xl p-4">
          {/* Period */}

          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {t("Period")}
            </p>

            <p className="mt-1 text-sm font-medium text-foreground">{period}</p>
          </div>

          {/* Duration */}

          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {t("Duration")}
            </p>

            <p className="mt-1 text-sm font-medium text-foreground">
              {project.duration ? t(project.duration) : "—"}
            </p>
          </div>

          {/* Category */}

          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {t("Category")}
            </p>

            <p className="mt-1 text-sm font-medium capitalize text-foreground">
              {project.category === "opensource"
                ? "open source"
                : project.category}
            </p>
          </div>

          {/* Status */}

          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {t("Status")}
            </p>

            <div className="mt-1">
              <StatusBadge status={project.status} />
            </div>
          </div>

          {/* GitHub live stats */}

          {project.githubUrl && (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {t("Repository")}
              </p>

              <div className="mt-1">
                <GitHubStatsBadge
                  repoUrl={project.githubUrl}
                  variant="full"
                />
              </div>
            </div>
          )}

          {/* Action buttons */}

          {(project.liveUrl || project.githubUrl) && (
            <div className="flex flex-wrap items-center gap-3 md:ml-auto">
              {/* Live demo */}

              {project.liveUrl && (
                <Button
                  asChild
                  size="sm"
                  className="bg-gradient-accent text-white hover:opacity-90"
                >
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${project.title} ${t("live demo")}`}
                  >
                    <ExternalLink className="size-3.5" aria-hidden />

                    {t("Live Demo")}
                  </a>
                </Button>
              )}

              {/* GitHub */}

              {project.githubUrl && (
                <Button asChild size="sm" variant="outline">
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${project.title} ${t("source code")}`}
                  >
                    <Github className="size-3.5" aria-hidden />
                    GitHub
                  </a>
                </Button>
              )}

              {/* Share */}

              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={shareProject}
                aria-label={t("Copy link to this project")}
                title={t("Copy link to this project")}
                className="gap-2 text-muted-foreground hover:text-primary"
              >
                <Link2 className="size-3.5" aria-hidden />

                {t("Share")}
              </Button>
            </div>
          )}
        </div>
      </FadeIn>

      {/* ========================================
       * Main project preview
       * ======================================== */}

      <FadeIn delay={0.15} className="mt-10">
        <button
          type="button"
          disabled={!previewUrl}
          onClick={() => {
            if (!galleryImages.length) {
              return;
            }

            setLightbox({
              images: galleryImages,
              index: 0,
            });
          }}
          aria-label={
            previewUrl
              ? `${t("Open")} ${project.title} ${t(
                  "screenshot gallery in fullscreen preview",
                )}`
              : t("Project preview unavailable")
          }
          title={
            previewUrl
              ? t("Open screenshot gallery")
              : t("Project preview unavailable")
          }
          className={cn(
            "group relative block w-full overflow-hidden rounded-2xl border border-border/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            previewUrl
              ? "cursor-zoom-in hover:border-primary/40"
              : "cursor-default",
          )}
        >
          <PreviewMedia
            project={project}
            alt={`${project.title} — main preview`}
            sizes="(min-width: 1024px) 1152px, 90vw"
            priority
            showStatus
            showCategory
          />

          {/* Zoom affordance */}
          {previewUrl && (
            <>
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />

              <span
                aria-hidden
                className="glass pointer-events-none absolute left-1/2 top-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 scale-75 place-items-center rounded-full text-foreground opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100"
              >
                <Maximize2 className="size-6" />
              </span>

              <span
                aria-hidden
                className="glass pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              >
                <Maximize2 className="size-3" />

                {galleryImages.length > 1
                  ? `${t("View gallery")} · ${galleryImages.length}`
                  : t("View fullscreen")}
              </span>
            </>
          )}
        </button>
      </FadeIn>

      {project.githubUrl ? (
        <ProjectIntelligence slug={project.slug} />
      ) : (
        <>
          <ProjectMetrics metrics={metrics} />

          <ProjectArchitecture architecture={architecture} />

          <ProjectTimeline timeline={timeline} />
        </>
      )}

      <ProjectGithub githubUrl={project.githubUrl} />

      <ProjectWhyBuilt data={whyBuilt} />

      {/* ========================================
       * Gallery
       * ======================================== */}

      {galleryImages.length > 1 && (
        <section aria-label={t("Project gallery")} className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <SectionHeading eyebrow={t("Gallery")} title={t("Screenshots")} />

            <p className="hidden items-center gap-1.5 font-mono text-[10px] text-muted-foreground sm:flex">
              {t("press")}
              <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 text-[10px] text-foreground/80">
                g
              </kbd>
              {t("to open gallery")}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {galleryImages.map((image, index) => (
              <FadeIn
                key={`${image.src}-${index}`}
                delay={index * 0.05}
                className="h-full"
              >
                <button
                  type="button"
                  onClick={() =>
                    setLightbox({
                      images: galleryImages,
                      index,
                    })
                  }
                  aria-label={`${t("Open")} ${image.alt} ${t(
                    "in fullscreen preview",
                  )}`}
                  className="group relative block aspect-video w-full cursor-zoom-in overflow-hidden rounded-xl border border-border/70 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(min-width: 640px) 45vw, 90vw"
                    className={cn(
                      "object-cover",
                      !reducedMotion &&
                        "transition-transform duration-500 group-hover:scale-105",
                    )}
                  />

                  <span
                    aria-hidden
                    className="glass pointer-events-none absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] tabular-nums text-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  >
                    {index + 1} / {galleryImages.length}
                  </span>
                </button>
              </FadeIn>
            ))}
          </div>
        </section>
      )}

      {/* ========================================
       * Tech stack
       * ======================================== */}

      <section aria-label={t("Tech stack")} className="mt-14">
        <SectionHeading eyebrow={t("Built with")} title={t("Tech stack")} />

        <FadeIn>
          <ul className="flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <li key={tech}>
                <TechBadge name={tech} size="md" />
              </li>
            ))}
          </ul>
        </FadeIn>
      </section>

      {/* ========================================
       * Key features
       * ======================================== */}

      <section aria-label={t("Key features")} className="mt-14">
        <SectionHeading eyebrow={t("Highlights")} title={t("Key features")} />

        <div className="grid gap-3 sm:grid-cols-2">
          {project.features.map((feature, index) => (
            <FadeIn key={feature} delay={index * 0.04} className="h-full">
              <div className="flex h-full gap-3 rounded-xl border border-border/70 bg-card/60 p-4 transition-colors hover:border-primary/40">
                <CheckCircle2
                  aria-hidden
                  className="mt-0.5 size-5 shrink-0 text-primary"
                />

                <p className="text-sm leading-relaxed text-foreground/90">
                  {t(feature)}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ========================================
       * Challenges & solutions
       * ======================================== */}

      <section aria-label={t("Challenges and solutions")} className="mt-14">
        <SectionHeading
          eyebrow={t("Deep dive")}
          title={t("Challenges & solutions")}
          description={t(
            "The interesting problems — and how they were solved.",
          )}
        />

        <div className="space-y-4">
          {project.challenges.map((challenge, index) => (
            <FadeIn key={challenge.title} delay={index * 0.05}>
              <article className="rounded-2xl border border-border/70 bg-card/60 p-6 transition-colors hover:border-primary/40">
                <p className="font-mono text-xs text-primary" aria-hidden>
                  {String(index + 1).padStart(2, "0")}
                </p>

                <h3 className="mt-2 font-semibold text-foreground">
                  {t(challenge.title)}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t(challenge.description)}
                </p>
              </article>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ========================================
       * Related projects
       * ======================================== */}

      {relatedProjects.length > 0 && (
        <section aria-label={t("Related projects")} className="mt-14">
          <SectionHeading
            eyebrow={t("Keep exploring")}
            title={t("Related projects")}
            description={t(
              "Similar stacks and problem domains you might like.",
            )}
          />

          <div className="grid gap-6 sm:grid-cols-2">
            {relatedProjects.map((related, index) => (
              <FadeIn
                key={related.slug}
                delay={index * 0.06}
                className="h-full"
              >
                <TiltCard className="h-full" maxTilt={6}>
                  <article
                    role="link"
                    tabIndex={0}
                    aria-label={`${related.title} — ${t(
                      "open project details",
                    )}`}
                    onClick={() => navigate("project-detail", related.slug)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();

                        navigate("project-detail", related.slug);
                      }
                    }}
                    className="card-shine group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/60 transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    {/* Related preview */}

                    <PreviewMedia
                      project={related}
                      alt={`${related.title} ${t("preview")}`}
                      sizes="(min-width: 640px) 45vw, 90vw"
                      aspectClassName="aspect-[16/7]"
                      showStatus
                    />

                    {/* Related body */}

                    <div className="flex flex-1 flex-col gap-2.5 p-4">
                      <h3 className="font-semibold transition-colors group-hover:text-primary">
                        {related.title}
                      </h3>

                      <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                        {t(related.shortDesc)}
                      </p>

                      <span className="mt-auto inline-flex items-center gap-1 pt-2 text-xs font-medium text-primary">
                        {t("View project")}

                        <ArrowRight
                          aria-hidden
                          className={cn(
                            "size-3.5",
                            !reducedMotion &&
                              "transition-transform duration-300 group-hover:translate-x-0.5",
                          )}
                        />
                      </span>
                    </div>
                  </article>
                </TiltCard>
              </FadeIn>
            ))}
          </div>
        </section>
      )}

      {/* ========================================
       * Previous / Next navigation
       * ======================================== */}

      <nav aria-label="Project pagination" className="mt-16">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Previous */}

          <button
            type="button"
            disabled={!prev}
            onClick={() => prev && navigate("project-detail", prev.slug)}
            aria-label={
              prev
                ? `${t("Previous project:")} ${prev.title}`
                : t("No previous project")
            }
            className="group rounded-2xl border border-border/70 bg-card/60 p-5 text-left transition-all hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
              <ArrowLeft
                aria-hidden
                className={cn(
                  "size-4",
                  !reducedMotion &&
                    "transition-transform group-hover:-translate-x-1",
                )}
              />

              {t("Previous project")}
            </span>

            <span className="mt-2 block font-semibold transition-colors group-hover:text-primary">
              {prev?.title ?? t("You're at the start")}
            </span>
          </button>

          {/* Next */}

          <button
            type="button"
            disabled={!next}
            onClick={() => next && navigate("project-detail", next.slug)}
            aria-label={
              next
                ? `${t("Next project:")} ${next.title}`
                : t("No next project")
            }
            className="group rounded-2xl border border-border/70 bg-card/60 p-5 text-right transition-all hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span className="flex items-center justify-end gap-2 font-mono text-xs text-muted-foreground">
              {t("Next project")}

              <ArrowRight
                aria-hidden
                className={cn(
                  "size-4",
                  !reducedMotion &&
                    "transition-transform group-hover:translate-x-1",
                )}
              />
            </span>

            <span className="mt-2 block font-semibold transition-colors group-hover:text-primary">
              {next?.title ?? t("You're at the end")}
            </span>
          </button>
        </div>
      </nav>

      {/* ========================================
       * Lightbox
       * ======================================== */}

      <Lightbox
        images={lightbox?.images ?? null}
        index={lightbox?.index ?? 0}
        onNavigate={(nextIndex) =>
          setLightbox((state) =>
            state
              ? {
                  ...state,
                  index: nextIndex,
                }
              : state,
          )
        }
        onClose={() => setLightbox(null)}
      />
    </div>
  );
}
