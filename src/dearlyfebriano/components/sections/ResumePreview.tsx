"use client";

import {
  Briefcase,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  Mail,
  MapPin,
  MessageCircle,
} from "lucide-react";

import type { JSX } from "react";

import { Button } from "@/components/ui/button";

import FadeIn from "@/dearlyfebriano/components/animations/FadeIn";

import { useLanguage } from "@/dearlyfebriano/i18n/language-context";

import { profile, stats } from "@/dearlyfebriano/data/profile";

/* ============================================================
 * ResumePreview
 *
 * Resume / CV center for the portfolio.
 *
 * Features:
 * - Resume summary
 * - Embedded PDF preview
 * - Open resume in new tab
 * - Download PDF
 * - WhatsApp CTA
 * - Email CTA
 * - Key resume highlights
 * ============================================================ */

const HIGHLIGHTS = [
  "Fullstack software development",
  "Backend & scalable systems",
  "AI agent development",
  "End-to-end product development",
  "Problem solving & software architecture",
  "Freelance software engineering",
];

export default function ResumePreview(): JSX.Element {
  const { t } = useLanguage();

  const whatsappUrl =
    `https://wa.me/${profile.whatsappNumber}` +
    `?text=${encodeURIComponent(
      "Hi Dearly, I found your portfolio and would like to discuss a software engineering opportunity or project.",
    )}`;

  const emailUrl =
    `mailto:${profile.email}` +
    `?subject=${encodeURIComponent(
      "Software Engineering Opportunity / Project",
    )}`;

  return (
    <section id="resume" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* ====================================================
         * SECTION HEADER
         * ==================================================== */}

        <FadeIn>
          <div className="flex flex-col gap-4">
            <span className="eyebrow text-primary">
              {t("Resume")}
            </span>

            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {t("Professional profile & CV")}
            </h2>

            <p className="max-w-2xl leading-relaxed text-muted-foreground">
              {t(
                "A concise overview of my experience, skills, projects, and software engineering focus.",
              )}
            </p>
          </div>
        </FadeIn>

        {/* ====================================================
         * TOP PROFILE CARD
         * ==================================================== */}

        <FadeIn delay={0.08} className="mt-10">
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
              {/* =================================================
               * PROFILE
               * ================================================= */}

              <div className="p-6 sm:p-8 lg:p-10">
                <div className="flex items-start gap-4">
                  {/* Icon */}

                  <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <FileText className="size-5" aria-hidden />
                  </div>

                  {/* Name */}

                  <div className="min-w-0">
                    <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-primary">
                      Curriculum Vitae
                    </p>

                    <h3 className="mt-1 text-xl font-semibold text-foreground sm:text-2xl">
                      {profile.fullName}
                    </h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {t(profile.roles[0])}
                    </p>
                  </div>
                </div>

                {/* Summary */}

                <p className="mt-6 max-w-2xl leading-relaxed text-muted-foreground">
                  {t(profile.tagline)}
                </p>

                {/* Facts */}

                <div className="mt-6 flex flex-wrap gap-2">
                  {/* Location */}

                  <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/50 px-3 py-1.5 text-xs text-muted-foreground">
                    <MapPin className="size-3.5 text-primary" aria-hidden />

                    {profile.locationShort}
                  </span>

                  {/* Experience */}

                  <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/50 px-3 py-1.5 text-xs text-muted-foreground">
                    <Briefcase className="size-3.5 text-primary" aria-hidden />
                    {stats.years}+ {t("yrs experience")}
                  </span>

                  {/* Availability */}

                  <span className="inline-flex items-center gap-2 rounded-full border border-border bg-transparent px-3 py-1.5 text-xs text-success">
                    <span
                      className="size-1.5 rounded-full bg-success"
                      aria-hidden
                    />

                    {t(profile.availability)}
                  </span>
                </div>

                {/* Buttons */}

                <div className="mt-7 flex flex-wrap gap-3">
                  <Button
                    asChild
                    className="bg-primary text-white shadow-lg hover:opacity-90"
                  >
                    <a
                      href={profile.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="size-4" aria-hidden />

                      {t("View Resume")}
                    </a>
                  </Button>

                  <Button asChild variant="outline">
                    <a href={profile.resumeUrl} download>
                      <Download className="size-4" aria-hidden />

                      {t("Download PDF")}
                    </a>
                  </Button>
                </div>
              </div>

              {/* =================================================
               * HIGHLIGHTS
               * ================================================= */}

              <div className="border-t border-border bg-background/30 p-6 sm:p-8 lg:border-l lg:border-t-0 lg:p-10">
                <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-primary">
                  {t("Highlights")}
                </p>

                <h3 className="mt-2 text-xl font-semibold text-foreground">
                  {t("What I focus on")}
                </h3>

                <ul className="mt-5 space-y-3">
                  {HIGHLIGHTS.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2
                        className="mt-0.5 size-4 shrink-0 text-primary"
                        aria-hidden
                      />

                      <span className="text-sm leading-relaxed text-muted-foreground">
                        {t(item)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* ====================================================
         * PDF PREVIEW
         * ==================================================== */}

        <FadeIn delay={0.12} className="mt-8">
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            {/* PDF toolbar */}

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-4 py-3 sm:px-5">
              <div className="flex items-center gap-3">
                <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="size-4" aria-hidden />
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground">
                    {t("Resume Preview")}
                  </p>

                  <p className="font-mono text-[10px] text-muted-foreground">
                    PDF · {profile.fullName}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm" variant="ghost">
                  <a
                    href={profile.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="size-3.5" aria-hidden />
                    {t("Open")}
                  </a>
                </Button>

                <Button asChild size="sm" variant="outline">
                  <a href={profile.resumeUrl} download>
                    <Download className="size-3.5" aria-hidden />
                    {t("Download")}
                  </a>
                </Button>
              </div>
            </div>

            {/* PDF */}

            <div className="bg-muted/20 p-2 sm:p-4">
              <div className="overflow-hidden rounded-xl border border-border bg-background">
                <iframe
                  src={`${profile.resumeUrl}#view=FitH`}
                  title={`${profile.fullName} — Resume`}
                  className="h-[700px] w-full sm:h-[850px] lg:h-[1000px]"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </FadeIn>

        {/* ====================================================
         * CONTACT CTA
         * ==================================================== */}

        <FadeIn delay={0.15} className="mt-8">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* WhatsApp */}

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-xl border border-[#25D366]/25 bg-[#25D366]/5 p-5 transition-all duration-300 hover:border-[#25D366]/40 hover:bg-[#25D366]/10"
            >
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-[#25D366]/10 text-[#25D366]">
                  <MessageCircle className="size-5" aria-hidden />
                </div>

                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {t("Interested?")}
                  </p>

                  <h3 className="font-semibold text-foreground transition-colors group-hover:text-[#25D366]">
                    {t("Discuss a project")}
                  </h3>
                </div>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {t(
                  "Let's discuss your software project or engineering opportunity.",
                )}
              </p>

              <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-[#25D366]">
                {t("Chat on WhatsApp")}

                <ExternalLink
                  className="size-3.5 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </span>
            </a>

            {/* Email */}

            <a
              href={emailUrl}
              className="group rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:border-foreground/25"
            >
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Mail className="size-5" aria-hidden />
                </div>

                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {t("Professional inquiries")}
                  </p>

                  <h3 className="font-semibold text-foreground transition-colors group-hover:text-primary">
                    {t("Contact by email")}
                  </h3>
                </div>
              </div>

              <p className="mt-3 truncate text-sm text-muted-foreground">
                {profile.email}
              </p>

              <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                {t("Send an email")}

                <ExternalLink
                  className="size-3.5 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </span>
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
