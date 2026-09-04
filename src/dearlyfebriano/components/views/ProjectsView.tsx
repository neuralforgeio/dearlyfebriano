"use client";

import Image from "next/image";
import { useMemo, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, ExternalLink, FolderSearch, Github, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FadeIn from "@/dearlyfebriano/components/animations/FadeIn";
import GlowCard from "@/dearlyfebriano/components/animations/GlowCard";
import TiltCard from "@/dearlyfebriano/components/animations/TiltCard";
import { TechBadge } from "@/dearlyfebriano/components/ui/TechIcon";
import { StatusBadge } from "@/dearlyfebriano/components/ui/StatusBadge";
import { projects } from "@/dearlyfebriano/data/projects";
import { useUIStore } from "@/dearlyfebriano/store/ui-store";
import { useLanguage } from "@/dearlyfebriano/i18n/language-context";
import type { Project, ProjectCategory } from "@/dearlyfebriano/types";
import { cn } from "@/lib/utils";
import type { JSX } from "react";

/* ============================================================
 * ProjectsView — full portfolio grid with animated category
 * filters, live search, and keyboard-accessible cards.
 * ============================================================ */

const PROJECT_FILTERS: { value: ProjectCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "web", label: "Web App" },
  { value: "mobile", label: "Mobile" },
  { value: "api", label: "API" },
  { value: "opensource", label: "Open Source" },
];

const MAX_VISIBLE_TECH = 4;

/** Opsi urutan grid — default "newest" (startDate desc). */
type SortOrder = "newest" | "oldest" | "az";

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "az", label: "Title A–Z" },
];

/** Bandingkan dua project berdasarkan sortOrder (startDate "YYYY-MM
 * aman dibandingkan sebagai string). */
function compareProjects(a: Project, b: Project, sortOrder: SortOrder): number {
  switch (sortOrder) {
    case "oldest":
      return a.startDate.localeCompare(b.startDate);
    case "az":
      return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
    case "newest":
    default:
      return b.startDate.localeCompare(a.startDate);
  }
}

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
}

function PageHeader({ eyebrow, title, description }: PageHeaderProps): JSX.Element {
  return (
    <FadeIn y={20} className="flex flex-col gap-4">
      <span className="font-mono text-xs uppercase tracking-[0.25em] text-primary">{eyebrow}</span>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
        {title}
      </h1>
      {description && (
        <p className="max-w-2xl leading-relaxed text-muted-foreground">{description}</p>
      )}
    </FadeIn>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }): JSX.Element {
  const navigate = useUIStore((state) => state.navigate);
  const { t } = useLanguage();
  const reducedMotion = useReducedMotion();
  const visibleTech = project.techStack.slice(0, MAX_VISIBLE_TECH);
  const hiddenTech = project.techStack.length - visibleTech.length;

  const openDetail = (): void => navigate("project-detail", project.slug);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLElement>): void => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openDetail();
    }
  };

  return (
    <TiltCard className="h-full">
      <GlowCard className="h-full">
        <article
          role="link"
          tabIndex={0}
          aria-label={`${project.title} — ${t("open project details")}`}
          onClick={openDetail}
          onKeyDown={handleKeyDown}
          className="card-shine group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/60 transition-all duration-300 hover:-translate-y-2 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {/* Ghost index number */}
          <span
            aria-hidden
            className="text-gradient pointer-events-none absolute -top-2 right-3 z-10 font-mono text-6xl font-black opacity-[0.07] transition-opacity duration-300 group-hover:opacity-20"
          >
            {String(index + 1).padStart(2, "0")}
          </span>

          {/* Thumbnail */}
          <div className="relative aspect-video overflow-hidden">
            <Image
              src={project.thumbnail}
              alt={`${project.title} ${t("preview")}`}
              fill
              sizes="(min-width: 768px) 45vw, 90vw"
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
              <StatusBadge status={project.status} />
            </div>
            <span className="glass absolute right-3 top-3 rounded-full px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider text-foreground">
              {project.category}
            </span>
          </div>

          {/* Body */}
          <div className="relative flex flex-1 flex-col gap-3 p-5">
            <h3 className="text-lg font-semibold transition-colors group-hover:text-primary">
              {project.title}
            </h3>
            <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {t(project.shortDesc)}
            </p>
            <ul className="flex flex-wrap gap-2" aria-label={t("Technologies used")}>
              {visibleTech.map((tech) => (
                <li key={tech}>
                  <TechBadge name={tech} />
                </li>
              ))}
              {hiddenTech > 0 && (
                <li className="inline-flex items-center rounded-full border border-border/70 px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                  +{hiddenTech}
                </li>
              )}
            </ul>
            <div className="mt-auto flex items-center gap-4 pt-3">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) => event.stopPropagation()}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <ExternalLink className="size-3.5" aria-hidden />
                  {t("Live")}
                </a>
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) => event.stopPropagation()}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <Github className="size-3.5" aria-hidden />
                  {t("Code")}
                </a>
              )}
              <span className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-primary">
                {t("View")}
                <ArrowUpRight
                  aria-hidden
                  className={cn(
                    "size-4",
                    !reducedMotion &&
                      "-translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                  )}
                />
              </span>
            </div>
          </div>
        </article>
      </GlowCard>
    </TiltCard>
  );
}

