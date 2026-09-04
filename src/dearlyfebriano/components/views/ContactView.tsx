"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { SiWhatsapp } from "react-icons/si";
import { Loader2, Mail, MapPin, Phone, Send, Copy, Check, Contact, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FadeIn from "@/dearlyfebriano/components/animations/FadeIn";
import MagneticButton from "@/dearlyfebriano/components/animations/MagneticButton";
import ContactMessagesSection from "@/dearlyfebriano/components/views/ContactMessagesSection";
import { SocialIcon } from "@/dearlyfebriano/components/ui/SocialIcon";
import { profile } from "@/dearlyfebriano/data/profile";
import { socialLinks } from "@/dearlyfebriano/data/socialLinks";
import { CONTACT_SUBJECTS } from "@/dearlyfebriano/lib/constants";
import { buildWhatsAppUrl, downloadVCard } from "@/dearlyfebriano/lib/helpers";
import { useLanguage } from "@/dearlyfebriano/i18n/language-context";
import { cn } from "@/lib/utils";
import type { JSX } from "react";

/* ============================================================
 * ContactView — RHF + zod contact form with success state,
 * direct contact cards, and a WhatsApp deep-link card.
 * ============================================================ */

const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must be at most 80 characters"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(120, "Email must be at most 120 characters"),
  subject: z.enum(CONTACT_SUBJECTS, { message: "Please select a subject" }),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be at most 2000 characters"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const MESSAGE_MAX = 2000;

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
}

function PageHeader({ eyebrow, title, description }: PageHeaderProps): JSX.Element {
  return (
    <FadeIn y={20} className="flex flex-col gap-4">
      <span className="font-mono text-xs uppercase tracking-[0.25em] text-primary">{eyebrow}</span>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
        {title}
      </h1>
      {description && (
        <p className="max-w-2xl leading-relaxed text-muted-foreground">{description}</p>
      )}
    </FadeIn>
  );
}

interface ContactResponse {
  ok?: boolean;
  id?: string;
  emailSent?: boolean;
  error?: string;
}

function InfoCard({
  icon,
  label,
  value,
  href,
  external,
  copyValue,
}: {
  icon: JSX.Element;
  label: string;
  value: string;
  href?: string;
  external?: boolean;
  /** Jika diisi, tampilkan tombol copy di kanan kartu. */
  copyValue?: string;
}): JSX.Element {
  const content = (
    <>
      <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 truncate text-sm font-medium text-foreground">{value}</p>
      </div>
    </>
  );
  const className = cn(
    "glass flex w-full items-center gap-4 rounded-2xl p-4 transition-colors hover:border-primary/40",
    href && "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    copyValue && "pr-14"
  );
  const anchor = href ? (
    <a
      href={href}
      aria-label={`${label}: ${value}`}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={className}
    >
      {content}
    </a>
  ) : (
    <div className={className}>{content}</div>
  );

  if (!copyValue) return anchor;

  return (
    <div className="relative w-full">
      {anchor}
      <CopyButton text={copyValue} />
    </div>
  );
}

function CopyButton({ text }: { text: string }): JSX.Element {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(t("Copied to clipboard"));
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error(t("Could not copy — clipboard unavailable"));
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`${t("Copy")} ${text} ${t("to clipboard")}`}
      title={`${t("Copy")} ${text}`}
      className="glass absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      {copied ? (
        <Check className="size-3.5 text-emerald-500" aria-hidden />
      ) : (
        <Copy className="size-3.5" aria-hidden />
      )}
    </button>
  );
}

