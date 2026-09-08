"use client";

import Image from "next/image";

import {
  ArrowRight,
  CheckCircle2,
  Code2,
  Mail,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import type { JSX } from "react";

import { Button } from "@/components/ui/button";

import FadeIn from "@/dearlyfebriano/components/animations/FadeIn";

import GlowCard from "@/dearlyfebriano/components/animations/GlowCard";

import { SectionHeading } from "@/dearlyfebriano/components/ui/SectionHeading";

import { useLanguage } from "@/dearlyfebriano/i18n/language-context";

/* ============================================================
 * ServicesSection
 *
 * Promotional software development service section.
 *
 * Main visual:
 *   /public/images/poster-joki.png
 *
 * Main purpose:
 *   - Promote custom software development services
 *   - Explain service scope
 *   - Explain workflow
 *   - Explain payment structure
 *   - Provide direct contact CTA
 * ============================================================ */

const SERVICES = [
  "Web Application",
  "Mobile Application",
  "Desktop Application",
  "REST API & Backend",
  "E-Commerce Development",
  "Dashboard & Admin Panel",
  "Authentication & Authorization",
  "Automation & Bot",
  "Deployment & Hosting",
];

const WORKFLOW = [
  {
    number: "01",
    title: "Free Consultation",
    description:
      "Discuss your idea, requirements, features, scope, and expected result.",
  },
  {
    number: "02",
    title: "Analysis & Estimation",
    description:
      "The project scope is analyzed and the estimated timeline and cost are prepared.",
  },
  {
    number: "03",
    title: "Project Development",
    description: "Development starts after the agreed 50% deposit is received.",
  },
  {
    number: "04",
    title: "Testing & Revision",
    description:
      "The project is tested and revised based on the agreed requirements.",
  },
  {
    number: "05",
    title: "Final Delivery",
    description:
      "The final project is delivered after the remaining payment is completed.",
  },
];

const ADVANTAGES = [
  "Fullstack development — frontend & backend",
  "Clean, structured, and scalable code",
  "Modern and responsive UI/UX",
  "Performance and security focused",
  "Clear communication and progress updates",
  "Post-project support",
];

export default function ServicesSection(): JSX.Element {
  const { t, lang } = useLanguage();

  const whatsappNumber = "6283854436555";

  const whatsappMessage = encodeURIComponent(
    "Halo Dear Engineer, saya ingin konsultasi mengenai project software yang ingin saya buat.",
  );

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  const emailAddress = "dearlyfebrianoi@gmail.com";

  const emailUrl =
    `mailto:${emailAddress}` +
    `?subject=${encodeURIComponent("Project Software Development Inquiry")}`;

  return (
    <section id="services" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* ==================================================
         * Section Heading
         * ================================================== */}

        <SectionHeading
          eyebrow="SOFTWARE DEVELOPMENT"
          title="Turn Your Idea Into a Real Product"
          description="Custom software development for businesses, personal projects, startups, and digital products."
        />

        {/* ==================================================
         * Main Promotional Area
         * ================================================== */}

        <div className="mt-12 grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          {/* =================================================
           * POSTER
           * ================================================= */}

          <FadeIn x={-24} className="relative">
            <GlowCard className="overflow-hidden rounded-3xl border border-border/70 bg-card/60 p-2">
              <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-background">
                <Image
                  src={
                    lang === "id"
                      ? "/images/poster-joki-id.png"
                      : "/images/poster-joki-en.png"
                  }
                  alt={
                    lang === "id"
                      ? "Poster jasa software development Dear Engineer"
                      : "Dear Engineer software development services poster"
                  }
                  width={1024}
                  height={1536}
                  sizes="(min-width: 1024px) 520px, 100vw"
                  className="h-auto w-full object-contain"
                  priority={false}
                />

                {/* Decorative overlay */}

                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/10 via-transparent to-transparent"
                />
              </div>
            </GlowCard>

            {/* Floating label */}

            <div className="absolute -bottom-4 left-4 right-4 sm:left-8 sm:right-8">
              <div className="glass flex items-center justify-between gap-4 rounded-2xl border border-primary/20 px-4 py-3 shadow-xl shadow-primary/10 backdrop-blur-xl">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Code2 className="size-4" aria-hidden />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-foreground">
                      Custom Software Development
                    </p>

                    <p className="truncate font-mono text-[10px] text-muted-foreground">
                      Built around your requirements
                    </p>
                  </div>
                </div>

                <Sparkles
                  className="size-4 shrink-0 text-primary"
                  aria-hidden
                />
              </div>
            </div>
          </FadeIn>

          {/* =================================================
           * RIGHT CONTENT
           * ================================================= */}

          <FadeIn x={24} delay={0.1} className="pt-2 lg:pt-4">
            {/* Intro */}

            <div className="rounded-2xl border border-border/70 bg-card/40 p-6">
              <div className="flex items-start gap-4">
                <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Sparkles className="size-5" aria-hidden />
                </div>

                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                    Dear Engineer
                  </p>

                  <h3 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
                    Have an idea?
                    <br />
                    Let&apos;s build it.
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    Ceritakan kebutuhan software Anda, lalu kita tentukan
                    solusi, fitur, teknologi, timeline, dan estimasi biaya yang
                    paling sesuai.
                  </p>
                </div>
              </div>
            </div>

            {/* =================================================
             * Services
             * ================================================= */}

            <div className="mt-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                Services
              </p>

              <h3 className="mt-2 text-lg font-semibold text-foreground">
                What I Can Build
              </h3>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {SERVICES.map((service) => (
                  <div
                    key={service}
                    className="group flex items-start gap-2.5 rounded-xl border border-border/60 bg-card/40 px-3.5 py-3 transition-colors hover:border-primary/40 hover:bg-card/70"
                  >
                    <CheckCircle2
                      className="mt-0.5 size-4 shrink-0 text-primary"
                      aria-hidden
                    />

                    <span className="text-sm text-foreground/90">
                      {service}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* =================================================
             * Pricing
             * ================================================= */}

            <div className="mt-6 rounded-2xl border border-border/70 bg-card/40 p-5">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Code2 className="size-5" aria-hidden />
                </div>

                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Pricing
                  </p>

                  <h3 className="font-semibold text-foreground">
                    Custom quotation for every project
                  </h3>
                </div>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Tidak ada harga yang dipukul rata. Estimasi disesuaikan dengan
                jumlah fitur, kompleksitas, scope project, dan estimasi waktu
                pengerjaan.
              </p>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {[
                  "Jumlah fitur",
                  "Tingkat kompleksitas",
                  "Project scope",
                  "Estimated timeline",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-xs text-muted-foreground"
                  >
                    <span className="size-1.5 rounded-full bg-primary" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* =================================================
             * Payment
             * ================================================= */}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-card/40 p-5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Payment
                </p>

                <div className="mt-3 flex items-center gap-3">
                  <div className="text-2xl font-bold text-primary">50%</div>

                  <p className="text-sm text-foreground">
                    DP untuk memulai project
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-border/70 bg-card/40 p-5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Final Payment
                </p>

                <div className="mt-3 flex items-center gap-3">
                  <div className="text-2xl font-bold text-primary">50%</div>

                  <p className="text-sm text-foreground">
                    Pelunasan setelah project selesai
                  </p>
                </div>
              </div>
            </div>

            {/* =================================================
             * Security
             * ================================================= */}

            <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
              <div className="flex items-start gap-3">
                <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-500">
                  <ShieldCheck className="size-5" aria-hidden />
                </div>

                <div>
                  <h3 className="font-semibold text-foreground">
                    Professional & Secure
                  </h3>

                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Scope, fitur, timeline, dan biaya dibahas terlebih dahulu
                    agar ekspektasi project jelas sejak awal.
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* ==================================================
         * WORKFLOW
         * ================================================== */}

        <FadeIn delay={0.15} className="mt-20">
          <div className="text-center">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
              How It Works
            </p>

            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Simple, transparent workflow
            </h3>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Setiap project dimulai dari diskusi terlebih dahulu sehingga scope
              dan ekspektasi sudah jelas sebelum development dimulai.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-5">
            {WORKFLOW.map((step, index) => (
              <div key={step.number} className="relative h-full">
                <div className="h-full rounded-2xl border border-border/70 bg-card/50 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-primary">
                      {step.number}
                    </span>

                    {index < WORKFLOW.length - 1 && (
                      <ArrowRight
                        className="hidden size-4 text-muted-foreground/40 md:block"
                        aria-hidden
                      />
                    )}
                  </div>

                  <h4 className="mt-4 text-sm font-semibold text-foreground">
                    {step.title}
                  </h4>

                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* ==================================================
         * Advantages
         * ================================================== */}

        <FadeIn delay={0.1} className="mt-14">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            {/* Heading card */}

            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
                Why work with me?
              </p>

              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                Clean code.
                <br />
                Clear process.
                <br />
                Real product.
              </h3>

              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Fokus saya bukan hanya membuat project terlihat jadi, tetapi
                membuat software yang masuk akal untuk digunakan, dikembangkan,
                dan dipelihara.
              </p>
            </div>

            {/* Advantages */}

            <div className="grid gap-3 sm:grid-cols-2">
              {ADVANTAGES.map((advantage) => (
                <div
                  key={advantage}
                  className="flex items-start gap-3 rounded-xl border border-border/70 bg-card/50 p-4"
                >
                  <CheckCircle2
                    className="mt-0.5 size-5 shrink-0 text-primary"
                    aria-hidden
                  />

                  <span className="text-sm text-foreground/90">
                    {advantage}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* ==================================================
         * CTA
         * ================================================== */}

        <FadeIn delay={0.1} className="mt-14">
          <GlowCard className="rounded-3xl border border-primary/30 bg-primary/5 p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
                  Free Consultation
                </p>

                <h3 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Punya ide project?
                  <br />
                  Mari bahas dulu.
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Konsultasi awal gratis. Ceritakan ide, kebutuhan, atau masalah
                  yang ingin Anda selesaikan. Kita tentukan pendekatan terbaik
                  sebelum membahas pengerjaan.
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-[240px]">
                <Button
                  asChild
                  size="lg"
                  className="w-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/20 hover:bg-[#20b458]"
                >
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Consult via WhatsApp"
                  >
                    <MessageCircle className="size-4" aria-hidden />
                    Konsultasi via WhatsApp
                  </a>
                </Button>

                <Button asChild size="lg" variant="outline" className="w-full">
                  <a href={emailUrl} aria-label="Send project inquiry by email">
                    <Mail className="size-4" aria-hidden />
                    Email Project Inquiry
                  </a>
                </Button>
              </div>
            </div>
          </GlowCard>
        </FadeIn>

        {/* ==================================================
         * Bottom note
         * ================================================== */}

        <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          IDE KAMU · KODE KAMI · PROJECT JADI
        </p>
      </div>
    </section>
  );
}
