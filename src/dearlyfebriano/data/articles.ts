import type { Article } from "@/dearlyfebriano/types";

/* ============================================================
 * TECH NOTES DATA — selaras kisah nyata: lulusan SMA Dr. Soetomo
 * Surabaya, self-taught, freelance di CV Builder Instant Resume
 * (2023), self-employed full-stack & AI agent developer (2024–),
 * Setiap artikel disusun dari "sections" (paragraph, heading,
 * list, quote, code, callout) agar mudah diedit tanpa markdown.
 * ============================================================ */

export const articles: Article[] = [
  {
    slug: "tuning-portfolio-performance",
    title: "How I Tuned My Portfolio to Feel 2× Faster",
    excerpt:
      "My own site felt heavy on an integrated-GPU laptop. Here is the exact playbook — five changes that kept every animation and cut the render cost in half.",
    publishedAt: "2026-02-18",
    readingMinutes: 7,
    tags: ["Next.js", "Performance", "Framer Motion", "Web Vitals"],
    category: "tutorial",
    featured: true,
    sections: [
      {
        type: "paragraph",
        text: "This portfolio is my own project, so when it felt laggy while scrolling on my laptop — an integrated GPU, like most machines people actually use — I had nobody to blame but myself. The frustrating part: DevTools showed nothing obviously wrong. No giant bundle, no blocking requests. The jank was in the rendering, and finding it meant learning how the compositor actually spends its budget. Here is the ordered playbook that took the site from noticeably heavy to smooth, without deleting a single animation.",
      },
      { type: "heading", text: "First finding: animated blur is the silent killer" },
      {
        type: "paragraph",
        text: "The hero had three large ambient orbs with 120px+ blur filters, drifting slowly. It looked gentle — but a filter re-rasterizes every frame the element moves. On a discrete GPU that's fine; on an integrated one, three full-screen blurs at 60fps eat the entire frame budget. The fix surprised me: I replaced each blur with a radial-gradient of the same color. Visually near-identical, computationally free. The animation still runs — the GPU just stops paying for it.",
      },
      { type: "heading", text: "The five changes, in order of impact" },
      {
        type: "list",
        items: [
          "Removed mix-blend-mode overlays that forced full-screen re-composite whenever anything animated underneath them — the visual payoff was 3% opacity; the cost was most of my frame budget.",
          "Replaced backdrop-blur on moving elements (a marquee of 40 tech pills) with an opaque 'flat glass' utility — re-blurring a moving backdrop every frame was the single biggest jank source.",
          "Stopped the particle canvas with an IntersectionObserver when it scrolled out of view — no point running a rAF loop nobody can see.",
          "Added content-visibility: auto with contain-intrinsic-size to every below-the-fold section, so the browser skips layout and paint for content outside the viewport.",
          "Code-split every non-home view with next/dynamic — the initial chunk shrank to just the shell and the landing view.",
        ],
      },
      {
        type: "callout",
        variant: "tip",
        text: "Record the Performance panel before and after each change — one change at a time. Twice I was sure a fix was helping, and the trace showed it did nothing while a smaller change had done all the work.",
      },
      { type: "heading", text: "Rotating elements must never carry filters" },
      {
        type: "paragraph",
        text: "The second-biggest win was my avatar's rotating glow ring. It had a blur-md filter — which meant the browser re-rasterized a blurred circle on every frame of a continuous rotation. I replaced it with two stacked arc strokes at lower opacity. Same soft glow, zero filter cost, pure compositor work. The rule I took from this: anything that animates transform infinitely should own nothing but transform and opacity.",
      },
      {
        type: "code",
        language: "css",
        code: "/* Before: re-rasterized every frame */\n.glow-ring {\n  animation: spin 12s linear infinite;\n  filter: blur(8px); /* ← the problem */\n}\n\n/* After: compositor-only, same softness */\n.glow-ring::before,\n.glow-ring::after {\n  border: 2px solid rgba(139, 92, 246, 0.4);\n  border-radius: 9999px;\n}",
      },
      { type: "heading", text: "Install time is user time too" },
      {
        type: "paragraph",
        text: "The site's Vercel builds were also crawling — four minutes, mostly npm install. I removed twenty unused dependencies (a markdown editor alone had dragged in a sandboxed code editor and half of CodeMirror), deleted six shadcn components nothing imported, and committed the Bun lockfile so Vercel could use its fast installer. Builds dropped to just over a minute. Cutting dependencies isn't housekeeping — it's a performance feature with a build-time bonus.",
      },
      {
        type: "quote",
        text: "Performance work isn't removing animations. It's making each frame cheap enough that the animations you love can actually run.",
        author: "Note to self, after the third 60fps trace",
      },
    ],
  },
  {
    slug: "local-first-storage-choices",
    title: "Why My Offline-First Agent Runs on SQLite",
    excerpt:
      "The default answer for app storage is a hosted Postgres. For software that must live on the user's machine, I keep choosing the boring single file — here's the honest decision framework.",
    publishedAt: "2025-07-12",
    readingMinutes: 6,
    tags: ["SQLite", "Local-First", "Architecture", "Opinion"],
    category: "opinion",
    featured: false,
    sections: [
      { type: "heading", text: "The case for the boring file" },
      {
        type: "list",
        items: [
          "No network hop — agent steps that read state complete in microseconds, which changes how eagerly you can checkpoint work.",
          "One file. Backup is cp. Staging is a file copy. There is no 3am connection-pool incident on a machine you own.",
          "Zero config for the user — the database is just part of the install, not a service they babysit.",
          "WAL mode handles the read-heavy pattern of an agent (constant reads, occasional writes) comfortably.",
        ],
      },
      {
        type: "callout",
        variant: "info",
        text: "SQLite's real ceiling isn't throughput — it's write concurrency. A single writer at a time, serialized. The moment you have many concurrent writers, that's your exit sign.",
      },
      { type: "heading", text: "The three questions I actually ask" },
      {
        type: "paragraph",
        text: "Does the software fundamentally live on one machine? Is the write pattern moderate rather than massively concurrent? Do I need the data to travel with the user, privately, by default? For an offline-first agent, three yeses. For a multiplayer web app, zero yeses — and it gets Postgres. The framework is boring on purpose; the failure mode of storage choices is picking by hype and discovering the mismatch in production.",
      },
      { type: "heading", text: "The schema discipline it forces" },
      {
        type: "paragraph",
        text: "A local database with no migration service makes you honest about migrations: they ship with the app, they must run on open, and they must be idempotent because users skip versions. That constraint improved my schema hygiene more than any hosted tooling did — you stop treating data as someone else's problem when it lives on the machine of the person who trusted you.",
      },
      {
        type: "quote",
        text: "The best database is the one whose failure modes you can debug at 3am without an internet connection.",
        author: "Hard-won preference",
      },
    ],
  },
  {
    slug: "self-taught-after-high-school",
    title: "Self-Taught After High School: My First Years in Software",
    excerpt:
      "No bootcamp, no CS degree — just a high school diploma, an internet connection, and a habit of building things slightly beyond my level. Here's the honest map.",
    publishedAt: "2025-03-08",
    readingMinutes: 8,
    tags: ["Career", "Learning", "Self-Taught", "Freelance"],
    category: "career",
    featured: false,
    sections: [
      {
        type: "paragraph",
        text: "I finished senior high school in Surabaya with a diploma and a habit: following what engineers around the world were building and trying to reproduce the interesting parts myself. No bootcamp, no CS program. Within a year I had shipped a freelance project; within two I was self-employed. This is the honest map — the habits that worked, the detours that didn't, and the parts nobody puts on a highlight reel.",
      },
      { type: "heading", text: "Research is a skill, not a mood" },
      {
        type: "paragraph",
        text: "My biggest advantage wasn't talent — it was that I treated following global tech trends as a discipline. Every week I read what shipped, what broke, and what people were arguing about. When the AI agent wave started, I wasn't reading about it for the first time; I was already positioned to start building. In an industry that reinvents itself yearly, staying current is compound interest.",
      },
      { type: "heading", text: "The first client taught me the most" },
      {
        type: "paragraph",
        text: "My first real work was building a CV-builder web app for Instant Resume as a freelance software engineer. The code wasn't my best — the lessons were. Shipping for someone who actually pays changes you: the deadline is real, the bugs are urgent, and 'it works on my machine' is not an answer. That single project taught me more about being an engineer than months of tutorials.",
      },
      {
        type: "callout",
        variant: "tip",
        text: "The exercise that broke my tutorial loop: rebuild the same app three times without looking anything up — a CV builder, then a version with real form validation, then one with a working export pipeline. The third build shows you what the first two were hiding.",
      },
      { type: "heading", text: "What actually compounds" },
      {
        type: "list",
        items: [
          "Building in public — my portfolio and my projects are documented because employers and clients read those more than certificates.",
          "Structured courses as checkpoints, not crutches — the Kaggle ML series and Dicoding's JavaScript path gave me proof of fundamentals I'd already practiced.",
          "Writing down what broke — my debugging notes became this site's Tech Notes and my best interview stories.",
        ],
      },
      { type: "heading", text: "The uncomfortable truths" },
      {
        type: "paragraph",
        text: "Self-taught means being honest about gaps: I learned the hard way that fundamentals matter — you can ship with a framework before understanding the platform, but the debt compounds. So I went back and filled holes deliberately: how the browser actually renders, how databases actually store, how networks actually fail. The impressive stuff sits on top of the boring stuff, and the boring stuff is learnable by anyone who wants it.",
      },
      {
        type: "quote",
        text: "A degree proves you finished a curriculum. Shipping proves you can start one. In this industry, the second is rarer.",
        author: "To every self-taught builder in Indonesia",
      },
      { type: "heading", text: "If you're starting where I did" },
      {
        type: "list",
        items: [
          "Month 1–3: one language deeply, git in your fingers, deploy something — anything — weekly.",
          "Month 4–9: three real projects, each with one feature you don't know how to build yet.",
          "Month 10+: take one paid or free project for a real client, then write publicly about everything it taught you.",
        ],
      },
    ],
  },
];

