"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Download, ExternalLink, FileText, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, type JSX } from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/dearlyfebriano/i18n/language-context";

/* ============================================================
 * Lightbox — fullscreen preview gallery.
 * - Menerima DAFTAR item + index aktif (single item = array 1).
 * - Item gambar → <Image> seperti biasa.
 * - Item PDF (pdfUrl) → EMBEDDED VIEWER (iframe Google Drive):
 *   SEMUA halaman PDF bisa di-scroll/zoom — bukan hanya halaman 1.
 *   Iframe hanya di-render saat modal terbuka (lazy, nol biaya
 *   saat tertutup).
 * - Navigasi: tombol prev/next, panah kiri/kanan keyboard,
 *   Escape / klik backdrop / tombol X untuk menutup.
 * - Counter "N / M" saat lebih dari satu item.
 * - Body scroll terkunci saat terbuka; focus dikelola masuk/keluar.
 * ============================================================ */

export interface LightboxImage {
  src: string;
  alt?: string;
  caption?: string;
  /** URL embedded PDF viewer — bila ada, item dirender sebagai PDF. */
  pdfUrl?: string;
  /** URL download file asli (dipakai untuk item PDF). */
  downloadUrl?: string;
  /** URL buka file asli di Google Drive (item PDF). */
  externalUrl?: string;
}

interface LightboxProps {
  /** Daftar item; null/empty berarti lightbox tertutup. */
  images: LightboxImage[] | null;
  /** Index item yang sedang aktif. */
  index: number;
  onClose: () => void;
  /** Dipanggil saat navigasi prev/next (jika disediakan). */
  onNavigate?: (index: number) => void;
}

/* ---------- Embedded PDF viewer (semua halaman) ---------- */

function PdfEmbed({ item }: { item: LightboxImage }): JSX.Element {
  const { t } = useLanguage();
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-border/70 bg-card/80">
      {!isLoaded && (
        <div
          role="status"
          aria-live="polite"
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-card/95"
        >
          <Loader2 aria-hidden className="size-8 animate-spin text-primary" />
          <p className="font-mono text-xs text-muted-foreground">{t("Loading document…")}</p>
        </div>
      )}
      <iframe
        src={item.pdfUrl}
        title={item.alt ? `${item.alt} — PDF preview` : "PDF preview"}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        className="h-full w-full"
        allow="fullscreen"
      />
    </div>
  );
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
  const isPdf = Boolean(current?.pdfUrl);

  return (
    <AnimatePresence>
      {isOpen && current && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={
            isPdf
              ? (current.alt ?? t("PDF document preview"))
              : total > 1
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
            className={cn(
              "relative flex cursor-default flex-col items-center gap-3",
              isPdf
                ? "h-[86vh] w-[92vw] max-w-5xl"
                : "max-h-[85vh] w-[85vw] max-w-[90vw]"
            )}
          >
            <div className="relative h-[70vh] w-full">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={current.pdfUrl ?? current.src}
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
                  {isPdf ? (
                    <PdfEmbed item={current} />
                  ) : (
                    <Image
                      src={current.src}
                      alt={current.alt ?? ""}
                      fill
                      sizes="90vw"
                      className="object-contain"
                      draggable={false}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
            {/* Caption — PDF: badge + hint + aksi; image: caption biasa */}
            {isPdf ? (
              <div className="flex w-full flex-wrap items-center justify-between gap-2 px-1">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary">
                    <FileText aria-hidden className="size-3" />
                    PDF
                  </span>
                  {current.caption && (
                    <p className="truncate font-mono text-xs text-muted-foreground">
                      {current.caption}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {current.externalUrl && (
                    <a
                      href={current.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(event) => event.stopPropagation()}
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      {t("Open in Drive")}
                      <ExternalLink aria-hidden className="size-3" />
                    </a>
                  )}
                  {current.downloadUrl && (
                    <a
                      href={current.downloadUrl}
                      download
                      onClick={(event) => event.stopPropagation()}
                      aria-label={t("Download PDF")}
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      {t("Download PDF")}
                      <Download aria-hidden className="size-3" />
                    </a>
                  )}
                </div>
              </div>
            ) : (
              current.caption && (
                <p className="max-w-2xl truncate px-2 text-center font-mono text-xs text-muted-foreground">
                  {current.caption}
                </p>
              )
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
