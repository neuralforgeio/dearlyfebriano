"use client";

import { useEffect, type JSX } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  Home,
  User,
  FolderGit2,
  Award,
  Briefcase,
  MessagesSquare,
  Mail,
  Download,
  Copy,
  Github,
  Sun,
  Moon,
  ExternalLink,
  NotebookPen,
  FileText,
  Contact,
  Keyboard,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { useUIStore } from "@/dearlyfebriano/store/ui-store";
import { NAV_ITEMS } from "@/dearlyfebriano/lib/constants";
import { profile } from "@/dearlyfebriano/data/profile";
import { socialLinks } from "@/dearlyfebriano/data/socialLinks";
import { projects } from "@/dearlyfebriano/data/projects";
import { articles } from "@/dearlyfebriano/data/articles";
import { buildWhatsAppUrl, downloadVCard } from "@/dearlyfebriano/lib/helpers";
import { useLanguage } from "@/dearlyfebriano/i18n/language-context";

/* ============================================================
 * CommandPalette — navigasi cepat ala developer tools.
 * Buka: Ctrl+K / ⌘+K atau tombol hint di Navbar. Escape menutup.
 * Action "Keyboard shortcuts" membuka ShortcutsDialog (?).
 * ============================================================ */

const VIEW_ICONS: Record<string, LucideIcon> = {
  home: Home,
  about: User,
  projects: FolderGit2,
  certificates: Award,
  experience: Briefcase,
  notes: NotebookPen,
  guestbook: MessagesSquare,
  contact: Mail,
};

