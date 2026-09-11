"use client";

import { Loader2 } from "lucide-react";
import { useLanguage, type Language } from "@/dearlyfebriano/i18n/language-context";
import { cn } from "@/lib/utils";

/* ============================================================
 * LanguageToggle — pill segmented EN / ID.
 * Default English; ID diterjemahkan otomatis via library.
 * Spinner kecil muncul saat kamus Indonesia masih dimuat.
 * ============================================================ */

const OPTIONS: { code: Language; label: string; title: string }[] = [
  { code: "en", label: "EN", title: "Switch to English" },
  { code: "id", label: "ID", title: "Ganti ke Bahasa Indonesia" },
];

export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang, loading } = useLanguage();

  return (
    <div
      role="group"
      aria-label="Language"
      title="Language / Bahasa"
      className={cn(
        "flex h-10 items-center gap-0.5 rounded-full border border-border bg-card p-0.5",
        className
      )}
    >
      {OPTIONS.map((option) => {
        const isActive = lang === option.code;
        return (
          <button
            key={option.code}
            type="button"
            onClick={() => setLang(option.code)}
            aria-pressed={isActive}
            title={option.title}
            className={cn(
              "flex h-9 min-w-9 items-center justify-center rounded-full px-2 font-mono text-[11px] font-semibold uppercase tracking-wide transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        );
      })}
      {loading && (
        <Loader2 aria-hidden className="mx-0.5 size-3.5 animate-spin text-primary" />
      )}
    </div>
  );
}

export default LanguageToggle;
