import type { Project } from "@/dearlyfebriano/types";

/* ============================================================
 * PROJECTS DATA — diambil dari CV asli
 * "CV DEARLY FEBRIANO IRWANSYAH.pdf":
 * - OpenForge (AI Agent) — AI Development, 2026
 * - CV Builder (Instant Resume) — freelance, 2023
 * - Akuma Joki (Roblox storefront) — freelance, 2026
 * - Tromino Digital (React design system) — freelance, 2026
 * Ditambah website portfolio ini sebagai project live.
 * Gambar thumbnail otomatis via api.screenshotone.com, diambil dari liveUrl. Dan bisa manua dari /public/images/projects/ jika project tersebut non-website dan perlu screenshot manual.
 * ============================================================ */

export const projects: Project[] = [
  {
    slug: "openforge",
    title: "OpenForge",
    shortDesc:
      "A local AI agent system that helps users complete tasks, search information offline, build software, and automate workflows — privacy-first.",
    longDesc:
      "OpenForge is a local AI agent system designed to help users complete various tasks, search for information offline, build software, automate workflows, manage systems, and enhance device security. With an offline-first approach, OpenForge prioritizes privacy, performance, and full control over user data — everything runs locally, nothing silently leaves the machine.",
    images: [],
    techStack: [
      "TypeScript",
      "Node.js",
      "LLM Tooling",
      "AI Agents",
      "Automation",
      "Local-First",
    ],
    category: "opensource",
    status: "in-progress",
    liveUrl: "https://openforge-website.vercel.app/",
    githubUrl: "https://github.com/neuralforgeio/openforge",
    features: [
      "Task completion agent — understands a goal and executes it step by step",
      "Offline information search across local files and knowledge bases",
      "Software building assistance — scaffolds, writes, and refactors code",
      "Workflow automation for repetitive system tasks",
      "System management and device security enhancements",
      "Offline-first architecture: privacy, performance, and full control over user data",
    ],
    challenges: [
      {
        title: "Running capable AI fully offline",
        description:
          "Cloud LLMs contradict the privacy goal. I structured the agent around local models and offline knowledge retrieval, so core workflows — search, task execution, automation — keep working with zero network calls.",
      },
      {
        title: "Reliable autonomous task execution",
        description:
          "An agent that does the wrong thing quickly is worse than no agent. I built the execution loop with explicit step planning and verifiable checkpoints, so every automated action can be traced and trusted.",
      },
    ],
    startDate: "2026-01",
    endDate: undefined,
    duration: "Ongoing",
    featured: true,
  },

  {
    slug: "instant-resume",
    title: "Instant Resume",
    shortDesc:
      "CV Builder platform that makes it easy for anyone to create a professional CV — speeding up resume creation without manual styling.",
    longDesc:
      "Instant Resume is a CV builder platform built as a freelance software engineering engagement in 2023. It exists for one reason: creating a CV should take minutes, not an afternoon. Users fill in their details and the platform handles layout, typography, and formatting automatically — producing a polished, ready-to-send resume without touching a style setting.",
    images: [],
    techStack: [
      "JavaScript",
      "React",
      "Node.js",
      "PDF Generation",
    ],
    category: "web",
    status: "live",
    liveUrl:
      "https://instantresume-builder.vercel.app/",
    githubUrl:
      "https://github.com/neuralforgeio",
    features: [
      "Guided CV creation flow — fill in content, never fight with styling",
      "Automatic layout and typography: consistent, professional output every time",
      "Instant PDF export, ready to send to recruiters",
      "Dramatically faster CV creation compared to manual document editing",
    ],
    challenges: [
      {
        title: "Pixel-consistent PDF output",
        description:
          "Rendering CVs to PDF reliably across browsers is deceptively hard. I isolated the rendering pipeline from the editor UI so what the user previews is exactly what lands in the exported file.",
      },
      {
        title: "Zero learning curve",
        description:
          "The target user has no design background. Every styling decision — margins, hierarchy, spacing — is encoded into templates instead of exposed as options, which is exactly what 'without manual styling' means in practice.",
      },
    ],
    startDate: "2023-01",
    endDate: "2023-12",
    duration: "Freelance, 2023",
    featured: true,
  },

  {
    slug: "akumajoki-store",
    title: "Akuma Joki",
    shortDesc:
      "A full-stack Roblox joki & storefront platform with a retro pixel-art interface, multi-item checkout, order tracking, customer loyalty, wishlist, reviews, smart search, and a GitHub-synced admin dashboard.",
    longDesc:
      "A full-stack Roblox joki and digital storefront platform built around a retro pixel-art aesthetic, designed to handle the complete customer journey from browsing game-specific services to checkout, order tracking, reviews, wishlist management, loyalty rewards, and post-order recovery. The storefront supports multiple game catalogs including Blox Fruits, Expedition Antarctica, and Retail Tycoon 2, with category-based products, pricing, requirements, difficulty levels, promotional tags, and contextual game notices. Customers can add up to five services into a single order, receive one shared Order ID, and continue the transaction through a WhatsApp-integrated checkout flow while the order is simultaneously recorded for administrative tracking. The platform also includes a dedicated order-tracking experience that groups every item belonging to the same Order ID and calculates an overall status across mixed, processing, completed, or cancelled items. On top of the storefront, the project ships with a large admin dashboard covering games, products, orders, reports, FAQ, announcements, settings, live chat, game analytics, developer tools, deployment controls, security/debug tooling, and maintenance mode. Content such as games, reviews, FAQs, announcements, about-page statistics, customer reports, and store settings can be synchronized through GitHub-backed JSON data so deployed instances stay aligned across environments. A smart-search API interprets natural-language-style queries such as cheapest or most expensive services, identifies relevant games, filters matching products, ranks the results, and returns a compact result set without requiring an external AI SDK. The client experience is further extended with persistent Zustand state for carts and selected orders, wishlist and recently-viewed data, loyalty points and tier progression, achievement badges, multilingual UI, responsive navigation, PWA installation handling, animated interactions, notification utilities, and a pixel-styled component system tailored specifically to the brand.",
    images: [],
    techStack: [
      "Next.js",
      "TypeScript",
      "React",
      "Tailwind CSS",
      "Framer Motion",
      "Zustand",
      "Prisma",
      "SQLite",
      "Radix UI",
      "Lucide React",
      "GitHub API",
      "WhatsApp",
      "Vercel",
    ],
    category: "web",
    status: "live",
    liveUrl: "https://akuma-joki.vercel.app/",
    githubUrl:
      "https://github.com/neuralforgeio/akuma-joki",
    features: [
      "Full Roblox storefront with multiple game catalogs, service categories, prices, requirements, difficulty levels, promotional tags, and game-specific notices.",
      "Multi-item cart and checkout supporting up to five services under one shared Order ID, with grouped order records and a WhatsApp handoff containing every selected item.",
      "Customer order tracking that aggregates all items belonging to the same Order ID, exposes individual item statuses, and derives an overall order state for mixed, processing, completed, or cancelled orders.",
      "Admin dashboard for managing games, products, orders, reports, announcements, FAQ, about content, settings, templates, live chat, analytics, and developer tooling.",
      "GitHub-backed content synchronization using admin-data.json as a deployed source of truth, allowing games, reviews, FAQs, announcements, settings, and reports to stay synchronized across deployments.",
      "Smart search API with intent parsing for queries such as cheapest or most expensive services, game detection, keyword matching, fallback matching, relevance filtering, and ranked results without an external AI SDK.",
      "Persistent customer experience powered by Zustand for cart state, selected orders, wishlist, recently viewed items, loyalty points, achievement badges, and other local-first interaction state.",
      "Loyalty and achievement system with Bronze through Diamond tiers, points earned from customer activity, and unlockable badges for milestones such as first order, repeat orders, reviews, wishlist usage, cart size, and loyalty progression.",
      "Review system migrated from localStorage to GitHub-synchronized admin data so customer reviews can persist beyond a single browser or device.",
      "Responsive retro pixel-art UI with animated interactions, theme support, language switching, toast notifications, skeleton loading states, back-to-top controls, network status, and reusable Radix-based interface primitives.",
      "Order recovery workflow with local order history, copyable Order IDs, success-state badges, and quick reorder functionality that can reconstruct previous multi-item orders.",
      "Maintenance/takedown mode that can redirect the complete application to a dedicated maintenance page through a single configuration switch.",
      "PWA-oriented experience with installation prompts, cache/service-worker recovery handling, and automated synchronization helpers designed for production deployments.",
    ],
    challenges: [
      {
        title: "Fixing production blank-page failures",
        description:
          "The application went through several production rendering failures caused by hydration and runtime behavior rather than the visual UI itself. A persisted Zustand/i18n hydration path could leave the application stuck in an incomplete state, while an old service worker could continue serving a cached blank page even after a successful deployment. The solution required removing skipHydration-based gating, simplifying the root layout metadata, splitting client-only synchronization and floating behavior out of the main layout, and adding self-healing cleanup for previously registered service workers and cached content.",
      },
      {
        title: "Grouping multi-item orders correctly",
        description:
          "Supporting multi-item checkout introduced a consistency problem across three separate surfaces: WhatsApp order messages, the customer tracking page, and the admin order manager. A shared Order ID could represent several services, so treating an order as a single item caused incomplete messages and incorrect progress states. The implementation was redesigned around grouped order collections, making every surface resolve all records sharing the same Order ID, calculate aggregate status, show per-item progress, and provide bulk or individual status controls in the admin dashboard.",
      },
      {
        title: "Building cross-device content synchronization",
        description:
          "The original review flow relied on browser-local state, which meant customer-generated content was isolated to one device. The system was reworked so reviews and other editable business data are stored in a synchronized admin-data.json representation and pushed through GitHub, with deployed instances consuming that synchronized source as the latest content layer while retaining sensible defaults as fallback data.",
      },
      {
        title: "Keeping admin and storefront data consistent",
        description:
          "The storefront contains editable business data such as game services, difficulty levels, promotional labels, contact information, FAQs, announcements, statistics, and reports. Maintaining separate hardcoded values risked the public site and dashboard drifting apart. The architecture therefore introduced synchronized data resolution: deployed data overrides defaults when valid, while the original definitions remain as a safe fallback, giving the application both editability and resilience.",
      },
      {
        title:
          "Replacing an external AI dependency with deterministic search",
        description:
          "The smart-search feature needed to understand useful customer phrases without adding a heavyweight AI runtime or SDK. Instead of making every search dependent on an LLM, the API parses intent locally, recognizes game aliases, extracts meaningful keywords, filters catalog data, falls back to broader text matching, applies price sorting when requested, and returns the best five results. This keeps the feature lightweight, predictable, and directly tied to the actual storefront catalog.",
      },
      {
        title:
          "Resolving routing conflicts in Next.js App Router",
        description:
          "A default page generated by the development environment was unintentionally taking precedence over the intended homepage route, causing the deployed site to display the wrong content. The conflicting root page and associated default assets were removed so the grouped main route could correctly own the / route and render the actual Akuma Joki application.",
      },
    ],
    startDate: "2026-07",
    endDate: undefined,
    duration: "Ongoing",
    featured: true,
  },

  {
    slug: "tromino-digital",
    title: "Tromino Digital",
    shortDesc:
      "A 29-component React design system with hand-rolled interaction primitives — zero UI dependencies — plus its own living docs site with live playgrounds.",
    longDesc:
      "A design system I built from scratch: 29 components in three tiers (core, overlay, showcase) sitting on hand-rolled interaction primitives — focus trap, roving tabindex, typeahead, fuzzy scoring, anchored positioning, dismissable layer, scroll lock — with zero runtime UI dependencies (no Radix, no HeadlessUI, no MUI, no cmdk) and 528 behavior-first tests (RTL + user-event + axe) enforcing the WAI-ARIA APG patterns. It ships with its own docs site: a single-route, hash-navigated Next.js app where every component gets a live playground with deep-linkable props and a device-width preview (pin to 390/768px), a three-tier token reference with a live export API (CSS, flat JSON, W3C Design Tokens format — parsed from the real stylesheet at runtime), a bundle-size dashboard, accessibility contract, changelog and roadmap.",
    images: [],
    techStack: [
      "Next.js",
      "TypeScript",
      "React",
      "Tailwind CSS",
      "Vitest",
      "Storybook",
      "Prisma",
      "Bun",
    ],
    category: "web",
    status: "live",
    liveUrl:
      "https://tromino-digital.vercel.app",
    githubUrl:
      "https://github.com/neuralforgeio/tromino-digital",
    features: [
      "29 components in three tiers, every one implementing its WAI-ARIA APG pattern with a keyboard table in the docs",
      "Hand-rolled interaction primitives: focus trap, roving tabindex, typeahead, fuzzy scoring, anchored positioning, dismissable layer, scroll lock",
      "Zero runtime UI dependencies — the command palette even runs its own in-repo fuzzy scorer",
      "528 behavior-first tests (RTL + user-event + axe) with a ≤3kB gzip budget per component",
      "Live playgrounds with props encoded in the URL hash, plus a device-width preview mode that deep-links (d=phone)",
      "Token system in three tiers with a live export API — CSS, flat JSON, and W3C Design Tokens format",
      "Three-shape responsive shell: desktop sidebar → tablet icon rail → phone drawer, audited 19 routes × 4 widths to zero horizontal overflow",
      "Dark mode as a pure token swap (never invert) and every motion path honors prefers-reduced-motion",
    ],
    challenges: [
      {
        title: "Fitting the docs header into 320px",
        description:
          "A scripted sweep across 19 routes at phone widths revealed the header overflowed every single page below 350px — full wordmark, segmented theme control, and two 44px buttons simply cannot fit 320px. I rebuilt the phone header with a compact wordmark and a single theme-cycle button (the tri-state control stays one drawer-tap away), then re-measured until the overflow count hit exactly zero.",
      },
      {
        title: "One icon axis across two sidebar shapes",
        description:
          "When the sidebar collapses to a tablet icon rail, every button must share one visual center line. The search trigger broke that contract — a fixed square button hugging the left padding put its icon at 28px while everything else sat at the 37.5px axis. I rebuilt it as a dual-form component (centered square icon when collapsed, full pill when expanded) and verified with in-browser geometry measurement: all icon centers now report a single axis.",
      },
      {
        title: "A library bug hiding behind a weak test",
        description:
          "The bare Drawer.Close button had rendered in the wrong position since v1.0.0 — a cn() argument-order slip let the variant base's 'relative' win twMerge's last-wins conflict against 'absolute'. The test suite never caught it because toContain('absolute') happily passes on 'before:absolute'. I fixed the merge order in the library, removed the consumer workaround, and documented the assertion hole so future tests assert geometry, not substrings.",
      },
    ],
    startDate: "2026-09",
    endDate: undefined,
    duration: "Ongoing",
    featured: true,
  },

  {
    slug: "arus-ledger",
    title: "Arus Ledger",
    shortDesc:
      "A local-first personal money tracker PWA with no backend — custom numpad, hand-rolled SVG charts, formal four-page PDF reports with embedded diagrams, digital signature, and offline-first architecture.",
    longDesc:
      "Arus Ledger is a local-first personal money tracker PWA built on the principle that financial data should never leave your device. Every transaction, account, category, budget, and setting lives in IndexedDB via Dexie — there is no server, no API, no cloud sync, and no analytics. The application ships a custom numpad and bottom-sheet system, a hand-rolled SVG icon set, and six custom chart types rendered with raw SVG primitives (daily cashflow bar, category donut, six-month trend, day-of-week pattern, weekly comparison, and a calendar heatmap) — all without a charting library on the production path. The reporting layer generates a formal four-page PDF report using jsPDF: page one holds sectioned tables with Times New Roman titles, page two renders visual diagrams (bar chart, donut chart, horizontal bar) with justified explanatory paragraphs, page three is a templated narrative report with seven lettered sections, and page four is a formal closing page with a digital signature block. A styled Excel-compatible export, CSV, and digital signature pad round out the export toolkit. The UI follows an m-banking design language with a blue (#2563EB) accent, a collapsible desktop sidebar with Ctrl+/ shortcut, a mobile bottom navigation, and route-per-tab navigation using Next.js App Router — each tab (/, /transaksi, /laporan, /pengaturan) has its own URL with scroll-position persistence that restores on reload but resets on fresh visit.",
    images: [],
    techStack: [
      "Next.js 16",
      "TypeScript",
      "Tailwind CSS 4",
      "Dexie/IndexedDB",
      "jsPDF",
      "PWA",
      "Local-First",
      "Vercel",
    ],
    category: "web",
    status: "live",
    liveUrl:
      "https://arus-ledger.vercel.app/",
    githubUrl:
      "https://github.com/neuralforgeio/Arus-Ledger",
    features: [
      "Local-first architecture — all data stored in IndexedDB via Dexie, zero backend, zero network calls, data never leaves the device",
      "Custom numpad with quick-amount chips (+5rb, +10rb, +20rb, +50rb, +100rb), '00' key, and a close button for easy dismissal",
      "Six custom SVG chart types built with raw primitives — no charting library: daily cashflow bar, category donut, six-month trend, day-of-week pattern, weekly comparison, and calendar heatmap",
      "Formal four-page PDF report: sectioned tables with Times New Roman titles, visual diagrams page (bar + donut + horizontal bar charts with justified explanations), templated narrative report (seven lettered sections A–G), and a dedicated closing page with digital signature block",
      "Styled Excel-compatible export with three sheets (Ringkasan, Transaksi, Kategori), blue headers, cell borders, alternating rows, and color-coded amounts",
      "Digital signature pad with canvas drawing, saves as base64 PNG, embedded directly into PDF reports on the closing page",
      "Profile modal with name, phone, email, city, address, job title, company, and ID number — used to populate report headers and the closing page's place/date line",
      "Route-per-tab navigation: / (Beranda), /transaksi, /laporan, /pengaturan — each with its own URL and scroll-position persistence (restore on reload, reset on fresh visit)",
      "PWA with vanilla service worker, offline fallback page, install prompt banner, and update detection",
      "Responsive m-banking UI: collapsible desktop sidebar (Ctrl+/ shortcut), mobile bottom navigation, blue (#2563EB) accent theme with light/dark mode",
      "Multi-currency support (IDR/USD) with cached exchange rate from open.er-api.com",
      "Integer IDR money semantics with local YYYY-MM-DD date keys and derived balances — never stored, always computed",
      "Semantic versioning (v1.1.0) with version displayed in sidebar footer and settings",
    ],
    challenges: [
      {
        title:
          "Rendering a formal four-page PDF report without a layout engine",
        description:
          "The PDF needed to look like a real financial report — sectioned tables, justified body text, visual diagrams, a narrative page, and a closing letter with a signature — but jsPDF has no layout engine. I built the report layer from primitives: a drawSectionTitle helper with alignment modes (centered for top-level titles, left-aligned for sub-sections), a drawJustifiedParagraph function that passes full paragraphs to jsPDF so it distributes inter-word spacing evenly (Word-style justify), and three chart-drawing functions (grouped bar, donut, horizontal bar) using raw rect/line/circle calls. The result is a four-page document where every title is Times New Roman, body text is justified, and the signature sits on a dedicated closing page rather than orphaned on a separate sheet.",
      },
      {
        title:
          "Fixing the numpad that closed itself on every button press",
        description:
          "The custom numpad lived inside a BottomSheet with drag-to-dismiss behavior. When the user tapped a numpad key, pointer events bubbled to the sheet container and triggered the drag handler, causing the numpad to disappear. The root cause was the hidden input's onBlur firing the moment focus moved to a numpad button. The fix required two layers: the numpad container now calls e.preventDefault() on mousedown to stop the hidden input from blurring, and the input's onBlur uses a 150ms delayed check that keeps the numpad open if focus moved to a numpad button. A dedicated 'Tutup Keypad' button was also added for explicit dismissal.",
      },
      {
        title:
          "Deploying a panel-built project to Vercel without leaking environment files",
        description:
          "The project was developed inside a sandbox panel that ships its own infrastructure files (Caddyfile, Prisma schema, .zscripts, service worker configs, bun.lock). Pushing these to GitHub would expose the panel's internals and break the Vercel build. I rewrote .gitignore to exclude all panel/system files, untracked them with git rm --cached (keeping them on disk), and squashed the entire history into a single commit authored by the user. The Vercel build then failed three times: first because Next.js 16 deprecated the eslint key in next.config.ts, then because @types/node was missing from devDependencies. Each was fixed iteratively until the deployment went READY.",
      },
      {
        title:
          "Route-per-tab navigation with scroll position persistence",
        description:
          "The app was originally a single-page component with tab state in React. Converting it to route-per-tab required extracting all shared state (DB, settings, sheet handlers) into an AppProvider context, building an AppShell that wraps every route with the sidebar and sheets, and creating four route pages. The scroll persistence hook saves scroll position to sessionStorage on scroll, restores it on reload by checking performance.getEntriesByType('navigation')[0].type === 'reload', and clears it on fresh navigation — so reload stays where you were, but closing the browser and reopening starts from the top. The outer container had to change from min-h-screen to h-screen so the main element actually scrolls internally instead of the whole page growing.",
      },
    ],
    startDate: "2026-09",
    endDate: undefined,
    duration: "Ongoing",
    featured: true,
  },

  {
    slug: "bliyu",
    title: "BliYu",
    shortDesc:
      "A zero-backend Indonesian e-commerce marketplace — 122 fixture products across 24 categories, a hand-rolled path-based router layered over Next.js App Router, integer-IDR money semantics, a five-step checkout with per-seller free-shipping rules, seller chat, product comparison, a voucher engine, and rolling flash-sale sessions.",
    longDesc:
      "BliYu is a pure-frontend Indonesian e-commerce marketplace built on the principle that the entire shopping experience — browsing, carting, checking out, paying, and tracking orders — should run flawlessly with zero real backend. All product, seller, order, and payment data lives in deterministic local fixtures (122 products, 24 categories, 515 image slots), so the app never makes a single network call for data. The money layer enforces integer-IDR semantics: every price, delta, discount, fee, and total is computed as whole-rupiah integers to eliminate floating-point drift. Navigation runs on a hand-rolled path-based router built with useSyncExternalStore over the History API, layered on top of Next.js App Router with a [...slug] catch-all for SSR deep links — 29 routes, real URLs like /produk/xxx instead of #/fragments, backward migration of legacy hash links, and modifier-key (cmd/ctrl-click) support. Client state uses Zustand with persist + skipHydration for SSR safety. The commerce layer includes a five-step checkout (delivery, voucher, review, payment, success), per-seller-group shipping with honest free-shipping thresholds and progress bars, a voucher engine validating scope per product/cart, seller chat with quick replies and product cards, variant-aware frequently-bought-together, side-by-side product comparison, a review center that keeps what the user actually wrote, and rolling two-hour flash-sale sessions with a live countdown that also respects prefers-reduced-motion and offers a WCAG pause control. The image pipeline ships real product photos mapped deterministically per product with a procedural SVG art fallback on error. The UI follows an Indonesian m-commerce design language with a red/gold accent, light/dark mode, mobile bottom navigation, sticky buy bars, and an ARIA combobox search with full keyboard navigation — capped with visible semantic versioning (v1.0.0) in the footer and settings.",
    images: [],
    techStack: [
      "Next.js 16",
      "React 19",
      "TypeScript",
      "Tailwind CSS 4",
      "Zustand",
      "Custom History Router",
      "Zero Backend",
      "Vercel",
    ],
    category: "web",
    status: "live",
    liveUrl: "https://bliyu.vercel.app",
    githubUrl:
      "https://github.com/neuralforgeio/BliYu",
    features: [
      "Zero-backend architecture — 122 products, 24 categories, 515 image slots, all deterministic local fixtures; no server, no API, no network calls for data",
      "Hand-rolled path-based router over Next.js App Router — useSyncExternalStore + History API, 29 routes with clean URLs (/produk/xxx), [...slug] catch-all for SSR deep links, and one-shot migration of legacy #/ hash links",
      "Integer-IDR money semantics — every price, variant delta, discount, shipping fee, and total computed as whole-rupiah integers, never floats",
      "Five-step checkout flow — delivery, voucher, review, payment, success — with payment methods, per-seller-group shipping, and honest order totals that match what was selected",
      "Per-seller free-shipping rules — threshold-based qualification and progress bars computed per seller group instead of a misleading global bar",
      "Voucher engine with scope validation — owned ∪ claimed vouchers persisted across reloads, per-product and per-cart scope enforcement, claim/unclaim flows",
      "Seller chat — quick replies, product cards, and product links that resolve to real slugs (not 404s)",
      "Variant-aware product system — variant price deltas actually applied to totals, per-variant stock clamping, and frequently-bought-together that refuses to add unavailable required variants",
      "Side-by-side product comparison with spec rows and honest add-to-compare from the product page",
      "Rolling two-hour flash-sale sessions — countdown that renders live immediately after hydration, keeps rolling into the next session, and ships a WCAG-compliant pause control honoring prefers-reduced-motion",
      "Review center that persists what the user actually writes — real star ratings and timestamps instead of discarding input",
      "Real product photos with a deterministic procedural SVG art fallback on image error — zero broken images in production",
      "Accessibility pass — ARIA combobox search with full keyboard navigation, AA contrast in both light and dark themes, ≥36px touch targets, and a top-level ErrorBoundary keyed per route",
      "Semantic versioning visible to users — v1.0.0 shown in the footer and settings/about, backed by a GitHub release and changelog policy",
    ],
    challenges: [
      {
        title: "The Reviews tab that white-screened the entire app",
        description:
          "A deep audit found that opening the Reviews tab on any product page crashed the whole application: the ReviewSection component referenced a `user` variable defined outside its scope, throwing a ReferenceError that unmounted the entire React tree into a blank white screen — and there was no ErrorBoundary anywhere to catch it. The trap was that ESLint reported a clean bill of health while TypeScript's compiler had been flagging the exact line all along. The fix had two layers: moving the session hook into the correct scope, and adding a top-level ErrorBoundary keyed by route so any future render error degrades into a recoverable error screen instead of a white screen. The lasting change was making `tsc --noEmit` a hard quality gate — a green linter is not proof the app runs.",
      },
      {
        title:
          "Migrating a hand-rolled hash router to real paths across 29 routes",
        description:
          "The app originally used a custom hash router (#/produk/xxx) and every product, category, and deep link depended on it. Migrating to normal paths meant rewriting the router core: parseLocation now goes through URLSearchParams with safe per-segment decoding so malformed %-sequences and multi-= query strings can never throw, BliLink renders real <a href> anchors with modifier-key support (cmd/ctrl-click opens new tabs), legacy #/ fixture links are migrated once on mount, and a Next.js [...slug] catch-all page makes deep links server-renderable. Review anchors became controlled tab state so 'Lihat Ulasan' scrolls and activates the tab instead of navigating to a broken hash. The migration was verified live across all 29 routes with zero page errors and zero console errors.",
      },
      {
        title: "Shipping 515 real product images with zero backend",
        description:
          "The marketplace needed real product thumbnails — procedural SVG placeholders looked fake — but the app has no backend to host dynamic images. I ran ~35 category-specific image searches (flannel shirts, coffee makers, mechanical keyboards, hijabs…), downloaded the results locally, and built a deterministic id-to-files mapping so every product, gallery, and recommendation slot resolves to a real photo. A procedural SVG art component stays registered as an onError fallback, so even if a file is missing the slot degrades gracefully instead of showing a broken image — verified with zero broken images in production.",
      },
      {
        title:
          "The shipping fee that charged Rp9.000 while Rp18.000 was selected",
        description:
          "A live checkout test caught a derived-state mismatch: the Regular radio (Rp18.000) was checked by default, but the order total charged the Economy fee (Rp9.000) — and the override silently bypassed the free-shipping threshold rules entirely. The root cause was two sources of truth: one function computed the fee from a hardcoded cheapest option while the UI read the selection. The fix collapsed them into a single derived shippingFeeMap per seller group — the checked radio is the fee that gets charged, and a group qualifies for free shipping exactly when its rules say so. This is also where the integer-IDR money law paid off: because every rupiah value is an integer, the corrected fees reconciled to the totals to the exact rupiah, with no rounding drift anywhere.",
      },
    ],
    startDate: "2026-09",
    endDate: undefined,
    duration: "Ongoing",
    featured: true,
  },
];

export const featuredProjects = projects.filter((p) => p.featured);

export const getProjectBySlug = (slug: string) =>
  projects.find((p) => p.slug === slug);

export const getAdjacentProjects = (slug: string) => {
  const index = projects.findIndex((p) => p.slug === slug);
  const prev = index > 0 ? projects[index - 1] : null;
  const next = index < projects.length - 1 ? projects[index + 1] : null;
  return { prev, next };
};

/**
 * Projects most similar to the given one — scored by shared
 * category (+3) and overlapping tech stack (+1 per shared tech).
 */
export const getRelatedProjects = (slug: string, count = 2): Project[] => {
  const current = getProjectBySlug(slug);
  if (!current) return [];
  return projects
    .filter((p) => p.slug !== slug)
    .map((p) => ({
      project: p,
      score:
        (p.category === current.category ? 3 : 0) +
        p.techStack.filter((tech) => current.techStack.includes(tech)).length,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(({ project }) => project);
};
