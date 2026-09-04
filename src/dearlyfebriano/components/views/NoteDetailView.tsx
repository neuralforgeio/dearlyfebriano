"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { FaLinkedin, FaWhatsapp } from "react-icons/fa6";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  Clock,
  Compass,
  Copy,
  FileText,
  Info,
  Lightbulb,
  Link2,
  Quote,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import FadeIn from "@/dearlyfebriano/components/animations/FadeIn";
import { getAdjacentArticles, getArticleBySlug, getRelatedArticles } from "@/dearlyfebriano/data/articles";
import { profile } from "@/dearlyfebriano/data/profile";
import { formatDateLong } from "@/dearlyfebriano/lib/helpers";
import { useUIStore } from "@/dearlyfebriano/store/ui-store";
import { useLanguage } from "@/dearlyfebriano/i18n/language-context";
import type { Article, ArticleSection } from "@/dearlyfebriano/types";
import { cn } from "@/lib/utils";
import type { JSX, MouseEvent as ReactMouseEvent, RefObject } from "react";

/* ============================================================
 * NoteDetailView — long-form reading experience for one note:
 * TOC with scrollspy (xl+), rich content blocks, copy-code
 * buttons, share link, and prev/next navigation.
 * ============================================================ */

const CALLOUT_STYLES = {
  tip: { icon: Lightbulb, classes: "border-emerald-500/40 bg-emerald-500/5", iconClasses: "text-emerald-500" },
  warning: { icon: TriangleAlert, classes: "border-amber-500/40 bg-amber-500/5", iconClasses: "text-amber-500" },
  info: { icon: Info, classes: "border-primary/40 bg-primary/5", iconClasses: "text-primary" },
} as const;

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/* ---------------------------------------------------------------
 * ReadingProgress — sticky progress pill: seberapa jauh artikel
 * sudah dibaca (relatif terhadap elemen <article>).
 * --------------------------------------------------------------- */
function ReadingProgress({
  articleRef,
}: {
  articleRef: RefObject<HTMLElement | null>;
}): JSX.Element {
  const [progress, setProgress] = useState(0);
  const reducedMotion = useReducedMotion();
  const { t } = useLanguage();

  useEffect(() => {
    const el = articleRef.current;
    if (!el) return;

    let raf = 0;
    const update = (): void => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total <= 0) {
        setProgress(100);
        return;
      }
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      setProgress(Math.round((scrolled / total) * 100));
    };
    const onScroll = (): void => {
      if (raf === 0) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf !== 0) cancelAnimationFrame(raf);
    };
  }, [articleRef]);

  return (
    <div
      role="progressbar"
      aria-label={t("Reading progress")}
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      className="sticky top-20 z-20 mt-8 flex items-center gap-3 rounded-full border border-border/60 bg-background/75 py-1.5 pl-4 pr-3 backdrop-blur-md"
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        {t("Reading")}
      </span>
      <div aria-hidden className="h-1 flex-1 overflow-hidden rounded-full bg-border/80">
        <div
          className={cn(
            "h-full rounded-full bg-gradient-accent",
            !reducedMotion && "transition-[width] duration-150 ease-out"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="w-9 text-right font-mono text-[10px] tabular-nums text-muted-foreground">
        {progress}%
      </span>
    </div>
  );
}

function CodeBlock({ language, code }: { language: string; code: string }): JSX.Element {
  const [copied, setCopied] = useState(false);
  const { t } = useLanguage();

  const handleCopy = async (event: ReactMouseEvent<HTMLButtonElement>): Promise<void> => {
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success(t("Code copied to clipboard"));
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error(t("Could not copy — clipboard unavailable"));
    }
  };

  return (
    <figure className="overflow-hidden rounded-xl border border-border/70">
      <figcaption className="flex items-center justify-between border-b border-border/70 bg-secondary/60 px-4 py-2">
        <span className="flex items-center gap-3">
          {/* Mac-style traffic lights */}
          <span aria-hidden className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
          </span>
          <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            {language}
          </span>
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={`${t("Copy")} ${language} ${t("code to clipboard")}`}
          className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 font-mono text-[11px] text-muted-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-emerald-500" aria-hidden />
              {t("Copied")}
            </>
          ) : (
            <>
              <Copy className="size-3.5" aria-hidden />
              {t("Copy")}
            </>
          )}
        </button>
      </figcaption>
      <pre className="overflow-x-auto bg-[#0d0d11] p-4 dark:bg-black/60">
        <code className="font-mono text-[13px] leading-relaxed text-[#e4e4ef]">{code}</code>
      </pre>
    </figure>
  );
}

