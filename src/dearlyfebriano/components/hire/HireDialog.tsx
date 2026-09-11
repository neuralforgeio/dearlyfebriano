"use client";

import {
  BriefcaseBusiness,
  Check,
  ChevronLeft,
  ChevronRight,
  Code2,
  ExternalLink,
  Handshake,
  Mail,
  MessageCircle,
  Sparkles,
  Users,
  X,
} from "lucide-react";

import { useMemo, useState, type JSX } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { profile } from "@/dearlyfebriano/data/profile";

import { useLanguage } from "@/dearlyfebriano/i18n/language-context";

/* ============================================================
 * Types
 * ============================================================ */

type InquiryType = "freelance" | "job" | "collaboration" | "consultation";

interface InquiryOption {
  id: InquiryType;
  title: string;
  description: string;
  icon: JSX.Element;
}

/* ============================================================
 * Constants
 * ============================================================ */

const PROJECT_TYPES = [
  "Web Application",
  "Mobile Application",
  "Desktop Application",
  "REST API & Backend",
  "E-Commerce",
  "Dashboard & Admin Panel",
  "Authentication & Authorization",
  "Automation & Bot",
  "Deployment & Hosting",
] as const;

const TIMELINES = [
  "As soon as possible",
  "1–2 weeks",
  "2–4 weeks",
  "1–2 months",
  "2–3 months",
  "Flexible",
] as const;

const FEATURE_OPTIONS = [
  "Authentication",
  "Dashboard",
  "Payment",
  "REST API",
  "Admin Panel",
  "Database",
  "Search",
  "Notification",
  "Automation",
  "Deployment",
] as const;

/* ============================================================
 * Props
 * ============================================================ */

interface HireDialogProps {
  open: boolean;
  onClose: () => void;
}

/* ============================================================
 * Component
 * ============================================================ */

