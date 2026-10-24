import type { Project } from "@/dearlyfebriano/types";

/* ============================================================
 * PROJECTS DATA — diambil dari CV asli
 * "CV DEARLY FEBRIANO IRWANSYAH.pdf":
 * - CV Builder (Instant Resume) — freelance, 2023
 * - Akuma Joki (Roblox storefront) — freelance, 2026
 * - Tromino Digital (React design system) — freelance, 2026
 * Ditambah website portfolio ini sebagai project live.
 * Gambar thumbnail otomatis via keyless screenshot service (thum.io + mShots fallback) yang diproxy lewat /api/project-preview, diambil dari liveUrl. Dan bisa manual dari /public/images/projects/ jika project tersebut non-website dan perlu screenshot manual.
 * ============================================================ */

export const projects: Project[] = [
  {
    slug: "finora",
    title: "Finora",
    shortDesc:
      "A modern financial operations platform that helps accountants and sales teams work faster, reduce repetitive work, and understand business performance in one place.",
    longDesc:
      "Finora connects accounting, sales, collections, and analytics in one calm, precise workspace. A deal closed in the pipeline becomes a draft invoice for finance; a recorded payment updates receivables, cash, the bank feed, and the ledger in one action; the collections queue prioritizes exactly the invoices that need attention today. Built frontend-first with a deterministic demo workspace, a centralized multi-currency system, and double-entry integrity enforced end to end.",
    images: [],
    techStack: [
      "TypeScript",
      "Next.js",
      "React",
      "Tailwind CSS",
      "shadcn/ui",
      "Zustand",
      "Recharts",
      "Vercel",
    ],
    category: "web",
    status: "live",
    liveUrl: "https://finora-financial.vercel.app",
    githubUrl: "https://github.com/neuralforgeio/Finora",
    features: [
      "One connected workflow — Opportunity → Quote → Invoice → Payment → Reconciliation → Dashboards, every screen reading from the same live dataset",
      "Centralized currency system across 37 views: USD, IDR, EUR, GBP, SGD with locale-aware formatting (Rp 1.000.000 / $1,000,000.00) and instant workspace-wide switching",
      "MoneyInput primitive — grouped live formatting, caret preservation, and paste normalization for every amount field; money, percentage, and quantity inputs stay deliberately separate",
      "Double-entry integrity enforced: journals must balance, payments never exceed outstanding balances, closed-period posting is blocked, and the balance sheet ties live",
      "Bank reconciliation that completes only at zero variance, with rule-based categorization suggestions and duplicate detection",
      "Collections workspace prioritizing overdue invoices by amount, age, and payment behavior — the shared ground between finance and sales",
      "Analytics center: revenue, expenses, profit, cash flow, budgets with variance alerts, and profitability by customer, product, rep, and service",
      "Role-aware experience — Owner, Administrator, Accountant, Sales Manager, and Sales Rep views with a command palette (Ctrl+K) and cross-module search",
    ],
    challenges: [
      {
        title: "One currency system for 37 screens",
        description:
          "Every module had its own notion of money — raw number inputs here, ad-hoc toLocaleString there, '$' + amount inside notification strings. Patching the Bills page alone would have left three dozen screens lying. I built a single currency layer (typed definitions, formatter, parser, MoneyInput) and threaded the workspace currency through roughly 400 call sites, so switching to Indonesian Rupiah re-renders KPIs, tables, charts, forms, and even the command palette — with no exchange-rate fakery, presentation only.",
      },
      {
        title: "Financial inputs that stay editable",
        description:
          "Live-formatted money inputs usually break editing: the caret jumps to the end, decimals fight the grouping separators, and pasting 'Rp 1.000.000' produces garbage. MoneyInput keeps a raw numeric model behind a grouped display layer, restores the caret by counting digits to its right, normalizes pasted values in any common format, and treats empty as empty — never as zero.",
      },
    ],
    startDate: "2026-09",
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
    techStack: ["JavaScript", "React", "Node.js", "PDF Generation"],
    category: "web",
    status: "live",
    liveUrl: "https://instantresume-builder.vercel.app/",
    githubUrl: "https://github.com/neuralforgeio/CV-Builder-App",
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
    githubUrl: "https://github.com/neuralforgeio/akuma-joki",
    features: [
      "Full Roblox storefront with multiple game catalogs, service categories, prices, requirements, difficulty levels, promotional tags, and game-specific notices.",
      "Multi-item cart and checkout supporting up to five services under one shared Order ID, with grouped order records and a WhatsApp handoff containing every selected item.",
      "Customer order tracking that aggregates all items belonging to the same Order ID, exposes individual item statuses, and derives an overall order state for mixed, processing, completed, or cancelled orders.",
      "Admin dashboard for managing games, products, orders, reports, announcements, FAQ, about content, settings, templates, live chat, analytics, and developer tool.",
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
        title: "Replacing an external AI dependency with deterministic search",
        description:
          "The smart-search feature needed to understand useful customer phrases without adding a heavyweight AI runtime or SDK. Instead of making every search dependent on an LLM, the API parses intent locally, recognizes game aliases, extracts meaningful keywords, filters catalog data, falls back to broader text matching, applies price sorting when requested, and returns the best five results. This keeps the feature lightweight, predictable, and directly tied to the actual storefront catalog.",
      },
      {
        title: "Resolving routing conflicts in Next.js App Router",
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
    liveUrl: "https://tromino-digital.vercel.app",
    githubUrl: "https://github.com/neuralforgeio/tromino-digital",
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
    liveUrl: "https://arus-ledger.vercel.app/",
    githubUrl: "https://github.com/neuralforgeio/Arus-Ledger",
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
        title: "Fixing the numpad that closed itself on every button press",
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
        title: "Route-per-tab navigation with scroll position persistence",
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
    githubUrl: "https://github.com/neuralforgeio/BliYu",
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

  {
    slug: "linkpulse",
    title: "LinkPulse",
    shortDesc:
      "Self-hosted, multi-tenant URL shortener with real-time click analytics — Go backend, Next.js dashboard, and PostgreSQL, with async click tracking, workspace roles, scoped API keys, and Argon2id security.",
    longDesc:
      "LinkPulse is a production-grade URL shortener built as a modular monolith: a Go backend, a Next.js dashboard, and PostgreSQL. Every redirect is recorded asynchronously — referrers, devices, browsers, campaigns, and unique-visitor estimates — without ever storing a raw IP address. Redirects bypass the dashboard entirely: visitors hit the Go server directly and get a 302 in milliseconds, while clicks flow into an in-memory buffer that a batch worker flushes to the click_events table every second or every 500 events — meaning analytics never slow a redirect down, and a graceful-shutdown flush ensures zero clicks are lost on deploys. The platform is multi-tenant by design: workspaces with invite codes and four roles (owner, admin, member, viewer) enforced server-side on every route, plus a public REST API with scoped keys (links:read, links:write, analytics:read) that are hashed at rest and shown exactly once. Security is treated as a feature: Argon2id password hashing, JWT access tokens with rotating refresh tokens and reuse detection, rate limiting, an append-only audit log, and parameterized SQL everywhere. The dashboard ships with dark/light/system themes, full responsiveness, QR codes, and CSV-ready data — and the whole thing is MIT-licensed and self-hostable, built to be owned with zero vendor lock-in.",
    images: [],
    techStack: [
      "Go 1.27",
      "Next.js 16",
      "TypeScript",
      "PostgreSQL",
      "chi",
      "pgx/v5",
      "TanStack Query",
      "Recharts",
      "Tailwind CSS",
      "JWT",
      "Argon2id",
      "Goose Migrations",
    ],
    category: "api",
    status: "live",
    liveUrl: "https://linkpulseshort.vercel.app",
    githubUrl: "https://github.com/neuralforgeio/LinkPulse",
    features: [
      "Short links with custom aliases, random base62 codes, expiry, click limits, password protection, and a UTM builder",
      "Async click tracking — redirects never wait for analytics: in-memory buffer, batch inserts (1s / 500 events), graceful-shutdown flush with zero lost clicks",
      "Real-time analytics — clicks over time, unique visitor estimates from salted IP hashes, top referrers, devices, browsers, OS, and campaigns",
      "Multi-tenant workspaces with invite codes and four roles (owner / admin / member / viewer) enforced server-side on every route",
      "Public REST API with scoped keys (links:read, links:write, analytics:read), keys hashed at rest and shown exactly once",
      "Security by default — Argon2id password hashing, JWT access tokens plus rotating refresh tokens with reuse detection, rate limiting, append-only audit log, and parameterized SQL everywhere",
      "Dashboard with dark / light / system themes, fully responsive, QR codes per link, and CSV-ready data exports",
      "Modular monolith architecture — one deployable Go backend with clear package boundaries (auth, link, analytics, apikey, audit) and Goose versioned migrations",
    ],
    challenges: [
      {
        title: "Tracking clicks without ever slowing a redirect",
        description:
          "The core tension in any shortener is that a redirect must be instant, but analytics must be complete. Writing a click event to PostgreSQL on every request would couple visitor latency to database health. I solved it with an in-memory click buffer: GET /{code} returns the 302 immediately after a lookup, while the click event (referrer, device, browser, campaign) is handed to the buffer and flushed by a batch worker every second or every 500 events. A graceful-shutdown hook drains the buffer so even a deploy mid-traffic loses zero clicks.",
      },
      {
        title: "Counting unique visitors without storing IP addresses",
        description:
          "Unique-visitor estimates normally require persisting IPs, which conflicts with the privacy stance of the project. Instead, each IP is hashed with a server-side salt before it ever touches storage, so the analytics layer can distinguish 'same visitor today' from 'new visitor' without the database ever holding a raw address. The salt never leaves the server, making the hashes non-reversible and non-joinable across deployments.",
      },
      {
        title: "API keys that are safe to store but possible to scope",
        description:
          "A public REST API needs keys that can be revoked and scoped, but storing them plaintext turns the database into a liability. Keys are generated once, shown exactly once, and stored only as hashes — with scopes (links:read, links:write, analytics:read) enforced server-side on every route. The same pattern as passwords, applied to machine access: the system can verify a key without being able to misuse it.",
      },
      {
        title: "Refresh token rotation with reuse detection",
        description:
          "Long-lived sessions are the classic weak point of JWT setups. Refresh tokens rotate on every use, and if a previously-rotated token is ever presented again the system treats it as a replay and invalidates the whole family — so a stolen token becomes worthless the moment the legitimate client refreshes. Combined with short-lived access tokens, sessions stay convenient for users and expensive for attackers.",
      },
    ],
    startDate: "2026-09",
    endDate: undefined,
    duration: "Ongoing",
    featured: true,
  },

  {
    slug: "umkm-os",
    title: "UMKM OS",
    shortDesc:
      "A Dockerized point-of-sale and store-operations platform for Indonesian warungs — Next.js 16 full-stack POS with an atomic checkout engine, a per-item stock ledger (restock/opname/sales), an owner analytics dashboard, an in-browser canvas photo editor for products, and a read-only FastAPI forecasting service over PostgreSQL.",
    longDesc:
      "UMKM OS is a full-stack point-of-sale and store-operations platform for small Indonesian businesses, built as a Dockerized monorepo with a deliberate trust boundary: the Next.js 16 App Router application is the single writer to PostgreSQL, while a Python FastAPI service connects read-only for demand forecasting, so ML experiments can never corrupt transactional data. The cashier POS runs a photo-rich product grid with category filtering, a cart supporting flat-Rp and percent discounts, CASH/QRIS/DEBIT payment flows with cash rounding and change calculation, and an instant receipt view. Checkout is atomic end-to-end: all money math runs in integer sen (1 Rp = 100 sen) against Decimal(12,2) columns, prices and discounts are recomputed server-side and never trusted from the browser, stock decrements are conditional updates guarded by `stock >= qty` so concurrent sales can never oversell, and every receipt writes its SALE rows into the stock ledger inside the same database transaction. The owner area ships an analytics dashboard (omzet today with day-over-day delta, 7-day sales chart, payment-method breakdown, top products, low-stock restock widget, recent receipts), full product management with multi-photo upload through an in-browser canvas editor (crop/rotate/flip) — images stored as bytes in Postgres so they survive container rebuilds and served via an immutable-caching API route — and a Kartu Stok ledger where restocks, opname adjustments, and sales are each attributable to a user, with SALE rows linking back to their receipt codes. Auth is NextAuth v5 credentials with bcrypt and an OWNER/KASIR role split bound to outlets (multi-outlet schema ready). The whole stack — postgres:18, a one-shot migrate+seed service, the FastAPI backend, and the standalone Next.js image — orchestrates with a single `docker compose up`, hot-rebuilding through `docker compose watch`, and ships a deterministic 42-day demo dataset (568 receipts) generated by a fixed mulberry32 PRNG so forecasting views always have history to learn from.",
    images: [
      "/images/umkm-os.svg",
    ],
    techStack: [
      "Next.js 16",
      "React 19",
      "TypeScript",
      "Tailwind CSS 4",
      "Prisma 7",
      "PostgreSQL 18",
      "FastAPI (Python)",
      "NextAuth v5",
      "Docker Compose",
      "Turbopack",
    ],
    category: "web",
    status: "live",
    liveUrl: undefined,
    githubUrl: "https://github.com/neuralforgeio/UMKM-OS",
    features: [
      "Dockerized monorepo — one `docker compose up` brings up postgres:18, a one-shot migrate+seed job, the FastAPI forecasting service, and the standalone Next.js production image; `docker compose watch` hot-rebuilds backend and frontend during development",
      "Atomic checkout engine — all money math in integer sen against Decimal(12,2) columns; subtotal, discount, total, paid, and change are recomputed server-side only (the browser sends just quantities, payment method, and a mode+value discount pair), so a tampered total can never land",
      "Oversell-proof inventory — stock decrements are conditional `UPDATE ... WHERE stock >= qty` inside the receipt transaction; a concurrent sale that fails the guard rolls the entire checkout back",
      "A stock ledger that cannot lie — every receipt writes its SALE movements inside the same database transaction it was created in, so the Kartu Stok ledger and the receipts structurally never disagree",
      "Kartu Stok (stock card) — restock (IN), opname physical-count adjustments (ADJUST), and sales (SALE) per item, each attributed to a user, SALE rows linked to their receipt codes, with type filters, search across product/SKU/receipt/note, and a low-stock panel offering one-click restock with pre-filled cost and quantity suggestions",
      "Owner analytics dashboard — omzet today with day-over-day delta, transaction and item counts, average basket, 7-day sales chart, payment-method breakdown (Tunai/QRIS/Debit), top products, low-stock restock widget, and recent receipts",
      "Product photo system — multi-image upload through an in-browser canvas editor (crop/rotate/flip), images stored as bytes in Postgres so they survive container rebuilds, served by /api/images/[id] with immutable caching, with an explicit thumbnail picker defaulting to the first photo and thumbnails rendered across POS, owner, and home",
      "Cashier POS — photo-rich product grid with category filtering, cart with flat-Rp/percent discount modes, three payment methods, cash rounding plus change calculation, and an instant receipt view",
      "RBAC via NextAuth v5 — bcrypt credentials, JWT sessions, OWNER vs KASIR roles, kasir bound to a single outlet while owner spans all (multi-outlet schema ready from day one)",
      "Historical price snapshots — every receipt line stores priceAtSale, so old receipts stay accurate after prices change; products use soft deletes so sales history is never lost",
      "Deterministic demo seeding — a mulberry32 PRNG with a fixed seed generates 42 days of warung-realistic history (568 receipts, weekend rush pattern, mixed payment methods), with an idempotent guard so re-deploys never wipe uploaded photos or manually recorded stock movements (FORCE_SEED=1 rebuilds from scratch)",
      "Read-only ML boundary — the FastAPI service connects with a read-only connection for forecasting queries, honoring the single-writer principle",
      "Rupiah everywhere — money renders as `Rp x.x00` through one shared formatter, with live Indonesian thousand-separator grouping while typing in every money input",
      "Next.js 16 cacheComponents-ready — dynamic pages rely on dynamic APIs (auth/cookies) rather than route-segment configs, keeping the build clean under cacheComponents + partial prefetching",
    ],
    challenges: [
      {
        title: "An update loop that only existed at runtime",
        description:
          "The redesigned home page crashed instantly with React error #185 — Maximum update depth exceeded — while `next build` passed cleanly, because it is a runtime-only bug. Root cause: a ticking LiveClock component whose useEffect listed the very state it set as a dependency, so every tick re-ran the effect that scheduled the next tick, forever. The fix renders a null state first so the server HTML and the first client render are identical (which also eliminates hydration mismatch), mounts the interval in an effect with intentionally empty deps, and builds the Intl.DateTimeFormat instances once at module level. The rule that emerged: an effect that writes its own dependency will always loop — deps arrays are load-bearing code, and a passing build proves nothing about render loops.",
      },
      {
        title: "The route config that cacheComponents forbids",
        description:
          "A new page shipped with `export const dynamic = \"force-dynamic\"` and the Docker production build failed on the spot: Next.js 16's cacheComponents mode disallows route-segment dynamic config entirely. The fix followed the codebase's own convention instead of fighting the framework — any page that reads cookies through `await auth()` is request-dynamic anyway, so the export was deleted and the page adopted the same auth-guard pattern as every other owner page. The broader lesson: under cacheComponents, dynamism comes from what the page *does* (dynamic APIs), not from what it *declares* (segment configs).",
      },
      {
        title: "Sen-precise money that never trusts the browser",
        description:
          "Warung checkout has three places where naive code loses money: float arithmetic on Rp amounts, client-computed totals, and races between concurrent sales. All money math runs in integer sen and converts to Decimal(12,2) strings only at the Prisma boundary; the client mirrors the server formula purely for display, while the server receives only quantities, payment method, and a mode+value discount pair — recomputing subtotal, discount, total, paid, and change itself. Overselling is prevented with conditional updates (`WHERE stock >= qty`) whose zero-count result rolls the whole receipt back, and each receipt writes its SALE movements into the stock ledger inside the same transaction, so the ledger and the receipts can never disagree even under concurrency.",
      },
      {
        title: "When the generated client fell behind the schema",
        description:
          "After evolving the schema with a StockMovement model, the editor lit up with a family of phantom errors — `Property 'stockMovement' does not exist on type 'PrismaClient'` cascading into implicit-any complaints — because Prisma's client is generated code that lags the schema until `npx prisma generate` runs. The cleanup also surfaced a real divergence: an interim migration had created the table with a TEXT column where the schema declared a Postgres enum, and a half-delivered feature left orphaned files importing exports that no longer existed. The resolution kept the enum-based migration (deleting the divergent one before it was ever applied), removed the orphans, regenerated the client, and restarted the TS server — and the discipline that emerged: the schema is the single source of truth, migrations must match it byte-for-byte, and any file that imports a vanished export is dead weight to delete, not fix.",
      },
    ],
    startDate: "2026-10",
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
