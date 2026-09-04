"use client";

import type { ComponentType } from "react";
import { Code2, Cloud } from "lucide-react";
import {
  SiReact,
  SiNextdotjs,
  SiTypescript,
  SiJavascript,
  SiTailwindcss,
  SiRedux,
  SiFramer,
  SiSass,
  SiVite,
  SiNodedotjs,
  SiExpress,
  SiNestjs,
  SiGraphql,
  SiPostgresql,
  SiMongodb,
  SiMysql,
  SiRedis,
  SiPrisma,
  SiDocker,
  SiVercel,
  SiGit,
  SiGithub,
  SiFigma,
  SiPostman,
  SiLinux,
  SiJest,
  SiNginx,
  SiStripe,
  SiSocketdotio,
  SiMapbox,
  SiD3,
  SiDart,
  SiPhp,
  SiJquery,
  SiStorybook,
  SiShadcnui,
  SiGithubactions,
} from "react-icons/si";
import { cn } from "@/lib/utils";

/* ============================================================
 * TechIcon — merender brand icon berdasarkan nama teknologi.
 * Fallback: generic Code2 icon jika tidak ada mapping.
 * ============================================================ */

type IconComponent = ComponentType<{ className?: string }>;

const ICON_MAP: Record<string, IconComponent> = {
  react: SiReact,
  "react native": SiReact,
  nextjs: SiNextdotjs,
  "next.js": SiNextdotjs,
  typescript: SiTypescript,
  javascript: SiJavascript,
  "tailwind css": SiTailwindcss,
  tailwind: SiTailwindcss,
  redux: SiRedux,
  "framer motion": SiFramer,
  sass: SiSass,
  vite: SiVite,
  "node.js": SiNodedotjs,
  nodejs: SiNodedotjs,
  express: SiExpress,
  nestjs: SiNestjs,
  graphql: SiGraphql,
  postgresql: SiPostgresql,
  prisma: SiPrisma,
  mongodb: SiMongodb,
  mysql: SiMysql,
  redis: SiRedis,
  docker: SiDocker,
  vercel: SiVercel,
  git: SiGit,
  github: SiGithub,
  figma: SiFigma,
  postman: SiPostman,
  linux: SiLinux,
  jest: SiJest,
  aws: Cloud,
  nginx: SiNginx,
  stripe: SiStripe,
  "socket.io": SiSocketdotio,
  websockets: SiSocketdotio,
  mapbox: SiMapbox,
  "d3.js": SiD3,
  dart: SiDart,
  php: SiPhp,
  jquery: SiJquery,
  storybook: SiStorybook,
  shadcn: SiShadcnui,
  "ci/cd": SiGithubactions,
  sqlite: SiPrisma,
};

export interface TechIconProps {
  name: string;
  className?: string;
}

export function TechIcon({ name, className }: TechIconProps) {
  const key = name.toLowerCase().trim();
  const Icon = ICON_MAP[key];
  if (!Icon) {
    return <Code2 aria-hidden className={cn("size-4", className)} />;
  }
  return <Icon aria-hidden className={cn("size-4", className)} />;
}

export interface TechBadgeProps {
  name: string;
  className?: string;
  size?: "sm" | "md";
}

/** Pill badge dengan brand icon + nama teknologi. */
export function TechBadge({ name, className, size = "sm" }: TechBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-card/80 font-mono text-foreground/80 backdrop-blur transition-colors hover:border-primary/50 hover:text-foreground",
        size === "sm" ? "px-2.5 py-0.5 text-[11px]" : "px-3 py-1 text-xs",
        className
      )}
    >
      <TechIcon name={name} className={size === "sm" ? "size-3" : "size-3.5"} />
      {name}
    </span>
  );
}
