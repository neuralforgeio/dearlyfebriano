"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import {
  ArrowRight,
  Briefcase,
  Download,
  MapPin,
  MessageCircle,
} from "lucide-react";

import type { JSX } from "react";

import { Button } from "@/components/ui/button";

import FadeIn from "@/dearlyfebriano/components/animations/FadeIn";

import TextReveal from "@/dearlyfebriano/components/animations/TextReveal";

import Typewriter from "@/dearlyfebriano/components/animations/Typewriter";

import HireDialog from "@/dearlyfebriano/components/hire/HireDialog";

import { SocialIcon } from "@/dearlyfebriano/components/ui/SocialIcon";

import { profile, stats } from "@/dearlyfebriano/data/profile";

import { socialLinks } from "@/dearlyfebriano/data/socialLinks";

import { useLanguage } from "@/dearlyfebriano/i18n/language-context";

/* ============================================================
 * HeroSection
 * ------------------------------------------------------------
 * Main portfolio hero — editorial minimal:
 *
 * - Personal introduction
 * - Animated role/typewriter
 * - Availability indicator
 * - View My Work CTA
 * - Hire Me CTA
 * - Download CV
 * - Social profiles
 * - Static editorial avatar
 * ============================================================ */

export default function HeroSection(): JSX.Element {
  const reducedMotion = useReducedMotion();

  const { t } = useLanguage();

  const [hireDialogOpen, setHireDialogOpen] = useState(false);

  /* ============================================================
   * View My Work
   * ============================================================ */

  const handleViewWork = (): void => {
    document.getElementById("featured-projects")?.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
    });
  };

  /* ============================================================
   * Hire Me → WhatsApp
   *
   * Uses the centralized WhatsApp number
   * from profile.ts.
   * ============================================================ */

  return (
    <section
      id="hero"
      className="relative flex min-h-[92vh] items-center overflow-hidden pt-28 pb-16"
    >
      {/* ======================================================
       * Main content
       * ====================================================== */}

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* ====================================================
         * LEFT COLUMN
         * ==================================================== */}

        <div className="flex flex-col items-start gap-6">
          {/* -----------------------------------------------
           * Welcome eyebrow
           * ----------------------------------------------- */}

          <FadeIn delay={0} y={14}>
            <span className="eyebrow inline-flex items-center gap-2.5">
              <span>{t("Welcome to my portfolio")}</span>

              <span
                aria-hidden
                className="size-1.5 rounded-full bg-success"
              />
            </span>
          </FadeIn>

          {/* -----------------------------------------------
           * Name
           * ----------------------------------------------- */}

          <h1
            className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl"
            aria-label="Hi, I'm Dearly Febriano Irwansyah."
          >
            <TextReveal
             text={t("Hi, I'm")}
              mode="char"
              stagger={0.05}
              delay={0.15}
              className="block text-foreground"
            />

            <motion.span
              className="block tracking-[-0.03em] text-foreground"
              initial={
                reducedMotion
                  ? {
                      opacity: 0,
                    }
                  : {
                      opacity: 0,
                      y: 26,
                    }
              }
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.5,
                delay: 0.4,
                ease: "easeOut",
              }}
            >
              Dearly Febriano Irwansyah.
            </motion.span>
          </h1>

          {/* -----------------------------------------------
           * Role typewriter
           * ----------------------------------------------- */}

          <FadeIn delay={0.55} y={14}>
            <p className="text-lg font-sans text-muted-foreground sm:text-xl">
              <Typewriter words={profile.roles.map((role) => t(role))} />
            </p>
          </FadeIn>

          {/* -----------------------------------------------
           * Tagline
           * ----------------------------------------------- */}

          <FadeIn delay={0.65}>
            <p className="max-w-xl leading-relaxed text-muted-foreground">
              {t(profile.tagline)}
            </p>
          </FadeIn>

          {/* ==================================================
           * Availability + quick facts
           * ================================================== */}

          <FadeIn delay={0.7} y={12} className="w-full">
            <div className="flex flex-wrap items-center gap-2">
              {/* Main availability */}

              <div className="inline-flex items-center gap-2 rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground">
                <span
                  aria-hidden
                  className="size-2 rounded-full bg-success"
                />

                <span className="font-medium text-foreground">
                  {t("Available for Freelance")}
                </span>
              </div>

              {/* Remote work */}

              <div className="inline-flex items-center gap-2 rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground">
                <Briefcase className="size-3.5" aria-hidden />

                {t("Open to Remote Work")}
              </div>

              {/* Location */}

              <div className="inline-flex items-center gap-2 rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground">
                <MapPin aria-hidden className="size-3.5" />

                {profile.locationShort}
              </div>

              {/* Experience */}

              <div className="inline-flex items-center gap-2 rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground">
                <Briefcase aria-hidden className="size-3.5" />

                {stats.years}+ {t("yrs experience")}
              </div>
            </div>
          </FadeIn>

          {/* ==================================================
           * MAIN CTA
           * ================================================== */}

          <FadeIn delay={0.78} className="w-full sm:w-auto">
            <div className="flex flex-wrap items-center gap-3">
              {/* ==============================================
               * VIEW MY WORK
               * ============================================== */}

              <Button
                size="lg"
                onClick={handleViewWork}
                className="group bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {t("View My Work")}

                <ArrowRight
                  aria-hidden
                  className="size-4 transition-transform duration-200"
                />
              </Button>

              {/* ==============================================
               * HIRE ME
               * ============================================== */}

              <Button
                size="lg"
                type="button"
                variant="outline"
                onClick={() => setHireDialogOpen(true)}
                className="group border-border bg-transparent text-foreground hover:bg-secondary"
                aria-label={t("Open project inquiry")}
              >
                <MessageCircle
                  aria-hidden
                  className="size-4"
                />

                {t("Hire Me")}
              </Button>

              {/* ==============================================
               * DOWNLOAD CV
               * ============================================== */}

              <Button
                size="lg"
                variant="ghost"
                asChild
                className="group text-muted-foreground hover:text-foreground"
              >
                <a href={profile.resumeUrl} download>
                  {t("Download CV")}

                  <Download
                    aria-hidden
                    className="size-4 transition-transform duration-200 group-hover:translate-y-px"
                  />
                </a>
              </Button>
            </div>
          </FadeIn>

          {/* ==================================================
           * Trust micro-copy
           * ================================================== */}

          <FadeIn delay={0.82}>
            <p className="eyebrow max-w-xl">
              {t(
                "Available for freelance projects and software engineering opportunities",
              )}
            </p>
          </FadeIn>

          {/* ==================================================
           * SOCIALS
           * ================================================== */}

          <div
            className="flex items-center gap-5"
            aria-label={t("Social profiles")}
          >
            {socialLinks.map((social, index) => (
              <motion.a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${social.label} (${t("opens in new tab")})`}
                initial={
                  reducedMotion
                    ? {
                        opacity: 0,
                      }
                    : {
                        opacity: 0,
                        y: 12,
                      }
                }
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.4,
                  delay: 0.85 + index * 0.08,
                  ease: "easeOut",
                }}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <SocialIcon icon={social.icon} className="size-5" />
              </motion.a>
            ))}
          </div>
        </div>

        {/* ====================================================
         * RIGHT COLUMN — AVATAR (editorial, static)
         * ==================================================== */}

        <motion.div
          className="relative z-10"
          initial={
            reducedMotion
              ? {
                  opacity: 0,
                }
              : {
                  opacity: 0,
                  scale: 0.9,
                }
          }
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={
            reducedMotion
              ? {
                  duration: 0.3,
                }
              : {
                  type: "spring",
                  stiffness: 90,
                  damping: 18,
                  delay: 0.3,
                }
          }
        >
          <div className="relative mx-auto size-64 sm:size-72 lg:size-80">
            {/* Static halo — hairline ring offset */}

            <div
              aria-hidden
              className="absolute -inset-3 rounded-full border border-border"
            />

            {/* Photo */}

            <div className="relative size-full overflow-hidden rounded-full ring-1 ring-border">
              <Image
                src={profile.avatar}
                alt="Portrait of Dearly Febriano Irwansyah"
                fill
                priority
                sizes="(min-width: 1024px) 320px, 256px"
                className="object-cover"
              />
            </div>
          </div>
        </motion.div>
      </div>

      <HireDialog
        open={hireDialogOpen}
        onClose={() => setHireDialogOpen(false)}
      />
    </section>
  );
}
