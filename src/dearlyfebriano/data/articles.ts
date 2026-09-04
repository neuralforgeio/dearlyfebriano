import type { Article } from "@/dearlyfebriano/types";

/* ============================================================
 * TECH NOTES DATA — ganti dengan tulisan asli Anda.
 * Setiap artikel disusun dari "sections" (paragraph, heading,
 * list, quote, code, callout) agar mudah diedit tanpa markdown.
 * ============================================================ */

export const articles: Article[] = [
  {
    slug: "lighthouse-95-nextjs",
    title: "Shipping a 95+ Lighthouse Score in Next.js",
    excerpt:
      "The exact checklist I used to take a client storefront from 61 to 97 on Performance — without rewriting the app.",
    publishedAt: "2024-11-02",
    readingMinutes: 7,
    tags: ["Next.js", "Performance", "Web Vitals", "Lighthouse"],
    category: "tutorial",
    featured: true,
    sections: [
      {
        type: "paragraph",
        text: "When I inherited the LuxeStore codebase, Lighthouse reported a Performance score of 61 on mobile. Three weeks later it shipped at 97. The fixes were boring, surgical, and — most importantly — measurable. Here is the exact playbook, ordered by impact.",
      },
      { type: "heading", text: "Start with the field data, not the lab" },
      {
        type: "paragraph",
        text: "Lighthouse lab numbers are a snapshot on a simulated Moto G. Before touching code, I wired up the Chrome UX Report to see what real users experienced. The lab said \"fix your fonts\"; the field said \"your TTFB is 900ms on Indonesian 4G\". That reordered every priority on my list.",
      },
      { type: "heading", text: "The five changes that mattered" },
      {
        type: "list",
        items: [
          "Moved image-heavy category pages to streaming SSR with Suspense boundaries — LCP element now paints before the sidebar resolves.",
          "Replaced one 410KB form library with native validation + server actions. The checkout bundle dropped 62%.",
          "Added explicit width/height (or fill + sizes) to every next/image so CLS went to 0.01.",
          "Preloaded the hero image and the two webfonts actually used above the fold — nothing else.",
          "Deleted three analytics scripts that nobody read, consolidated the rest into one party-town'd worker.",
        ],
      },
      {
        type: "callout",
        variant: "tip",
        text: "Run Lighthouse five times and take the median. A single run once cost me an afternoon chasing a variance ghost that didn't exist.",
      },
      { type: "heading", text: "Fonts: the silent tax" },
      {
        type: "paragraph",
        text: "Inter in four weights, each blocking render, added 380ms to every navigation. The fix was unglamorous: two weights, font-display: swap, and a subset limited to latin. The design barely noticed; the LCP did.",
      },
      {
        type: "code",
        language: "css",
        code: "/* next/font handles this, but the lesson generalizes */\n@font-face {\n  font-family: 'Inter';\n  src: url('/fonts/inter-latin.woff2') format('woff2');\n  font-weight: 400 600;\n  font-display: swap;\n  unicode-range: U+0000-00FF, U+2000-206F;\n}",
      },
      { type: "heading", text: "Measure again — then stop" },
      {
        type: "paragraph",
        text: "Performance work has a nasty property: the last 3 points cost more than the first 30. Once the score crossed 95 on the median run and real-user INP stayed under 200ms, I stopped. That discipline kept three weeks from becoming three months.",
      },
      {
        type: "quote",
        text: "Fast is a feature, but shipped is a feature too. Know when both are done.",
        author: "Notes to self, week three",
      },
    ],
  },
  {
    slug: "idempotent-apis-paywave",
    title: "Designing Idempotent APIs: Lessons from a Payment Gateway",
    excerpt:
      "Double-charges, retry storms, and flaky webhooks — what 18 months of operating PayWave taught me about making distributed payments safe.",
    publishedAt: "2024-08-17",
    readingMinutes: 9,
    tags: ["Backend", "Distributed Systems", "API Design", "Payments"],
    category: "engineering",
    featured: false,
    sections: [
      {
        type: "paragraph",
        text: "A payment API has one unforgivable sin: charging twice. Everything else — latency, ergonomics, even uptime — can be forgiven. Here is what running PayWave taught me about preventing that sin in a world of timeouts, retries, and lying networks.",
      },
      { type: "heading", text: "The timeout problem" },
      {
        type: "paragraph",
        text: "Here is the trap. A client sends a charge request. Your server processes it in 4.1 seconds. The client's timeout fires at 4 seconds and it retries. Two requests, one charge — unless the server can tell them apart. That's idempotency: the same request, sent twice, must produce the same single effect.",
      },
      {
        type: "code",
        language: "http",
        code: "POST /v1/charges\nIdempotency-Key: 7f3a9c2e-1b4d-4e5f-8a9b-0c1d2e3f4a5b\nContent-Type: application/json\n\n{ \"amount\": 250000, \"currency\": \"IDR\", \"provider\": \"gopay\" }",
      },
      {
        type: "paragraph",
        text: "The key is client-generated, unique per logical operation, and stored with the request hash. A retry carrying the same key gets the stored response — replayed verbatim, not reprocessed.",
      },
      { type: "heading", text: "The three storage rules" },
      {
        type: "list",
        items: [
          "Store the key before doing the work. If the server dies mid-charge, a tombstone tells the retry what happened instead of guessing.",
          "Hash the request body with the key. Same key, different body is a client bug — reject it loudly with a 422.",
          "Expire keys on a clock (we use 24h) and document it. Infinite idempotency is a memory leak wearing a bowtie.",
        ],
      },
      {
        type: "callout",
        variant: "warning",
        text: "Redis as the only idempotency store is a trap. If Redis flushes, the keys are gone but the money moved. Mirror every key to the primary database — Redis is the fast path, Postgres is the truth.",
      },
      { type: "heading", text: "Webhooks will lie to you" },
      {
        type: "paragraph",
        text: "Providers fire webhooks twice, out of order, sometimes never. The reconciliation loop — a daily job comparing our ledger against every provider's settlement report — caught 11 discrepancies in the first month, all silent, all fixed before any merchant noticed. Active polling as a fallback covered the rest.",
      },
      {
        type: "quote",
        text: "In distributed systems, you don't eliminate failure — you design the narrow path where failure is allowed to live.",
        author: "PayWave postmortem #7",
      },
      { type: "heading", text: "The honest checklist" },
      {
        type: "list",
        items: [
          "Idempotency keys on every state-changing endpoint — no exceptions for \"internal\" APIs.",
          "Tombstones before side effects, always.",
          "Status webhooks as hints, reconciliation as truth.",
          "Retries with jittered exponential backoff on the client, documented limits on the server.",
        ],
      },
    ],
  },
  {
    slug: "sqlite-still-wins-2024",
    title: "Why I Still Reach for SQLite in 2024",
    excerpt:
      "Everyone's default is Postgres. But for 70% of the products I build, SQLite in WAL mode is faster, cheaper, and dramatically simpler. Here's the decision framework.",
    publishedAt: "2024-05-09",
    readingMinutes: 6,
    tags: ["SQLite", "Databases", "Opinion", "Architecture"],
    category: "opinion",
    featured: false,
    sections: [
      {
        type: "paragraph",
        text: "Every architecture diagram I see starts with Postgres. It's the safe answer, the senior answer, the answer nobody gets fired for. But after shipping SnipVault on SQLite with 800+ GitHub stars and zero database incidents, I want to defend the other default.",
      },
      { type: "heading", text: "The case nobody makes" },
      {
        type: "list",
        items: [
          "No network hop. A read on a warm cache is microseconds, not milliseconds — it changes how you architect features.",
          "One file. Backup is cp. Migration is a copy. Staging is scp. Disaster recovery stops being a runbook.",
          "Zero config, zero connection pool, zero DNS mysteries at 3am.",
          "It scales far past what people think: read-heavy workloads with WAL mode comfortably serve tens of thousands of requests per second on one modest VPS.",
        ],
      },
      {
        type: "callout",
        variant: "info",
        text: "SQLite's real ceiling isn't throughput — it's write concurrency. A single writer at a time, serialized. If your workload is write-heavy and concurrent, that's the moment to leave.",
      },
      { type: "heading", text: "My decision framework" },
      {
        type: "paragraph",
        text: "I ask three questions. Is the product a single logical server (or can it be)? Is the write pattern under a few hundred writes per second? Do I need analytical queries over live data at scale? Two no's and a yes means SQLite ships. SnipVault answered no-no-no. LuxeStore's order pipeline answered differently — and got Postgres.",
      },
      {
        type: "quote",
        text: "The best database is the one whose failure modes you understand at 3am.",
        author: "Hard-won opinion",
      },
      { type: "heading", text: "Litmus test" },
      {
        type: "paragraph",
        text: "If you can't articulate what your app loses by choosing SQLite, you don't yet know what Postgres is buying you. Both defaults are fine — chosen defaults are the only ones that scale.",
      },
    ],
  },
  {
    slug: "bootcamp-to-fullstack",
    title: "From Bootcamp to Full Stack: My First Three Years",
    excerpt:
      "What actually moved the needle after graduation — the projects, the mistakes, and the uncomfortable habits that compound.",
    publishedAt: "2024-02-21",
    readingMinutes: 8,
    tags: ["Career", "Learning", "Mentorship"],
    category: "career",
    featured: false,
    sections: [
      {
        type: "paragraph",
        text: "I graduated from a 12-week bootcamp knowing how to build a CRUD app and nothing about being a developer. Three years later I ship payment infrastructure. This is the honest map — the things that worked, and the six-month detour that didn't.",
      },
      { type: "heading", text: "Tutorial hell is real, and the exit is ugly" },
      {
        type: "paragraph",
        text: "For my first six months out, I completed eleven courses. I could follow any tutorial to its end. Then someone asked me to build an app with no video, and I froze. The skill I'd trained was following; the skill I needed was flailing productively.",
      },
      {
        type: "callout",
        variant: "tip",
        text: "The fix that worked: build the same app three times without looking anything up — a blog, then a todo app with auth, then a small API. The third build teaches you what the first two were hiding.",
      },
      { type: "heading", text: "What actually compound" },
      {
        type: "list",
        items: [
          "Shipping in public. Every project on GitHub with a README, even the embarrassing ones — employers read these more than certificates.",
          "Reading other people's code. An hour in a popular open-source repo taught me more patterns than a course.",
          "Writing about what broke. My debugging notes became my most-read articles and my best interview stories.",
          "Mentoring juniors once I was six months ahead — explaining forces the knowledge to organize itself.",
        ],
      },
      { type: "heading", text: "The interview that changed my career" },
      {
        type: "paragraph",
        text: "My first real interview had a take-home: a small API with one trick requirement — idempotent order creation. I failed it. Completely. But I spent the weekend building the thing properly anyway and sent it back with notes on what I'd gotten wrong. They didn't hire me for that role. They called me four months later for a better one.",
      },
      {
        type: "quote",
        text: "Talent is what you have when nobody's watching yet. Everything else is a habit.",
        author: "A mentor, over kopi susu",
      },
      { type: "heading", text: "If I started today" },
      {
        type: "list",
        items: [
          "Month 1–3: one language deeply, git in the fingers, deploy something weekly.",
          "Month 4–9: three real projects — each with a feature I don't know how to build yet.",
          "Month 10+: contribute to one repo I admire and write publicly about the journey.",
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
