import PortfolioApp from "@/dearlyfebriano/PortfolioApp";
import AutoTranslate from "@/dearlyfebriano/components/i18n/AutoTranslate";
import { profile } from "@/dearlyfebriano/data/profile";
import { socialLinks } from "@/dearlyfebriano/data/socialLinks";
import { LanguageProvider } from "@/dearlyfebriano/i18n/language-context";

/* ============================================================
 * Halaman utama (satu-satunya route user-visible: "/").
 * Portfolio di-render sebagai SPA oleh <PortfolioApp />.
 * JSON-LD Person schema untuk SEO.
 * ============================================================ */

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.fullName,
    jobTitle: profile.roles[0],
    description: profile.bioShort,
    url: profile.siteUrl,
    email: `mailto:${profile.email}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Surabaya",
      addressRegion: "Jawa Timur",
      addressCountry: "ID",
    },
    sameAs: socialLinks.map((link) => link.href),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LanguageProvider>
        <AutoTranslate />
        <PortfolioApp />
      </LanguageProvider>
    </>
  );
}
