"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Calendar,
  CloudOff,
  Download,
  ExternalLink,
  FileText,
  FolderOpen,
  Loader2,
  RefreshCw,
  ZoomIn,
} from "lucide-react";
import FadeIn from "@/dearlyfebriano/components/animations/FadeIn";
import GlowCard from "@/dearlyfebriano/components/animations/GlowCard";
import Lightbox, { type LightboxImage } from "@/dearlyfebriano/components/common/Lightbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DRIVE_FOLDER_LINK,
  certificateCategories,
  certificates as staticCertificates,
  type CertificateCategory,
} from "@/dearlyfebriano/data/certificates";
import { formatDateLong } from "@/dearlyfebriano/lib/helpers";
import { useLanguage } from "@/dearlyfebriano/i18n/language-context";
import type { Certificate } from "@/dearlyfebriano/types";
import { cn } from "@/lib/utils";
import type { JSX } from "react";

/* ============================================================
 * CertificatesView — credential gallery, LIVE-SYNCED dari
 * folder Google Drive user:
 *  - data utama: /api/certificates (cache server 5 menit)
 *  - fallback: data statis certificates.ts bila Drive gagal
 *  - re-sync saat window focus (jika cache > 5 menit) + tombol
 *    refresh manual
 * ============================================================ */

const CATEGORY_LABELS: Record<CertificateCategory, string> = {
  all: "All",
  web: "Web",
  ai: "AI / ML",
  backend: "Backend",
  cloud: "Cloud",
  data: "Data",
};

/** Threshold sebelum re-sync otomatis saat window kembali fokus. */
const RESYNC_THRESHOLD_MS = 5 * 60 * 1000;

interface LightboxState {
  images: LightboxImage[];
  index: number;
}

interface ApiResponse {
  certificates?: Certificate[];
  syncedAt?: number | null;
  source?: "drive" | "fallback";
  error?: string;
}

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
}

function PageHeader({ eyebrow, title, description }: PageHeaderProps): JSX.Element {
  return (
    <FadeIn y={20} className="flex flex-col gap-4">
      <span className="font-mono text-xs uppercase tracking-[0.25em] text-primary">{eyebrow}</span>
      <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
        {title}
      </h1>
      {description && (
        <p className="max-w-2xl leading-relaxed text-muted-foreground">{description}</p>
      )}
    </FadeIn>
  );
}

