"use client";

import { useReducedMotion } from "framer-motion";
import { useState, type JSX } from "react";
import { SiWhatsapp } from "react-icons/si";
import { buildWhatsAppUrl } from "@/dearlyfebriano/lib/helpers";
import { useLanguage } from "@/dearlyfebriano/i18n/language-context";

/* ============================================================
 * WhatsAppButton — fixed floating chat button (bottom-right)
 * linking to the WhatsApp deep link from buildWhatsAppUrl().
 * Brand color #25D366 is intentional (allowed brand hex).
 * Shows a tooltip on hover/focus and a subtle pulsing ring.
 * ============================================================ */

export default function WhatsAppButton(): JSX.Element {
  const reducedMotion = useReducedMotion();
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const { t } = useLanguage();

  return (
    <a
      href={buildWhatsAppUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("Chat on WhatsApp")}
      onMouseEnter={() => setIsTooltipVisible(true)}
      onMouseLeave={() => setIsTooltipVisible(false)}
      onFocus={() => setIsTooltipVisible(true)}
      onBlur={() => setIsTooltipVisible(false)}
      className="group fixed bottom-6 right-6 z-40 flex size-12 print:hidden items-center justify-center rounded-full bg-[#25D366] text-white shadow-md transition-opacity duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:size-13"
    >
      <SiWhatsapp aria-hidden className="relative size-6" />
      <span
        aria-hidden
        className={`card-surface pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-md px-3 py-1.5 text-xs text-foreground transition-opacity duration-200 ${
          isTooltipVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        {t("Chat me on WhatsApp")}
      </span>
    </a>
  );
}
