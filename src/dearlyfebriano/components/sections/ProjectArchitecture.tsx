"use client";

import { useId, useMemo, useState, type JSX } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpLeft,
  GitBranch,
  Info,
  Layers3,
  RotateCcw,
  Search,
  X,
} from "lucide-react";

import FadeIn from "@/dearlyfebriano/components/animations/FadeIn";
import { SectionHeading } from "@/dearlyfebriano/components/ui/SectionHeading";
import { useLanguage } from "@/dearlyfebriano/i18n/language-context";
import type {
  ArchitectureEdge,
  ArchitectureNode,
  ProjectArchitecture as ProjectArchitectureData,
} from "@/dearlyfebriano/types";

/* ============================================================
 * Props and local types
 * ============================================================ */

interface ProjectArchitectureProps {
  architecture: ProjectArchitectureData | null;
}

interface ConnectedNode {
  node: ArchitectureNode;
  edge: ArchitectureEdge;
}

/* ============================================================
 * Helpers
 * ============================================================ */

function getCategoryColor(category?: string): string {
  const normalized = category?.toLowerCase() ?? "";

  if (normalized.includes("present") || normalized.includes("frontend")) {
    return "bg-sky-500";
  }

  if (normalized.includes("interface") || normalized.includes("ui")) {
    return "bg-cyan-500";
  }

  if (normalized.includes("core") || normalized.includes("state")) {
    return "bg-violet-500";
  }

  if (normalized.includes("domain") || normalized.includes("service")) {
    return "bg-emerald-500";
  }

  if (normalized.includes("storage") || normalized.includes("database")) {
    return "bg-amber-500";
  }

  if (normalized.includes("engine") || normalized.includes("processing")) {
    return "bg-rose-500";
  }

  if (normalized.includes("runtime") || normalized.includes("device")) {
    return "bg-indigo-500";
  }

  return "bg-primary";
}

function getNodeMap(nodes: ArchitectureNode[]): Map<string, ArchitectureNode> {
  return new Map(nodes.map((node) => [node.id, node]));
}

function matchesQuery(node: ArchitectureNode, query: string): boolean {
  if (!query) return true;

  const searchable = [node.label, node.description, node.category]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return searchable.includes(query);
}

/* ============================================================
 * Connection list
 * ============================================================ */

interface ConnectionListProps {
  title: string;
  direction: "incoming" | "outgoing";
  items: ConnectedNode[];
  emptyLabel: string;
  onSelect: (nodeId: string) => void;
}