function SectionBlock({
  section,
  headingNumber,
}: {
  section: ArticleSection;
  headingNumber: number;
}): JSX.Element {
  switch (section.type) {
    case "paragraph":
      return (
        <p className="text-base leading-[1.85] text-foreground/90 sm:text-lg">
          {section.text}
        </p>
      );
    case "heading": {
      const id = slugifyHeading(section.text);
      return (
        <h2
          id={id}
          className="scroll-mt-28 pt-4 text-xl font-bold tracking-tight text-foreground sm:text-2xl"
        >
          <span aria-hidden className="mr-3 font-mono text-sm text-primary/70">
            {String(headingNumber).padStart(2, "0")}
          </span>
          {section.text}
        </h2>
      );
    }
    case "list":
      return (
        <ul className="space-y-2.5">
          {section.items.map((item) => (
            <li key={item} className="flex gap-3 text-base leading-relaxed text-foreground/90">
              <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-gradient-accent" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case "quote":
      return (
        <blockquote className="relative rounded-r-xl border-l-2 border-primary/70 bg-primary/5 py-4 pl-6 pr-4">
          <Quote aria-hidden className="absolute -left-3 -top-3 size-7 rounded-full bg-background p-1 text-primary" />
          <p className="text-base italic leading-relaxed text-foreground/90">{section.text}</p>
          {section.author && (
            <footer className="mt-2 font-mono text-xs text-muted-foreground">
              — {section.author}
            </footer>
          )}
        </blockquote>
      );
    case "code":
      return <CodeBlock language={section.language} code={section.code} />;
    case "callout": {
      const { icon: Icon, classes, iconClasses } = CALLOUT_STYLES[section.variant];
      return (
        <aside className={cn("flex gap-3 rounded-xl border p-4", classes)}>
          <Icon aria-hidden className={cn("mt-0.5 size-5 shrink-0", iconClasses)} />
          <p className="text-sm leading-relaxed text-foreground/90">{section.text}</p>
        </aside>
      );
    }
  }
}

export default function NoteDetailView(): JSX.Element {
  const noteSlug = useUIStore((state) => state.noteSlug);
  const navigate = useUIStore((state) => state.navigate);
  const reducedMotion = useReducedMotion();
  const { t } = useLanguage();
  const [activeHeading, setActiveHeading] = useState<string | null>(null);
  const articleRef = useRef<HTMLElement>(null);

  const article = noteSlug ? getArticleBySlug(noteSlug) : undefined;

  /* TOC entries: headings only, with stable slugs. */
  const headings = useMemo(() => {
    if (!article) return [];
    let counter = 0;
    return article.sections
      .filter((s): s is Extract<ArticleSection, { type: "heading" }> => s.type === "heading")
      .map((s) => {
        counter += 1;
        return { id: slugifyHeading(s.text), text: s.text, number: counter };
      });
  }, [article]);

  /* Sections with pre-computed heading numbers (immutable derivation). */
  const numberedSections = useMemo(() => {
    if (!article) return [];
    let counter = 0;
    return article.sections.map((section) => {
      if (section.type === "heading") counter += 1;
      return { section, headingNumber: counter };
    });
  }, [article]);

  /* Scrollspy via IntersectionObserver. */
  useEffect(() => {
    if (!article || headings.length === 0) return;
    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveHeading(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [article, headings]);

  const scrollToHeading = useCallback(
    (id: string) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start",
      });
      setActiveHeading(id);
    },
    [reducedMotion]
  );

  const shareArticle = async (): Promise<void> => {
    const url = `${window.location.origin}${window.location.pathname}#notes/${article?.slug ?? ""}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t("Article link copied to clipboard"));
    } catch {
      toast.error(t("Could not copy the link."));
    }
  };

  /* Share ke jaringan sosial (tab baru). */
  const shareTo = (network: "whatsapp" | "linkedin"): void => {
    const url = `${window.location.origin}${window.location.pathname}#notes/${article?.slug ?? ""}`;
    const text = article ? `${article.title} — ${profile.fullName}` : profile.fullName;
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(text);
    const targets: Record<typeof network, string> = {
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    };
    window.open(targets[network], "_blank", "noopener,noreferrer");
  };

  if (!article) {
    return (
      <div className="relative mx-auto w-full max-w-4xl px-4 pb-20 pt-28 sm:px-6 sm:pb-28 sm:pt-32">
        <FadeIn className="py-20 text-center sm:py-28">
          <Compass aria-hidden className="mx-auto size-12 text-muted-foreground/50" />
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
            {t("Note not found")}
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {t("The note you are looking for doesn't exist or has been moved.")}
          </p>
          <Button
            type="button"
            onClick={() => navigate("notes")}
            className="mt-8 bg-gradient-accent text-white shadow-lg shadow-primary/25 hover:opacity-90"
          >
            <ArrowLeft className="size-4" aria-hidden />
            {t("Back to notes")}
          </Button>
        </FadeIn>
      </div>
    );
  }

  const { prev, next } = getAdjacentArticles(article.slug);
  const related = getRelatedArticles(article.slug, 2);

  return (
    <div className="relative mx-auto w-full max-w-6xl px-4 pb-20 pt-28 sm:px-6 sm:pb-28 sm:pt-32">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="font-mono text-xs text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <button
              type="button"
              onClick={() => navigate("notes")}
              className="transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {t("notes")}
            </button>
          </li>
          <li aria-hidden>/</li>
          <li className="text-primary" aria-current="page">
            {article.slug}
          </li>
        </ol>
      </nav>

      {/* Article header */}
      <FadeIn y={20} delay={0.05} className="mt-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="glass rounded-full px-3 py-0.5 font-mono text-[11px] capitalize text-foreground">
            {t(article.category)}
          </span>
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border/70 px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
        <h1 className="mt-5 max-w-3xl text-balance text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
          {t(article.title)}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          {t(article.excerpt)}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-y border-border/60 py-4">
          <div className="flex items-center gap-3">
            <Image
              src={profile.avatar}
              alt={profile.fullName}
              width={40}
              height={40}
              className="size-10 rounded-full ring-2 ring-border"
            />
            <div>
              <p className="text-sm font-medium text-foreground">{profile.fullName}</p>
              <p className="font-mono text-[11px] text-muted-foreground">{t(profile.roles[0])}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-3.5" aria-hidden />
              {formatDateLong(article.publishedAt)}
            </span>
            {article.updatedAt && (
              <span className="inline-flex items-center gap-1.5">
                ({t("updated")} {formatDateLong(article.updatedAt)})
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" aria-hidden />
              {article.readingMinutes} {t("min read")}
            </span>
          </div>
        </div>
      </FadeIn>

      {/* Sticky reading progress */}
      <ReadingProgress articleRef={articleRef} />

      {/* Body + TOC layout */}
      <div className="mt-10 grid gap-12 xl:grid-cols-[minmax(0,1fr)_220px]">
        {/* Article body */}
        <FadeIn delay={0.1}>
          <article ref={articleRef} className="flex max-w-3xl flex-col gap-7">
            {numberedSections.map(({ section, headingNumber }, index) => (
              <SectionBlock
                key={`${section.type}-${index}`}
                section={section}
                headingNumber={headingNumber}
              />
            ))}
          </article>

          {/* Share row */}
          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border/60 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("notes")}
              className="gap-2"
            >
              <ArrowLeft className="size-4" aria-hidden />
              {t("All notes")}
            </Button>
            <div className="flex flex-wrap items-center gap-2">
              <span
                aria-hidden
                className="mr-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
              >
                {t("Share")}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => shareTo("whatsapp")}
                aria-label={t("Share this article on WhatsApp")}
                className="size-9"
              >
                <FaWhatsapp className="size-4" aria-hidden />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => shareTo("linkedin")}
                aria-label={t("Share this article on LinkedIn")}
                className="size-9"
              >
                <FaLinkedin className="size-4" aria-hidden />
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={shareArticle}
                className="gap-2"
              >
                <Link2 className="size-4" aria-hidden />
                {t("Copy link")}
              </Button>
            </div>
          </div>
        </FadeIn>

        {/* TOC (xl+) */}
        <FadeIn delay={0.15} className="hidden xl:block">
          <nav
            aria-label={t("Table of contents")}
            className="sticky top-28 border-l border-border/60 pl-4"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {t("On this page")}
            </p>
            <ul className="mt-3 space-y-1">
              {headings.map((heading) => {
                const isActive = activeHeading === heading.id;
                return (
                  <li key={heading.id}>
                    <button
                      type="button"
                      onClick={() => scrollToHeading(heading.id)}
                      aria-current={isActive ? "true" : undefined}
                      className={cn(
                        "group flex w-full items-baseline gap-2 rounded-md py-1.5 pr-2 text-left text-xs leading-snug transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
                        isActive
                          ? "text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "font-mono text-[10px]",
                          isActive ? "text-primary" : "text-muted-foreground/50"
                        )}
                      >
                        {String(heading.number).padStart(2, "0")}
                      </span>
                      <span
                        className={cn(
                          "transition-transform",
                          isActive &&
                            !reducedMotion &&
                            "translate-x-0.5"
                        )}
                      >
                        {heading.text}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="mt-5 flex items-start gap-2 text-[11px] leading-relaxed text-muted-foreground/70">
              <FileText className="mt-0.5 size-3 shrink-0" aria-hidden />
              {article.sections.length} {t("blocks")} · {article.readingMinutes} {t("min")}
            </p>
          </nav>
        </FadeIn>
      </div>

      {/* Related notes */}
      {related.length > 0 && (
        <FadeIn delay={0.1} className="mt-14">
          <section aria-label={t("Related notes")}>
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                {t("Related notes")}
              </h2>
              <button
                type="button"
                onClick={() => navigate("notes")}
                className="font-mono text-xs text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {t("view all")} →
              </button>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {related.map((relatedArticle) => (
                <button
                  key={relatedArticle.slug}
                  type="button"
                  onClick={() => navigate("note-detail", relatedArticle.slug)}
                  aria-label={`${t("Read related note:")} ${relatedArticle.title}`}
                  className="card-shine group relative flex h-full flex-col gap-3 overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-2 -top-5 select-none font-mono text-6xl font-bold text-foreground/[0.04] transition-colors duration-300 group-hover:text-primary/10"
                  >
                    {String(related.indexOf(relatedArticle) + 1).padStart(2, "0")}
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary">
                      {t(relatedArticle.category)}
                    </span>
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                      <Clock aria-hidden className="size-3" />
                      {relatedArticle.readingMinutes} {t("min")}
                    </span>
                  </div>
                  <h3 className="font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                    {t(relatedArticle.title)}
                  </h3>
                  <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {t(relatedArticle.excerpt)}
                  </p>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-2 font-mono text-[11px] text-primary">
                    {t("Read note")}
                    <ArrowRight
                      aria-hidden
                      className={cn(
                        "size-3.5",
                        !reducedMotion && "transition-transform group-hover:translate-x-1"
                      )}
                    />
                  </span>
                </button>
              ))}
            </div>
          </section>
        </FadeIn>
      )}

      {/* Prev / Next navigation */}
      <nav aria-label="Article pagination" className="mt-16">
        <div className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            disabled={!prev}
            onClick={() => prev && navigate("note-detail", prev.slug)}
            aria-label={prev ? `${t("Previous article:")} ${prev.title}` : t("No previous article")}
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
              {t("Previous article")}
            </span>
            <span className="mt-2 block font-semibold transition-colors group-hover:text-primary">
              {prev?.title ?? t("You're at the start")}
            </span>
          </button>
          <button
            type="button"
            disabled={!next}
            onClick={() => next && navigate("note-detail", next.slug)}
            aria-label={next ? `${t("Next article:")} ${next.title}` : t("No next article")}
            className="group rounded-2xl border border-border/70 bg-card/60 p-5 text-right transition-all hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span className="flex items-center justify-end gap-2 font-mono text-xs text-muted-foreground">
              {t("Next article")}
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
    </div>
  );
}
