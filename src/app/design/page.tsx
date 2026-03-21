import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CircuitDivider } from "@/components/animations/circuit-divider";
import { FadeIn } from "@/components/animations/fade-in";
import { CtaButton } from "@/components/shared/cta-button";
import { DesignFilterTabs } from "@/components/design/design-filter-tabs";
import { DESIGN_SECTION, DESIGN_TRENDS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Модерен Уеб Дизайн 2026 | Тенденции и Стилове | LEVEL 8",
  description:
    "Интерактивна галерия с 8 водещи тенденции в уеб дизайна за 2026: Bento Grid, Glassmorphism, Dark Premium, Neobrutalism и още. Живи демонстрации без скрийншотове.",
  alternates: {
    canonical: "/design",
  },
  openGraph: {
    title: "Модерен Уеб Дизайн 2026 | LEVEL 8",
    description:
      "Интерактивна галерия с 8 водещи тенденции в уеб дизайна за 2026.",
    url: "https://level8.bg/design",
    type: "website",
    locale: "bg_BG",
    siteName: "ЛЕВЕЛ 8",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Модерен Уеб Дизайн 2026 | LEVEL 8",
    description:
      "Интерактивна галерия с 8 водещи тенденции в уеб дизайна.",
    images: ["/opengraph-image"],
  },
};

export default function DesignPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Модерен Уеб Дизайн 2026",
    description:
      "Интерактивна галерия с водещи тенденции в уеб дизайна за 2026.",
    url: "https://level8.bg/design",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: DESIGN_TRENDS.length,
      itemListElement: DESIGN_TRENDS.map((trend, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: trend.name,
        description: trend.description,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar />

      <main className="min-h-screen pt-24">
        {/* Hero */}
        <section className="container mx-auto px-4 py-16 text-center">
          <FadeIn>
            <div className="inline-block px-3 py-1 rounded-full border border-neon/20 bg-neon/5 text-neon text-xs font-mono tracking-wider mb-6">
              {DESIGN_SECTION.tag}
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
              {DESIGN_SECTION.title}{" "}
              <span className="text-neon">{DESIGN_SECTION.titleAccent}</span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              {DESIGN_SECTION.subtitle}
            </p>
          </FadeIn>
        </section>

        <CircuitDivider />

        {/* Trends Grid */}
        <section className="container mx-auto px-4 py-16">
          <DesignFilterTabs trends={DESIGN_TRENDS} />
        </section>

        <CircuitDivider />

        {/* Bottom CTA */}
        <section className="container mx-auto px-4 py-20 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {"Искате някой от тези "}
              <span className="text-neon">стилове</span>?
            </h2>
          </FadeIn>

          <FadeIn delay={0.1}>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
              Свържете се с нас за безплатна консултация. Ще подберем най-подходящия дизайн за вашия бизнес.
            </p>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <CtaButton href="/#contact" variant="neon">
                Безплатна консултация
              </CtaButton>
              <CtaButton href="/#portfolio" variant="outline">
                Вижте реални проекти
              </CtaButton>
            </div>
          </FadeIn>
        </section>
      </main>

      <Footer />
    </>
  );
}
