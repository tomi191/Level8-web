import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import Script from "next/script";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const GA_MEASUREMENT_ID = "G-XH5YXLME97";

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
  },
  twitter: {
    card: "summary_large_image",
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ЛЕВЕЛ 8 ЕООД",
    url: "https://level8.bg",
    description:
      "Дигитална агенция, специализирана в онлайн магазини, AI чатботове, автоматизация и програми за лоялност.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "София",
      addressCountry: "BG",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+359-895-552-550",
      contactType: "customer service",
      availableLanguage: "Bulgarian",
    },
    sameAs: [
      "https://www.facebook.com/level8.bg",
      "https://www.instagram.com/level8.bg",
      "https://www.linkedin.com/company/level8bg",
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Колко време отнема изграждането на проект?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Лендинг страница — 1-2 седмици. Онлайн магазин — 3-5 седмици. AI чатбот — 1-2 седмици за настройка и обучение.",
        },
      },
      {
        "@type": "Question",
        name: "Какво се случва, ако не съм доволен от резултата?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Работим с неограничени ревизии до пълното ви удовлетворение. Вашият проект не се пуска live, докато не сте 100% доволни.",
        },
      },
      {
        "@type": "Question",
        name: "Кой притежава кода и дизайна след проекта?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Вие. След финално плащане, целият код, дизайн и съдържание са ваша собственост.",
        },
      },
      {
        "@type": "Question",
        name: "Мога ли да надградя пакета си по-късно?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Разбира се. Всички наши решения са модулни — можете да започнете с лендинг и после да добавите онлайн магазин, AI чатбот или програма за лоялност.",
        },
      },
    ],
  },
];

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
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
