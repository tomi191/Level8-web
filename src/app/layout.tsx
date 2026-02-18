import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import Script from "next/script";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const GA_MEASUREMENT_ID = "G-XH5YXLME97";
const FB_PIXEL_ID = "1908508549753105";

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
    url: "/",
    siteName: "\u041B\u0415\u0412\u0415\u041B 8",
  },
  twitter: {
    card: "summary_large_image",
    title: "\u041B\u0415\u0412\u0415\u041B 8 | \u0414\u0438\u0433\u0438\u0442\u0430\u043B\u043D\u0438 \u0440\u0435\u0448\u0435\u043D\u0438\u044F \u0437\u0430 \u0432\u0430\u0448\u0438\u044F \u0431\u0438\u0437\u043D\u0435\u0441",
    description:
      "\u041E\u043D\u043B\u0430\u0439\u043D \u043C\u0430\u0433\u0430\u0437\u0438\u043D\u0438, AI \u0447\u0430\u0442\u0431\u043E\u0442\u043E\u0432\u0435, \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0437\u0430\u0446\u0438\u044F \u0438 \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u0438 \u0437\u0430 \u043B\u043E\u044F\u043B\u043D\u043E\u0441\u0442.",
  },
  other: {
    "facebook-domain-verification": "ldzod08h04npwh60ty213ub9u00n7s",
  },
};

const organizationJsonLd = {
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
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${FB_PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
