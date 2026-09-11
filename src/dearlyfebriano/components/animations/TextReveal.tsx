"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { JSX } from "react";

/* ============================================================
 * TextReveal — reveals the whole text as one unit (fade +
 * translateY 10px) as it scrolls into view. Calm single-motion
 * reveal, no per-character stagger.
 * ============================================================ */

interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  mode?: "word" | "char";
  once?: boolean;
}

export default function TextReveal({
  text,
  className,
  delay = 0,
  stagger = 0.04,
  mode = "word",
  once = true,
}: TextRevealProps): JSX.Element {
  const reducedMotion = useReducedMotion();
  void stagger;
  void mode;

  return (
    <motion.span
      className={className}
      aria-label={text}
      initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once, margin: "-80px" }}
      transition={{
        duration: 0.4,
        delay,
        ease: "easeOut",
      }}
    >
      {text}
    </motion.span>
  );
}
