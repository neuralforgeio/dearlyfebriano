"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { JSX, ReactNode } from "react";

/* ============================================================
 * StaggerChildren — pair of components for staggered scroll
 * reveals. Place <StaggerItem> elements directly inside a
 * <StaggerContainer>; the container orchestrates the stagger and
 * the items animate opacity + translateY.
 * ============================================================ */

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  stagger?: number;
  once?: boolean;
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  y?: number;
}

export function StaggerContainer({
  children,
  className,
  delay = 0,
  stagger = 0.08,
  once = true,
}: StaggerContainerProps): JSX.Element {
  const containerVariants: Variants = {
    hidden: {},
    show: {
      transition: { staggerChildren: stagger, delayChildren: delay },
    },
  };

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: "-60px" }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className, y = 24 }: StaggerItemProps): JSX.Element {
  const reducedMotion = useReducedMotion();

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: reducedMotion ? 0 : y },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reducedMotion ? 0.15 : 0.5, ease: "easeOut" },
    },
  };

  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}
