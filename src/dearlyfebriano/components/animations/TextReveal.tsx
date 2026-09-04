"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Fragment, type JSX } from "react";

/* ============================================================
 * TextReveal — splits text into words or characters and reveals
 * each unit (opacity 0→1 + translateY 18px→0) with a stagger as
 * it scrolls into view. Words are kept unbreakable in "char"
 * mode and whitespace is preserved between units.
 * ============================================================ */

interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  mode?: "word" | "char";
  once?: boolean;
}

interface RevealUnit {
  key: string;
  content: string;
}

interface RevealGroup {
  key: string;
  units: RevealUnit[];
  /** Render a literal space before this group. */
  leadingSpace: boolean;
  /** Global unit index where this group starts (for stagger timing). */
  startIndex: number;
}

function buildGroups(text: string, mode: "word" | "char"): RevealGroup[] {
  let runningIndex = 0;
  return text.split(" ").map((word, wordIndex) => {
    const units: RevealUnit[] =
      mode === "word"
        ? [{ key: `w-${wordIndex}`, content: word }]
        : Array.from(word).map((char, charIndex) => ({
            key: `w-${wordIndex}-c-${charIndex}`,
            content: char,
          }));
    const group: RevealGroup = {
      key: `g-${wordIndex}`,
      units,
      leadingSpace: wordIndex > 0,
      startIndex: runningIndex,
    };
    runningIndex += units.length;
    return group;
  });
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
  const groups = buildGroups(text, mode);

  return (
    <span className={className} aria-label={text}>
      <span aria-hidden="true">
        {groups.map((group) => (
          <Fragment key={group.key}>
            {group.leadingSpace ? " " : null}
            <span className="inline-block">
              {group.units.map((unit, unitIndex) => (
                <motion.span
                  key={unit.key}
                  className="inline-block"
                  initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
                  whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once, margin: "-80px" }}
                  transition={{
                    duration: 0.45,
                    delay: delay + (group.startIndex + unitIndex) * stagger,
                    ease: "easeOut",
                  }}
                >
                  {unit.content}
                </motion.span>
              ))}
            </span>
          </Fragment>
        ))}
      </span>
    </span>
  );
}
