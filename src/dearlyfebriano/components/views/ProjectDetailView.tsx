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
  Link2,
  Maximize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import FadeIn from "@/dearlyfebriano/components/animations/FadeIn";
import TiltCard from "@/dearlyfebriano/components/animations/TiltCard";
import { SectionHeading } from "@/dearlyfebriano/components/ui/SectionHeading";
import { StatusBadge } from "@/dearlyfebriano/components/ui/StatusBadge";
import { TechBadge } from "@/dearlyfebriano/components/ui/TechIcon";
import Lightbox from "@/dearlyfebriano/components/common/Lightbox";
import { getAdjacentProjects, getProjectBySlug, getRelatedProjects } from "@/dearlyfebriano/data/projects";
import { useUIStore } from "@/dearlyfebriano/store/ui-store";
import { useLanguage } from "@/dearlyfebriano/i18n/language-context";
import { formatTimeline } from "@/dearlyfebriano/lib/helpers";
import { cn } from "@/lib/utils";
import type { JSX } from "react";

/* ============================================================
 * ProjectDetailView — deep dive for one project: hero, meta,
 * gallery with lightbox, features, challenges, prev/next nav.
 * ============================================================ */

interface LightboxState {
  images: { src: string; alt: string; caption: string }[];
  index: number;
}

/** True saat event keyboard terjadi saat user sedang mengetik
 * (input / textarea / contenteditable) — shortcut harus diabaikan. */
function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return (
    tag === "input" ||
    tag === "textarea" ||
    tag === "select" ||
    target.isContentEditable
  );
}

/* ---------- Helpers: galeri dibangun dari data project ---------- */
function buildGalleryImages(
  project: NonNullable<ReturnType<typeof getProjectBySlug>>
): { src: string; alt: string; caption: string }[] {
  return [
    {
      src: project.thumbnail,
      alt: `${project.title} — main preview`,
      caption: `${project.title} — main preview`,
    },
    ...project.images.map((image, index) => ({
      src: image,
      alt: `${project.title} — screenshot ${index + 2}`,
      caption: `${project.title} — screenshot ${index + 2}`,
    })),
  ];
}

function galleryImagesCount(
  project: NonNullable<ReturnType<typeof getProjectBySlug>>
): number {
  return 1 + project.images.length;
}