export default function ProjectsView(): JSX.Element {
  const [activeFilter, setActiveFilter] = useState<ProjectCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const { t } = useLanguage();
  const reducedMotion = useReducedMotion();

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();
    return projects
      .filter((project) => {
        const matchesCategory = activeFilter === "all" || project.category === activeFilter;
        if (!matchesCategory) return false;
        if (!query) return true;
        return (
          project.title.toLowerCase().includes(query) ||
          project.shortDesc.toLowerCase().includes(query) ||
          project.techStack.some((tech) => tech.toLowerCase().includes(query))
        );
      })
      .sort((a, b) => compareProjects(a, b, sortOrder));
  }, [activeFilter, search, sortOrder]);

  const hasFilters = activeFilter !== "all" || search.trim() !== "";

  const resetFilters = (): void => {
    setActiveFilter("all");
    setSearch("");
  };

  return (
    <div className="relative mx-auto w-full max-w-6xl px-4 pb-20 pt-28 sm:px-6 sm:pb-28 sm:pt-32">
      <PageHeader
        eyebrow={t("Portfolio")}
        title={t("All Projects")}
        description={t("Everything I've built — shipped products, experiments, and open source.")}
      />

      {/* Controls: filter pills + search */}
      <FadeIn delay={0.1} className="mt-10 flex flex-col gap-4 sm:mt-12 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label={t("Filter projects by category")}>
          {PROJECT_FILTERS.map((filter) => {
            const isActive = activeFilter === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActiveFilter(filter.value)}
                aria-pressed={isActive}
                className={cn(
                  "relative rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  isActive
                    ? "border-primary text-primary-foreground"
                    : "border-border/70 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.span
                    aria-hidden
                    layoutId="projects-filter"
                    className="absolute inset-0 rounded-full bg-primary"
                    transition={
                      reducedMotion
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 400, damping: 32 }
                    }
                  />
                )}
                <span className="relative z-10">{t(filter.label)}</span>
              </button>
            );
          })}
        </div>
        <div className="relative w-full sm:w-auto">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("Search projects…")}
            aria-label={t("Search projects by name, description, or technology")}
            className="max-w-xs pl-9"
          />
        </div>
        {/* Sort order */}
        <div className="w-full sm:w-auto">
          <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as SortOrder)}>
            <SelectTrigger
              className="w-full max-w-[180px] font-mono text-xs"
              aria-label={t("Sort projects")}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {t(option.label)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </FadeIn>

      {/* Count */}
      <p aria-live="polite" className="mt-6 font-mono text-xs text-muted-foreground">
        {t("Showing")} {filteredProjects.length} {t("of")} {projects.length} {t("projects")}
      </p>

      {/* Grid */}
      {filteredProjects.length > 0 ? (
        <motion.div layout className="mt-6 grid gap-6 md:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => (
              <motion.div
                key={project.slug}
                layout
                initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                transition={{ duration: reducedMotion ? 0.15 : 0.25, ease: "easeOut" }}
                className="h-full"
              >
                <ProjectCard project={project} index={projects.indexOf(project)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <FadeIn className="py-20 text-center">
          <FolderSearch aria-hidden className="mx-auto size-12 text-muted-foreground/50" />
          <h2 className="mt-4 text-lg font-semibold text-foreground">
            {t("No projects match your filters")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("Try a different keyword or category.")}
          </p>
          {hasFilters && (
            <Button type="button" variant="outline" onClick={resetFilters} className="mt-6">
              {t("Reset filters")}
            </Button>
          )}
        </FadeIn>
      )}
    </div>
  );
}
