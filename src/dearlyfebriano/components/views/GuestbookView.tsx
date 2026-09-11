"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Inbox,
  KeyRound,
  Loader2,
  LogOut,
  PenLine,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
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
import { avatarGradientFor, initialsOf, timeAgo } from "@/dearlyfebriano/lib/helpers";
import type { GuestbookEntry } from "@/dearlyfebriano/types";
import { useLanguage } from "@/dearlyfebriano/i18n/language-context";
import { cn } from "@/lib/utils";
import type { JSX } from "react";

/* ============================================================
 * GuestbookView — sign the guestbook and see messages from
 * other visitors, newest first, with live updates on post.
 * ============================================================ */

const guestbookSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters"),
  message: z
    .string()
    .trim()
    .min(5, "Message must be at least 5 characters")
    .max(500, "Message must be at most 500 characters"),
});

const NAME_MAX = 50;
const MESSAGE_MAX = 500;

/** Berapa banyak pesan per halaman. */
const PAGE_SIZE = 6;

/** sessionStorage key untuk admin key (mode Manage guestbook). */
const ADMIN_KEY_STORAGE = "dearlyfebriano:admin-key";

/** Daftar nomor halaman dengan ellipsis (1 … 4 5 6 … 12). */
function pageList(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, total, current - 1, current, current + 1]);
  const sorted = Array.from(pages)
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
  const result: (number | "…")[] = [];
  let previous = 0;
  for (const p of sorted) {
    if (p - previous > 1) result.push("…");
    result.push(p);
    previous = p;
  }
  return result;
}

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
}

function PageHeader({ eyebrow, title, description }: PageHeaderProps): JSX.Element {
  return (
    <FadeIn y={20} className="flex flex-col gap-4">
      <span className="eyebrow text-primary">{eyebrow}</span>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
        {title}
      </h1>
      {description && (
        <p className="max-w-2xl leading-relaxed text-muted-foreground">{description}</p>
      )}
    </FadeIn>
  );
}

function EntrySkeleton(): JSX.Element {
  return (
    <div className="space-y-3 rounded-2xl border border-border/70 bg-card/60 p-5">
      <div className="flex items-center gap-3">
        <Skeleton className="size-9 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-2.5 w-16" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
    </div>
  );
}

