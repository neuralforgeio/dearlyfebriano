"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, type JSX } from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/dearlyfebriano/i18n/language-context";

/* ============================================================
 * Lightbox — fullscreen image gallery preview.
 * - Menerima DAFTAR gambar + index aktif (single image = array 1).
 * - Navigasi: tombol prev/next, panah kiri/kanan keyboard,
 *   Escape / klik backdrop / tombol X untuk menutup.
 * - Counter "N / M" saat lebih dari satu gambar.
 * - Body scroll terkunci saat terbuka; focus dikelola masuk/keluar.
 * ============================================================ */

export interface LightboxImage {
  src: string;
  alt?: string;
  caption?: string;
}

interface LightboxProps {
  /** Daftar gambar; null/empty berarti lightbox tertutup. */
  images: LightboxImage[] | null;
  /** Index gambar yang sedang aktif. */
  index: number;
  onClose: () => void;
  /** Dipanggil saat navigasi prev/next (jika disediakan). */
  onNavigate?: (index: number) => void;
}

export default function Lightbox({
  images,
  index,
  onClose,
  onNavigate,
}: LightboxProps): JSX.Element {
  const reducedMotion = useReducedMotion();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { t } = useLanguage();
  const onCloseRef = useRef(onClose);
  const onNavigateRef = useRef(onNavigate);

  const isOpen = images !== null && images.length > 0;
  const safeIndex = isOpen ? Math.min(Math.max(index, 0), images.length - 1) : 0;
  const current = isOpen ? images[safeIndex] : null;
  const total = images?.length ?? 0;

  /* Terlacak untuk label tombol prev/next (di-render setelah state settle). */
  const [slideDirection, setSlideDirection] = useState<1 | -1>(1);

  useEffect(() => {
    onCloseRef.current = onClose;
    onNavigateRef.current = onNavigate;
  }, [onClose, onNavigate]);

  /* ---------- Scroll lock + focus management (per open/close) ---------- */
  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [isOpen]);

  /* ---------- Keyboard: Escape + panah (index via ref agar stabil) ---------- */
  const indexRef = useRef(safeIndex);
  const totalRef = useRef(total);
  useEffect(() => {
    indexRef.current = safeIndex;
    totalRef.current = total;
  }, [safeIndex, total]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (totalRef.current < 2) return;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        const nextIndex = indexRef.current + 1;
        if (nextIndex < totalRef.current) {
          setSlideDirection(1);
          onNavigateRef.current?.(nextIndex);
        }
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        const prevIndex = indexRef.current - 1;
        if (prevIndex >= 0) {
          setSlideDirection(-1);
          onNavigateRef.current?.(prevIndex);
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  const goTo = (nextIndex: number): void => {
    if (nextIndex < 0 || nextIndex >= total) return;
    setSlideDirection(nextIndex > safeIndex ? 1 : -1);
    onNavigate?.(nextIndex);
  };

  const hasPrev = safeIndex > 0;
  const hasNext = safeIndex < total - 1;

  return (
    <AnimatePresence>
      {isOpen && current && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={
            total > 1
              ? `${current.alt ?? t("Image preview")} — ${t("image")} ${safeIndex + 1} ${t("of")} ${total}`
              : (current.alt ?? t("Image preview"))
          }
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.15 : 0.25 }}
          onClick={() => onCloseRef.current()}
          className="fixed inset-0 z-[95] flex cursor-zoom-out items-center justify-center bg-background/90 p-4 backdrop-blur-sm"
        >
          {/* Counter */}
          {total > 1 && (
            <p className="glass pointer-events-none absolute left-4 top-4 rounded-full border border-border px-3 py-1 font-mono text-xs text-foreground">
              {safeIndex + 1} / {total}
            </p>
          )}

          <motion.div
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: reducedMotion ? 0.15 : 0.3, ease: "easeOut" }}
            onClick={(event) => event.stopPropagation()}
            className="relative flex max-h-[85vh] w-[85vw] max-w-[90vw] cursor-default flex-col items-center gap-3"
          >
            <div className="relative h-[70vh] w-full">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={current.src}
                  initial={
                    reducedMotion
                      ? { opacity: 0 }
                      : { opacity: 0, x: slideDirection * 40 }
                  }
                  animate={{ opacity: 1, x: 0 }}
                  exit={
                    reducedMotion
                      ? { opacity: 0 }
                      : { opacity: 0, x: slideDirection * -40 }
                  }
                  transition={{ duration: reducedMotion ? 0.12 : 0.22, ease: "easeOut" }}
                  className="absolute inset-0"
                >
                  <Image
                    src={current.src}
                    alt={current.alt ?? ""}
                    fill
                    sizes="90vw"
                    className="object-contain"
                    draggable={false}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
            {current.caption && (
              <p className="max-w-2xl truncate px-2 text-center font-mono text-xs text-muted-foreground">
                {current.caption}
              </p>
            )}
          </motion.div>

          {/* Prev / next */}
          {total > 1 && (
            <>
              <button
                type="button"
                aria-label={t("Previous image")}
                disabled={!hasPrev}
                onClick={(event) => {
                  event.stopPropagation();
                  goTo(safeIndex - 1);
                }}
                className={cn(
                  "glass absolute left-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border text-foreground transition-all hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:left-6",
                  !hasPrev && "pointer-events-none opacity-30"
                )}
              >
                <ChevronLeft className="size-5" aria-hidden />
              </button>
              <button
                type="button"
                aria-label={t("Next image")}
                disabled={!hasNext}
                onClick={(event) => {
                  event.stopPropagation();
                  goTo(safeIndex + 1);
                }}
                className={cn(
                  "glass absolute right-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border text-foreground transition-all hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:right-6",
                  !hasNext && "pointer-events-none opacity-30"
                )}
              >
                <ChevronRight className="size-5" aria-hidden />
              </button>
            </>
          )}

          <button
            ref={closeButtonRef}
            type="button"
            aria-label={t("Close preview")}
            onClick={(event) => {
              event.stopPropagation();
              onCloseRef.current();
            }}
            className="glass absolute right-4 top-4 flex size-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <X className="size-5" aria-hidden />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
