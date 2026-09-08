"use client";

import Image from "next/image";

import { motion, useReducedMotion } from "framer-motion";

import {
  ArrowRight,
  Briefcase,
  ChevronDown,
  Download,
  MapPin,
  MessageCircle,
} from "lucide-react";

import type { JSX } from "react";

import { Button } from "@/components/ui/button";

import FadeIn from "@/dearlyfebriano/components/animations/FadeIn";

import FloatingParticles from "@/dearlyfebriano/components/animations/FloatingParticles";

import MagneticButton from "@/dearlyfebriano/components/animations/MagneticButton";

import OrbitingBorder from "@/dearlyfebriano/components/animations/OrbitingBorder";

import TextReveal from "@/dearlyfebriano/components/animations/TextReveal";

import Typewriter from "@/dearlyfebriano/components/animations/Typewriter";

import { SocialIcon } from "@/dearlyfebriano/components/ui/SocialIcon";

import { TechIcon } from "@/dearlyfebriano/components/ui/TechIcon";

import { profile, stats } from "@/dearlyfebriano/data/profile";

import { socialLinks } from "@/dearlyfebriano/data/socialLinks";

import { useLanguage } from "@/dearlyfebriano/i18n/language-context";

import { cn } from "@/lib/utils";

/* ============================================================
 * HeroSection
 * ------------------------------------------------------------
 * Main portfolio hero:
 *
 * - Personal introduction
 * - Animated role/typewriter
 * - Availability indicator
 * - View My Work CTA
 * - Hire Me CTA
 * - Download CV
 * - Social profiles
 * - Animated avatar
 * ============================================================ */

interface FloatingBadge {
  name: string;
  position: string;
  duration: number;
  delay: number;
}

/* ============================================================
 * Floating technology badges around avatar
 * ============================================================ */

const FLOATING_BADGES: FloatingBadge[] = [
  {
    name: "React",
    position: "-right-3 top-16 sm:-right-10 sm:top-20",
    duration: 3.2,
    delay: 0.3,
  },
  {
    name: "TypeScript",
    position: "-left-2 top-4 hidden sm:block lg:-left-12 lg:top-10",
    duration: 4.4,
    delay: 0.75,
  },
  {
    name: "Node.js",
    position: "-left-3 bottom-14 sm:-left-12 sm:bottom-20",
    duration: 3.8,
    delay: 0.5,
  },
  {
    name: "Next.js",
    position: "-right-3 bottom-6 sm:-right-10 sm:bottom-10",
    duration: 4.1,
    delay: 0.9,
  },
];

/* ============================================================
 * Component
 * ============================================================ */

