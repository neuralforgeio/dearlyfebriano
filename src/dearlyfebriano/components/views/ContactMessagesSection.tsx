"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import {
  Inbox,
  KeyRound,
  Loader2,
  LogOut,
  MailCheck,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import FadeIn from "@/dearlyfebriano/components/animations/FadeIn";
import { initialsOf, timeAgo } from "@/dearlyfebriano/lib/helpers";
import { useLanguage } from "@/dearlyfebriano/i18n/language-context";
import type { ContactMessage } from "@/dearlyfebriano/types";
import { cn } from "@/lib/utils";
import type { JSX } from "react";

/* ============================================================
 * ContactMessagesSection — "Recent messages" (owner tools).
 * ------------------------------------------------------------
 * Panel di bawah contact form untuk PEMILIK portfolio:
 * - Terkunci secara default — dibuka dengan admin key yang sama
 *   dengan mode Manage di Guestbook (sessionStorage shared).
 * - Menampilkan pesan contact form terbaru (max 50) lengkap
 *   dengan nama, email, subject, status email, dan waktu.
 * - Setiap pesan bisa DIHAPUS (dengan konfirmasi) supaya daftar
 *   recent messages tetap bersih dan tidak mengganggu.
 * - Key diverifikasi via GET /api/contact (401 = salah),
 *   tidak pernah mengirim key ke pihak lain.
 * ============================================================ */

/** sessionStorage key — SAMA dengan GuestbookView (sekali buka, dua-duanya aktif). */
const ADMIN_KEY_STORAGE = "dearlyfebriano:admin-key";

interface ContactMessagesSectionProps {
  /** Di-bump ContactView setelah form berhasil dikirim → reload daftar. */
  refreshKey?: number;
}

interface MessageCardProps {
  message: ContactMessage;
  onDelete: (message: ContactMessage) => void;
}

function MessageCard({ message, onDelete }: MessageCardProps): JSX.Element {
  const { t } = useLanguage();

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.18 } }}
      transition={{ type: "spring", stiffness: 320, damping: 30 }}
      className="group card-surface rounded-xl border border-border p-5 transition-colors hover:border-foreground/25"
    >
      <div className="flex items-start gap-4">
        {/* Avatar initials */}
        <div
          aria-hidden
          className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/15 font-mono text-xs font-semibold text-primary ring-1 ring-primary/25"
        >
          {initialsOf(message.name) || "?"}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="truncate text-sm font-semibold text-foreground">
              {message.name}
            </p>
            <a
              href={`mailto:${message.email}`}
              className="truncate font-mono text-xs text-muted-foreground underline-offset-2 transition-colors hover:text-primary hover:underline"
            >
              {message.email}
            </a>
            <span className="ml-auto shrink-0 font-mono text-[10px] text-muted-foreground">
              {timeAgo(message.createdAt)}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary">
              {t(message.subject)}
            </span>
            {message.emailed ? (
              <span
                title={t("Email notification was sent")}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2.5 py-0.5 font-mono text-[10px] text-success"
              >
                <MailCheck aria-hidden className="size-3" />
                {t("emailed")}
              </span>
            ) : (
              <span
                title={t("Stored in database (email not configured)")}
                className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 font-mono text-[10px] text-muted-foreground"
              >
                {t("stored")}
              </span>
            )}
          </div>

          <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/90">
            {message.message}
          </p>
        </div>

        {/* Delete */}
        <button
          type="button"
          onClick={() => onDelete(message)}
          aria-label={`${t("Delete message from")} ${message.name}`}
          title={t("Delete message")}
          className="grid size-9 shrink-0 place-items-center rounded-lg text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 group-hover:opacity-100"
        >
          <Trash2 aria-hidden className="size-4" />
        </button>
      </div>
    </motion.article>
  );
}

function MessageSkeleton(): JSX.Element {
  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-4">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-2.5 w-48" />
        </div>
      </div>
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
    </div>
  );
}

