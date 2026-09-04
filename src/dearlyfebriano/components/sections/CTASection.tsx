"use client";

import { motion, useReducedMotion } from "framer-motion";
import { SiWhatsapp } from "react-icons/si";
import type { JSX } from "react";
import { Button } from "@/components/ui/button";
import MagneticButton from "@/dearlyfebriano/components/animations/MagneticButton";
import { useLanguage } from "@/dearlyfebriano/i18n/language-context";
import { buildWhatsAppUrl } from "@/dearlyfebriano/lib/helpers";
import { useUIStore } from "@/dearlyfebriano/store/ui-store";

/* ============================================================
 * CTASection — gradient banner with noise + blurred orbs,
 * contact and WhatsApp CTAs.
 * ============================================================ */

export default function CTASection(): JSX.Element {
  const navigate = useUIStore((state) => state.navigate);
  const reducedMotion = useReducedMotion();
  const { t } = useLanguage();

  return (
    <section id="cta" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 32, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: reducedMotion ? 0.3 : 0.6, ease: "easeOut" }}
          className="relative overflow-hidden rounded-3xl bg-gradient-accent px-6 py-14 sm:px-12 sm:py-20"
        >
          {/* Texture + decorative orbs */}
          <div
            aria-hidden
            className="noise-overlay pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full bg-white/20 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-28 -left-20 size-80 rounded-full bg-white/20 blur-3xl"
          />

          <div className="relative z-10 flex flex-col items-center gap-6 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-white/80">
              {t("Let’s build together")}
            </p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              {t("Have a Project in Mind?")}
            </h2>
            <p className="max-w-xl text-white/80">
              {t("Tell me about your idea — I usually reply within 24 hours with honest feedback and a clear plan to ship it.")}
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <MagneticButton>
                <Button
                  size="lg"
                  onClick={() => navigate("contact")}
                  className="bg-white text-[#4338ca] hover:bg-white/90"
                >
                  {t("Send a Message")}
                </Button>
              </MagneticButton>
              <MagneticButton>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-2 border-white/60 bg-transparent text-white hover:bg-white/10 hover:text-white dark:bg-transparent dark:text-white dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <a
                    href={buildWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${t("Chat on WhatsApp")} (${t("opens in new tab")})`}
                  >
                    <SiWhatsapp aria-hidden className="size-4" />
                    {t("Chat on WhatsApp")}
                  </a>
                </Button>
              </MagneticButton>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
