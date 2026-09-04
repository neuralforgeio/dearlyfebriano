# Dearly Febriano Irwansyah — Portfolio

Personal portfolio of **Dearly Febriano Irwansyah**, a Full Stack Developer based in Surabaya, Indonesia. Built as a single-page application with Next.js App Router, featuring smooth animations, an interactive guestbook, live-synced certificates from Google Drive, and automatic English ⇄ Indonesian translation.

**Live:** deployed on Vercel · **Repo:** `neuralforgeio/dearlyfebriano`

## ✨ Features

- **SPA portfolio** — client-side hash views (`#/about`, `#/projects`, `#/certificates`, …) rendered on a single `/` route
- **Auto EN ⇄ ID translation** — default English; toggle to Indonesian with translations generated automatically via `google-translate-api-x` (no manual sentence translation), cached client & server side
- **Interactive guestbook** — visitors can leave messages; the owner can delete them in "Manage" mode using an admin key
- **Contact form** — messages stored server-side + optional email delivery via Resend
- **Live certificate sync** — certificates pulled from a public Google Drive folder via Drive API v3 with server-side caching (lightweight, no client polling)
- **Dark mode default** with light theme toggle (next-themes)
- **Motion design** — signature orbiting-border avatar, typewriter roles, magnetic buttons, scroll reveals (Framer Motion)
- **Command palette** (`Ctrl K`), lightbox galleries, scroll progress, custom scrollbar, Konami-code easter egg
- **Responsive & accessible** — mobile-first, ARIA labels, keyboard navigation, reduced-motion support

## 🧱 Tech Stack

| Layer | Tools |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack), React 19, TypeScript |
| Styling | Tailwind CSS v4, shadcn/ui, CSS custom properties |
| Animation | Framer Motion |
| State | Zustand (UI/navigation) |
| Forms | React Hook Form + Zod |
| Email | Resend |
| Translation | google-translate-api-x |

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

### Environment Variables (all optional)

Copy `.env.example` to `.env.local` and adjust:

| Variable | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Enable contact-form email delivery (free tier: resend.com) |
| `PERSONAL_EMAIL` | Where contact emails are sent (defaults to the profile email) |
| `RESEND_FROM` | Verified sender identity |
| `ADMIN_DELETE_KEY` | Admin key for deleting guestbook/contact messages in "Manage" mode (defaults to the built-in owner key) |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL for SEO/OG tags |
| `NEXT_PUBLIC_WA_NUMBER` / `NEXT_PUBLIC_WA_MESSAGE` | Override the WhatsApp floating button target |
| `GOOGLE_DRIVE_API_KEY` | Google Drive API key for live certificate sync |
| `GDRIVE_FOLDER_ID` | Google Drive folder ID that holds the certificates |

Without any env vars the site still runs fully — messages are stored in `data/messages.json`, and certificates fall back to the static list in `src/dearlyfebriano/data/certificates.ts`.

## 📁 Structure

```
src/
├── app/                    # App Router shell, API routes, metadata
│   └── api/                # /api/translate, /api/certificates, /api/guestbook, /api/contact
├── components/ui/          # shadcn/ui primitives
└── dearlyfebriano/
    ├── PortfolioApp.tsx    # SPA shell (hash-based view switching)
    ├── components/         # layout / sections / views / animations / common
    ├── data/               # all portfolio content (edit these!)
    ├── i18n/               # EN⇄ID auto-translation system
    ├── lib/                # drive sync, email, message store, helpers
    ├── store/              # zustand UI store
    └── types/              # shared TypeScript types
```

> All personal data (name, links, projects, experience, certificates) is centralized in `src/dearlyfebriano/data/` — edit those files to make it yours.

## 📄 License

Personal portfolio — content © Dearly Febriano Irwansyah. Code available for inspiration; please don't republish the content as-is.
