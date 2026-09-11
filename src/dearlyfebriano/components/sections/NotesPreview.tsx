"use client";

import { ArrowRight, Calendar, Clock, Hash } from "lucide-react";
import FadeIn from "@/dearlyfebriano/components/animations/FadeIn";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/dearlyfebriano/components/ui/SectionHeading";
import { articles } from "@/dearlyfebriano/data/articles";
import { useLanguage } from "@/dearlyfebriano/i18n/language-context";
import { formatDateLong } from "@/dearlyfebriano/lib/helpers";
import { useUIStore } from "@/dearlyfebriano/store/ui-store";
import { cn } from "@/lib/utils";
import type { JSX } from "react";

/* ============================================================
 * NotesPreview — "Latest Notes" strip on the home page:
 * the three most recent tech notes + a link to the archive.
 * ============================================================ */

const CATEGORY_STYLES: Record<string, string> = {
  engineering: "border-border bg-secondary text-success",
  tutorial: "border-border bg-secondary text-primary",
  opinion: "border-border bg-secondary text-muted-foreground",
  career: "border-border bg-secondary text-muted-foreground",
};

export default function NotesPreview(): JSX.Element {
  const navigate = useUIStore((state) => state.navigate);
  const { t } = useLanguage();
  const latest = [...articles]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 3);

  return (
    <section id="notes-preview" className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
      <SectionHeading
        eyebrow={t("Tech Notes")}
        title={t("Latest writing")}
        description={t("Engineering deep dives and career notes — written the way I wish I'd found them.")}
      />

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {latest.map((article, index) => (
          <FadeIn key={article.slug} delay={index * 0.07} className="h-full">
            <div className="h-full">
              <article
                role="link"
                tabIndex={0}
                aria-label={`${t(article.title)} — ${t("open article")}`}
                onClick={() => navigate("note-detail", article.slug)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    navigate("note-detail", article.slug);
                  }
                }}
                className=" group relative flex h-full cursor-pointer flex-col rounded-xl border border-border bg-card p-6 transition-all duration-300.5 hover:border-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full border px-2.5 py-0.5 font-mono text-[11px] capitalize",
                      CATEGORY_STYLES[article.category]
                    )}
                  >
                    {article.category}
                  </span>
                  <span className="ml-auto font-mono text-[11px] text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                  {t(article.title)}
                </h3>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                  {t(article.excerpt)}
                </p>

                <ul className="mt-4 flex flex-wrap gap-1.5" aria-label={t("Article tags")}>
                  {article.tags.slice(0, 2).map((tag) => (
                    <li
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground"
                    >
                      <Hash className="size-2.5 text-primary/70" aria-hidden />
                      {tag}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                  <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="size-3" aria-hidden />
                      {formatDateLong(article.publishedAt)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="size-3" aria-hidden />
                      {article.readingMinutes}m
                    </span>
                  </p>
                  <ArrowRight
                    aria-hidden
                    className="size-4 shrink-0 text-primary transition-transform duration-300"
                  />
                </div>
              </article>
            </div>
          </FadeIn>
        ))}
      </div>

      <FadeIn delay={0.2} className="mt-10 flex justify-center">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => navigate("notes")}
          className="group gap-2"
        >
          {t("Browse all notes")}
          <ArrowRight
            aria-hidden
            className="size-4 transition-transform duration-300"
          />
        </Button>
      </FadeIn>
    </section>
  );
}
