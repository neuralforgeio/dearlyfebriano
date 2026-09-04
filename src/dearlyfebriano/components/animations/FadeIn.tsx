"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { JSX, ReactNode } from "react";

/* ============================================================
 * FadeIn — generic scroll-reveal wrapper: opacity 0→1 plus
 * translateY(y)/translateX(x) → 0, 0.5s easeOut, whileInView.
 * Reduced motion: opacity-only fade with no translation.
 * ============================================================ */

interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
  x?: number;
}

export default function FadeIn({
  children,
  className,
  delay = 0,
  y = 24,
  once = true,
  x = 0,
}: FadeInProps): JSX.Element {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={
        reducedMotion
          ? { opacity: 0 }
          : { opacity: 0, x, y }
      }
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, margin: "-60px" }}
      transition={{
        duration: reducedMotion ? 0.3 : 0.5,
        delay: reducedMotion ? 0 : delay,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
}
