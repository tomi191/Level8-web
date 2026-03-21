import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { CookieConsent } from "@/components/shared/cookie-consent";
import { AnalyticsScripts } from "@/components/shared/analytics-scripts";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin", "latin-ext"],
  weight: ["700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://level8.bg"),
  title: "ЛЕВЕЛ 8 | Дигитални решения за вашия бизнес",
  description:
    "Онлайн магазини, AI чатботове, автоматизация и програми за лоялност. Вашият технологичен партньор в България.",
  keywords: [
    "онлайн магазин",
    "AI чатбот",
    "автоматизация",
    "програма за лоялност",
    "дигитална агенция",
    "България",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ЛЕВЕЛ 8 | Дигитални решения за вашия бизнес",
    description:
      "Онлайн магазини, AI чатботове, автоматизация и програми за лоялност.",
    type: "website",
    locale: "bg_BG",
    url: "/",
    siteName: "ЛЕВЕЛ 8",
  },
  twitter: {
    card: "summary_large_image",
    title: "ЛЕВЕЛ 8 | Дигитални решения за вашия бизнес",
    description:
      "Онлайн магазини, AI чатботове, автоматизация и програми за лоялност.",
  },
  other: {
    "facebook-domain-verification": "ldzod08h04npwh60ty213ub9u00n7s",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "ЛЕВЕЛ 8 ЕООД",
  url: "https://level8.bg",
  logo: "https://level8.bg/icon.svg",
  description:
    "Дигитална агенция, специализирана в онлайн магазини, AI чатботове, автоматизация и програми за лоялност.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Варна",
    addressCountry: "BG",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+359-895-552-550",
    contactType: "customer service",
    availableLanguage: ["Bulgarian", "English"],
  },
  areaServed: [
    { "@type": "Country", name: "Bulgaria" },
    { "@type": "Country", name: "European Union" },
  ],
  priceRange: "$$",
  knowsAbout: ["e-commerce", "AI chatbots", "web development", "SEO", "automation"],
  sameAs: [
    "https://www.facebook.com/level8.bg",
    "https://www.instagram.com/level8.bg",
    "https://www.linkedin.com/company/level8bg",
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "ЛЕВЕЛ 8",
  url: "https://level8.bg",
  inLanguage: "bg",
  publisher: { "@type": "Organization", name: "ЛЕВЕЛ 8 ЕООД" },
  potentialAction: {
    "@type": "SearchAction",
    target: "https://level8.bg/blog?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bg" className="dark">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <AnalyticsScripts />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        {children}
        <CookieConsent />
        <Toaster />
      </body>
    </html>
  );
}
