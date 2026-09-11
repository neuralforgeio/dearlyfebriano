"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/* ============================================================
 * SectionHeading — judul section dengan eyebrow, gradient text
 * underline animasi, dan deskripsi opsional.
 * ============================================================ */

export interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  id?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  id,
}: SectionHeadingProps) {
  return (
    <div
      id={id}
      className={cn(
        "mb-10 flex flex-col gap-3 sm:mb-12",
        align === "center" && "items-center text-center",
        className
      )}
    >
      {eyebrow && (
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.4 }}
          className="eyebrow"
        >
          {eyebrow}
        </motion.span>
      )}
      <div className="relative">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-4xl"
        >
          {title}
        </motion.h2>
        <motion.span
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
          className="absolute -bottom-2 left-0 h-px w-16 origin-left bg-primary"
          aria-hidden
        />
      </div>
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className={cn(
            "max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base",
            align === "center" && "mx-auto"
          )}
        >
          {description}
        </motion.p>
      )}
    </div>
  );
}
