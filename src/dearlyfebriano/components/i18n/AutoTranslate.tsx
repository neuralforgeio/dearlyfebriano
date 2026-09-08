"use client";

import { useCallback, useEffect, useRef, type JSX } from "react";

import {
  cleanupTouchedNodes,
  translateDocument,
} from "@/dearlyfebriano/i18n/auto-translator";

import { useLanguage } from "@/dearlyfebriano/i18n/language-context";

/* ============================================================
 * Global Auto Translator
 *
 * Source:
 *   English / Indonesian / Mixed
 *
 * Target:
 *   current language
 *
 * The component itself renders nothing.
 * ============================================================ */

export default function AutoTranslate(): JSX.Element | null {
  const { lang, loading, t } = useLanguage();

  const langRef = useRef(lang);

  const loadingRef = useRef(loading);

  const runningRef = useRef(false);

  const scheduledRef = useRef(false);

  const lastRunRef = useRef(0);

  /* ==========================================================
   * Translation API
   * ========================================================== */

  const translateBatch = useCallback(
    async (
      strings: string[],
      target: "en" | "id",
    ): Promise<Record<string, string>> => {
      if (strings.length === 0) {
        return {};
      }

      const response = await fetch("/api/translate", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          strings,
          target,
        }),
      });

      /*
       * Do not immediately retry a 429.
       *
       * The observer/cooldown will retry later.
       */

      if (response.status === 429) {
        return {};
      }

      if (!response.ok) {
        return {};
      }

      const data = (await response.json()) as {
        translations?: Record<string, string>;
      };

      return data.translations ?? {};
    },
    [],
  );

  /* ==========================================================
   * Run
   * ========================================================== */

  const runTranslation = useCallback(async (): Promise<void> => {
    if (runningRef.current) {
      return;
    }

    if (loadingRef.current) {
      return;
    }

    const now = Date.now();

    /*
     * Hard cooldown between scans.
     */

    if (now - lastRunRef.current < 1500) {
      return;
    }

    lastRunRef.current = now;

    runningRef.current = true;

    try {
      await translateDocument({
        target: langRef.current,

        translateBatch,

        lookupTranslation: (text, target) => {
          /*
           * The normal t() dictionary currently has a
           * dedicated active-language lookup.
           *
           * Use it only when target matches current
           * language.
           */

          if (target !== langRef.current) {
            return undefined;
          }

          const translated = t(text);

          return translated !== text ? translated : undefined;
        },
      });
    } finally {
      runningRef.current = false;

      cleanupTouchedNodes();
    }
  }, [t, translateBatch]);

  /* ==========================================================
   * Sync refs
   * ========================================================== */

  useEffect(() => {
    const timer = window.setTimeout(() => {
      langRef.current = lang;

      loadingRef.current = loading;
    }, 0);

    return () => window.clearTimeout(timer);
  }, [lang, loading]);

  /* ==========================================================
   * Language change
   * ========================================================== */

  useEffect(() => {
    /*
     * Always re-run for BOTH languages.
     *
     * This is the important difference from the old version.
     *
     * We do NOT restore an "original English" DOM anymore.
     */

    const timer = window.setTimeout(() => {
      if (!loading) {
        void runTranslation();
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [lang, loading, runTranslation]);

  /* ==========================================================
   * Mutation observer
   * ========================================================== */

  useEffect(() => {
    if (typeof MutationObserver === "undefined") {
      return;
    }

    let debounceTimer: number | null = null;

    const schedule = (): void => {
      if (scheduledRef.current) {
        return;
      }

      scheduledRef.current = true;

      debounceTimer = window.setTimeout(() => {
        scheduledRef.current = false;

        debounceTimer = null;

        if (loadingRef.current) {
          return;
        }

        void runTranslation();
      }, 500);
    };

    const observer = new MutationObserver((mutations) => {
      /*
       * ONLY childList.
       *
       * We deliberately do not observe characterData because
       * the translator itself changes Text.nodeValue.
       *
       * Otherwise:
       *
       * translate
       * -> mutation
       * -> translate
       * -> mutation
       * -> 429
       */

      const relevant = mutations.some(
        (mutation) =>
          mutation.type === "childList" &&
          (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0),
      );

      if (relevant) {
        schedule();
      }
    });

    observer.observe(document.body, {
      childList: true,

      subtree: true,

      characterData: false,
    });

    return () => {
      observer.disconnect();

      if (debounceTimer !== null) {
        window.clearTimeout(debounceTimer);
      }

      scheduledRef.current = false;
    };
  }, [runTranslation]);

  return null;
}
