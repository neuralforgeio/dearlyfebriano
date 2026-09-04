"use client";

import { useEffect, useState, type JSX } from "react";
import { useReducedMotion } from "framer-motion";
import { ArrowUp, Clock, Command, Heart, Keyboard } from "lucide-react";
import { NAV_ITEMS } from "@/dearlyfebriano/lib/constants";
import { profile } from "@/dearlyfebriano/data/profile";
import { socialLinks } from "@/dearlyfebriano/data/socialLinks";
import { useUIStore } from "@/dearlyfebriano/store/ui-store";
import { SocialIcon } from "@/dearlyfebriano/components/ui/SocialIcon";
import { useLanguage } from "@/dearlyfebriano/i18n/language-context";

/* ============================================================
 * Footer — bottom of the page. The app root wraps everything
 * in `min-h-screen flex flex-col`; `mt-auto` here keeps the
 * footer pinned to the bottom when content is short.
 * ============================================================ */

/* Jam lokal Surabaya (WIB) — update tiap detik, aman hydration (initial render
 * placeholder, waktu diisi lewat rAF/interval callback). */
function SurabayaClock(): JSX.Element {
  const { t } = useLanguage();
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const tick = () => setTime(formatter.format(new Date()));
    const raf = requestAnimationFrame(tick);
    const interval = setInterval(tick, 1000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(interval);
    };
  }, []);

  return (
    <span className="flex items-center gap-1.5 font-mono tabular-nums" title={t("Local time in Surabaya (WIB)")}>
      <Clock className="size-3.5" aria-hidden />
      {time ?? "--:--:--"} WIB
    </span>
  );
}

export function Footer() {
  const { t } = useLanguage();
  const navigate = useUIStore((state) => state.navigate);
  const setCommandOpen = useUIStore((state) => state.setCommandOpen);
  const setShortcutsOpen = useUIStore((state) => state.setShortcutsOpen);
  const prefersReducedMotion = useReducedMotion();
  const currentYear = new Date().getFullYear();

  const handleBackToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <footer className="mt-auto border-t border-border bg-card/40 print:hidden">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        {/* Top row: brand / quick links / socials */}
        <div className="grid gap-10 md:grid-cols-3 md:gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => navigate("home")}
              aria-label={t("Go to home")}
              className="flex h-11 w-fit items-center font-mono text-lg font-bold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              <span className="text-foreground">dearly</span>
              <span className="text-gradient">febriano</span>
              <span className="text-primary" aria-hidden="true">
                .
              </span>
            </button>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              {t(profile.tagline)}
            </p>
          </div>

          {/* Quick links */}
          <nav aria-label={t("Footer quick links")}>
            <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {t("Quick Links")}
            </h2>
            <ul className="flex flex-col">
              {NAV_ITEMS.map((item) => (
                <li key={item.view}>
                  <button
                    type="button"
                    onClick={() => navigate(item.view)}
                    className="py-2.5 text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    {t(item.label)}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Socials */}
          <div>
            <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {t("Connect")}
            </h2>
            <ul className="flex flex-wrap items-center gap-3">
              {socialLinks.map((link) => (
                <li key={link.icon}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${link.label} (${t("opens in new tab")})`}
                    className="grid size-9 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <SocialIcon icon={link.icon} className="size-4" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom row: copyright / made with / clock / command hint / back to top */}
        <div className="mt-10 flex flex-col justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>
            &copy; {currentYear} {profile.fullName}. {t("All rights reserved.")}
          </p>
          <div className="flex flex-wrap items-center gap-5">
            <p className="flex items-center gap-1.5">
              <span>{t("Made with")}</span>
              <Heart className="size-3 fill-current text-primary" aria-hidden="true" />
              <span>{t("using Next.js & Tailwind CSS")}</span>
            </p>
            <span className="hidden items-center gap-2 md:flex" aria-label={t("Local time in Surabaya")}>
              <span className="text-foreground/60" aria-hidden>
                ·
              </span>
              <span className="text-foreground/70">{profile.location.split(",")[0]}</span>
              <SurabayaClock />
            </span>
            <button
              type="button"
              onClick={() => setCommandOpen(true)}
              aria-label={t("Open command palette")}
              title={t("Open command palette (Ctrl+K)")}
              className="hidden h-8 items-center gap-1.5 rounded-md border border-border bg-secondary px-2.5 font-mono text-[10px] transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 lg:flex"
            >
              <Command className="size-3" aria-hidden />
              <kbd>Ctrl</kbd>
              <kbd>K</kbd>
            </button>
            {/* Touch/pointer entry point for the shortcuts cheatsheet —
                "?" and Ctrl+K both need a physical keyboard, so mobile
                users need a tappable target (worklog ronde 8, rekomendasi d). */}
            <button
              type="button"
              onClick={() => setShortcutsOpen(true)}
              aria-label={t("Keyboard shortcuts")}
              title={t("Keyboard shortcuts")}
              className="grid size-11 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <Keyboard className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={handleBackToTop}
              aria-label={t("Back to top")}
              className="flex h-11 items-center gap-1.5 px-1 transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <ArrowUp className="size-3.5" aria-hidden="true" />
              {t("Back to top")}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
