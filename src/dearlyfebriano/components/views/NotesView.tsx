"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Calendar, Clock, FileText, Hash, NotebookPen, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FadeIn from "@/dearlyfebriano/components/animations/FadeIn";
import GlowCard from "@/dearlyfebriano/components/animations/GlowCard";
import TiltCard from "@/dearlyfebriano/components/animations/TiltCard";
import {
  allArticleTags,
  articles,
  featuredArticles,
} from "@/dearlyfebriano/data/articles";
import { formatDateLong } from "@/dearlyfebriano/lib/helpers";
import { useUIStore } from "@/dearlyfebriano/store/ui-store";
import { useLanguage } from "@/dearlyfebriano/i18n/language-context";
import type { Article } from "@/dearlyfebriano/types";
import { cn } from "@/lib/utils";
import type { JSX } from "react";

/* ============================================================
 * NotesView — index of tech notes: featured article banner,
 * tag filter pills, live search, and reading cards.
 * ============================================================ */

const CATEGORY_STYLES: Record<Article["category"], string> = {
  engineering: "border-emerald-500/40 bg-emerald-500/10 text-emerald-500",
  tutorial: "border-primary/40 bg-primary/10 text-primary",
  opinion: "border-amber-500/40 bg-amber-500/10 text-amber-500",
  career: "border-violet-500/40 bg-violet-500/10 text-violet-400",
};

const MAX_VISIBLE_TAGS = 3;

function ArticleMeta({ article, className }: { article: Article; className?: string }): JSX.Element {
  const { t } = useLanguage();
  return (
    <p className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted-foreground", className)}>
      <span className="inline-flex items-center gap-1.5">
        <Calendar className="size-3" aria-hidden />
        {formatDateLong(article.publishedAt)}
      </span>
      <span aria-hidden>·</span>
      <span className="inline-flex items-center gap-1.5">
        <Clock className="size-3" aria-hidden />
        {article.readingMinutes} {t("min read")}
      </span>
    </p>
  );
}

function FeaturedCard({ article }: { article: Article }): JSX.Element {
  const navigate = useUIStore((state) => state.navigate);
  const { t } = useLanguage();
  const reducedMotion = useReducedMotion();

  return (
    <FadeIn y={20} delay={0.1}>
      <TiltCard maxTilt={4}>
        <article
          role="link"
          tabIndex={0}
          aria-label={`${article.title} — ${t("open article")}`}
          onClick={() => navigate("note-detail", article.slug)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              navigate("note-detail", article.slug);
            }
          }}
          className="gradient-border group relative block w-full cursor-pointer overflow-hidden rounded-2xl p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:p-8"
        >
          {/* Ambient orbs */}
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-primary/20 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-20 -left-10 size-48 rounded-full bg-[#8b5cf6]/15 blur-3xl" />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-8">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="glass rounded-full px-3 py-0.5 font-mono text-[11px] uppercase tracking-wider text-foreground">
                  {t("Featured")}
                </span>
                <span
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 font-mono text-[11px] capitalize",
                    CATEGORY_STYLES[article.category]
                  )}
                >
                  {t(article.category)}
                </span>
              </div>
              <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-3xl">
                {t(article.title)}
              </h2>
              <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
                {t(article.excerpt)}
              </p>
              <ArticleMeta article={article} className="mt-5" />
              <Button
                type="button"
                tabIndex={-1}
                className="mt-6 bg-gradient-accent text-white shadow-lg shadow-primary/25 hover:opacity-90"
                aria-hidden
              >
                {t("Read article")}
                <ArrowUpRight
                  className={cn(
                    "size-4",
                    !reducedMotion && "transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  )}
                />
              </Button>
            </div>
          </div>
        </article>
      </TiltCard>
    </FadeIn>
  );
}

function ArticleCard({ article, index }: { article: Article; index: number }): JSX.Element {
  const navigate = useUIStore((state) => state.navigate);
  const { t } = useLanguage();
  const visibleTags = article.tags.slice(0, MAX_VISIBLE_TAGS);
  const hiddenTags = article.tags.length - visibleTags.length;

  return (
    <FadeIn delay={0.05 * index} className="h-full">
      <TiltCard className="h-full">
        <GlowCard className="h-full">
          <article
            role="link"
            tabIndex={0}
            aria-label={`${article.title} — ${t("open article")}`}
            onClick={() => navigate("note-detail", article.slug)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                navigate("note-detail", article.slug);
              }
            }}
            className="card-shine group relative flex h-full cursor-pointer flex-col rounded-2xl border border-border/70 bg-card/60 p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {/* Ghost index number */}
            <span
              aria-hidden
              className="text-gradient pointer-events-none absolute -top-1 right-4 font-mono text-5xl font-black opacity-[0.08] transition-opacity duration-300 group-hover:opacity-20"
            >
              {String(index + 1).padStart(2, "0")}
            </span>

            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "rounded-full border px-2.5 py-0.5 font-mono text-[11px] capitalize",
                  CATEGORY_STYLES[article.category]
                )}
              >
                {t(article.category)}
              </span>
            </div>

            <h3 className="mt-3 pr-10 text-lg font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
              {t(article.title)}
            </h3>
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
              {t(article.excerpt)}
            </p>

            <ul className="mt-4 flex flex-wrap gap-1.5" aria-label={t("Article tags")}>
              {visibleTags.map((tag) => (
                <li
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full border border-border/70 px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground"
                >
                  <Hash className="size-2.5 text-primary/70" aria-hidden />
                  {tag}
                </li>
              ))}
              {hiddenTags > 0 && (
                <li className="inline-flex items-center rounded-full border border-border/70 px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                  +{hiddenTags}
                </li>
              )}
            </ul>

            <div className="mt-auto flex items-center justify-between gap-4 pt-5">
              <ArticleMeta article={article} />
              <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                {t("Read")}
                <ArrowUpRight
                  aria-hidden
                  className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </span>
            </div>
          </article>
        </GlowCard>
      </TiltCard>
    </FadeIn>
  );
}