export default function ProjectDetailView(): JSX.Element {
  const projectSlug = useUIStore((state) => state.projectSlug);
  const navigate = useUIStore((state) => state.navigate);
  const { t } = useLanguage();
  const reducedMotion = useReducedMotion();
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  // Scroll back to top whenever a new project is opened.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [projectSlug]);

  const project = projectSlug ? getProjectBySlug(projectSlug) : undefined;

  /* Shortcut "g": buka galeri (lightbox) langsung — hanya saat tidak
   * sedang mengetik, tanpa modifier, dan lightbox belum terbuka. */
  useEffect(() => {
    if (!project || galleryImagesCount(project) < 1) return;
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key.toLowerCase() !== "g") return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;
      event.preventDefault();
      // Buka hanya bila belum terbuka — jangan reset index saat lightbox aktif.
      setLightbox((state) => state ?? { images: buildGalleryImages(project), index: 0 });
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [project]);

  const shareProject = useCallback(async (): Promise<void> => {
    const url = `${window.location.origin}${window.location.pathname}#projects/${project?.slug ?? ""}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t("Project link copied to clipboard"));
    } catch {
      toast.error(t("Could not copy the link."));
    }
  }, [project, t]);

  if (!project) {
    return (
      <div className="relative mx-auto w-full max-w-6xl px-4 pb-20 pt-28 sm:px-6 sm:pb-28 sm:pt-32">
        <FadeIn className="py-20 text-center sm:py-28">
          <Compass aria-hidden className="mx-auto size-12 text-muted-foreground/50" />
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
            {t("Project not found")}
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {t("The project you are looking for doesn't exist or has been moved.")}
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

  const { prev, next } = getAdjacentProjects(project.slug);
  const relatedProjects = getRelatedProjects(project.slug, 2);
  const galleryImages = buildGalleryImages(project);
  const period = `${formatTimeline(project.startDate)} — ${
    project.endDate ? formatTimeline(project.endDate) : t("Present")
  }`;

  return (
    <div className="relative mx-auto w-full max-w-6xl px-4 pb-20 pt-28 sm:px-6 sm:pb-28 sm:pt-32">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="font-mono text-xs text-muted-foreground">
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

      {/* Hero */}
      <FadeIn y={20} delay={0.05} className="mt-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          {project.title}
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">
          {t(project.longDesc)}
        </p>
      </FadeIn>

      {/* Meta bar */}
      <FadeIn delay={0.1} className="mt-8">
        <div className="glass flex flex-wrap gap-x-8 gap-y-3 rounded-xl p-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {t("Period")}
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">{period}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {t("Duration")}
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {project.duration ? t(project.duration) : "—"}
            </p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {t("Category")}
            </p>
            <p className="mt-1 text-sm font-medium capitalize text-foreground">
              {project.category === "opensource" ? "open source" : project.category}
            </p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {t("Status")}
            </p>
            <div className="mt-1">
              <StatusBadge status={project.status} />
            </div>
          </div>
          {(project.liveUrl || project.githubUrl) && (
            <div className="flex flex-wrap items-center gap-3 md:ml-auto">
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

      {/* Hero image — klik membuka lightbox galeri penuh */}
      <FadeIn delay={0.15} className="mt-10">
        <button
          type="button"
          onClick={() => setLightbox({ images: galleryImages, index: 0 })}
          aria-label={`${t("Open")} ${project.title} ${t("screenshot gallery in fullscreen preview")}`}
          title={t("Open screenshot gallery")}
          className="group relative block aspect-video w-full cursor-zoom-in overflow-hidden rounded-2xl border border-border/70 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Image
            src={project.thumbnail}
            alt={`${project.title} — main preview`}
            fill
            priority
            sizes="(min-width: 1024px) 1152px, 90vw"
            className={cn(
              "object-cover",
              !reducedMotion && "transition-transform duration-700 group-hover:scale-[1.03]"
            )}
          />
          {/* Zoom affordance overlay */}
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
        </button>
      </FadeIn>

      {/* Gallery */}
      {galleryImages.length > 1 && (
        <section aria-label={t("Project gallery")} className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <SectionHeading eyebrow={t("Gallery")} title={t("Screenshots")} />
            <p className="hidden items-center gap-1.5 font-mono text-[10px] text-muted-foreground sm:flex">
              press
              <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 text-[10px] text-foreground/80">
                g
              </kbd>
              to open gallery
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {galleryImages.map((image, index) => (
              <FadeIn key={image.src} delay={index * 0.05} className="h-full">
                <button
                  type="button"
                  onClick={() => setLightbox({ images: galleryImages, index })}
                  aria-label={`${t("Open")} ${image.alt} ${t("in fullscreen preview")}`}
                  className="group relative block aspect-video w-full cursor-zoom-in overflow-hidden rounded-xl border border-border/70 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(min-width: 640px) 45vw, 90vw"
                    className={cn(
                      "object-cover",
                      !reducedMotion && "transition-transform duration-500 group-hover:scale-105"
                    )}
                  />
                  {/* Screenshot index pill (hover) */}
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

      {/* Tech stack */}
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

      {/* Key features */}
      <section aria-label={t("Key features")} className="mt-14">
        <SectionHeading eyebrow={t("Highlights")} title={t("Key features")} />
        <div className="grid gap-3 sm:grid-cols-2">
          {project.features.map((feature, index) => (
            <FadeIn key={feature} delay={index * 0.04} className="h-full">
              <div className="flex h-full gap-3 rounded-xl border border-border/70 bg-card/60 p-4 transition-colors hover:border-primary/40">
                <CheckCircle2 aria-hidden className="mt-0.5 size-5 shrink-0 text-primary" />
                <p className="text-sm leading-relaxed text-foreground/90">{t(feature)}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Challenges & solutions */}
      <section aria-label={t("Challenges and solutions")} className="mt-14">
        <SectionHeading
          eyebrow={t("Deep dive")}
          title={t("Challenges & solutions")}
          description={t("The interesting problems — and how they were solved.")}
        />
        <div className="space-y-4">
          {project.challenges.map((challenge, index) => (
            <FadeIn key={challenge.title} delay={index * 0.05}>
              <article className="rounded-2xl border border-border/70 bg-card/60 p-6 transition-colors hover:border-primary/40">
                <p className="font-mono text-xs text-primary" aria-hidden>
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 font-semibold text-foreground">{t(challenge.title)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t(challenge.description)}
                </p>
              </article>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Related projects — scored by shared category + tech stack */}
      {relatedProjects.length > 0 && (
        <section aria-label={t("Related projects")} className="mt-14">
          <SectionHeading
            eyebrow={t("Keep exploring")}
            title={t("Related projects")}
            description={t("Similar stacks and problem domains you might like.")}
          />
          <div className="grid gap-6 sm:grid-cols-2">
            {relatedProjects.map((related, index) => (
              <FadeIn key={related.slug} delay={index * 0.06} className="h-full">
                <TiltCard className="h-full" maxTilt={6}>
                  <article
                    role="link"
                    tabIndex={0}
                    aria-label={`${related.title} — ${t("open project details")}`}
                    onClick={() => navigate("project-detail", related.slug)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        navigate("project-detail", related.slug);
                      }
                    }}
                    className="card-shine group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/60 transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <div className="relative aspect-[16/7] overflow-hidden">
                      <Image
                        src={related.thumbnail}
                        alt={`${related.title} ${t("preview")}`}
                        fill
                        sizes="(min-width: 640px) 45vw, 90vw"
                        className={cn(
                          "object-cover",
                          !reducedMotion && "transition-transform duration-500 group-hover:scale-105"
                        )}
                      />
                      <div
                        aria-hidden
                        className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent"
                      />
                      <div className="absolute left-3 top-3">
                        <StatusBadge status={related.status} />
                      </div>
                    </div>
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
                              "transition-transform duration-300 group-hover:translate-x-0.5"
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

      {/* Prev / Next navigation */}
      <nav aria-label="Project pagination" className="mt-16">
        <div className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            disabled={!prev}
            onClick={() => prev && navigate("project-detail", prev.slug)}
            aria-label={prev ? `${t("Previous project:")} ${prev.title}` : t("No previous project")}
            className="group rounded-2xl border border-border/70 bg-card/60 p-5 text-left transition-all hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
              <ArrowLeft
                aria-hidden
                className={cn(
                  "size-4",
                  !reducedMotion && "transition-transform group-hover:-translate-x-1"
                )}
              />
              {t("Previous project")}
            </span>
            <span className="mt-2 block font-semibold transition-colors group-hover:text-primary">
              {prev?.title ?? t("You're at the start")}
            </span>
          </button>
          <button
            type="button"
            disabled={!next}
            onClick={() => next && navigate("project-detail", next.slug)}
            aria-label={next ? `${t("Next project:")} ${next.title}` : t("No next project")}
            className="group rounded-2xl border border-border/70 bg-card/60 p-5 text-right transition-all hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span className="flex items-center justify-end gap-2 font-mono text-xs text-muted-foreground">
              {t("Next project")}
              <ArrowRight
                aria-hidden
                className={cn(
                  "size-4",
                  !reducedMotion && "transition-transform group-hover:translate-x-1"
                )}
              />
            </span>
            <span className="mt-2 block font-semibold transition-colors group-hover:text-primary">
              {next?.title ?? t("You're at the end")}
            </span>
          </button>
        </div>
      </nav>

      {/* Lightbox for gallery images */}
      <Lightbox
        images={lightbox?.images ?? null}
        index={lightbox?.index ?? 0}
        onNavigate={(nextIndex) =>
          setLightbox((state) => (state ? { ...state, index: nextIndex } : state))
        }
        onClose={() => setLightbox(null)}
      />
    </div>
  );
}
