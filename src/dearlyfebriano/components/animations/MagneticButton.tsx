"use client";

import { motion, useReducedMotion, useSpring } from "framer-motion";
import { useRef, type JSX, type MouseEvent as ReactMouseEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ============================================================
 * MagneticButton — transparent wrapper that makes its child
 * (already a <button> or <a>) translate toward the cursor while
 * hovered, and spring back to center on leave.
 * Renders no visual styles of its own.
 * ============================================================ */

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  strength?: number;
}

export default function MagneticButton({
  children,
  className,
  strength = 0.35,
}: MagneticButtonProps): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const x = useSpring(0, { stiffness: 180, damping: 15, mass: 0.25 });
  const y = useSpring(0, { stiffness: 180, damping: 15, mass: 0.25 });

  const handleMouseMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (reducedMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const relX = event.clientX - (rect.left + rect.width / 2);
    const relY = event.clientY - (rect.top + rect.height / 2);
    // Max travel ≈ 8px * strength * 10 (~28px at default strength).
    const maxTranslate = 8 * strength * 10;
    const clamp = (value: number): number =>
      Math.max(-maxTranslate, Math.min(maxTranslate, value));
    x.set(clamp(relX * strength));
    y.set(clamp(relY * strength));
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x, y }}
      className={cn("inline-block", className)}
    >
      {children}
    </motion.div>
  );
}
