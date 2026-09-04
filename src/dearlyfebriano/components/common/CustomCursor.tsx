"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useEffect, useState, type JSX } from "react";
import { useIsFinePointer } from "@/dearlyfebriano/hooks/use-mouse-position";

/* ============================================================
 * CustomCursor — decorative custom cursor for fine-pointer
 * devices only: a small dot following the cursor 1:1 and a ring
 * trailing with a spring. Near interactive elements the ring
 * scales up and the dot fades. Both elements use
 * mix-blend-difference + white for auto contrast. The native
 * cursor is intentionally NOT hidden.
 * ============================================================ */

const INTERACTIVE_SELECTOR =
  "a, button, [role='button'], input, textarea, select, [data-cursor]";

function isInteractiveTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement && target.closest(INTERACTIVE_SELECTOR) !== null
  );
}

export default function CustomCursor(): JSX.Element | null {
  const isFinePointer = useIsFinePointer();
  const reducedMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  const ringX = useSpring(mouseX, { stiffness: 250, damping: 25, mass: 0.6 });
  const ringY = useSpring(mouseY, { stiffness: 250, damping: 25, mass: 0.6 });

  useEffect(() => {
    let raf = 0;
    let latestX = -100;
    let latestY = -100;

    const onMouseMove = (event: MouseEvent) => {
      latestX = event.clientX;
      latestY = event.clientY;
      setIsVisible(true);
      if (raf === 0) {
        raf = requestAnimationFrame(() => {
          raf = 0;
          mouseX.set(latestX);
          mouseY.set(latestY);
        });
      }
    };

    const onMouseOver = (event: MouseEvent) => {
      setIsHovering(isInteractiveTarget(event.target));
    };

    const onMouseOut = (event: MouseEvent) => {
      const next = event.relatedTarget;
      setIsHovering(
        next instanceof HTMLElement ? isInteractiveTarget(next) : false
      );
    };

    const onMouseEnter = () => setIsVisible(true);
    const onMouseLeave = () => setIsVisible(false);

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseover", onMouseOver);
    document.addEventListener("mouseout", onMouseOut);
    document.addEventListener("mouseenter", onMouseEnter);
    document.addEventListener("mouseleave", onMouseLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseout", onMouseOut);
      document.removeEventListener("mouseenter", onMouseEnter);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [mouseX, mouseY]);

  if (!isFinePointer || reducedMotion) return null;

  return (
    <>
      {/* Dot — follows the cursor 1:1, fades out over interactive elements. */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[90]"
        style={{ x: mouseX, y: mouseY }}
      >
        <motion.div
          animate={{ opacity: isVisible && !isHovering ? 1 : 0, scale: isHovering ? 0.5 : 1 }}
          transition={{ duration: 0.15 }}
          className="-ml-[3px] -mt-[3px] size-1.5 rounded-full bg-white mix-blend-difference"
        />
      </motion.div>
      {/* Ring — trails the cursor with a spring, scales up over interactive elements. */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[90]"
        style={{ x: ringX, y: ringY }}
      >
        <motion.div
          animate={{ opacity: isVisible ? 1 : 0, scale: isHovering ? 1.6 : 1 }}
          transition={{ duration: 0.2 }}
          className="-ml-5 -mt-5 size-10 rounded-full border border-white mix-blend-difference"
        />
      </motion.div>
    </>
  );
}
