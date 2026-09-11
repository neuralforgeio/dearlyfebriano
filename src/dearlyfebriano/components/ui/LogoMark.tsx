import { profile } from "@/dearlyfebriano/data/profile";
import { cn } from "@/lib/utils";

/* ============================================================
 * LogoMark — monogram "DF" (pengganti teks "dearlyfebriano"
 * di navbar, sesuai permintaan user). Desainnya konsisten
 * dengan favicon (src/app/icon.svg): kotak rounded, tepi
 * gradient indigo→violet, huruf DF gradient di tengah.
 * Dipakai di Navbar (kiri atas) + header MobileMenu.
 * ============================================================ */

interface LogoMarkProps {
  className?: string;
  /** Label aksesibilitas (dibacakan screen reader). */
  label?: string;
}

export function LogoMark({ className, label = "Dearly Febriano" }: LogoMarkProps) {
  return (
    <span
      role="img"
      aria-label={label}
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-md border border-border bg-card",
        className
      )}
    >
      <span className="font-sans text-[13px] font-semibold leading-none tracking-tight text-foreground">
        {profile.initials}
      </span>
    </span>
  );
}
