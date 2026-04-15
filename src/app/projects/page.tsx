import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink, TrendingUp } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CircuitDivider } from "@/components/animations/circuit-divider";
import { FadeIn } from "@/components/animations/fade-in";
import { SpotlightCard } from "@/components/animations/spotlight-card";
import { CtaButton } from "@/components/shared/cta-button";
import { CASE_STUDIES } from "@/lib/case-studies";

const TITLE = "Проекти \u2014 Case Studies | LEVEL 8";
const DESCRIPTION =
  "Реални проекти, реални резултати. " +
  CASE_STUDIES.length +
  " case studies от клиенти на Level 8 \u2014 онлайн магазини, уеб приложения, AI интеграции, автоматизации. Разгледайте архитектура, технически решения и метрики.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/projects" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    url: "/projects",
    locale: "bg_BG",
    siteName: "\u041B\u0415\u0412\u0415\u041B 8",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

function getDomain(url: string) {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

export default function ProjectsIndexPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "\u041F\u0440\u043E\u0435\u043A\u0442\u0438 \u2014 Case Studies | LEVEL 8",
    description: DESCRIPTION,
    url: "https://level8.bg/projects",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: CASE_STUDIES.length,
      itemListElement: CASE_STUDIES.map((cs, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `https://level8.bg/projects/${cs.slug}`,
        name: cs.name,
        description: cs.tagline,
        image: `https://level8.bg${cs.heroImage}`,
      })),
    },
  };

  // Collect unique categories + industries for filters (future enhancement via client component)
  const categories = Array.from(new Set(CASE_STUDIES.map((cs) => cs.category)));
  const allTags = Array.from(new Set(CASE_STUDIES.flatMap((cs) => cs.tags)));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar />

      <main className="min-h-screen pt-24">
        {/* ── Hero ── */}
        <section className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-4xl mx-auto text-center">
            <FadeIn>
              <span className="font-mono-terminal text-[10px] text-neon/40 tracking-[0.2em] uppercase block mb-4">
                {"// /projects"}
              </span>
              <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground leading-tight mb-6">
                Реални проекти.{" "}
                <span className="text-neon text-glow-neon">Реални резултати.</span>
              </h1>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
                {CASE_STUDIES.length} case studies от клиенти на Level 8 —
                как построихме, какви технологии ползвахме, какви резултати
                постигнахме.
              </p>
            </FadeIn>

            {/* Category chips */}
            <FadeIn delay={0.2}>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-neon/20 bg-neon/5 px-3 py-1 text-xs font-mono text-neon">
                  Всички ({CASE_STUDIES.length})
                </span>
                {categories.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-mono text-muted-foreground"
                  >
                    {cat} (
                    {CASE_STUDIES.filter((cs) => cs.category === cat).length})
                  </span>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>

        <CircuitDivider />

        {/* ── Projects Grid ── */}
        <section className="container mx-auto px-4 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CASE_STUDIES.map((cs, i) => (
              <FadeIn key={cs.slug} delay={i * 0.05}>
                <SpotlightCard className="bg-surface border border-border rounded-2xl hover:border-neon/30 transition-all duration-300 group h-full overflow-hidden">
                  <Link
                    href={`/projects/${cs.slug}`}
                    className="flex flex-col h-full"
                    aria-label={`Виж case study: ${cs.name}`}
                  >
                    {/* Browser mockup frame */}
                    <div className="m-3 mb-0 rounded-t-lg border border-border/50 overflow-hidden bg-black/30">
                      <div className="flex items-center gap-2 px-3 py-2 bg-black/40 border-b border-border/30">
                        <div className="flex gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                          <span className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
                        </div>
                        <span className="flex-1 text-center font-mono-terminal text-[10px] text-muted-foreground/50 truncate">
                          {getDomain(cs.liveUrl)}
                        </span>
                      </div>
                      <div className="relative aspect-video overflow-hidden">
                        <Image
                          src={cs.heroImage}
                          alt={`Screenshot на ${cs.name}`}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      {/* Category badge */}
                      <span className="inline-flex self-start items-center rounded-full border border-neon/20 bg-neon/5 px-2 py-0.5 text-[10px] font-mono text-neon/70 mb-3 uppercase tracking-wider">
                        {cs.category}
                      </span>

                      <h2 className="font-display text-xl font-bold text-foreground group-hover:text-neon transition-colors mb-1.5">
                        {cs.name}
                      </h2>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
                        {cs.tagline}
                      </p>

                      {/* Primary metric */}
                      {cs.primaryMetric && (
                        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border/50">
                          <TrendingUp size={14} className="text-neon shrink-0" />
                          <div className="flex items-baseline gap-2">
                            <span className="font-mono text-sm font-bold text-neon">
                              {cs.primaryMetric.value}
                            </span>
                            <span className="text-xs text-muted-foreground/70">
                              {cs.primaryMetric.label}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Tech stack tags */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {cs.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.03] border border-border/30 text-muted-foreground/60"
                          >
                            {tag}
                          </span>
                        ))}
                        {cs.tags.length > 3 && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 text-muted-foreground/40">
                            +{cs.tags.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Footer: View case study + external link */}
                      <div className="flex items-center justify-between pt-2 mt-auto">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-neon/80 group-hover:text-neon transition-colors">
                          Виж case study
                          <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                        </span>
                        <span className="text-[10px] text-muted-foreground/40 font-mono">
                          {cs.year} · {cs.duration}
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* External link shortcut */}
                  {cs.liveUrl && (
                    <a
                      href={cs.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-4 right-4 z-10 inline-flex items-center gap-1 rounded-lg border border-border bg-surface/90 backdrop-blur px-2 py-1 text-[10px] font-mono text-muted-foreground/70 hover:border-neon/30 hover:text-neon transition-colors opacity-0 group-hover:opacity-100"
                      aria-label={`Отвори ${getDomain(cs.liveUrl)}`}
                    >
                      <ExternalLink size={10} />
                      Live
                    </a>
                  )}
                </SpotlightCard>
              </FadeIn>
            ))}
          </div>
        </section>

        <CircuitDivider />

        {/* ── Tags Cloud (for SEO + discovery) ── */}
        <section className="container mx-auto px-4 py-12 md:py-16">
          <FadeIn>
            <div className="max-w-3xl mx-auto text-center">
              <span className="font-mono-terminal text-[10px] text-neon/40 tracking-[0.2em] uppercase block mb-3">
                {"// TECH STACK"}
              </span>
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-6">
                Технологии, които използваме
              </h2>
              <div className="flex flex-wrap gap-2 justify-center">
                {allTags.map((tag) => (
                  <span
                    key={tag}
                    className="text-sm font-mono px-3 py-1.5 rounded-full bg-surface border border-border text-muted-foreground hover:border-neon/30 hover:text-neon transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </FadeIn>
        </section>

        <CircuitDivider />

        {/* ── CTA ── */}
        <section className="container mx-auto px-4 py-16 md:py-20 text-center">
          <FadeIn>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Вашият проект <span className="text-neon">следващ</span>?
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
              Безплатна консултация и предложение за вашия бизнес. Разкажете ни какво
              искате да постигнете.
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <CtaButton href="/#contact" variant="neon">
                Безплатна консултация
              </CtaButton>
              <CtaButton href="/#services" variant="outline">
                Нашите услуги
              </CtaButton>
            </div>
          </FadeIn>
        </section>
      </main>

      <Footer />
    </>
  );
}