export default function GuestbookView(): JSX.Element {
  const { t } = useLanguage();

  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ name?: string; message?: string }>({});
  const [isPosting, setIsPosting] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState("");

  /* Pagination — pesan terbaru selalu di halaman 1. */
  const [page, setPage] = useState(1);

  /* ---------- Admin "Manage" mode (hapus pesan) ---------- */
  const [isAdmin, setIsAdmin] = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [adminKeyInput, setAdminKeyInput] = useState("");
  const [isVerifyingKey, setIsVerifyingKey] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<GuestbookEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  /* Muat kembali admin key tersimpan (sessionStorage). */
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(ADMIN_KEY_STORAGE);
      if (stored) setIsAdmin(true);
    } catch {
      /* sessionStorage bisa diblokir — biarkan mode admin off. */
    }
  }, []);

  const getAdminKey = (): string | null => {
    try {
      return sessionStorage.getItem(ADMIN_KEY_STORAGE);
    } catch {
      return null;
    }
  };

  const exitAdminMode = (): void => {
    try {
      sessionStorage.removeItem(ADMIN_KEY_STORAGE);
    } catch {
      /* ignore */
    }
    setIsAdmin(false);
    setAdminKeyInput("");
    setShowKeyInput(false);
    toast.info(t("Manage mode turned off"));
  };

  /* Verifikasi key: coba hapus entry dummy (id tidak ada) — 401 = key
     salah, 404 = key valid. Dengan begitu key diverifikasi tanpa
     menghapus data apa pun. */
  const handleVerifyKey = async (): Promise<void> => {
    const key = adminKeyInput.trim();
    if (!key) return;
    setIsVerifyingKey(true);
    try {
      const response = await fetch("/api/guestbook?id=verify-key-probe", {
        method: "DELETE",
        headers: { "x-admin-key": key },
      });
      if (response.status === 404) {
        // Key valid (dummy id tidak ditemukan tapi auth lolos).
        try {
          sessionStorage.setItem(ADMIN_KEY_STORAGE, key);
        } catch {
          /* ignore */
        }
        setIsAdmin(true);
        setShowKeyInput(false);
        setAdminKeyInput("");
        toast.success(t("Manage mode enabled — you can now remove messages"));
      } else {
        toast.error(t("Wrong admin key."));
      }
    } catch {
      toast.error(t("Network error — could not verify the key."));
    } finally {
      setIsVerifyingKey(false);
    }
  };

  const handleConfirmDelete = async (): Promise<void> => {
    const entry = pendingDelete;
    if (!entry) return;
    const key = getAdminKey();
    if (!key) {
      setIsAdmin(false);
      setPendingDelete(null);
      return;
    }
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/guestbook?id=${encodeURIComponent(entry.id)}`, {
        method: "DELETE",
        headers: { "x-admin-key": key },
      });
      const json = (await response.json().catch(() => null)) as { deleted?: boolean; error?: string } | null;
      if (response.ok && json?.deleted) {
        setEntries((previous) => previous.filter((e) => e.id !== entry.id));
        setLiveAnnouncement(`${t("Message from")} ${entry.name} ${t("was removed.")}`);
        toast.success(t("Message deleted"));
        setPendingDelete(null);
      } else if (response.status === 401) {
        // Key tidak lagi valid — keluar dari mode admin.
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

  const totalPages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pagedEntries = entries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const rangeStart = entries.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, entries.length);

  // Load existing entries (re-runs when the user clicks "Try again").
  useEffect(() => {
    let cancelled = false;
    const load = async (): Promise<void> => {
      try {
        const response = await fetch("/api/guestbook");
        const json = (await response.json()) as {
          entries?: GuestbookEntry[];
          error?: string;
        };
        if (cancelled) return;
        if (response.ok && json.entries) {
          setEntries(json.entries);
          setLoadError(null);
        } else {
          setLoadError(json.error || "Failed to load messages.");
        }
      } catch {
        if (!cancelled) setLoadError("Network error — could not load messages.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const parsed = guestbookSchema.safeParse({ name, message });
    if (!parsed.success) {
      const nextErrors: { name?: string; message?: string } = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key === "name" || key === "message") {
          nextErrors[key] = nextErrors[key] ?? issue.message;
        }
      }
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsPosting(true);
    try {
      const response = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = (await response.json()) as { entry?: GuestbookEntry; error?: string };
      if (response.status === 201 && json.entry) {
        const newEntry = json.entry;
        setEntries((previous) => [newEntry, ...previous]);
        setPage(1);
        setLiveAnnouncement(`${newEntry.name} ${t("just signed the guestbook.")}`);
        toast.success(t("Message posted!"));
        setName("");
        setMessage("");
      } else {
        toast.error(t(json.error || "Failed to post your message."));
      }
    } catch {
      toast.error(t("Network error — please try again."));
    } finally {
      setIsPosting(false);
    }
  };

  const messageCount = entries.length;

  return (
    <div className="relative mx-auto w-full max-w-6xl px-4 pb-20 pt-28 sm:px-6 sm:pb-28 sm:pt-32">
      <PageHeader
        eyebrow={t("Guestbook")}
        title={t("Say hello 👋")}
        description={t("Leave a message — it appears here instantly for everyone visiting.")}
      />

      <div className="mt-14 grid gap-10 sm:mt-16 lg:grid-cols-[0.9fr_1.1fr]">
        {/* ---------- LEFT: sign form ---------- */}
        <FadeIn x={-24}>
          <form
            onSubmit={handleSubmit}
            noValidate
            aria-label={t("Sign the guestbook")}
            className="card-surface flex h-fit flex-col gap-5 rounded-2xl p-6"
          >
            <div>
              <h2 className="text-lg font-semibold text-foreground">{t("Sign the guestbook")}</h2>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {t("// visitors from everywhere")}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="guestbook-name">{t("Name")}</Label>
              <Input
                id="guestbook-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={NAME_MAX}
                autoComplete="name"
                placeholder={t("e.g. Alex from Berlin")}
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={errors.name ? "guestbook-name-error" : undefined}
              />
              {errors.name && (
                <p id="guestbook-name-error" className="text-xs text-destructive">
                  {t(errors.name)}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="guestbook-message">{t("Message")}</Label>
              <Textarea
                id="guestbook-message"
                rows={4}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                maxLength={MESSAGE_MAX}
                placeholder={t("Say hi, share feedback, or drop a fun fact…")}
                aria-invalid={errors.message ? true : undefined}
                aria-describedby={
                  errors.message ? "guestbook-message-error" : "guestbook-message-count"
                }
              />
              <div className="flex items-center justify-between gap-4">
                {errors.message ? (
                  <p id="guestbook-message-error" className="text-xs text-destructive">
                    {t(errors.message)}
                  </p>
                ) : (
                  <span aria-hidden />
                )}
                <p
                  id="guestbook-message-count"
                  className="ml-auto shrink-0 font-mono text-xs text-muted-foreground"
                >
                  {message.length} / {MESSAGE_MAX}
                </p>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isPosting}
              className="bg-primary text-white shadow-lg shadow-primary/25 hover:opacity-90"
            >
              {isPosting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  {t("Posting…")}
                </>
              ) : (
                <>
                  <PenLine className="size-4" aria-hidden />
                  {t("Sign guestbook")}
                </>
              )}
            </Button>
          </form>
        </FadeIn>

        {/* ---------- RIGHT: entries ---------- */}
        <FadeIn x={24} delay={0.1} className="flex min-w-0 flex-col">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-lg font-semibold text-foreground">{t("Recent messages")}</h2>
            <div className="flex items-center gap-3">
              <p className="font-mono text-xs text-muted-foreground" aria-live="off">
                {messageCount} {messageCount === 1 ? t("message") : t("messages")}
              </p>
              {/* Manage toggle (owner) */}
              {!isAdmin ? (
                <button
                  type="button"
                  onClick={() => setShowKeyInput((v) => !v)}
                  aria-expanded={showKeyInput}
                  aria-label={t("Turn on manage mode to remove messages")}
                  title={t("Owner: manage messages")}
                  className="inline-flex size-7 items-center justify-center rounded-full border border-border/70 text-muted-foreground transition-colors hover:border-foreground/25 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <ShieldCheck aria-hidden className="size-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={exitAdminMode}
                  aria-label={t("Turn off manage mode")}
                  title={t("Manage mode is on — click to turn off")}
                  className="inline-flex items-center gap-1.5 rounded-full border border-primary/50 bg-primary/10 px-2.5 py-1 font-mono text-[10px] text-primary transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <ShieldCheck aria-hidden className="size-3" />
                  {t("managing")}
                  <LogOut aria-hidden className="size-3" />
                </button>
              )}
            </div>
          </div>

          {/* Inline admin key input */}
          <AnimatePresence initial={false}>
            {showKeyInput && !isAdmin && (
              <motion.form
                key="admin-key-form"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleVerifyKey();
                }}
                className="overflow-hidden"
                aria-label={t("Enter admin key")}
              >
                <div className="mt-3 flex items-center gap-2 rounded-xl border border-border/70 bg-card/60 p-3">
                  <KeyRound aria-hidden className="size-4 shrink-0 text-muted-foreground" />
                  <Input
                    type="password"
                    value={adminKeyInput}
                    onChange={(event) => setAdminKeyInput(event.target.value)}
                    placeholder={t("Admin key (ADMIN_DELETE_KEY)")}
                    autoComplete="off"
                    aria-label={t("Admin key")}
                    className="h-8 border-none bg-transparent font-mono text-xs focus-visible:ring-0"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isVerifyingKey || adminKeyInput.trim() === ""}
                    className="h-8 shrink-0 px-3 text-xs"
                  >
                    {isVerifyingKey ? (
                      <Loader2 aria-hidden className="size-3.5 animate-spin" />
                    ) : (
                      t("Unlock")
                    )}
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
          {/* Polite screen-reader announcement for freshly posted messages */}
          <p aria-live="polite" className="sr-only">
            {liveAnnouncement}
          </p>

          <div className="mt-4 min-w-0">
            {isLoading ? (
              <div className="space-y-4" aria-label={t("Loading messages")}>
                <EntrySkeleton />
                <EntrySkeleton />
                <EntrySkeleton />
              </div>
            ) : loadError ? (
              <div
                role="alert"
                className="flex flex-col items-center gap-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center"
              >
                <AlertTriangle aria-hidden className="size-8 text-destructive" />
                <p className="text-sm text-foreground">{t(loadError)}</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setReloadKey((key) => key + 1)}
                  className="gap-2"
                >
                  <RefreshCw className="size-4" aria-hidden />
                  {t("Try again")}
                </Button>
              </div>
            ) : entries.length === 0 ? (
              <div className="py-12 text-center">
                <Inbox aria-hidden className="mx-auto size-10 text-muted-foreground/50" />
                <p className="mt-4 font-medium text-foreground">{t("Be the first to sign!")}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("Your message will appear here for everyone.")}
                </p>
              </div>
            ) : (
              <>
                <ul className="space-y-4" aria-label={t("Guestbook messages")}>
                  <AnimatePresence initial={false} mode="popLayout">
                    {pagedEntries.map((entry) => (
                      <motion.li
                        key={entry.id}
                        layout
                        initial={{ opacity: 0, y: -20, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className={cn(
                          "group/entry rounded-2xl border bg-card/60 p-5 transition-colors duration-300",
                          isAdmin
                            ? "border-primary/30 hover:border-foreground/25"
                            : "border-border/70 hover:border-primary/30"
                        )}
                      >
                        <header className="flex items-center gap-3">
                          <span
                            aria-hidden
                            className={cn(
                              "grid size-9 shrink-0 place-items-center rounded-full text-xs font-bold text-white ring-2 ring-background/60",
                              avatarGradientFor(entry.name)
                            )}
                          >
                            {initialsOf(entry.name)}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-foreground">
                              {entry.name}
                            </p>
                            <time
                              dateTime={entry.createdAt}
                              className="font-mono text-[11px] text-muted-foreground"
                            >
                              {timeAgo(entry.createdAt)}
                            </time>
                          </div>
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => setPendingDelete(entry)}
                              aria-label={`${t("Delete message from")} ${entry.name}`}
                              className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition-colors hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                            >
                              <Trash2 aria-hidden className="size-4" />
                            </button>
                          )}
                        </header>
                        <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/90">
                          {entry.message}
                        </p>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>

                {/* Pagination */}
                {totalPages > 1 && (
                  <nav
                    aria-label={t("Guestbook pages")}
                    className="mt-6 flex flex-wrap items-center justify-between gap-3"
                  >
                    <p aria-live="polite" className="font-mono text-xs text-muted-foreground">
                      {t("Showing")} {rangeStart}–{rangeEnd} {t("of")} {messageCount}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        aria-label={t("Previous page")}
                        className="size-8"
                      >
                        <ChevronLeft className="size-4" aria-hidden />
                      </Button>
                      {pageList(page, totalPages).map((item, index) =>
                        item === "…" ? (
                          <span
                            key={`ellipsis-${index}`}
                            aria-hidden
                            className="px-1 font-mono text-xs text-muted-foreground"
                          >
                            …
                          </span>
                        ) : (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setPage(item)}
                            aria-label={`${t("Go to page")} ${item}`}
                            aria-current={item === page ? "page" : undefined}
                            className={cn(
                              "grid size-8 place-items-center rounded-md border font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                              item === page
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border/70 text-muted-foreground hover:border-foreground/25 hover:text-foreground"
                            )}
                          >
                            {item}
                          </button>
                        )
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        aria-label={t("Next page")}
                        className="size-8"
                      >
                        <ChevronRight className="size-4" aria-hidden />
                      </Button>
                    </div>
                  </nav>
                )}
              </>
            )}
          </div>
        </FadeIn>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("Delete this message?")}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  {t("This will permanently remove the message from")}{" "}
                  <span className="font-semibold text-foreground">{pendingDelete?.name}</span>:
                </p>
                <p className="rounded-lg border border-border/70 bg-secondary/50 p-3 font-mono text-xs text-muted-foreground">
                  “{pendingDelete?.message}”
                </p>
                <p>{t("This action cannot be undone.")}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{t("Cancel")}</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={(event) => {
                event.preventDefault();
                void handleConfirmDelete();
              }}
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
    </div>
  );
}