export default function NotesView(): JSX.Element {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const { t } = useLanguage();

  const featured = featuredArticles[0];
  const restArticles = useMemo(
    () => articles.filter((a) => a.slug !== featured?.slug),
    [featured?.slug]
  );

  const filteredArticles = useMemo(() => {
    const query = search.trim().toLowerCase();
    return restArticles.filter((article) => {
      const matchesTag = !activeTag || article.tags.includes(activeTag);
      if (!matchesTag) return false;
      if (!query) return true;
      return (
        article.title.toLowerCase().includes(query) ||
        article.excerpt.toLowerCase().includes(query) ||
        article.tags.some((tag) => tag.toLowerCase().includes(query)) ||
        article.category.toLowerCase().includes(query)
      );
    });
  }, [restArticles, activeTag, search]);

  /* Tag counts for the filter pills. */
  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const article of restArticles) {
      for (const tag of article.tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    return counts;
  }, [restArticles]);

  const hasFilters = activeTag !== null || search.trim() !== "";

  const resetFilters = (): void => {
    setActiveTag(null);
    setSearch("");
  };

  return (
    <div className="relative mx-auto w-full max-w-6xl px-4 pb-20 pt-28 sm:px-6 sm:pb-28 sm:pt-32">
      {/* Header */}
      <FadeIn y={20} className="flex flex-col gap-4">
        <span className="font-mono text-xs uppercase tracking-[0.25em] text-primary">
          {t("Tech Notes")}
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          {t("Writing & Notes")}
        </h1>
        <p className="max-w-2xl leading-relaxed text-muted-foreground">
          {t("Things I learned the hard way — engineering deep dives, tutorials, and career notes from building products in production.")}
        </p>
      </FadeIn>

      {/* Featured article */}
      {featured && !hasFilters && (
        <section aria-label={t("Featured article")} className="mt-10">
          <FeaturedCard article={featured} />
        </section>
      )}

      {/* Controls: tag pills + search */}
      <FadeIn
        delay={0.1}
        className="mt-10 flex flex-col gap-4 sm:mt-12 sm:flex-row sm:items-center sm:justify-between"
      >
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label={t("Filter articles by tag")}
        >
          <button
            type="button"
            onClick={() => setActiveTag(null)}
            aria-pressed={activeTag === null}
            className={cn(
              "relative rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              activeTag === null
                ? "border-primary text-primary"
                : "border-border/70 text-muted-foreground hover:border-primary/40 hover:text-foreground"
            )}
          >
            {t("All")}
          </button>
          {allArticleTags.map((tag) => {
            const isActive = activeTag === tag;
            const count = tagCounts.get(tag) ?? 0;
            if (count === 0 && !isActive) return null;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setActiveTag(isActive ? null : tag)}
                aria-pressed={isActive}
                className={cn(
                  "relative rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  isActive
                    ? "border-primary text-primary"
                    : "border-border/70 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                )}
              >
                {tag}
                <span className="ml-1.5 font-mono text-[10px] text-muted-foreground">
                  {count}
                </span>
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
            placeholder={t("Search notes…")}
            aria-label={t("Search articles by title, tag, or category")}
            className="max-w-xs pl-9"
          />
        </div>
      </FadeIn>

      {/* Count */}
      <p aria-live="polite" className="mt-6 font-mono text-xs text-muted-foreground">
        {hasFilters
          ? `${filteredArticles.length} ${t("of")} ${restArticles.length} ${t("notes")}`
          : `${restArticles.length} ${t("notes and counting")}`}
      </p>

      {/* Grid */}
      {filteredArticles.length > 0 ? (
        <motion.div layout className="mt-6 grid gap-6 md:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {filteredArticles.map((article, index) => (
              <motion.div
                key={article.slug}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="h-full"
              >
                <ArticleCard
                  article={article}
                  index={restArticles.indexOf(article)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <FadeIn className="py-20 text-center">
          <NotebookPen aria-hidden className="mx-auto size-12 text-muted-foreground/50" />
          <h2 className="mt-4 text-lg font-semibold text-foreground">{t("No notes match your filters")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t("Try a different keyword or tag.")}</p>
          {hasFilters && (
            <Button type="button" variant="outline" onClick={resetFilters} className="mt-6">
              {t("Reset filters")}
            </Button>
          )}
        </FadeIn>
      )}

      {/* Footnote */}
      <FadeIn delay={0.15} className="mt-14">
        <p className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <FileText className="size-3.5 text-primary/70" aria-hidden />
          {t("More notes are drafted — new articles ship roughly once a month.")}
        </p>
      </FadeIn>
    </div>
  );
}
