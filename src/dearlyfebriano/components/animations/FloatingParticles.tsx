"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useRef, type JSX } from "react";
import { cn } from "@/lib/utils";

/* ============================================================
 * FloatingParticles — canvas-based ambient background: tiny
 * twinkling dots drifting slowly, with faint connecting lines
 * between very close particles. Scales particle count with the
 * viewport area and handles resize + devicePixelRatio.
 * PERF: rAF loop berhenti total saat canvas keluar viewport
 * (IntersectionObserver) — canvas hero tak lagi membakar CPU/GPU
 * saat user membaca section bawah.
 * ============================================================ */

interface FloatingParticlesProps {
  className?: string;
  maxParticles?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  color: string;
}

const PARTICLE_COLORS = ["#a78bfa", "#6366f1", "#ffffff"] as const;
const LINK_DISTANCE = 96;
const LINK_PARTICLE_CAP = 30;
const WRAP_MARGIN = 12;

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export default function FloatingParticles({
  className,
  maxParticles = 28,
}: FloatingParticlesProps): JSX.Element | null {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles: Particle[] = [];
    let width = 0;
    let height = 0;
    let raf = 0;
    let lastTime = performance.now();

    const seed = (w: number, h: number) => {
      // Scale count with viewport area so mobile gets fewer particles.
      const target = Math.round(maxParticles * Math.min(1, (w * h) / (1280 * 720)));
      const count = Math.max(6, Math.min(maxParticles, target));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: randomBetween(-0.18, 0.18),
        vy: randomBetween(-0.14, 0.14),
        radius: randomBetween(1, 2.5),
        baseAlpha: randomBetween(0.08, 0.3),
        twinkleSpeed: randomBetween(0.0006, 0.0018),
        twinklePhase: randomBetween(0, Math.PI * 2),
        color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
      }));
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed(width, height);
    };

    const drawLinks = () => {
      // Cap the O(n²) work — skip lines entirely above the particle cap.
      if (particles.length > LINK_PARTICLE_CAP) return;
      context.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        if (!a) continue;
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          if (!b) continue;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distance = Math.hypot(dx, dy);
          if (distance >= LINK_DISTANCE) continue;
          const alpha = (1 - distance / LINK_DISTANCE) * 0.08;
          context.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.stroke();
        }
      }
    };

    const frame = (now: number) => {
      const dt = Math.min(now - lastTime, 48);
      lastTime = now;
      const step = dt / 16.6667;

      context.clearRect(0, 0, width, height);
      drawLinks();

      for (const particle of particles) {
        particle.x += particle.vx * step;
        particle.y += particle.vy * step;
        if (particle.x < -WRAP_MARGIN) particle.x = width + WRAP_MARGIN;
        else if (particle.x > width + WRAP_MARGIN) particle.x = -WRAP_MARGIN;
        if (particle.y < -WRAP_MARGIN) particle.y = height + WRAP_MARGIN;
        else if (particle.y > height + WRAP_MARGIN) particle.y = -WRAP_MARGIN;

        const twinkle = 0.55 + 0.45 * Math.sin(now * particle.twinkleSpeed + particle.twinklePhase);
        context.globalAlpha = Math.max(0, particle.baseAlpha * twinkle);
        context.fillStyle = particle.color;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fill();
      }
      context.globalAlpha = 1;

      raf = requestAnimationFrame(frame);
    };

    /* Loop hanya berjalan saat canvas terlihat — hemat CPU/GPU
       saat user scroll ke bawah. */
    const startLoop = () => {
      if (raf === 0) {
        lastTime = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    const stopLoop = () => {
      if (raf !== 0) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) startLoop();
        else stopLoop();
      },
      { rootMargin: "80px" }
    );
    intersectionObserver.observe(canvas);
    resize();
    startLoop();

    return () => {
      stopLoop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, [reducedMotion, maxParticles]);

  if (reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
    />
  );
}
