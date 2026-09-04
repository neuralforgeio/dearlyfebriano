"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import type { JSX } from "react";
import { useLanguage } from "@/dearlyfebriano/i18n/language-context";

/* ============================================================
 * KonamiConfetti — easter egg.
 * Type the classic Konami code (↑ ↑ ↓ ↓ ← → ← → B A) anywhere
 * to fire a confetti burst on a zero-dependency canvas.
 * - respects prefers-reduced-motion (toast only)
 * - canvas is created on demand and fully cleaned up
 * ============================================================ */

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

const CONFETTI_COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#22c55e", "#f59e0b", "#f472b6"];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  color: string;
  shape: "rect" | "circle";
  life: number; // seconds remaining
}

function fireConfetti(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  // Burst from bottom-center-left and bottom-center-right, like cannons.
  const cannons: { x: number; y: number; angle: number }[] = [
    { x: width * 0.12, y: height * 0.85, angle: -Math.PI / 3 },
    { x: width * 0.88, y: height * 0.85, angle: (-Math.PI * 2) / 3 },
  ];

  const particles: Particle[] = [];
  for (const cannon of cannons) {
    for (let i = 0; i < 70; i++) {
      const spread = (Math.random() - 0.5) * 0.55;
      const speed = 650 + Math.random() * 450; // px/s
      particles.push({
        x: cannon.x,
        y: cannon.y,
        vx: Math.cos(cannon.angle + spread) * speed,
        vy: Math.sin(cannon.angle + spread) * speed,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 8,
        size: 5 + Math.random() * 7,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        shape: Math.random() > 0.35 ? "rect" : "circle",
        life: 2.6 + Math.random() * 1.2,
      });
    }
  }

  let last = performance.now();
  let raf = 0;

  const step = (now: number) => {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    ctx.clearRect(0, 0, width, height);
    let alive = 0;

    for (const p of particles) {
      p.life -= dt;
      if (p.life <= 0) continue;
      alive++;
      p.vy += 1500 * dt; // gravity (px/s²)
      p.vx *= 1 - 0.8 * dt; // air drag
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rotation += p.rotationSpeed * dt;

      const alpha = Math.min(1, p.life / 0.8);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      if (p.shape === "rect") {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    if (alive > 0) {
      raf = requestAnimationFrame(step);
    } else {
      canvas.remove();
    }
  };

  raf = requestAnimationFrame(step);

  // Safety: hard-remove the canvas after 6s no matter what.
  const timeout = window.setTimeout(() => {
    cancelAnimationFrame(raf);
    canvas.remove();
  }, 6000);

  canvas.dataset.cleanupTimer = String(timeout);
}

export default function KonamiConfetti(): JSX.Element | null {
  const reducedMotion = useReducedMotion();
  const progressRef = useRef<string[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      const isTyping =
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable ||
          target.tagName === "SELECT");
      if (isTyping) {
        progressRef.current = [];
        return;
      }

      const expected = KONAMI[progressRef.current.length];
      const pressed = event.key.length === 1 ? event.key.toLowerCase() : event.key;

      if (pressed === expected) {
        progressRef.current.push(pressed);
        if (progressRef.current.length === KONAMI.length) {
          progressRef.current = [];
          if (reducedMotion) {
            toast.success(`🎮 ${t("Konami code accepted — you found the easter egg!")}`);
            return;
          }
          const canvas = document.createElement("canvas");
          canvas.setAttribute("aria-hidden", "true");
          canvas.style.cssText =
            "position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:80;";
          document.body.appendChild(canvas);
          fireConfetti(canvas);
          toast.success(`🎮 ${t("Konami code accepted — you found the easter egg!")}`);
        }
      } else {
        progressRef.current = pressed === KONAMI[0] ? [pressed] : [];
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      // Remove any lingering confetti canvas on unmount.
      const existing = document.querySelector("canvas[aria-hidden='true'][data-cleanup-timer]");
      if (existing instanceof HTMLCanvasElement) {
        const timer = Number(existing.dataset.cleanupTimer);
        if (timer) window.clearTimeout(timer);
        existing.remove();
      }
    };
  }, [reducedMotion]);

  return null;
}
