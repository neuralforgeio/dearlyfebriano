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
        "grid size-9 shrink-0 place-items-center rounded-[11px] bg-gradient-accent p-[1.5px] shadow-sm",
        className
      )}
    >
      <span className="grid h-full w-full place-items-center rounded-[9.5px] bg-card">
        <span className="font-mono text-[13px] font-bold leading-none tracking-tight text-gradient">
          {profile.initials}
        </span>
      </span>
    </span>
  );
}