export default function HeroSection(): JSX.Element {
  const reducedMotion = useReducedMotion();

  const { t } = useLanguage();

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

  const whatsappUrl =
    `https://wa.me/${profile.whatsappNumber}` +
    `?text=${encodeURIComponent(
      "Hi Dearly, I found your portfolio and would like to discuss a software project.",
    )}`;

  return (
    <section
      id="hero"
      className="relative flex min-h-[92vh] items-center overflow-hidden pt-28 pb-16"
    >
      {/* ======================================================
       * Background
       * ====================================================== */}

      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        <motion.div
          className="absolute -left-40 -top-32 size-[380px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.20)_0%,rgba(99,102,241,0.08)_45%,transparent_70%)]"
          animate={
            reducedMotion
              ? undefined
              : {
                  x: 50,
                  y: 40,
                }
          }
          transition={{
            duration: 16,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute -right-40 top-1/4 size-[460px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.15)_0%,rgba(139,92,246,0.06)_45%,transparent_70%)]"
          animate={
            reducedMotion
              ? undefined
              : {
                  x: -45,
                  y: 55,
                }
          }
          transition={{
            duration: 18,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute -bottom-24 left-1/3 size-[320px] rounded-full bg-[radial-gradient(circle,rgba(167,139,250,0.10)_0%,rgba(167,139,250,0.04)_45%,transparent_70%)]"
          animate={
            reducedMotion
              ? undefined
              : {
                  x: 35,
                  y: -30,
                }
          }
          transition={{
            duration: 14,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        />

        <div className="absolute inset-0 bg-grid opacity-50 [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_70%)] [-webkit-mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_70%)]" />

        <FloatingParticles />
      </div>

      {/* ======================================================
       * Main content
       * ====================================================== */}

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* ====================================================
         * LEFT COLUMN
         * ==================================================== */}

        <div className="flex flex-col items-start gap-6">
          {/* -----------------------------------------------
           * Welcome badge
           * ----------------------------------------------- */}

          <FadeIn delay={0} y={14}>
            <span className="glass inline-flex items-center gap-2.5 rounded-full px-4 py-1.5 font-mono text-xs text-muted-foreground">
              <span aria-hidden>👋</span>

              <span>{t("Welcome to my portfolio")}</span>

              <span className="relative flex size-2" aria-hidden>
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75" />

                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
            </span>
          </FadeIn>

          {/* -----------------------------------------------
           * Name
           * ----------------------------------------------- */}

          <h1
            className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
            aria-label="Hi, I'm Dearly Febriano Irwansyah."
          >
            <TextReveal
              text={t("Hi, I'm")}
              mode="char"
              stagger={0.05}
              delay={0.15}
              className="block font-medium text-foreground"
            />

            <motion.span
              className="text-gradient block tracking-[-0.03em]"
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
                duration: 0.6,
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
            <p className="flex items-center gap-2 font-mono text-lg text-muted-foreground sm:text-xl">
              <span aria-hidden className="text-primary">
                $
              </span>

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
           * Availability badge
           * ================================================== */}

          <FadeIn delay={0.7} y={12} className="w-full">
            <div className="flex flex-wrap items-center gap-2">
              {/* Main availability */}

              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3.5 py-1.5 text-xs text-emerald-500 shadow-sm">
                <span className="relative flex size-2" aria-hidden>
                  {!reducedMotion && (
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  )}

                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                </span>

                <span className="font-medium">
                  {t("Available for Freelance")}
                </span>
              </div>

              {/* Remote work */}

              <div className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs text-muted-foreground">
                <Briefcase className="size-3.5 text-primary" aria-hidden />

                {t("Open to Remote Work")}
              </div>
            </div>
          </FadeIn>

          {/* ==================================================
           * Quick facts
           * ================================================== */}

          <FadeIn delay={0.72} y={12} className="w-full">
            <ul
              aria-label={t("Quick facts")}
              className="flex flex-wrap items-center gap-2"
            >
              <li className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
                <MapPin aria-hidden className="size-3.5 text-primary" />

                {profile.locationShort}
              </li>

              <li className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
                <Briefcase aria-hidden className="size-3.5 text-primary" />
                {stats.years}+ {t("yrs experience")}
              </li>
            </ul>
          </FadeIn>

          {/* ==================================================
           * MAIN CTA
           * ================================================== */}

          <FadeIn delay={0.78} className="w-full sm:w-auto">
            <div className="flex flex-wrap items-center gap-3">
              {/* ==============================================
               * VIEW MY WORK
               * ============================================== */}

              <MagneticButton>
                <Button
                  size="lg"
                  onClick={handleViewWork}
                  className="group bg-gradient-accent text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.28),0_10px_28px_-10px_rgba(99,102,241,0.65)] transition-shadow hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.34),0_14px_32px_-10px_rgba(139,92,246,0.7)] hover:opacity-95"
                >
                  {t("View My Work")}

                  <ArrowRight
                    aria-hidden
                    className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Button>
              </MagneticButton>

              {/* ==============================================
               * HIRE ME
               * ============================================== */}

              <MagneticButton>
                <Button
                  size="lg"
                  asChild
                  variant="outline"
                  className="group border-emerald-500/30 bg-emerald-500/5 text-foreground hover:border-emerald-500/50 hover:bg-emerald-500/10"
                >
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t("Hire me via WhatsApp")}
                  >
                    <MessageCircle
                      aria-hidden
                      className="size-4 text-emerald-500 transition-transform duration-300 group-hover:scale-110"
                    />

                    {t("Hire Me")}
                  </a>
                </Button>
              </MagneticButton>

              {/* ==============================================
               * DOWNLOAD CV
               * ============================================== */}

              <MagneticButton>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="group text-muted-foreground hover:text-foreground"
                >
                  <a href={profile.resumeUrl} download>
                    {t("Download CV")}

                    <Download
                      aria-hidden
                      className="size-4 transition-transform duration-300 group-hover:translate-y-0.5"
                    />
                  </a>
                </Button>
              </MagneticButton>
            </div>
          </FadeIn>

          {/* ==================================================
           * Trust micro-copy
           * ================================================== */}

          <FadeIn delay={0.82}>
            <p className="max-w-xl font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {t(
                "Available for freelance projects and software engineering opportunities",
              )}
            </p>
          </FadeIn>

          {/* ==================================================
           * SOCIALS
           * ================================================== */}

          <div
            className="flex items-center gap-3"
            aria-label={t("Social profiles")}
          >
            <span
              aria-hidden
              className="hidden h-px w-8 bg-gradient-to-r from-primary/60 to-transparent sm:block"
            />

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
                className="grid size-11 place-items-center rounded-full border border-border bg-transparent text-muted-foreground transition-all hover:-translate-y-1 hover:border-primary/60 hover:bg-primary/10 hover:text-primary"
              >
                <SocialIcon icon={social.icon} className="size-[18px]" />
              </motion.a>
            ))}
          </div>
        </div>

        {/* ====================================================
         * RIGHT COLUMN — AVATAR
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
            {/* Avatar background glow */}

            <div
              aria-hidden
              className="absolute inset-0 animate-[pulse_6s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.26)_0%,rgba(99,102,241,0.10)_50%,transparent_72%)]"
            />

            {/* Ambient shadow */}

            <div
              aria-hidden
              className="absolute inset-4 rounded-full bg-[radial-gradient(circle,rgba(0,0,0,0.38)_0%,rgba(0,0,0,0.16)_55%,transparent_75%)] dark:bg-[radial-gradient(circle,rgba(0,0,0,0.5)_0%,rgba(0,0,0,0.22)_55%,transparent_75%)]"
            />

            {/* Orbiting border */}

            <OrbitingBorder className="size-full">
              <div className="relative size-full overflow-hidden rounded-full ring-4 ring-background shadow-[0_24px_48px_rgba(0,0,0,0.45)]">
                <Image
                  src={profile.avatar}
                  alt="Portrait of Dearly Febriano Irwansyah"
                  fill
                  priority
                  sizes="(min-width: 1024px) 320px, 256px"
                  className="object-cover"
                />
              </div>
            </OrbitingBorder>

            {/* Floating technologies */}

            {FLOATING_BADGES.map((badge) => (
              <motion.div
                key={badge.name}
                aria-hidden
                className={cn("absolute z-20", badge.position)}
                animate={
                  reducedMotion
                    ? undefined
                    : {
                        y: [0, -10, 0],
                      }
                }
                transition={{
                  duration: badge.duration,
                  repeat: Infinity,
                  repeatType: "mirror",
                  ease: "easeInOut",
                  delay: badge.delay,
                }}
              >
                <span className="glass-flat inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-xs text-foreground/90 shadow-lg">
                  <TechIcon
                    name={badge.name}
                    className="size-3.5 text-primary"
                  />

                  {badge.name}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ======================================================
       * SCROLL HINT
       * ====================================================== */}

      <div
        aria-hidden
        className="absolute inset-x-0 bottom-6 z-10 hidden flex-col items-center gap-1 text-muted-foreground md:flex"
      >
        <span className="font-mono text-[10px] tracking-[0.3em]">SCROLL</span>

        <ChevronDown className="size-4 animate-bounce" />
      </div>
    </section>
  );
}