export default function ContactView(): JSX.Element {
  const { t } = useLanguage();
  const reducedMotion = useReducedMotion();
  const [submitResult, setSubmitResult] = useState<{ emailSent: boolean } | null>(null);
  /* Di-bump saat form sukses → ContactMessagesSection reload daftar. */
  const [messagesRefreshKey, setMessagesRefreshKey] = useState(0);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: CONTACT_SUBJECTS[0],
      message: "",
    },
  });

  const messageLength = useWatch({ control, name: "message" })?.length ?? 0;

  const onSubmit = async (values: ContactFormValues): Promise<void> => {
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = (await response.json()) as ContactResponse;
      if (response.ok && json.ok) {
        setSubmitResult({ emailSent: json.emailSent ?? false });
        setMessagesRefreshKey((key) => key + 1);
      } else {
        toast.error(t(json.error || "Failed to send your message. Please try again."));
      }
    } catch {
      toast.error(t("Network error — please check your connection and try again."));
    }
  };

  const resetForm = (): void => {
    reset();
    setSubmitResult(null);
  };

  return (
    <div className="relative mx-auto w-full max-w-6xl px-4 pb-20 pt-28 sm:px-6 sm:pb-28 sm:pt-32">
      <PageHeader
        eyebrow={t("Contact")}
        title={t("Let's work together")}
        description={t("Tell me about your project — I usually reply within 24 hours.")}
      />

      <div className="mt-14 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] sm:mt-16">
        {/* ---------- LEFT: form / success ---------- */}
        <FadeIn x={-24}>
          <AnimatePresence mode="wait" initial={false}>
            {submitResult ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: reducedMotion ? 0 : 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reducedMotion ? 0 : -12 }}
                transition={{ duration: reducedMotion ? 0.15 : 0.35, ease: "easeOut" }}
                className="glass flex h-full min-h-[400px] flex-col items-center justify-center rounded-2xl p-8 text-center sm:p-12"
                aria-live="polite"
              >
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={
                    reducedMotion
                      ? { duration: 0.15 }
                      : { type: "spring", stiffness: 260, damping: 18 }
                  }
                  className="grid size-16 place-items-center rounded-full bg-emerald-500/10 text-emerald-500"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="size-8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <motion.path
                      d="M4.5 12.5l5 5 10-11"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{
                        duration: reducedMotion ? 0.15 : 0.45,
                        delay: reducedMotion ? 0 : 0.2,
                        ease: "easeOut",
                      }}
                    />
                  </svg>
                </motion.div>
                <h2 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
                  {t("Message sent!")}
                </h2>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  {t("Thanks — I'll get back to you within 24 hours.")}
                </p>
                {!submitResult.emailSent && (
                  <p className="mt-3 font-mono text-xs text-muted-foreground">
                    {t("(stored offline mode — email delivery not configured)")}
                  </p>
                )}
                <Button type="button" variant="outline" onClick={resetForm} className="mt-8">
                  {t("Send another message")}
                </Button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                noValidate
                onSubmit={handleSubmit(onSubmit)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-6"
                aria-label={t("Contact form")}
              >
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="contact-name">{t("Name")}</Label>
                    <Input
                      id="contact-name"
                      autoComplete="name"
                      placeholder={t("Your name")}
                      aria-invalid={errors.name ? true : undefined}
                      aria-describedby={errors.name ? "contact-name-error" : undefined}
                      {...register("name")}
                    />
                    {errors.name && (
                      <p id="contact-name-error" className="text-xs text-destructive">
                        {t(errors.name.message ?? "")}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="contact-email">{t("Email")}</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      aria-invalid={errors.email ? true : undefined}
                      aria-describedby={errors.email ? "contact-email-error" : undefined}
                      {...register("email")}
                    />
                    {errors.email && (
                      <p id="contact-email-error" className="text-xs text-destructive">
                        {t(errors.email.message ?? "")}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="contact-subject">{t("Subject")}</Label>
                  <Controller
                    control={control}
                    name="subject"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger
                          id="contact-subject"
                          className="w-full"
                          aria-invalid={errors.subject ? true : undefined}
                          aria-describedby={errors.subject ? "contact-subject-error" : undefined}
                        >
                          <SelectValue placeholder={t("Choose a topic")} />
                        </SelectTrigger>
                        <SelectContent>
                          {CONTACT_SUBJECTS.map((subject) => (
                            <SelectItem key={subject} value={subject}>
                              {t(subject)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.subject && (
                    <p id="contact-subject-error" className="text-xs text-destructive">
                      {t(errors.subject.message ?? "")}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="contact-message">{t("Message")}</Label>
                  <Textarea
                    id="contact-message"
                    rows={6}
                    placeholder={t("Tell me about your project, timeline, and goals…")}
                    aria-invalid={errors.message ? true : undefined}
                    aria-describedby={
                      errors.message ? "contact-message-error" : "contact-message-count"
                    }
                    {...register("message")}
                  />
                  <div className="flex items-center justify-between gap-4">
                    {errors.message ? (
                      <p id="contact-message-error" className="text-xs text-destructive">
                        {t(errors.message.message ?? "")}
                      </p>
                    ) : (
                      <span aria-hidden />
                    )}
                    <p
                      id="contact-message-count"
                      className="ml-auto shrink-0 font-mono text-xs text-muted-foreground"
                    >
                      {messageLength} / {MESSAGE_MAX}
                    </p>
                  </div>
                </div>

                <MagneticButton className="w-full">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-accent text-white shadow-lg shadow-primary/25 hover:opacity-90"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" aria-hidden />
                        {t("Sending…")}
                      </>
                    ) : (
                      <>
                        <Send className="size-4" aria-hidden />
                        {t("Send message")}
                      </>
                    )}
                  </Button>
                </MagneticButton>

                <p className="font-mono text-[11px] text-muted-foreground">
                  {t("Powered by Resend — your message is also stored securely.")}
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </FadeIn>

        {/* ---------- RIGHT: info column ---------- */}
        <FadeIn x={24} delay={0.1} className="flex flex-col gap-4">
          <InfoCard
            icon={<Mail className="size-5" aria-hidden />}
            label={t("Email")}
            value={profile.email}
            href={`mailto:${profile.email}`}
            copyValue={profile.email}
          />
          <InfoCard
            icon={<Phone className="size-5" aria-hidden />}
            label={t("Phone")}
            value={profile.phone}
            href={`tel:${profile.phone.replace(/[^+\d]/g, "")}`}
            copyValue={profile.phone}
          />
          <InfoCard
            icon={<MapPin className="size-5" aria-hidden />}
            label={t("Location")}
            value={`${profile.location} 🇮🇩`}
          />

          {/* Save contact (vCard) */}
          <button
            type="button"
            onClick={() => {
              downloadVCard();
              toast.success(t("Contact card downloaded — check your files"));
            }}
            className="glass group flex w-full items-center gap-4 rounded-2xl p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-gradient-accent group-hover:text-white">
              <Contact className="size-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {t("Save contact")}
              </p>
              <p className="mt-0.5 truncate text-sm font-medium text-foreground">
                {t("Download vCard (.vcf)")}
              </p>
            </div>
            <Download className="ml-auto size-4 shrink-0 text-muted-foreground transition-all group-hover:translate-y-0.5 group-hover:text-primary" aria-hidden />
          </button>

          {/* Availability */}
          <div className="glass rounded-2xl p-4">
            <p className="flex items-center gap-2.5 text-sm font-medium text-foreground">
              <span className="relative flex size-2.5" aria-hidden>
                {!reducedMotion && (
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                )}
                <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
              </span>
              {t(profile.availability)}
            </p>
            <p className="mt-2 pl-5 text-xs text-muted-foreground">
              {t("Typical reply time: under 24h")}
            </p>
          </div>

          {/* WhatsApp */}
          <div className="rounded-2xl border border-[#25D366]/30 bg-[#25D366]/10 p-5">
            <div className="flex items-center gap-3">
              <SiWhatsapp aria-hidden className="size-6 text-[#25D366]" />
              <h2 className="font-semibold text-foreground">{t("Prefer WhatsApp?")}</h2>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t("Chat instantly with a prefilled message — no email thread needed.")}
            </p>
            <Button
              asChild
              className="mt-4 w-full bg-[#25D366] text-white hover:bg-[#20b458]"
            >
              <a
                href={buildWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("Chat on WhatsApp (opens in a new tab)")}
              >
                <SiWhatsapp aria-hidden className="size-4" />
                {t("Chat on WhatsApp")}
              </a>
            </Button>
          </div>

          {/* Socials */}
          <div className="flex flex-wrap items-center gap-3 pt-2" aria-label={t("Social profiles")}>
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${link.label} ${t("profile (opens in a new tab)")}`}
                className="grid size-10 place-items-center rounded-full border border-border/70 text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <SocialIcon icon={link.icon} />
              </a>
            ))}
          </div>
        </FadeIn>
      </div>

      {/* ---------- OWNER TOOLS: recent messages (manage mode) ---------- */}
      <ContactMessagesSection refreshKey={messagesRefreshKey} />
    </div>
  );
}
