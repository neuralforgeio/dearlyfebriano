"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { CSSProperties, JSX, ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ============================================================
 * OrbitingBorder — wraps content (e.g. a profile photo) with
 * 2–3 rotating partial arc rings that orbit around it.
 * Each ring is a conic-gradient arc masked into a thin circle
 * and animated with transform rotation only (60fps friendly).
 * ============================================================ */

export interface OrbitConfig {
  /** Seconds per full rotation. */
  duration?: number;
  /** Arc color (hex / rgba). */
  color?: string;
  /** Arc peak position in degrees — partial arc, NOT a full circle (≈70–120). */
  arc?: number;
  /** Ring thickness in px. */
  width?: number;
  /** How far (px) the ring extends beyond the content on every side. */
  offset?: number;
  /** Adds a blurred duplicate of the arc for a soft glow. */
  glow?: boolean;
  /** Reverses the rotation direction. */
  reverse?: boolean;
}

interface OrbitingBorderProps {
  children: ReactNode;
  orbits?: OrbitConfig[];
  className?: string;
}

const DEFAULT_ORBITS: OrbitConfig[] = [
  { duration: 8, color: "#6366f1", arc: 90, width: 2, offset: 10, glow: true },
  { duration: 13, color: "#8b5cf6", arc: 110, width: 2, offset: 14 },
  { duration: 18, color: "#a78bfa", arc: 70, width: 1.5, offset: 18, reverse: true },
];

export default function OrbitingBorder({
  children,
  orbits,
  className,
}: OrbitingBorderProps): JSX.Element {
  const reducedMotion = useReducedMotion();
  const rings = orbits ?? DEFAULT_ORBITS;

  return (
    <div className={cn("relative", className)}>
      {children}
      {rings.map((orbit, index) => {
        const {
          duration = 8 + index * 5,
          color = "#6366f1",
          arc = 90,
          width = 2,
          offset = 12,
          glow = false,
          reverse = false,
        } = orbit;

        const arcStyle: CSSProperties = {
          background: `conic-gradient(from 0deg, transparent 0deg, ${color} ${arc}deg, transparent ${
            arc + 30
          }deg)`,
          WebkitMask: `radial-gradient(farthest-side, transparent calc(100% - ${width}px), #000 calc(100% - ${width}px))`,
          mask: `radial-gradient(farthest-side, transparent calc(100% - ${width}px), #000 calc(100% - ${width}px))`,
        };

        return (
          <motion.div
            key={index}
            aria-hidden
            className="pointer-events-none absolute rounded-full"
            style={{ inset: -offset }}
            animate={reducedMotion ? { rotate: 0 } : { rotate: reverse ? -360 : 360 }}
            transition={{ duration, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute inset-0 rounded-full" style={arcStyle} />
            {glow && (
              /* PERF: duplikat glow TANPA filter blur — arc yang berputar
                 dengan blur-md dipaksa re-rasterisasi tiap frame di GPU.
                 Ganti dengan stroke lebih lebar + opacity rendah: soft glow
                 yang visualnya setara, biaya compositor-only. */
              <div
                className="absolute inset-0 rounded-full opacity-40"
                style={{
                  ...arcStyle,
                  WebkitMask: `radial-gradient(farthest-side, transparent calc(100% - ${width * 2 + 2}px), #000 calc(100% - ${width * 2 + 2}px))`,
                  mask: `radial-gradient(farthest-side, transparent calc(100% - ${width * 2 + 2}px), #000 calc(100% - ${width * 2 + 2}px))`,
                }}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
