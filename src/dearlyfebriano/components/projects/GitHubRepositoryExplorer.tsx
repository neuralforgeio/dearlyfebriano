"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Github,
  Star,
  GitFork,
  ExternalLink,
  Search,
  RefreshCw,
  Code2,
  Package,
} from "lucide-react";

import { Input } from "@/components/ui/input";

type Repository = {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  homepage: string | null;
  language: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  updatedAt: string;
  pushedAt: string;
  topics: string[];
  isFork: boolean;
  isArchived: boolean;
  defaultBranch: string;
  license: string | null;
};

type RepositoryResponse = {
  username: string;
  totalRepositories: number;
  repositories: Repository[];
  updatedAt: string;
};

type SortBy = "updated" | "stars" | "forks";

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "bg-[#3178c6]",
  JavaScript: "bg-[#f1e05a]",
  Python: "bg-[#3572A5]",
  Go: "bg-[#00ADD8]",
  Rust: "bg-[#dea584]",
  Java: "bg-[#b07219]",
  HTML: "bg-[#e34c26]",
  CSS: "bg-[#563d7c]",
  PHP: "bg-[#4F5D95]",
  Ruby: "bg-[#701516]",
  Dart: "bg-[#00B4AB]",
  Shell: "bg-[#89e051]",
};

