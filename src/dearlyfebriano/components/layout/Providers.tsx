"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { LanguageProvider } from "@/dearlyfebriano/i18n/language-context";

/* ============================================================
 * Providers — theme (next-themes) + language (EN/ID auto
 * translate) + toast (sonner). Dark mode adalah default
 * sesuai design system portfolio.
 * ============================================================ */

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <LanguageProvider>{children}</LanguageProvider>
      <Toaster position="bottom-right" richColors closeButton />
    </ThemeProvider>
  );
}