export default function HireDialog({
  open,
  onClose,
}: HireDialogProps): JSX.Element | null {
  const { t } = useLanguage();

  /* ==========================================================
   * State
   * ========================================================== */

  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [inquiryType, setInquiryType] = useState<InquiryType | null>(null);

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [projectType, setProjectType] = useState(PROJECT_TYPES[0]);

  const [timeline, setTimeline] = useState(TIMELINES[0]);

  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const [description, setDescription] = useState("");

  const [isSendingEmail, setIsSendingEmail] = useState(false);

  /* ==========================================================
   * Inquiry options
   * ========================================================== */

  const inquiryOptions: InquiryOption[] = [
    {
      id: "freelance",
      title: "Freelance Project",
      description:
        "Build a website, application, API, dashboard, automation, or other custom software.",
      icon: <Code2 className="size-5" aria-hidden />,
    },

    {
      id: "job",
      title: "Software Engineering Job",
      description:
        "Discuss a full-time, part-time, contract, or remote engineering opportunity.",
      icon: <BriefcaseBusiness className="size-5" aria-hidden />,
    },

    {
      id: "collaboration",
      title: "Collaboration",
      description:
        "Work together on an open-source project, product, startup, or technical initiative.",
      icon: <Handshake className="size-5" aria-hidden />,
    },

    {
      id: "consultation",
      title: "Consultation",
      description:
        "Discuss architecture, technology choices, project planning, or technical direction.",
      icon: <Users className="size-5" aria-hidden />,
    },
  ];

  /* ==========================================================
   * Toggle feature
   * ========================================================== */

  const toggleFeature = (feature: string): void => {
    setSelectedFeatures((current) =>
      current.includes(feature)
        ? current.filter((item) => item !== feature)
        : [...current, feature],
    );
  };

  /* ==========================================================
   * Reset
   * ========================================================== */

  const reset = (): void => {
    setStep(1);

    setInquiryType(null);

    setName("");

    setEmail("");

    setProjectType(PROJECT_TYPES[0]);

    setTimeline(TIMELINES[0]);

    setSelectedFeatures([]);

    setDescription("");

    setIsSendingEmail(false);
  };

  /* ==========================================================
   * Close
   * ========================================================== */

  const handleClose = (): void => {
    reset();
    onClose();
  };

  /* ==========================================================
   * Validation
   * ========================================================== */

  const validateContact = (): boolean => {
    const trimmedName = name.trim();

    const trimmedEmail = email.trim();

    if (!trimmedName) {
      toast.error(t("Please enter your name."));

      return false;
    }

    if (!trimmedEmail) {
      toast.error(t("Please enter your email."));

      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast.error(t("Please enter a valid email address."));

      return false;
    }

    return true;
  };

  /* ==========================================================
   * WhatsApp message
   * ========================================================== */

  const whatsappUrl = useMemo(() => {
    if (!inquiryType) {
      return `https://wa.me/${profile.whatsappNumber}`;
    }

    const inquiryLabel =
      inquiryOptions.find((option) => option.id === inquiryType)?.title ??
      "Inquiry";

    let message =
      `🚀 *DEAR ENGINEER — PROJECT INQUIRY*\n\n` + `━━━━━━━━━━━━━━━━━━━━\n\n`;

    /* Client */

    message +=
      `👤 *CLIENT*\n` +
      `Name: ${name.trim() || "Not provided"}\n` +
      `Email: ${email.trim() || "Not provided"}\n\n`;

    /* Inquiry */

    message += `🎯 *INQUIRY TYPE*\n` + `${inquiryLabel}\n`;

    /* Freelance */

    if (inquiryType === "freelance") {
      message += `\n💻 *PROJECT*\n` + `${projectType}\n\n`;

      message += `⏱️ *TIMELINE*\n` + `${timeline}\n\n`;

      message += `🧩 *FEATURES*\n`;

      if (selectedFeatures.length > 0) {
        message += selectedFeatures.map((feature) => `• ${feature}`).join("\n");

        message += "\n";
      } else {
        message += `• To be discussed\n`;
      }
    }

    /* Details */

    message +=
      `\n📝 *PROJECT DETAILS*\n` +
      `${description.trim() || "No additional details provided."}\n\n`;

    message +=
      `━━━━━━━━━━━━━━━━━━━━\n\n` +
      `✨ Sent from Dearly Febriano Portfolio\n` +
      `💻 Fullstack Software Engineer`;

    return (
      `https://wa.me/${profile.whatsappNumber}` +
      `?text=${encodeURIComponent(message)}`
    );
  }, [
    inquiryType,
    projectType,
    timeline,
    selectedFeatures,
    description,
    name,
    email,
    inquiryOptions,
  ]);

  /* ==========================================================
   * Submit email inquiry
   * ========================================================== */

  const sendInquiryEmail = async (): Promise<void> => {
    if (!validateContact()) {
      return;
    }

    if (!inquiryType) {
      toast.error(t("Please choose an inquiry type."));

      return;
    }

    setIsSendingEmail(true);

    try {
      const inquiryLabel =
        inquiryOptions.find((option) => option.id === inquiryType)?.title ??
        inquiryType;

      const response = await fetch("/api/project-inquiry", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          inquiryType: inquiryLabel,

          name: name.trim(),

          email: email.trim(),

          projectType: inquiryType === "freelance" ? projectType : undefined,

          timeline: inquiryType === "freelance" ? timeline : undefined,

          features: inquiryType === "freelance" ? selectedFeatures : [],

          description: description.trim(),
        }),
      });

      const result = (await response.json()) as {
        ok?: boolean;
        error?: string;
      };

      if (!response.ok || !result.ok) {
        throw new Error(result.error ?? "Unable to send inquiry.");
      }

      toast.success(t("Your project inquiry has been sent successfully."));

      handleClose();
    } catch (error) {
      console.error("[HireDialog]", error);

      toast.error(
        error instanceof Error
          ? error.message
          : t("Unable to send the email. Please try again or use WhatsApp."),
      );
    } finally {
      setIsSendingEmail(false);
    }
  };

  /* ==========================================================
   * Don't render
   * ========================================================== */

  if (!open) {
    return null;
  }

  /* ==========================================================
   * Modal
   * ========================================================== */

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hire-dialog-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      {/* Backdrop */}

      <div
        aria-hidden
        className="absolute inset-0 bg-black/80"
      />

      {/* Modal */}

      <div className="relative z-10 flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-border/70 bg-background shadow-2xl shadow-black/50">
        {/* ====================================================
         * Header
         * ==================================================== */}

        <div className="border-b border-border/70 bg-card/70 px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <Sparkles className="size-5" aria-hidden />
              </div>

              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-primary">
                  {t("Project inquiry")}
                </p>

                <h2
                  id="hire-dialog-title"
                  className="mt-1 text-lg font-semibold tracking-tight text-foreground sm:text-xl"
                >
                  {t("Let's talk about your project")}
                </h2>

                <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  {t(
                    "A few details help me understand what you need before we continue.",
                  )}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              aria-label={t("Close")}
              className="grid size-9 shrink-0 place-items-center rounded-xl border border-border/70 text-muted-foreground transition-colors hover:border-foreground/25 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>

          {/* Progress */}

          <div className="mt-5 flex gap-2">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary"
              >
                <div
                  className={[
                    "h-full rounded-full bg-primary transition-all duration-300",
                    item <= step ? "w-full" : "w-0",
                  ].join(" ")}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ====================================================
         * Scrollable content
         * ==================================================== */}

        <div className="overflow-y-auto p-5 sm:p-6">
          {/* ==================================================
           * STEP 1
           * ================================================== */}

          {step === 1 && (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                STEP 01
              </p>

              <h3 className="mt-2 text-lg font-semibold text-foreground">
                {t("What are you looking for?")}
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                {t(
                  "Choose the type of conversation that best matches your needs.",
                )}
              </p>

              <div className="mt-5 grid gap-3">
                {inquiryOptions.map((option) => {
                  const active = inquiryType === option.id;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setInquiryType(option.id)}
                      className={[
                        "group flex items-start gap-4 rounded-2xl border p-4 text-left transition-all duration-200",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70",
                        active
                          ? "border-primary/50 bg-primary/5 shadow-lg shadow-primary/5"
                          : "border-border/70 bg-card/30 hover:border-primary/30 hover:bg-card/60",
                      ].join(" ")}
                    >
                      <div
                        className={[
                          "grid size-11 shrink-0 place-items-center rounded-xl transition-colors",
                          active
                            ? "bg-primary/15 text-primary"
                            : "bg-secondary text-muted-foreground group-hover:text-primary",
                        ].join(" ")}
                      >
                        {option.icon}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <h4 className="font-medium text-foreground">
                            {t(option.title)}
                          </h4>

                          {active && (
                            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                              <Check className="size-3.5" aria-hidden />
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                          {t(option.description)}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==================================================
           * STEP 2
           * ================================================== */}

          {step === 2 && (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                STEP 02
              </p>

              <h3 className="mt-2 text-lg font-semibold text-foreground">
                {inquiryType === "freelance"
                  ? t("Tell me about the project")
                  : t("Tell me a little more")}
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                {t("These details help prepare the right conversation.")}
              </p>

              {/* Name / Email */}

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="hire-name"
                    className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
                  >
                    {t("Your name")}
                  </label>

                  <input
                    id="hire-name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder={t("Your full name")}
                    className="mt-2 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="hire-email"
                    className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
                  >
                    {t("Your email")}
                  </label>

                  <input
                    id="hire-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="mt-2 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Freelance fields */}

              {inquiryType === "freelance" && (
                <div className="mt-5 space-y-5">
                  {/* Project type */}

                  <div>
                    <label
                      htmlFor="hire-project-type"
                      className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
                    >
                      {t("Project type")}
                    </label>

                    <select
                      id="hire-project-type"
                      value={projectType}
                      onChange={(event) =>
                        setProjectType(
                          event.target.value as (typeof PROJECT_TYPES)[number],
                        )
                      }
                      className="mt-2 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary/50"
                    >
                      {PROJECT_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {t(type)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Timeline */}

                  <div>
                    <label
                      htmlFor="hire-timeline"
                      className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
                    >
                      {t("Expected timeline")}
                    </label>

                    <select
                      id="hire-timeline"
                      value={timeline}
                      onChange={(event) =>
                        setTimeline(
                          event.target.value as (typeof TIMELINES)[number],
                        )
                      }
                      className="mt-2 h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary/50"
                    >
                      {TIMELINES.map((item) => (
                        <option key={item} value={item}>
                          {t(item)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Features */}

                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {t("Needed features")}
                    </p>

                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {FEATURE_OPTIONS.map((feature) => {
                        const checked = selectedFeatures.includes(feature);

                        return (
                          <button
                            key={feature}
                            type="button"
                            onClick={() => toggleFeature(feature)}
                            className={[
                              "flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors",
                              checked
                                ? "border-primary/40 bg-primary/5 text-foreground"
                                : "border-border/70 bg-card/30 text-muted-foreground hover:border-primary/30 hover:text-foreground",
                            ].join(" ")}
                          >
                            <span
                              className={[
                                "grid size-4 shrink-0 place-items-center rounded border",
                                checked
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border",
                              ].join(" ")}
                            >
                              {checked && (
                                <Check className="size-3" aria-hidden />
                              )}
                            </span>

                            {t(feature)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}

              <div className="mt-5">
                <label
                  htmlFor="hire-description"
                  className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
                >
                  {t("Description")}
                </label>

                <textarea
                  id="hire-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={6}
                  maxLength={2000}
                  placeholder={t(
                    "Tell me about your idea, requirements, current situation, or what you would like to discuss...",
                  )}
                  className="mt-2 w-full resize-none rounded-xl border border-border/70 bg-background px-3 py-3 text-sm leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/50"
                />

                <div className="mt-1 text-right font-mono text-[10px] text-muted-foreground">
                  {description.length} / 2000
                </div>
              </div>
            </div>
          )}

          {/* ==================================================
           * STEP 3
           * ================================================== */}

          {step === 3 && (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                STEP 03
              </p>

              <h3 className="mt-2 text-lg font-semibold text-foreground">
                {t("Ready to continue?")}
              </h3>

              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {t(
                  "Choose how you would like to continue. Your information will be prepared automatically.",
                )}
              </p>

              {/* Summary */}

              <div className="mt-5 rounded-2xl border border-border/70 bg-card/40 p-4">
                <p className="font-mono text-[10px] uppercase tracking-widest text-primary">
                  {t("Inquiry summary")}
                </p>

                <div className="mt-4 space-y-3">
                  <SummaryRow label={t("Name")} value={name.trim() || "—"} />

                  <SummaryRow label={t("Email")} value={email.trim() || "—"} />

                  <SummaryRow
                    label={t("Type")}
                    value={
                      inquiryOptions.find((option) => option.id === inquiryType)
                        ?.title ?? "—"
                    }
                  />

                  {inquiryType === "freelance" && (
                    <>
                      <SummaryRow label={t("Project")} value={t(projectType)} />

                      <SummaryRow label={t("Timeline")} value={t(timeline)} />

                      <SummaryRow
                        label={t("Features")}
                        value={
                          selectedFeatures.length > 0
                            ? selectedFeatures.join(", ")
                            : t("To be discussed")
                        }
                      />
                    </>
                  )}

                  <SummaryRow
                    label={t("Description")}
                    value={description.trim() || t("Not provided")}
                  />
                </div>
              </div>

              {/* WhatsApp info */}

              <div className="mt-5 rounded-2xl border border-[#25D366]/20 bg-[#25D366]/5 p-5">
                <div className="flex items-start gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#25D366]/10 text-[#25D366]">
                    <MessageCircle className="size-5" aria-hidden />
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground">
                      {t("Continue on WhatsApp")}
                    </h4>

                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {t(
                        "Your answers will be formatted into a professional project inquiry message.",
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Email info */}

              <div className="mt-3 rounded-2xl border border-border/70 bg-card/40 p-5">
                <div className="flex items-start gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Mail className="size-5" aria-hidden />
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground">
                      {t("Send as professional email")}
                    </h4>

                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {t(
                        "Your inquiry will be delivered as a formatted HTML email.",
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ====================================================
         * Footer
         * ==================================================== */}

        <div className="border-t border-border/70 bg-card/40 px-5 py-4 sm:px-6">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Back */}

            <button
              type="button"
              disabled={isSendingEmail}
              onClick={() => {
                if (step === 1) {
                  handleClose();
                  return;
                }

                setStep((current) => (current - 1) as 1 | 2 | 3);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border/70 px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="size-4" aria-hidden />

              {step === 1 ? t("Cancel") : t("Back")}
            </button>

            <div className="flex flex-col gap-2 sm:flex-row">
              {/* Step 1 */}

              {step === 1 && (
                <Button
                  type="button"
                  disabled={!inquiryType}
                  onClick={() => setStep(2)}
                  className="bg-primary text-white hover:opacity-90"
                >
                  {t("Continue")}

                  <ChevronRight className="size-4" aria-hidden />
                </Button>
              )}

              {/* Step 2 */}

              {step === 2 && (
                <Button
                  type="button"
                  onClick={() => {
                    if (!validateContact()) {
                      return;
                    }

                    setStep(3);
                  }}
                  className="bg-primary text-white hover:opacity-90"
                >
                  {t("Review inquiry")}

                  <ChevronRight className="size-4" aria-hidden />
                </Button>
              )}

              {/* Step 3 */}

              {step === 3 && (
                <>
                  <Button
                    asChild
                    disabled={isSendingEmail}
                    className="bg-[#25D366] text-white hover:bg-[#20b458]"
                  >
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="size-4" aria-hidden />

                      {t("Continue to WhatsApp")}

                      <ExternalLink className="size-3.5" aria-hidden />
                    </a>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSendingEmail}
                    onClick={sendInquiryEmail}
                  >
                    {isSendingEmail ? (
                      <>
                        <span
                          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                          aria-hidden
                        />

                        {t("Sending...")}
                      </>
                    ) : (
                      <>
                        <Mail className="size-4" aria-hidden />

                        {t("Send via Email")}
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
 * Summary Row
 * ============================================================ */

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}): JSX.Element {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border/50 bg-background/30 p-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <span className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </span>

      <span className="whitespace-pre-wrap text-sm leading-relaxed text-foreground sm:max-w-[70%] sm:text-right">
        {value}
      </span>
    </div>
  );
}
