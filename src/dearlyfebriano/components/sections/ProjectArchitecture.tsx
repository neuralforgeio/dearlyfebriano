"use client";

import { useMemo, useState, type JSX } from "react";

import { GitBranch, Info, Layers3 } from "lucide-react";

import FadeIn from "@/dearlyfebriano/components/animations/FadeIn";


import { SectionHeading } from "@/dearlyfebriano/components/ui/SectionHeading";

import { useLanguage } from "@/dearlyfebriano/i18n/language-context";

import type {
ArchitectureNode,
  ProjectArchitecture,
} from "@/dearlyfebriano/types";

/* ============================================================
 * Props
 * ============================================================ */

interface ProjectArchitectureProps {
  architecture: ProjectArchitecture | null;
}

/* ============================================================
 * Helper
 * ============================================================ */

function getNode(
  nodes: ArchitectureNode[],
  id: string,
): ArchitectureNode | undefined {
  return nodes.find((node) => node.id === id);
}

/* ============================================================
 * Component
 * ============================================================ */

export default function ProjectArchitecture({
  architecture,
}: ProjectArchitectureProps): JSX.Element | null {
  const { t } = useLanguage();

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const selectedNode = useMemo(() => {
    if (!architecture || !selectedNodeId) {
      return null;
    }

    return getNode(architecture.nodes, selectedNodeId) ?? null;
  }, [architecture, selectedNodeId]);

  if (!architecture || architecture.nodes.length === 0) {
    return null;
  }

  const nodeWidth = 190;
  const nodeHeight = 96;

  return (
    <section aria-label={t("Project architecture")} className="mt-14">
      {/* ======================================================
       * Header
       * ====================================================== */}

      <FadeIn>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow={t("Architecture")}
            title={t("How it fits together")}
            description={t(
              "A high-level view of the major systems and how data flows between them.",
            )}
          />

          <div className="hidden items-center gap-2 rounded-md border border-border bg-secondary px-3 py-1.5 sm:flex">
            <GitBranch className="size-3.5 text-primary" aria-hidden />

            <span className="font-mono text-[10px] uppercase tracking-widest text-primary">
              {t("System map")}
            </span>
          </div>
        </div>
      </FadeIn>

      {/* ======================================================
       * Main Architecture Canvas
       * ====================================================== */}

      <FadeIn delay={0.08} className="mt-6">
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="border-b border-border bg-background/30 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                <Layers3 className="size-4" aria-hidden />
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground">
                  {t("Architecture overview")}
                </p>

                <p className="font-mono text-[10px] text-muted-foreground">
                  {architecture.nodes.length} {t("nodes")} ·{" "}
                  {architecture.edges.length} {t("connections")}
                </p>
              </div>
            </div>
          </div>

          {/* ==================================================
           * SVG canvas
           * ================================================== */}

          <div className="overflow-x-auto bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.055)_1px,transparent_1px)] [background-size:20px_20px]">
            <div className="min-w-[760px] p-6 sm:p-8">
              <div className="relative aspect-[16/10] min-h-[560px] w-full overflow-hidden rounded-xl border border-border bg-background/70">
                <svg
                  aria-hidden="true"
                  className="absolute inset-0 size-full"
                  viewBox="0 0 1000 625"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient
                      id="architecture-line-gradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop
                        offset="0%"
                        stopColor="hsl(var(--primary) / 0.16)"
                      />

                      <stop
                        offset="50%"
                        stopColor="hsl(var(--primary) / 0.7)"
                      />

                      <stop
                        offset="100%"
                        stopColor="hsl(var(--primary) / 0.16)"
                      />
                    </linearGradient>

                    <marker
                      id="architecture-arrow"
                      markerWidth="8"
                      markerHeight="8"
                      refX="6"
                      refY="4"
                      orient="auto"
                    >
                      <path
                        d="M0,0 L8,4 L0,8 z"
                        fill="hsl(var(--primary) / 0.65)"
                      />
                    </marker>
                  </defs>

                  {/* Connections */}

                  {architecture.edges.map((edge) => {
                    const from = getNode(architecture.nodes, edge.from);

                    const to = getNode(architecture.nodes, edge.to);

                    if (!from || !to) {
                      return null;
                    }

                    const x1 = (from.x / 100) * 1000;

                    const y1 = (from.y / 100) * 625;

                    const x2 = (to.x / 100) * 1000;

                    const y2 = (to.y / 100) * 625;

                    const midX = (x1 + x2) / 2;

                    return (
                      <g key={`${edge.from}-${edge.to}`}>
                        <path
                          d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                          fill="none"
                          stroke="url(#architecture-line-gradient)"
                          strokeWidth="2"
                          strokeDasharray="7 6"
                          markerEnd="url(#architecture-arrow)"
                          vectorEffect="non-scaling-stroke"
                        />

                        {edge.label && (
                          <text
                            x={midX}
                            y={(y1 + y2) / 2 - 6}
                           textAnchor="middle"
                            className="fill-muted-foreground text-[10px]"
                          >
                            {edge.label}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* ==================================================
                 * Nodes
                 * ================================================== */}

                {architecture.nodes.map((node) => {
                  const isSelected = selectedNodeId === node.id;

                  return (
                    <button
                      key={node.id}
                      type="button"
                      onClick={() =>
                        setSelectedNodeId(isSelected ? null : node.id)
                      }
                      className={[
                        "absolute -translate-x-1/2 -translate-y-1/2 rounded-xl border text-left transition-all duration-300",
                        "hover:-translate-x-1/2 hover:-translate-y-[calc(50%+3px)]",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70",
                        isSelected
                          ? "z-20 border-primary/70 bg-primary/10 shadow-md"
                          : "z-10 border-border bg-card shadow-sm hover:border-foreground/25",
                      ].join(" ")}
                      style={{
                        left: `${node.x}%`,
                        top: `${node.y}%`,
                        width: `${nodeWidth}px`,
                        minHeight: `${nodeHeight}px`,
                      }}
                      aria-pressed={isSelected}
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-primary">
                            {node.category ?? "System"}
                          </span>

                          <span
                            className={[
                              "size-1.5 rounded-full",
                              isSelected
                                ? "bg-primary"
                                : "bg-muted-foreground/40",
                            ].join(" ")}
                          />
                        </div>

                        <p className="mt-2 text-sm font-semibold text-foreground">
                          {node.label}
                        </p>

                        {node.description && (
                          <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-muted-foreground">
                            {node.description}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}

                {/* ==================================================
                 * Center status
                 * ================================================== */}

                {!selectedNode && (
                  <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                      <Info className="size-3" aria-hidden />

                      {t("Click a node to inspect it")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ==================================================
           * Selected Node Detail
           * ================================================== */}

          {selectedNode && (
            <div className="border-t border-border bg-background/30 px-5 py-5 sm:px-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                    {selectedNode.category ?? t("System")}
                  </p>

                  <h3 className="mt-1 text-lg font-semibold text-foreground">
                    {selectedNode.label}
                  </h3>

                  {selectedNode.description && (
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                      {selectedNode.description}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedNodeId(null)}
                  className="self-start rounded-full border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:border-foreground/25 hover:text-foreground"
                >
                  {t("Close")}
                </button>
              </div>
            </div>
          )}
        </div>
      </FadeIn>
    </section>
  );
}