/** Indikator status sync Drive — pill kecil + tombol refresh. */
function SyncIndicator({
  source,
  syncedAt,
  isRefreshing,
  onRefresh,
}: {
  source: "drive" | "fallback";
  syncedAt: number | null;
  isRefreshing: boolean;
  onRefresh: () => void;
}): JSX.Element {
  const [, forceRender] = useState(0);
  const { t } = useLanguage();

  /* Update label "x min ago" tiap 30 detik. */
  useEffect(() => {
    const interval = setInterval(() => forceRender((n) => n + 1), 30_000);
    return () => clearInterval(interval);
  }, []);

  const label = useMemo(() => {
    if (source === "fallback" || !syncedAt) return t("Offline — showing saved data");
    const seconds = Math.floor((Date.now() - syncedAt) / 1000);
    if (seconds < 60) return t("Synced just now");
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${t("Synced")} ${minutes} ${t("min ago")}`;
    const hours = Math.floor(minutes / 60);
    return `${t("Synced")} ${hours}h ${t("ago")}`;
  }, [source, syncedAt, forceRender, t]);

  const isLive = source === "drive";

  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "glass inline-flex items-center gap-2 rounded-full px-3 py-1 font-mono text-[11px] text-muted-foreground",
        )}
        aria-live="off"
      >
        <span className="relative flex size-1.5" aria-hidden>
          <span
            className={cn(
              "absolute inline-flex size-full rounded-full",
              isLive ? "animate-ping bg-emerald-500 opacity-75" : "bg-amber-500",
            )}
          />
          <span
            className={cn(
              "relative inline-flex size-1.5 rounded-full",
              isLive ? "bg-emerald-500" : "bg-amber-500",
            )}
          />
        </span>
        {isLive ? label : label}
      </span>
      <button
        type="button"
        onClick={onRefresh}
        disabled={isRefreshing}
        aria-label={t("Re-sync certificates from Google Drive")}
        className="inline-flex size-7 items-center justify-center rounded-full border border-border/70 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <RefreshCw
          aria-hidden
          className={cn("size-3.5", isRefreshing && "animate-spin")}
        />
      </button>
    </div>
  );
}

function CertificateCard({
  certificate,
  index,
  onOpen,
}: {
  certificate: Certificate;
  /** Posisi kartu dalam hasil filter — dipakai untuk lightbox galeri. */
  index: number;
  /** Buka lightbox galeri pada index kartu ini. */
  onOpen: (index: number) => void;
}): JSX.Element {
  const reducedMotion = useReducedMotion();
  const { t } = useLanguage();

  const openPreview = (): void => onOpen(index);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLElement>): void => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPreview();
    }
  };

  return (
    <GlowCard className="h-full">
      <article
        role="button"
        tabIndex={0}
        aria-label={`${certificate.title} ${t("by")} ${certificate.issuer} — ${
          certificate.fileType === "pdf"
            ? t("open PDF preview (all pages)")
            : t("open certificate preview")
        }`}
        onClick={openPreview}
        onKeyDown={handleKeyDown}
        className="card-shine group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/60 transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {/* Certificate image */}
        <div className="relative aspect-[1200/850] overflow-hidden border-b border-border/60">
          <Image
            src={certificate.imageUrl}
            alt={`${certificate.title} — ${t("certificate issued by")} ${certificate.issuer}`}
            fill
            unoptimized
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
            className={cn(
              "object-cover",
              !reducedMotion && "transition-transform duration-500 group-hover:scale-105"
            )}
          />
          <span
            aria-hidden
            className="glass absolute left-1/2 top-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          >
            {certificate.fileType === "pdf" ? (
              <FileText className="size-5" />
            ) : (
              <ZoomIn className="size-5" />
            )}
          </span>
          {certificate.source !== "drive" && (
            <span className="glass absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-foreground">
              <CloudOff aria-hidden className="size-3" />
              {t("saved")}
            </span>
          )}
          {/* Badge PDF — menandakan preview multi-halaman */}
          {certificate.fileType === "pdf" && (
            <span className="glass absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-primary/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary">
              <FileText aria-hidden className="size-3" />
              PDF
            </span>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-2 p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {certificate.issuer}
            </p>
            <span className="shrink-0 rounded-full border border-border/70 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {t(CATEGORY_LABELS[certificate.category as CertificateCategory] ?? certificate.category)}
            </span>
          </div>
          <h3 className="font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
            {certificate.title}
          </h3>
          {certificate.issueDate ? (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar aria-hidden className="size-3.5" />
              <time dateTime={certificate.issueDate}>{formatDateLong(certificate.issueDate)}</time>
            </p>
          ) : (
            <p className="font-mono text-xs text-muted-foreground/70">{t("Date not set")}</p>
          )}
          {certificate.credentialId && (
            <p className="font-mono text-[10px] text-muted-foreground/70">
              ID: {certificate.credentialId}
            </p>
          )}
          {/* Actions: Open in Drive + Download file asli */}
          {(certificate.verifyUrl || certificate.driveFileId) && (
            <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-2">
              {certificate.verifyUrl && (
                <a
                  href={certificate.verifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) => event.stopPropagation()}
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {t("Open in Drive")}
                  <ExternalLink aria-hidden className="size-3" />
                </a>
              )}
              {certificate.driveFileId && (
                <a
                  href={`https://drive.google.com/uc?export=download&id=${certificate.driveFileId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) => event.stopPropagation()}
                  aria-label={`${t("Download certificate file:")} ${certificate.title}`}
                  title={t("Download original file from Drive")}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {t("Download")}
                  <Download aria-hidden className="size-3" />
                </a>
              )}
            </div>
          )}
        </div>
      </article>
    </GlowCard>
  );
}