function ConnectionList({
  title,
  direction,
  items,
  emptyLabel,
  onSelect,
}: ConnectionListProps): JSX.Element {
  const { t } = useLanguage();
  const Icon = direction === "incoming" ? ArrowUpLeft : ArrowDownRight;

  return (
    <div className="rounded-xl border border-border bg-background/40 p-4">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-primary" aria-hidden />
        <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
          {t(title)}
        </h4>
        <span className="ml-auto rounded-full bg-secondary px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
          {items.length}
        </span>
      </div>

      {items.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {items.map(({ node, edge }) => (
            <li key={`${edge.from}-${edge.to}-${node.id}`}>
              <button
                type="button"
                onClick={() => onSelect(node.id)}
                className="group flex w-full items-center gap-3 rounded-lg border border-border/70 bg-card px-3 py-2.5 text-left transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                aria-label={`${t("Inspect connected component")} ${node.label}`}
              >
                <span
                  className={`size-2 shrink-0 rounded-full ${getCategoryColor(node.category)}`}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-medium text-foreground">
                    {node.label}
                  </span>
                  <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">
                    {edge.label ||
                      (direction === "incoming"
                        ? t("Upstream component")
                        : t("Downstream component"))}
                  </span>
                </span>
                <ArrowRight className="size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 rounded-lg border border-dashed border-border px-3 py-4 text-xs text-muted-foreground">
          {t(emptyLabel)}
        </p>
      )}
    </div>
  );
}

/* ============================================================
 * Interactive Architecture Explorer
 * ============================================================ */

export default function ProjectArchitecture({
  architecture,
}: ProjectArchitectureProps): JSX.Element | null {
  const { t } = useLanguage();
  const markerId = `architecture-arrow-${useId().replace(/:/g, "")}`;

  const [selection, setSelection] = useState<{
    architecture: ProjectArchitectureData;
    nodeId: string;
  } | null>(null);
  const [search, setSearch] = useState("");

  const selectedNodeId =
    selection?.architecture === architecture ? selection.nodeId : null;

  const normalizedSearch = search.trim().toLowerCase();

  const nodeMap = useMemo(
    () => getNodeMap(architecture?.nodes ?? []),
    [architecture],
  );

  const selectedNode = selectedNodeId
    ? (nodeMap.get(selectedNodeId) ?? null)
    : null;

  const incomingConnections = useMemo<ConnectedNode[]>(() => {
    if (!architecture || !selectedNode) return [];

    return architecture.edges.flatMap((edge) => {
      if (edge.to !== selectedNode.id) return [];
      const node = nodeMap.get(edge.from);
      return node ? [{ node, edge }] : [];
    });
  }, [architecture, nodeMap, selectedNode]);

  const outgoingConnections = useMemo<ConnectedNode[]>(() => {
    if (!architecture || !selectedNode) return [];

    return architecture.edges.flatMap((edge) => {
      if (edge.from !== selectedNode.id) return [];
      const node = nodeMap.get(edge.to);
      return node ? [{ node, edge }] : [];
    });
  }, [architecture, nodeMap, selectedNode]);

  const matchingNodeCount = architecture
    ? architecture.nodes.filter((node) => matchesQuery(node, normalizedSearch))
        .length
    : 0;

  if (!architecture || architecture.nodes.length === 0) {
    return null;
  }

  const selectNode = (nodeId: string): void => {
    setSelection({ architecture, nodeId });
  };

  const clearExplorer = (): void => {
    setSelection(null);
    setSearch("");
  };

  return (
    <section aria-label={t("Project architecture explorer")} className="mt-14">
      {/* Header */}
      <FadeIn>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow={t("Architecture explorer")}
            title={t("Interactive Architecture Explorer")}
            description={t(
              "Explore the system one component at a time. Select a node to reveal its role, incoming dependencies, and downstream connections.",
            )}
          />

          <div className="flex items-center gap-2 rounded-md border border-border bg-secondary px-3 py-1.5">
            <GitBranch className="size-3.5 text-primary" aria-hidden />
            <span className="font-mono text-[10px] uppercase tracking-widest text-primary">
              {t("Interactive system map")}
            </span>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.08} className="mt-6">
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {/* Explorer toolbar */}
          <div className="flex flex-col gap-4 border-b border-border bg-background/30 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <Layers3 className="size-5" aria-hidden />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {t("System topology")}
                </p>
                <p className="font-mono text-[10px] text-muted-foreground">
                  {architecture.nodes.length} {t("components")} ·{" "}
                  {architecture.edges.length} {t("connections")}
                </p>
              </div>
            </div>

            <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
              <label className="relative min-w-0 flex-1 sm:min-w-[250px] lg:w-[300px]">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t("Find a component...")}
                  aria-label={t("Search architecture components")}
                  className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/10"
                />
              </label>

              <button
                type="button"
                onClick={clearExplorer}
                disabled={!selectedNodeId && !search}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border px-3 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/25 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RotateCcw className="size-3.5" aria-hidden />
                {t("Reset explorer")}
              </button>
            </div>
          </div>

          {/* Search result context */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 px-4 py-3 sm:px-5">
            <p className="text-[11px] text-muted-foreground" aria-live="polite">
              {normalizedSearch
                ? `${matchingNodeCount} ${t("matching components")}`
                : t("Select any component to inspect its connections.")}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-primary" />
                {t("Selected")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-500" />
                {t("Connected")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-muted-foreground/40" />
                {t("Other modules")}
              </span>
            </div>
          </div>

          {/* Architecture canvas */}
          <div className="overflow-x-auto bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.055)_1px,transparent_1px)] [background-size:20px_20px]">
            <div className="min-w-[820px] p-4 sm:p-6">
              <div className="relative min-h-[640px] w-full overflow-hidden rounded-xl border border-border bg-background/70">
                <svg
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 size-full"
                  viewBox="0 0 1000 640"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient
                      id={`${markerId}-gradient`}
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop
                        offset="0%"
                        stopColor="hsl(var(--primary) / 0.18)"
                      />
                      <stop
                        offset="50%"
                        stopColor="hsl(var(--primary) / 0.72)"
                      />
                      <stop
                        offset="100%"
                        stopColor="hsl(var(--primary) / 0.18)"
                      />
                    </linearGradient>
                    <marker
                      id={markerId}
                      markerWidth="8"
                      markerHeight="8"
                      refX="6"
                      refY="4"
                      orient="auto"
                    >
                      <path
                        d="M0,0 L8,4 L0,8 z"
                        fill="hsl(var(--primary) / 0.8)"
                      />
                    </marker>
                  </defs>

                  {architecture.edges.map((edge, index) => {
                    const from = nodeMap.get(edge.from);
                    const to = nodeMap.get(edge.to);
                    if (!from || !to) return null;

                    const x1 = (from.x / 100) * 1000;
                    const y1 = (from.y / 100) * 640;
                    const x2 = (to.x / 100) * 1000;
                    const y2 = (to.y / 100) * 640;
                    const midX = (x1 + x2) / 2;
                    const isConnected =
                      selectedNodeId !== null &&
                      (edge.from === selectedNodeId ||
                        edge.to === selectedNodeId);
                    const isSearchRelevant =
                      !normalizedSearch ||
                      matchesQuery(from, normalizedSearch) ||
                      matchesQuery(to, normalizedSearch);
                    const isDimmed =
                      (selectedNodeId !== null && !isConnected) ||
                      !isSearchRelevant;

                    return (
                      <g key={`${edge.from}-${edge.to}-${index}`}>
                        <path
                          d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                          fill="none"
                          stroke={
                            isConnected
                              ? "hsl(var(--primary) / 0.95)"
                              : `url(#${markerId}-gradient)`
                          }
                          strokeWidth={isConnected ? 3 : 2}
                          strokeDasharray={isConnected ? "5 5" : "7 7"}
                          markerEnd={`url(#${markerId})`}
                          opacity={isDimmed ? 0.12 : isConnected ? 1 : 0.72}
                          vectorEffect="non-scaling-stroke"
                        />
                        {edge.label && (
                          <text
                            x={midX}
                            y={(y1 + y2) / 2 - 7}
                            textAnchor="middle"
                            className="fill-muted-foreground text-[10px]"
                            opacity={isDimmed ? 0.15 : 0.9}
                          >
                            {edge.label}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* Component nodes */}
                {architecture.nodes.map((node) => {
                  const isSelected = selectedNodeId === node.id;
                  const isConnected =
                    selectedNodeId !== null &&
                    architecture.edges.some(
                      (edge) =>
                        (edge.from === selectedNodeId && edge.to === node.id) ||
                        (edge.to === selectedNodeId && edge.from === node.id),
                    );
                  const isMatch = matchesQuery(node, normalizedSearch);
                  const isDimmed =
                    (!isMatch && normalizedSearch.length > 0) ||
                    (selectedNodeId !== null && !isSelected && !isConnected);

                  return (
                    <button
                      key={node.id}
                      type="button"
                      onClick={() =>
                        setSelection((current) =>
                          current?.architecture === architecture &&
                          current.nodeId === node.id
                            ? null
                            : { architecture, nodeId: node.id },
                        )
                      }
                      className={[
                        "absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-xl border text-left shadow-sm transition-all duration-200",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        isSelected
                          ? "z-20 scale-[1.03] border-primary bg-primary/10 shadow-lg shadow-primary/10"
                          : isConnected
                            ? "border-emerald-500/60 bg-card shadow-md"
                            : "border-border bg-card hover:border-primary/50 hover:shadow-md",
                      ].join(" ")}
                      style={{
                        left: `${node.x}%`,
                        top: `${node.y}%`,
                        width: "200px",
                        minHeight: "108px",
                        opacity: isDimmed ? 0.28 : 1,
                      }}
                      aria-pressed={isSelected}
                      aria-label={`${t("Inspect component")}: ${node.label}. ${node.description ?? ""}`}
                    >
                      <div className="p-3.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex min-w-0 items-center gap-2 font-mono text-[9px] uppercase tracking-[0.13em] text-muted-foreground">
                            <span
                              className={`size-2 shrink-0 rounded-full ${getCategoryColor(node.category)}`}
                            />
                            <span className="truncate">
                              {node.category ?? t("System")}
                            </span>
                          </span>
                          <span
                            className={[
                              "shrink-0 rounded-full px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider",
                              isSelected
                                ? "bg-primary/15 text-primary"
                                : isConnected
                                  ? "bg-emerald-500/10 text-emerald-500"
                                  : "bg-secondary text-muted-foreground",
                            ].join(" ")}
                          >
                            {isSelected
                              ? t("Selected")
                              : isConnected
                                ? t("Connected")
                                : t("Module")}
                          </span>
                        </div>

                        <p className="mt-2 text-sm font-semibold leading-snug text-foreground">
                          {node.label}
                        </p>

                        {node.description && (
                          <p className="mt-1.5 line-clamp-2 text-[10px] leading-relaxed text-muted-foreground">
                            {node.description}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}

                {/* Canvas helper */}
                {!selectedNode && (
                  <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/95 px-3 py-2 font-mono text-[9px] uppercase tracking-widest text-muted-foreground shadow-sm">
                      <Info className="size-3" aria-hidden />
                      {t("Select a component to trace its connections")}
                    </span>
                  </div>
                )}

                {normalizedSearch && matchingNodeCount === 0 && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <span className="rounded-lg border border-border bg-background/95 px-4 py-3 text-sm text-muted-foreground shadow-sm">
                      {t("No matching component found")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Selected component inspector */}
          {selectedNode && (
            <div className="border-t border-border bg-background/30 p-4 sm:p-5">
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="mt-1 grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Layers3 className="size-4" aria-hidden />
                    </div>
                    <div className="min-w-0">
                      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
                        {selectedNode.category ?? t("System component")}
                      </p>
                      <h3 className="mt-1 text-lg font-semibold text-foreground">
                        {selectedNode.label}
                      </h3>
                      {selectedNode.description && (
                        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                          {selectedNode.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelection(null)}
                    className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-foreground/25 hover:text-foreground"
                    aria-label={t("Close component details")}
                    title={t("Close")}
                  >
                    <X className="size-4" aria-hidden />
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <ConnectionList
                    title="Receives from"
                    direction="incoming"
                    items={incomingConnections}
                    emptyLabel="No incoming connection is defined for this component."
                    onSelect={selectNode}
                  />
                  <ConnectionList
                    title="Sends to"
                    direction="outgoing"
                    items={outgoingConnections}
                    emptyLabel="No outgoing connection is defined for this component."
                    onSelect={selectNode}
                  />
                </div>

                <p className="text-[10px] leading-relaxed text-muted-foreground">
                  {t(
                    "Choose any connected component above to continue tracing the architecture flow.",
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </FadeIn>
    </section>
  );
}
