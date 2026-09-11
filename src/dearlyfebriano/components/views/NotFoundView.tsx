"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Compass, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import FadeIn from "@/dearlyfebriano/components/animations/FadeIn";
import { useUIStore } from "@/dearlyfebriano/store/ui-store";
import { useLanguage } from "@/dearlyfebriano/i18n/language-context";
import type { JSX } from "react";

/* ============================================================
 * NotFoundView — tampilan 404 untuk hash tak dikenal
 * (mis. #foobar). Nuansa terminal developer + angka 404
 * gradient besar. A11y: kontras aman, reduced-motion aman.
 * ============================================================ */

export default function NotFoundView(): JSX.Element {
  const navigate = useUIStore((state) => state.navigate);
  const setCommandOpen = useUIStore((state) => state.setCommandOpen);
  const { t } = useLanguage();
  const reducedMotion = useReducedMotion();

  return (
    <div className="relative mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col items-center justify-center px-4 pb-20 pt-28 text-center sm:px-6 sm:pt-32">
      {/* Angka 404 besar */}
      <FadeIn y={24}>
        <motion.div
          aria-hidden
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={
            reducedMotion
              ? { duration: 0.2 }
              : { type: "spring", stiffness: 120, damping: 16, delay: 0.1 }
          }
          className="select-none font-mono text-[110px] font-bold leading-none tracking-tighter sm:text-[150px]"
        >
          <span className="text-foreground">4</span>
          <motion.span
            className="text-foreground inline-block"
            animate={reducedMotion ? undefined : { y: [0, -6, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          >
            0
          </motion.span>
          <span className="text-foreground">4</span>
        </motion.div>
      </FadeIn>

      {/* Terminal-style line */}
      <FadeIn delay={0.15} y={12}>
        <p className="card-surface inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-xs text-muted-foreground">
          <span aria-hidden className="text-primary">$</span>
          <span>GET</span>
          <span className="text-foreground">#{`<unknown-route>`}</span>
          <span aria-hidden className="text-destructive">→ 404</span>
        </p>
      </FadeIn>

      <FadeIn delay={0.25} y={12}>
        <h1 className="mt-6 text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t("This page drifted off the grid")}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          {t("The link you followed doesn't exist — maybe a typo, or an old bookmark. The rest of the portfolio is still very much here.")}
        </p>
      </FadeIn>

      {/* Actions */}
      <FadeIn delay={0.35} y={12} className="mt-10 w-full sm:w-auto">
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            type="button"
            size="lg"
            onClick={() => navigate("home")}
            className="group w-full bg-primary text-white shadow-lg shadow-primary/25 hover:opacity-90 sm:w-auto"
          >
            <ArrowLeft
              aria-hidden
              className="size-4 transition-transform duration-300"
            />
            {t("Back to home")}
          </Button>
          <Button
            type="button"
            size="lg"
            variant="outline"
            onClick={() => navigate("projects")}
            className="w-full sm:w-auto"
          >
            <Compass aria-hidden className="size-4" />
            {t("Browse projects")}
          </Button>
          <Button
            type="button"
            size="lg"
            variant="ghost"
            onClick={() => setCommandOpen(true)}
            className="w-full font-mono text-xs text-muted-foreground sm:w-auto"
          >
            <Search aria-hidden className="size-4" />
            {t("Search")}
            <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 text-[9px]">
              Ctrl K
            </kbd>
          </Button>
        </div>
      </FadeIn>

      <FadeIn delay={0.45}>
        <p className="mt-12 font-mono text-[11px] text-muted-foreground/60">
          error_code: VIEW_NOT_FOUND · {t("try the command palette")}
        </p>
      </FadeIn>
    </div>
  );
}
