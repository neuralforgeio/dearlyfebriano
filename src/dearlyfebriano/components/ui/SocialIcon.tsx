"use client";

import type { ComponentType } from "react";
import { SiGithub, SiInstagram, SiWhatsapp } from "react-icons/si";
import { FaLinkedin } from "react-icons/fa6";
import { Mail } from "lucide-react";
import type { SocialIconKey } from "@/dearlyfebriano/types";
import { cn } from "@/lib/utils";

/* ============================================================
 * SocialIcon — brand icons untuk sosial media.
 * NOTE: LinkedIn icon diambil dari react-icons/fa6 karena
 * Simple Icons sudah menghapus brand LinkedIn.
 * ============================================================ */

type IconComponent = ComponentType<{ className?: string }>;

const SOCIAL_ICON_MAP: Record<SocialIconKey, IconComponent> = {
  github: SiGithub,
  linkedin: FaLinkedin,
  instagram: SiInstagram,
  whatsapp: SiWhatsapp,
  email: Mail,
};

export interface SocialIconProps {
  icon: SocialIconKey;
  className?: string;
}

export function SocialIcon({ icon, className }: SocialIconProps) {
  const Icon = SOCIAL_ICON_MAP[icon] ?? Mail;
  return <Icon aria-hidden className={cn("size-4", className)} />;
}