function CardSkeleton(): JSX.Element {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/60">
      <Skeleton className="aspect-[1200/850] rounded-none border-b border-border/60" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-2.5 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-28" />
      </div>
    </div>
  );
}

export default function CertificatesView(): JSX.Element {
  const [certificates, setCertificates] = useState<Certificate[]>(staticCertificates);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [syncSource, setSyncSource] = useState<"drive" | "fallback">("drive");
  const [syncedAt, setSyncedAt] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<CertificateCategory>("all");
  const [activeIssuer, setActiveIssuer] = useState<string>("all");
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const { t } = useLanguage();
  const reducedMotion = useReducedMotion();

  const loadCertificates = useCallback(
    async (force = false): Promise<void> => {
      if (force) setIsRefreshing(true);
      try {
        const response = await fetch(
          force ? "/api/certificates?refresh=1" : "/api/certificates",
          { cache: "no-store" }
        );
        const json = (await response.json()) as ApiResponse;
        if (response.ok && json.certificates && json.certificates.length > 0) {
          setCertificates(json.certificates);
          setSyncedAt(json.syncedAt ?? null);
          setSyncSource(json.source === "fallback" ? "fallback" : "drive");
        }
      } catch {
        // Biarkan data terakhir / fallback statis tetap tampil.
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    []
  );

  /* Initial load. */
  useEffect(() => {
    void loadCertificates();
  }, [loadCertificates]);

  /* Re-sync saat window kembali fokus dan cache sudah tua. */
  useEffect(() => {
    const onVisible = (): void => {
      if (document.visibilityState !== "visible") return;
      if (syncedAt && Date.now() - syncedAt < RESYNC_THRESHOLD_MS) return;
      void loadCertificates(true);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [loadCertificates, syncedAt]);

  /* Daftar issuer unik + jumlah sertifikatnya (untuk filter pill). */
  const issuers = useMemo(() => {
    const map = new Map<string, number>();
    for (const certificate of certificates) {
      map.set(certificate.issuer, (map.get(certificate.issuer) ?? 0) + 1);
    }
    return Array.from(map.entries()).map(([issuer, count]) => ({ issuer, count }));
  }, [certificates]);

  const filteredCertificates = useMemo(
    () =>
      certificates.filter(
        (certificate) =>
          (activeCategory === "all" || certificate.category === activeCategory) &&
          (activeIssuer === "all" || certificate.issuer === activeIssuer)
      ),
    [certificates, activeCategory, activeIssuer]
  );

  /* Buka lightbox galeri (semua hasil filter) pada index kartu yang diklik.
     Drive images: pakai resolusi lebih besar (w1200) untuk preview.
     Drive PDFs: pakai embedded viewer — SEMUA halaman bisa di-scroll. */
  const openLightboxAt = (index: number): void => {
    setLightbox({
      images: filteredCertificates.map((certificate) => ({
        src: certificate.driveFileId
          ? certificate.imageUrl.replace("sz=w800", "sz=w1200")
          : certificate.imageUrl,
        alt: certificate.title,
        caption: `${certificate.title} — ${certificate.issuer}`,
        pdfUrl:
          certificate.fileType === "pdf" && certificate.driveFileId
            ? `https://drive.google.com/file/d/${certificate.driveFileId}/preview`
            : undefined,
        downloadUrl: certificate.driveFileId
          ? `https://drive.google.com/uc?export=download&id=${certificate.driveFileId}`
          : undefined,
        externalUrl: certificate.verifyUrl,
      })),
      index,
    });
  };

  return (
    <div className="relative mx-auto w-full max-w-6xl px-4 pb-20 pt-28 sm:px-6 sm:pb-28 sm:pt-32">
      <PageHeader
        eyebrow={t("Achievements")}
        title={t("Certificates")}
        description={t("Proof of continuous learning — synced live from my Google Drive certificate folder.")}
      />

      {/* Live-sync indicator + link folder Drive */}
      <FadeIn delay={0.08} className="mt-6 flex flex-wrap items-center gap-3">
        <SyncIndicator
          source={syncSource}
          syncedAt={syncedAt}
          isRefreshing={isRefreshing}
          onRefresh={() => void loadCertificates(true)}
        />
        <a
          href={DRIVE_FOLDER_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <FolderOpen aria-hidden className="size-3.5" />
          {t("View Drive folder")}
          <ExternalLink aria-hidden className="size-3" />
        </a>
      </FadeIn>

      {/* Category filters */}
      <FadeIn delay={0.1} className="mt-8 sm:mt-10">
        <div className="flex flex-wrap gap-2" role="group" aria-label={t("Filter certificates by category")}>
          {certificateCategories.map((category) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                aria-pressed={isActive}
                className={cn(
                  "relative rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  isActive
                    ? "border-primary text-primary-foreground"
                    : "border-border/70 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.span
                    aria-hidden
                    layoutId="certificates-filter"
                    className="absolute inset-0 rounded-full bg-primary"
                    transition={
                      reducedMotion
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 400, damping: 32 }
                    }
                  />
                )}
                <span className="relative z-10">{t(CATEGORY_LABELS[category])}</span>
              </button>
            );
          })}
        </div>

        {/* Issuer filters — pill kecil dengan count */}
        <div
          className="mt-3 flex flex-wrap items-center gap-1.5"
          role="group"
          aria-label={t("Filter certificates by issuer")}
        >
          <span className="mr-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
            {t("Issuer")}
          </span>
          <button
            type="button"
            onClick={() => setActiveIssuer("all")}
            aria-pressed={activeIssuer === "all"}
            className={cn(
              "rounded-full border px-3 py-1 font-mono text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              activeIssuer === "all"
                ? "border-primary/60 bg-primary/10 text-primary"
                : "border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
            )}
          >
            {t("all")} ({certificates.length})
          </button>
          {issuers.map(({ issuer, count }) => {
            const isActive = activeIssuer === issuer;
            return (
              <button
                key={issuer}
                type="button"
                onClick={() => setActiveIssuer(isActive ? "all" : issuer)}
                aria-pressed={isActive}
                className={cn(
                  "rounded-full border px-3 py-1 font-mono text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  isActive
                    ? "border-primary/60 bg-primary/10 text-primary"
                    : "border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                )}
              >
                {issuer} ({count})
              </button>
            );
          })}
        </div>
      </FadeIn>

      {/* Count */}
      <p aria-live="polite" className="mt-6 font-mono text-xs text-muted-foreground">
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 aria-hidden className="size-3 animate-spin" />
            {t("Syncing with Google Drive…")}
          </span>
        ) : (
          <>{t("Showing")} {filteredCertificates.length} {t("of")} {certificates.length} {t("certificates")}</>
        )}
      </p>

      {/* Grid */}
      {isLoading ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-label={t("Loading certificates")}>
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredCertificates.length > 0 ? (
        <motion.div layout className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredCertificates.map((certificate, index) => (
              <motion.div
                key={certificate.id}
                layout
                initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                transition={{ duration: reducedMotion ? 0.15 : 0.25, ease: "easeOut" }}
                className="h-full"
              >
                <CertificateCard certificate={certificate} onOpen={openLightboxAt} index={index} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <FadeIn className="py-20 text-center">
          <FolderOpen aria-hidden className="mx-auto size-12 text-muted-foreground/50" />
          <h2 className="mt-4 text-lg font-semibold text-foreground">
            {t("No certificates match your filters")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{t("Try another category or issuer.")}</p>
          <button
            type="button"
            onClick={() => {
              setActiveCategory("all");
              setActiveIssuer("all");
            }}
            className="mt-6 inline-flex h-9 items-center justify-center rounded-md border border-border/70 bg-card/60 px-4 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {t("Show all certificates")}
          </button>
        </FadeIn>
      )}

      <Lightbox
        images={lightbox?.images ?? null}
        index={lightbox?.index ?? 0}
        onNavigate={(nextIndex) =>
          setLightbox((state) => (state ? { ...state, index: nextIndex } : state))
        }
        onClose={() => setLightbox(null)}
      />
    </div>
  );
}
