"use client";

import { useCallback, useEffect, useState } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { cn } from "@/lib/utils";
import type { JSX, PointerEvent as ReactPointerEvent, ReactNode } from "react";

/* ============================================================
 * TiltCard — subtle 3D tilt that follows the pointer (rotateX /
 * rotateY springs) with an optional moving glare sheen.
 * - Disabled for touch devices and prefers-reduced-motion.
 * - Server renders a plain div; the tilt upgrades on mount.
 * - Only transforms + opacity — GPU friendly.
 * ============================================================ */

const SPRING = { stiffness: 260, damping: 22, mass: 0.6 } as const;

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  /** Maximum tilt in degrees (default 8). */
  maxTilt?: number;
  /** Hover scale (default 1 — no scale). */
  scale?: number;
  /** Show a pointer-following glare sheen (default true). */
  glare?: boolean;
}

export default function TiltCard({
  children,
  className,
  maxTilt = 8,
  scale = 1,
  glare = true,
}: TiltCardProps): JSX.Element {
  const reducedMotion = useReducedMotion();
  const [isFinePointer, setIsFinePointer] = useState(false);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);
  const glareOpacity = useMotionValue(0);

  const springRotateX = useSpring(rotateX, SPRING);
  const springRotateY = useSpring(rotateY, SPRING);
  const glareBackground = useMotionTemplate`radial-gradient(320px circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.07), transparent 55%)`;

  useEffect(() => {
    const media = window.matchMedia("(pointer: fine)");
    const apply = () => setIsFinePointer(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  const enabled = !reducedMotion && isFinePointer;

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!enabled || event.pointerType !== "mouse") return;
      const rect = event.currentTarget.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width; // 0..1
      const py = (event.clientY - rect.top) / rect.height; // 0..1
      rotateY.set((px - 0.5) * 2 * maxTilt);
      rotateX.set(-(py - 0.5) * 2 * maxTilt);
      glareX.set(px * 100);
      glareY.set(py * 100);
      glareOpacity.set(1);
    },
    [enabled, maxTilt, rotateX, rotateY, glareX, glareY, glareOpacity]
  );

  const handlePointerLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
    glareOpacity.set(0);
  }, [rotateX, rotateY, glareOpacity]);

  if (!enabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{ rotateX: springRotateX, rotateY: springRotateY, transformPerspective: 900 }}
      whileHover={{ scale }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className={cn("relative will-change-transform", className)}
    >
      {children}
      {glare && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 rounded-[inherit]"
          style={{ opacity: glareOpacity, background: glareBackground }}
        />
      )}
    </motion.div>
  );
}
