"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useState, type JSX } from "react";
import { cn } from "@/lib/utils";

/* ============================================================
 * Typewriter — cycles through `words` infinitely:
 * type → pause → delete → next word. Renders the current text
 * plus a blinking caret. Reduced motion: shows the first word
 * statically with a steady caret.
 * ============================================================ */

interface TypewriterProps {
  words: string[];
  className?: string;
  typeSpeed?: number;
  deleteSpeed?: number;
  pause?: number;
}

type Phase = "typing" | "deleting";

export default function Typewriter({
  words,
  className,
  typeSpeed = 70,
  deleteSpeed = 38,
  pause = 1800,
}: TypewriterProps): JSX.Element {
  const reducedMotion = useReducedMotion();
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<Phase>("typing");

  useEffect(() => {
    if (reducedMotion || words.length === 0) return;
    const word = words[wordIndex % words.length] ?? "";

    let timer: ReturnType<typeof setTimeout> | undefined;

    if (phase === "typing") {
      if (text.length < word.length) {
        timer = setTimeout(() => setText(word.slice(0, text.length + 1)), typeSpeed);
      } else {
        timer = setTimeout(() => setPhase("deleting"), pause);
      }
    } else {
      if (text.length > 0) {
        timer = setTimeout(() => setText(word.slice(0, text.length - 1)), deleteSpeed);
      } else {
        // Word fully deleted — advance to the next word. Done inside a
        // timeout callback (async) instead of synchronously in the effect
        // body to avoid cascading renders.
        timer = setTimeout(() => {
          setWordIndex((index) => (index + 1) % words.length);
          setPhase("typing");
        }, 0);
      }
    }

    return () => {
      if (timer !== undefined) clearTimeout(timer);
    };
  }, [text, phase, wordIndex, words, typeSpeed, deleteSpeed, pause, reducedMotion]);

  const staticWord = words[0] ?? "";
  const visibleText = reducedMotion ? staticWord : text;

  return (
    <span className={cn("inline-flex items-baseline", className)}>
      <span>{visibleText}</span>
      <span
        aria-hidden
        className={cn(
          "ml-0.5 inline-block h-[1em] w-[2px] translate-y-[0.12em] bg-primary",
          !reducedMotion && "animate-pulse"
        )}
      />
    </span>
  );
}
