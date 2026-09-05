import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter, Fira_Code } from "next/font/google";
import "./globals.css";
import { Providers } from "@/dearlyfebriano/components/layout/Providers";
import { profile } from "@/dearlyfebriano/data/profile";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fira-code",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || profile.siteUrl;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${profile.fullName} — ${profile.roles[0]}`,
    template: `%s | ${profile.fullName}`,
  },
  description: profile.bioShort,
  keywords: [
    profile.fullName,
    "Dearly Febriano Irwansyah",
    "Software Engineer",
    "Full Stack Developer",
    "AI Agent Developer",
    "Problem Solver",
    "Web Developer",
    "React",
    "Next.js",
    "TypeScript",
    "Node.js",
    "OpenForge",
    "Portfolio",
    "Surabaya",
    "Jawa Timur",
    "Indonesia",
  ],
  authors: [{ name: profile.fullName }],
  creator: profile.fullName,
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: `${profile.fullName} — Portfolio`,
    title: `${profile.fullName} — ${profile.roles[0]}`,
    description: profile.bioShort,
    images: [
      {
        url: "/images/og-image.png",
        width: 1344,
        height: 768,
        alt: `${profile.fullName} — Portfolio`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.fullName} — ${profile.roles[0]}`,
    description: profile.bioShort,
    images: ["/images/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.webmanifest",
  /* canonical TIDAK statis di sini — halaman yang sama di-serve di
   * banyak path (/about, /projects/slug, …); canonical "/" akan
   * memberi tahu Google semua path itu duplikat root. PortfolioApp
   * menyuntikkan <link rel="canonical"> self-referencing per path
   * (dan og:url) setelah routing client aktif. */
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${firaCode.variable} bg-background font-sans text-foreground antialiased`}
      >
        {/* SCROLL RESTORATION — harus berjalan SEBELUM paint/hydration
            (beforeInteractive): (1) matikan restorasi scroll NATIVE browser
            saat reload (kalau tidak, browser menang duluan dan mengalahkan
            sistem sessionStorage kita); (2) pulihkan posisi pra-paint TANPA
            flash. Kebijakan sesuai permintaan owner, berbasis TIPE navigasi
            (Performance API): "reload" (F5) → kembali ke posisi terakhir;
            "navigate" (user masuk/typed URL/link dari luar web) → MULAI DARI
            ATAS (entry dianggap fresh — key lama path itu dihapus);
            "back_forward" → kembali ke posisi (kontinuitas natural).
            Key HARUS sinkron dengan scrollKey() PortfolioApp:
            `dearlyfebriano:scroll:<path>`. */}
        <Script
          id="df-scroll-restoration"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html:
              "try{if('scrollRestoration' in history)history.scrollRestoration='manual';var t=(performance.getEntriesByType('navigation')[0]||{}).type;var k='dearlyfebriano:scroll:'+location.pathname;if(t==='navigate'){sessionStorage.removeItem(k);}else{var v=parseInt(sessionStorage.getItem(k),10);if(v>0)window.scrollTo(0,v);}}catch(e){}",
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
