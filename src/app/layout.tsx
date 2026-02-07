import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
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
  openGraph: {
    title: "ЛЕВЕЛ 8 | Дигитални решения за вашия бизнес",
    description:
      "Онлайн магазини, AI чатботове, автоматизация и програми за лоялност.",
    type: "website",
    locale: "bg_BG",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ЛЕВЕЛ 8 ЕООД",
  url: "https://level8.bg",
  description:
    "Дигитална агенция, специализирана в онлайн магазини, AI чатботове, автоматизация и програми за лоялност.",
  address: {
    "@type": "PostalAddress",
    addressCountry: "BG",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+359-88-888-8888",
    contactType: "customer service",
    availableLanguage: "Bulgarian",
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
        className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