export default function CommandPalette(): JSX.Element {
  const isOpen = useUIStore((s) => s.isCommandOpen);
  const setOpen = useUIStore((s) => s.setCommandOpen);
  const navigate = useUIStore((s) => s.navigate);
  const { resolvedTheme, setTheme } = useTheme();
  const { t } = useLanguage();

  /* Global shortcut: Ctrl/Cmd + K toggle */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(!useUIStore.getState().isCommandOpen);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setOpen]);

  /* Body scroll lock saat terbuka */
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen, setOpen]);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      toast.success(`${t("Email copied")} — ${profile.email}`);
    } catch {
      toast.error(t("Could not copy the email address."));
    }
    setOpen(false);
  };

  const toggleTheme = () => {
    const next = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(next);
    toast.success(next === "dark" ? t("Switched to dark mode") : t("Switched to light mode"));
    setOpen(false);
  };

  const isMac =
    typeof navigator !== "undefined" && /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent);
  const modKey = isMac ? "⌘ K" : "Ctrl K";
  const githubLink = socialLinks.find((s) => s.icon === "github");

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[70] flex items-start justify-center bg-background/95 p-4 pt-[12vh]"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={t("Command palette")}
        >
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="card-surface w-full max-w-lg overflow-hidden rounded-xl border border-border shadow-2xl "
            onClick={(event) => event.stopPropagation()}
          >
            <Command loop>
              <CommandInput
                autoFocus
                placeholder={t("Type a command or search…")}
                className="border-none font-mono text-sm"
              />
              <CommandList className="max-h-[55vh] p-2">
                <CommandEmpty className="py-8 text-center text-sm text-muted-foreground">
                  {t("No results found.")}
                </CommandEmpty>

                <CommandGroup heading={t("Navigation")} className="[&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.08em]">
                  {NAV_ITEMS.map((item) => {
                    const Icon = VIEW_ICONS[item.view] ?? Home;
                    return (
                      <CommandItem
                        key={item.view}
                        value={`navigation ${item.label} ${item.view}`}
                        onSelect={() => navigate(item.view)}
                        className="gap-3 text-sm"
                      >
                        <Icon className="size-4 text-primary" aria-hidden />
                        {t(item.label)}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading={t("Projects")} className="[&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.08em]">
                  {projects.map((project) => (
                    <CommandItem
                      key={project.slug}
                      value={`project ${project.title} ${project.slug}`}
                      onSelect={() => navigate("project-detail", project.slug)}
                      className="gap-3 text-sm"
                    >
                      <span className="font-mono text-[10px] text-muted-foreground" aria-hidden>
                        {String(projects.indexOf(project) + 1).padStart(2, "0")}
                      </span>
                      {project.title}
                      <CommandShortcut className="font-mono text-[10px] capitalize">
                        {project.category}
                      </CommandShortcut>
                    </CommandItem>
                  ))}
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading={t("Tech Notes")} className="[&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.08em]">
                  {articles.map((article) => (
                    <CommandItem
                      key={article.slug}
                      value={`article ${article.title} ${article.tags.join(" ")}`}
                      onSelect={() => navigate("note-detail", article.slug)}
                      className="gap-3 text-sm"
                    >
                      <FileText className="size-4 shrink-0 text-primary" aria-hidden />
                      <span className="truncate">{article.title}</span>
                      <CommandShortcut className="font-mono text-[10px]">
                        {article.readingMinutes} min
                      </CommandShortcut>
                    </CommandItem>
                  ))}
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading={t("Actions")} className="[&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.08em]">
                  <CommandItem value="action copy email" onSelect={copyEmail} className="gap-3 text-sm">
                    <Copy className="size-4 text-primary" aria-hidden />
                    {t("Copy email address")}
                    <CommandShortcut className="font-mono text-[10px]">{profile.email}</CommandShortcut>
                  </CommandItem>
                  <CommandItem value="action download cv resume" onSelect={() => {
                    window.open(profile.resumeUrl, "_blank");
                    setOpen(false);
                  }} className="gap-3 text-sm">
                    <Download className="size-4 text-primary" aria-hidden />
                    {t("Download CV")}
                  </CommandItem>
                  <CommandItem
                    value="action save contact vcard vcf"
                    onSelect={() => {
                      downloadVCard();
                      toast.success(t("Contact card downloaded"));
                      setOpen(false);
                    }}
                    className="gap-3 text-sm"
                  >
                    <Contact className="size-4 text-primary" aria-hidden />
                    {t("Save contact (vCard)")}
                    <CommandShortcut className="font-mono text-[10px]">.vcf</CommandShortcut>
                  </CommandItem>
                  <CommandItem value="action toggle theme dark light" onSelect={toggleTheme} className="gap-3 text-sm">
                    {resolvedTheme === "dark" ? (
                      <Sun className="size-4 text-primary" aria-hidden />
                    ) : (
                      <Moon className="size-4 text-primary" aria-hidden />
                    )}
                    {resolvedTheme === "dark" ? t("Switch to light mode") : t("Switch to dark mode")}
                  </CommandItem>
                  <CommandItem
                    value="action keyboard shortcuts cheatsheet help keys"
                    onSelect={() => {
                      setOpen(false);
                      useUIStore.getState().setShortcutsOpen(true);
                    }}
                    className="gap-3 text-sm"
                  >
                    <Keyboard className="size-4 text-primary" aria-hidden />
                    {t("Keyboard shortcuts")}
                    <CommandShortcut className="font-mono text-[10px]">?</CommandShortcut>
                  </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading={t("External")} className="[&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.08em]">
                  <CommandItem
                    value="external github"
                    onSelect={() => {
                      window.open(githubLink?.href ?? "https://github.com/neuralforgeio", "_blank", "noopener,noreferrer");
                      setOpen(false);
                    }}
                    className="gap-3 text-sm"
                  >
                    <Github className="size-4 text-primary" aria-hidden />
                    {t("Open GitHub profile")}
                    <CommandShortcut className="font-mono text-[10px]">
                      <ExternalLink className="size-3" aria-hidden />
                    </CommandShortcut>
                  </CommandItem>
                  <CommandItem
                    value="external whatsapp chat"
                    onSelect={() => {
                      window.open(buildWhatsAppUrl(), "_blank", "noopener,noreferrer");
                      setOpen(false);
                    }}
                    className="gap-3 text-sm"
                  >
                    <SiWhatsapp className="size-4 text-[#25D366]" aria-hidden />
                    {t("Chat on WhatsApp")}
                    <CommandShortcut className="font-mono text-[10px]">
                      <ExternalLink className="size-3" aria-hidden />
                    </CommandShortcut>
                  </CommandItem>
                </CommandGroup>
              </CommandList>

              <div className="flex items-center justify-between border-t border-border px-4 py-2.5 font-mono text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5">↑↓</kbd>
                  {t("navigate")}
                  <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5">↵</kbd>
                  {t("select")}
                  <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5">esc</kbd>
                  {t("close")}
                </span>
                <span>{modKey} {t("to toggle")}</span>
              </div>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