export const featuredArticles = articles.filter((a) => a.featured);

export const getArticleBySlug = (slug: string) => articles.find((a) => a.slug === slug);

export const getAdjacentArticles = (slug: string) => {
  const index = articles.findIndex((a) => a.slug === slug);
  const prev = index > 0 ? articles[index - 1] : null;
  const next = index < articles.length - 1 ? articles[index + 1] : null;
  return { prev, next };
};

/** Artikel terkait — skor: kategori sama +3, tiap tag sama +1.
 *  Bila tidak ada yang cocok (tag/kategori unik), fallback ke
 *  artikel terbaru lainnya supaya section tetap bermanfaat. */
export const getRelatedArticles = (slug: string, count = 2): Article[] => {
  const current = getArticleBySlug(slug);
  if (!current) return [];
  const others = articles.filter((a) => a.slug !== slug);
  const scored = others
    .map((a) => {
      let score = 0;
      if (a.category === current.category) score += 3;
      score += a.tags.filter((t) => current.tags.includes(t)).length;
      return { article: a, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ article }) => article);
  if (scored.length > 0) return scored.slice(0, count);
  return [...others]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, count);
};

/** All unique tags across articles, alphabetized. */
export const allArticleTags = Array.from(
  new Set(articles.flatMap((a) => a.tags))
).sort((a, b) => a.localeCompare(b));
