"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import type { JSX } from "react";

/* ============================================================
 * ScrollProgress — fixed 3px gradient bar at the top of the
 * viewport showing smoothed scroll progress. Fades out when
 * progress is ≈0. Transform/opacity only (60fps friendly).
 * ============================================================ */

export default function ScrollProgress(): JSX.Element {
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const smoothed = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });
  const opacity = useTransform(scrollYProgress, [0, 0.01], [0, 1]);
  const scaleX = reducedMotion ? scrollYProgress : smoothed;

  return (
    <motion.div
      aria-hidden
      className="fixed left-0 top-0 z-[80] h-0.5 w-full origin-left bg-primary"
      style={{ scaleX, opacity }}
    />
  );
}
