"use client";

import { useReducedMotion } from "framer-motion";
import { useRef, type CSSProperties, type JSX, type MouseEvent as ReactMouseEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ============================================================
 * GlowCard — neutral relative wrapper whose children style
 * their own background. On hover a soft radial glow follows the
 * mouse via the CSS variables --glow-x / --glow-y. The glow is
 * disabled for users who prefer reduced motion.
 * ============================================================ */

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
}

export default function GlowCard({
  children,
  className,
  glowColor = "rgba(99, 102, 241, 0.15)",
}: GlowCardProps): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const handleMouseMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (reducedMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    ref.current.style.setProperty("--glow-x", `${event.clientX - rect.left}px`);
    ref.current.style.setProperty("--glow-y", `${event.clientY - rect.top}px`);
  };

  const glowStyle: CSSProperties = {
    background: `radial-gradient(circle at var(--glow-x, 50%) var(--glow-y, 50%), ${glowColor}, transparent 60%)`,
  };

  return (
    <div ref={ref} onMouseMove={handleMouseMove} className={cn("group relative", className)}>
      {!reducedMotion && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={glowStyle}
        />
      )}
      {children}
    </div>
  );
}