export default function ContactMessagesSection({
  refreshKey = 0,
}: ContactMessagesSectionProps): JSX.Element {
  const { t } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [adminKeyInput, setAdminKeyInput] = useState("");
  const [isVerifyingKey, setIsVerifyingKey] = useState(false);

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  /* Filter subject ("all" | salah satu subject) — untuk merapikan daftar. */
  const [activeSubject, setActiveSubject] = useState<string>("all");

  const [pendingDelete, setPendingDelete] = useState<ContactMessage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const getAdminKey = (): string | null => {
    try {
      return sessionStorage.getItem(ADMIN_KEY_STORAGE);
    } catch {
      return null;
    }
  };

  const exitAdminMode = useCallback((): void => {
    try {
      sessionStorage.removeItem(ADMIN_KEY_STORAGE);
    } catch {
      /* ignore */
    }
    setIsAdmin(false);
    setMessages([]);
    setAdminKeyInput("");
    setShowKeyInput(false);
    setLoadError(null);
    toast.info(t("Manage mode turned off"));
  }, []);

  /** Muat daftar pesan dengan key tertentu. 401 → key tidak valid. */
  const loadMessages = useCallback(
    async (key: string): Promise<boolean> => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const response = await fetch("/api/contact", {
          headers: { "x-admin-key": key },
        });
        if (response.status === 401) return false;
        if (!response.ok) {
          setLoadError("Could not load messages — please try again.");
          return true;
        }
        const json = (await response.json()) as { messages?: ContactMessage[] };
        setMessages(json.messages ?? []);
        return true;
      } catch {
        setLoadError("Network error — could not load messages.");
        return true;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /* Muat kembali admin key tersimpan (sessionStorage) saat mount. */
  useEffect(() => {
    const stored = getAdminKey();
    if (!stored) return;
    let cancelled = false;
    (async () => {
      const valid = await loadMessages(stored);
      if (cancelled) return;
      if (valid) {
        setIsAdmin(true);
      } else {
        // Key tersimpan sudah tidak valid — bersihkan.
        try {
          sessionStorage.removeItem(ADMIN_KEY_STORAGE);
        } catch {
          /* ignore */
        }
        toast.error(t("Saved admin key was rejected — log in again."));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* Reload saat ContactView memberi sinyal (form baru terkirim). */
  useEffect(() => {
    if (refreshKey === 0) return;
    const key = getAdminKey();
    if (key) void loadMessages(key);
  }, [refreshKey]);

  const handleVerifyKey = async (): Promise<void> => {
    const key = adminKeyInput.trim();
    if (!key) return;
    setIsVerifyingKey(true);
    try {
      const response = await fetch("/api/contact", {
        headers: { "x-admin-key": key },
      });
      if (response.ok) {
        try {
          sessionStorage.setItem(ADMIN_KEY_STORAGE, key);
        } catch {
          /* ignore */
        }
        setIsAdmin(true);
        setShowKeyInput(false);
        setAdminKeyInput("");
        await loadMessages(key);
        toast.success(t("Manage mode enabled — recent messages unlocked"));
      } else if (response.status === 401) {
        toast.error(t("Wrong admin key."));
      } else {
        toast.error(t("Could not verify the key — try again."));
      }
    } catch {
      toast.error(t("Network error — could not verify the key."));
    } finally {
      setIsVerifyingKey(false);
    }
  };

  /* Subjects unik + jumlahnya (untuk filter pill). */
  const subjects = useMemo(() => {
    const map = new Map<string, number>();
    for (const message of messages) {
      map.set(message.subject, (map.get(message.subject) ?? 0) + 1);
    }
    return Array.from(map.entries()).map(([subject, count]) => ({ subject, count }));
  }, [messages]);

  const filteredMessages = useMemo(
    () =>
      activeSubject === "all"
        ? messages
        : messages.filter((message) => message.subject === activeSubject),
    [messages, activeSubject]
  );

  const handleConfirmDelete = async (): Promise<void> => {
    const target = pendingDelete;
    if (!target) return;
    const key = getAdminKey();
    if (!key) {
      exitAdminMode();
      setPendingDelete(null);
      return;
    }
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/contact?id=${encodeURIComponent(target.id)}`, {
        method: "DELETE",
        headers: { "x-admin-key": key },
      });
      const json = (await response.json().catch(() => null)) as {
        deleted?: boolean;
        error?: string;
      } | null;
      if (response.ok && json?.deleted) {
        setMessages((previous) => previous.filter((m) => m.id !== target.id));
        toast.success(t("Message deleted"));
        setPendingDelete(null);
      } else if (response.status === 401) {
        exitAdminMode();
        setPendingDelete(null);
        toast.error(t("Admin key rejected — manage mode disabled."));
      } else {
        toast.error(t(json?.error || "Failed to delete the message."));
      }
    } catch {
      toast.error(t("Network error — could not delete the message."));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRetry = async (): Promise<void> => {
    const key = getAdminKey();
    if (key) await loadMessages(key);
  };

  return (
    <FadeIn y={20} delay={0.15} className="mt-14 sm:mt-16">
      <section
        aria-label={t("Owner tools — recent contact messages")}
        className="card-surface rounded-xl border border-border p-6 sm:p-8"
      >
        {/* Header */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 eyebrow text-primary">
              <ShieldCheck aria-hidden className="size-3.5" />
              {t("Owner tools")}
            </p>
            <h2 className="mt-1.5 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {t("Recent messages")}
              {isAdmin && messages.length > 0 && (
                <span
                  aria-live="polite"
                  className="ml-2 inline-flex items-center rounded-full border border-border bg-secondary px-2.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                >
                  {messages.length}
                </span>
              )}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {isAdmin
                ? t("Contact form submissions, newest first — delete any you don't need.")
                : t("Private inbox for the site owner — unlock with your admin key to read and remove messages.")}
            </p>
          </div>

          {isAdmin ? (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleRetry}
                disabled={isLoading}
                aria-label={t("Reload messages")}
                title={t("Reload messages")}
                className="size-9"
              >
                <RefreshCw
                  aria-hidden
                  className={cn("size-4", isLoading && "animate-spin")}
                />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={exitAdminMode}
                aria-label={t("Turn off manage mode")}
                className="gap-2"
              >
                <LogOut aria-hidden className="size-3.5" />
                {t("Exit manage")}
              </Button>
            </div>
          ) : (
            !showKeyInput && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowKeyInput(true)}
                aria-label={t("Turn on manage mode to read and remove messages")}
                title={t("Owner: manage messages")}
                className="gap-2"
              >
                <ShieldCheck aria-hidden className="size-3.5" />
                {t("Manage messages")}
              </Button>
            )
          )}
        </div>

        {/* Key input (locked state) */}
        <AnimatePresence initial={false}>
          {!isAdmin && showKeyInput && (
            <motion.div
              key="key-input"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="mt-5 flex flex-col gap-2 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <Label
                    htmlFor="contact-admin-key"
                    className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
                  >
                    {t("Admin key")}
                  </Label>
                  <Input
                    id="contact-admin-key"
                    type="password"
                    autoComplete="off"
                    value={adminKeyInput}
                    onChange={(event) => setAdminKeyInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !isVerifyingKey) {
                        event.preventDefault();
                        void handleVerifyKey();
                      }
                    }}
                    placeholder={t("Your ADMIN_DELETE_KEY")}
                    className="mt-1.5 font-mono"
                    disabled={isVerifyingKey}
                  />
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {t("Same key as the guestbook manage mode. It stays in this browser session only.")}
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={handleVerifyKey}
                  disabled={isVerifyingKey || adminKeyInput.trim() === ""}
                  className="gap-2 sm:mb-0"
                >
                  {isVerifyingKey ? (
                    <>
                      <Loader2 aria-hidden className="size-4 animate-spin" />
                      {t("Verifying…")}
                    </>
                  ) : (
                    <>
                      <KeyRound aria-hidden className="size-4" />
                      {t("Unlock")}
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message list (admin state) */}
        {isAdmin && (
          <div className="mt-6">
            {/* Subject filter — hanya bila ada pesan dan >1 jenis subject */}
            {messages.length > 0 && (
              <div
                className="mb-4 flex flex-wrap items-center gap-1.5"
                role="group"
                aria-label={t("Filter messages by subject")}
              >
                <span className="mr-1 eyebrow/70">
                  {t("Subject")}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveSubject("all")}
                  aria-pressed={activeSubject === "all"}
                  className={cn(
                    "rounded-full border px-3 py-1 font-mono text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    activeSubject === "all"
                      ? "border-primary/60 bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-foreground/25 hover:text-foreground"
                  )}
                >
                  {t("all")} ({messages.length})
                </button>
                {subjects.map(({ subject, count }) => {
                  const isActive = activeSubject === subject;
                  return (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => setActiveSubject(isActive ? "all" : subject)}
                      aria-pressed={isActive}
                      className={cn(
                        "rounded-full border px-3 py-1 font-mono text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        isActive
                          ? "border-primary/60 bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-foreground/25 hover:text-foreground"
                      )}
                    >
                      {t(subject)} ({count})
                    </button>
                  );
                })}
              </div>
            )}
            {isLoading ? (
              <div className="flex flex-col gap-3" aria-label={t("Loading messages")}>
                <MessageSkeleton />
                <MessageSkeleton />
                <MessageSkeleton />
              </div>
            ) : loadError ? (
              <div
                role="alert"
                className="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center"
              >
                <p className="text-sm text-muted-foreground">{t(loadError)}</p>
                <Button type="button" variant="outline" size="sm" onClick={handleRetry}>
                  <RefreshCw aria-hidden className="size-3.5" />
                  {t("Try again")}
                </Button>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border p-10 text-center">
                <Inbox aria-hidden className="size-8 text-muted-foreground/60" />
                <p className="text-sm text-muted-foreground">
                  {activeSubject === "all"
                    ? t("No messages yet — the contact form submissions will appear here.")
                    : `${t("No messages with subject")} “${activeSubject}”.`}
                </p>
              </div>
            ) : (
              <ul
                className="flex flex-col gap-3"
                aria-label={t("Recent contact messages")}
              >
                <AnimatePresence initial={false} mode="popLayout">
                  {filteredMessages.map((message) => (
                    <li key={message.id} className="contents">
                      <MessageCard
                        message={message}
                        onDelete={(m) => setPendingDelete(m)}
                      />
                    </li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </div>
        )}
      </section>

      {/* Delete confirmation */}
      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("Delete this message?")}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                <p>
                  {t("Message from")} <strong>{pendingDelete?.name}</strong>
                  {pendingDelete?.subject ? ` — “${t(pendingDelete.subject)}”` : ""}{" "}
                  {t("will be permanently removed from recent messages.")}
                </p>
                {pendingDelete?.message && (
                  <p className="mt-2 max-h-24 overflow-y-auto whitespace-pre-wrap rounded-lg border border-border bg-secondary/50 p-3 font-mono text-xs text-muted-foreground">
                    {pendingDelete.message.slice(0, 300)}
                    {pendingDelete.message.length > 300 ? "…" : ""}
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{t("Cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void handleConfirmDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 aria-hidden className="size-4 animate-spin" />
                  {t("Deleting…")}
                </>
              ) : (
                <>
                  <Trash2 aria-hidden className="size-4" />
                  {t("Delete message")}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </FadeIn>
  );
}
