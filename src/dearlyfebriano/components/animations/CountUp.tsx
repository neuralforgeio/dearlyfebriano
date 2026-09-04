"use client";

import { useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type JSX } from "react";

/* ============================================================
 * CountUp — animates a number from 0 to `value` with an easeOut
 * curve once it scrolls into view. Renders a plain <span> that
 * inherits all font styles from `className`.
 * ============================================================ */

interface CountUpProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  decimals?: number;
  className?: string;
}

export default function CountUp({
  value,
  prefix = "",
  suffix = "",
  duration = 1.8,
  decimals = 0,
  className,
}: CountUpProps): JSX.Element {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const reducedMotion = useReducedMotion();
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    // Reduced motion / zero duration: the final value is rendered
    // directly (see `display` below), no state updates needed.
    if (!isInView || reducedMotion || duration <= 0) return;

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setAnimated(value * eased);
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setAnimated(value);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isInView, reducedMotion, value, duration]);

  const display = isInView && (reducedMotion || duration <= 0) ? value : animated;

  const formatted =
    decimals > 0
      ? display.toFixed(decimals)
      : Math.round(display).toLocaleString("en-US");

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
