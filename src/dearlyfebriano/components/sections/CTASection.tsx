"use client";

import { motion, useReducedMotion } from "framer-motion";
import { SiWhatsapp } from "react-icons/si";
import type { JSX } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/dearlyfebriano/i18n/language-context";
import { buildWhatsAppUrl } from "@/dearlyfebriano/lib/helpers";
import { useUIStore } from "@/dearlyfebriano/store/ui-store";

/* ============================================================
 * CTASection — inverted editorial banner, contact and
 * WhatsApp CTAs.
 * ============================================================ */

export default function CTASection(): JSX.Element {
  const navigate = useUIStore((state) => state.navigate);
  const reducedMotion = useReducedMotion();
  const { t } = useLanguage();

  return (
    <section id="cta" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: reducedMotion ? 0.3 : 0.5, ease: "easeOut" }}
          className="relative overflow-hidden rounded-2xl bg-foreground px-6 py-14 sm:px-12 sm:py-20"
        >
          <div className="relative z-10 flex flex-col items-center gap-6 text-center">
            <p className="eyebrow text-background/70">
              {t("Let’s build together")}
            </p>
            <h2 className="text-3xl font-semibold text-background sm:text-4xl lg:text-5xl">
              {t("Have a Project in Mind?")}
            </h2>
            <p className="max-w-xl text-background/75">
              {t("Tell me about your idea — I usually reply within 24 hours with honest feedback and a clear plan to ship it.")}
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                onClick={() => navigate("contact")}
                className="bg-background text-foreground hover:bg-background/90"
              >
                {t("Send a Message")}
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border border-background/30 bg-transparent text-background hover:bg-background/10"
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
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
