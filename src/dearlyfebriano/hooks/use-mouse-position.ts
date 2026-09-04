"use client";

import { useEffect, useState } from "react";

/* ============================================================
 * useMousePosition — melacak posisi cursor (viewport coords).
 * Dipakai MagneticButton, CustomCursor, GlowCard.
 * ============================================================ */

export function useMousePosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let raf = 0;
    const update = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setPosition({ x: e.clientX, y: e.clientY }));
    };
    window.addEventListener("mousemove", update, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", update);
    };
  }, []);

  return position;
}

/** Returns true on devices with a fine pointer (mouse/trackpad). */
export function useIsFinePointer(): boolean {
  const [isFine, setIsFine] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const update = () => setIsFine(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isFine;
}
