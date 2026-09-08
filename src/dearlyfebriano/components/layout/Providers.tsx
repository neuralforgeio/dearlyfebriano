"use client";

import { ThemeProvider } from "next-themes";

import { Toaster } from "@/components/ui/sonner";

import { LanguageProvider } from "@/dearlyfebriano/i18n/language-context";

import AutoTranslate from "@/dearlyfebriano/components/i18n/AutoTranslate";

/* ============================================================
 * Providers
 *
 * Order:
 *
 * ThemeProvider
 *   ↓
 * LanguageProvider
 *   ↓
 * AutoTranslate
 *   ↓
 * Portfolio
 *
 * AutoTranslate must be BELOW LanguageProvider because it uses
 * useLanguage().
 * ============================================================ */

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <LanguageProvider>
        <AutoTranslate />

        {children}
      </LanguageProvider>

      <Toaster position="bottom-right" richColors closeButton />
    </ThemeProvider>
  );
}
