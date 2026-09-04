"use client";

import { Circle, Loader2, Archive } from "lucide-react";
import type { ProjectStatus } from "@/dearlyfebriano/types";
import { useLanguage } from "@/dearlyfebriano/i18n/language-context";
import { cn } from "@/lib/utils";

/* ============================================================
 * StatusBadge — status project: Live / In Progress / Archived.
 * ============================================================ */

const STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; icon: typeof Circle; className: string; dotClass: string }
> = {
  live: {
    label: "Live",
    icon: Circle,
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
    dotClass: "bg-emerald-500",
  },
  "in-progress": {
    label: "In Progress",
    icon: Loader2,
    className: "border-amber-500/30 bg-amber-500/10 text-amber-500",
    dotClass: "bg-amber-500",
  },
  archived: {
    label: "Archived",
    icon: Archive,
    className: "border-zinc-500/30 bg-zinc-500/10 text-zinc-400",
    dotClass: "bg-zinc-400",
  },
};

export interface StatusBadgeProps {
  status: ProjectStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const { t } = useLanguage();
  const Icon = config.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        config.className,
        className
      )}
    >
      {status === "in-progress" ? (
        <Icon className="size-3 animate-spin [animation-duration:3s]" />
      ) : (
        <span className={cn("size-1.5 rounded-full", config.dotClass)} aria-hidden />
      )}
      {t(config.label)}
    </span>
  );
}