function formatDate(date: string): string {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function RepositoryCard({ repository }: { repository: Repository }) {
  const languageColor = repository.language
    ? (LANGUAGE_COLORS[repository.language] ?? "bg-primary")
    : "bg-muted-foreground";

  return (
    <article className="group flex h-full flex-col rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
            <Github className="size-5" />
          </div>

          <div className="min-w-0">
            <h3 className="truncate font-semibold text-foreground transition-colors group-hover:text-emerald-500">
              {repository.name}
            </h3>

            <p className="truncate text-[11px] text-muted-foreground">
              {repository.fullName}
            </p>
          </div>
        </div>

        <a
          href={repository.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${repository.name} on GitHub`}
          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ExternalLink className="size-4" />
        </a>
      </div>

      <p className="mt-4 min-h-10 text-sm leading-relaxed text-muted-foreground line-clamp-2">
        {repository.description || "No description provided."}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
        {repository.language && (
          <span className="inline-flex items-center gap-1.5">
            <span className={`size-2.5 rounded-full ${languageColor}`} />
            {repository.language}
          </span>
        )}

        <span className="inline-flex items-center gap-1">
          <Star className="size-3.5" />
          {repository.stars.toLocaleString("en-US")}
        </span>

        <span className="inline-flex items-center gap-1">
          <GitFork className="size-3.5" />
          {repository.forks.toLocaleString("en-US")}
        </span>
      </div>

      {repository.topics.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {repository.topics.slice(0, 4).map((topic) => (
            <span
              key={topic}
              className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium text-emerald-500"
            >
              {topic}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-4 mt-5 text-[11px] text-muted-foreground">
        <span className="flex flex-wrap items-center gap-2">
          {repository.isFork && (
            <span className="inline-flex items-center gap-1">
              <GitFork className="size-3" />
              Fork
            </span>
          )}

          {repository.isArchived && (
            <span className="rounded-full border border-amber-500/30 px-2 py-0.5 text-amber-500">
              Archived
            </span>
          )}

          {!repository.isFork && !repository.isArchived && (
            <span className="text-emerald-500">Public</span>
          )}
        </span>

        <span>Updated {formatDate(repository.updatedAt)}</span>
      </div>

      {repository.homepage && (
        <a
          href={repository.homepage}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
        >
          Visit website
          <ExternalLink className="size-3" />
        </a>
      )}
    </article>
  );
}

export default function GitHubRepositoryExplorer() {
  const [data, setData] = useState<RepositoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState("all");
  const [sortBy, setSortBy] = useState<SortBy>("updated");
  const [visibleCount, setVisibleCount] = useState(8);

  const loadRepositories = useCallback(async (refresh = false) => {
    try {
      setLoading(true);
      setError("");

      const endpoint = refresh
        ? "/api/github-repositories?refresh=1"
        : "/api/github-repositories";

      const response = await fetch(endpoint, {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          [result.error, result.details].filter(Boolean).join(" — ") ||
            "Failed to load repositories.",
        );
      }

      setData(result as RepositoryResponse);
      setVisibleCount(8);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRepositories();
  }, [loadRepositories]);

  const repositories = data?.repositories ?? [];

  const languages = useMemo(
    () =>
      Array.from(
        new Set(
          repositories
            .map((repo) => repo.language)
            .filter((value): value is string => Boolean(value)),
        ),
      ).sort(),
    [repositories],
  );

  const filteredRepositories = useMemo(() => {
    const query = search.trim().toLowerCase();

    return repositories
      .filter((repo) => {
        const matchesLanguage =
          language === "all" || repo.language === language;

        const matchesSearch =
          !query ||
          repo.name.toLowerCase().includes(query) ||
          repo.fullName.toLowerCase().includes(query) ||
          (repo.description ?? "").toLowerCase().includes(query) ||
          (repo.language ?? "").toLowerCase().includes(query) ||
          repo.topics.some((topic) => topic.toLowerCase().includes(query));

        return matchesLanguage && matchesSearch;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "stars":
            return b.stars - a.stars;

          case "forks":
            return b.forks - a.forks;

          case "updated":
          default:
            return (
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            );
        }
      });
  }, [repositories, search, language, sortBy]);

  const totalStars = repositories.reduce((sum, repo) => sum + repo.stars, 0);

  const totalForks = repositories.reduce((sum, repo) => sum + repo.forks, 0);

  const visibleRepositories = filteredRepositories.slice(0, visibleCount);

  return (
    <section aria-label="GitHub repositories" className="mt-10">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500" />
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-500">
              Open Source
            </p>
          </div>

          <h2 className="mt-2 text-2xl font-semibold text-foreground">
            GitHub Repository Explorer
          </h2>

          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Explore my public repositories, technologies, and development work.
          </p>
        </div>

        <a
          href={`https://github.com/${data?.username ?? "neuralforgeio"}?tab=repositories`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:bg-muted"
        >
          <Github className="size-4" />
          GitHub Profile
        </a>
      </div>

      {/* Loading */}
      {loading && !data && (
        <div className="mt-6 rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Loading GitHub repositories...
        </div>
      )}

      {/* Error */}
      {!loading && error && !data && (
        <div className="mt-6 rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-destructive">{error}</p>

          <button
            type="button"
            onClick={() => void loadRepositories(true)}
            className="mt-3 inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <RefreshCw className="size-4" />
            Try again
          </button>
        </div>
      )}

      {data && (
        <>
          {/* Statistics */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              {
                label: "Repositories",
                value: repositories.length,
                icon: Package,
              },
              {
                label: "Total Stars",
                value: totalStars,
                icon: Star,
              },
              {
                label: "Total Forks",
                value: totalForks,
                icon: GitFork,
              },
            ].map((stat) => {
              const Icon = stat.icon;

              return (
                <article
                  key={stat.label}
                  className="rounded-xl border border-border bg-card p-3 sm:p-5"
                >
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Icon className="size-4 text-emerald-500" />
                    <span className="text-xs sm:text-sm">{stat.label}</span>
                  </div>

                  <p className="mt-3 text-xl font-semibold text-foreground sm:text-3xl">
                    {stat.value.toLocaleString("en-US")}
                  </p>
                </article>
              );
            })}
          </div>

          {/* Search + filters */}
          <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setVisibleCount(8);
                }}
                placeholder="Search repositories..."
                aria-label="Search repositories"
                className="pl-9"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                value={language}
                onChange={(event) => {
                  setLanguage(event.target.value);
                  setVisibleCount(8);
                }}
                aria-label="Filter by programming language"
                className="h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary"
              >
                <option value="all">All languages</option>

                {languages.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as SortBy)}
                aria-label="Sort repositories"
                className="h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary"
              >
                <option value="updated">Recently updated</option>
                <option value="stars">Most stars</option>
                <option value="forks">Most forks</option>
              </select>

              <button
                type="button"
                onClick={() => void loadRepositories(true)}
                disabled={loading}
                aria-label="Refresh repositories"
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-border px-3 text-sm text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
              >
                <RefreshCw
                  className={`size-4 ${loading ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              Showing {visibleRepositories.length} of{" "}
              {filteredRepositories.length} repositories
            </p>

            <p className="text-xs text-muted-foreground">
              Synced {new Date(data.updatedAt).toLocaleString("id-ID")}
            </p>
          </div>

          {/* Repository grid */}
          {visibleRepositories.length > 0 ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {visibleRepositories.map((repository) => (
                <RepositoryCard key={repository.id} repository={repository} />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-border bg-card px-6 py-14 text-center">
              <Code2 className="mx-auto size-9 text-muted-foreground/50" />

              <h3 className="mt-3 font-semibold text-foreground">
                No repositories found
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Try another search keyword or language.
              </p>
            </div>
          )}

          {/* Load more */}
          {visibleCount < filteredRepositories.length && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => setVisibleCount((count) => count + 8)}
                className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:border-emerald-500/50 hover:bg-emerald-500/5 hover:text-emerald-500"
              >
                Load more repositories
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 border-t border-border pt-4 text-center">
            <p className="text-xs text-muted-foreground">
              Public repositories from @{data.username}
            </p>
          </div>
        </>
      )}
    </section>
  );
}
