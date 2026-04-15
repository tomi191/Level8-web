import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Clock,
  Calendar,
  Quote,
  Lightbulb,
  Wrench,
  FileCode2,
  Sparkles,
  Activity,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CircuitDivider } from "@/components/animations/circuit-divider";
import { FadeIn } from "@/components/animations/fade-in";
import { StaggerChildren, StaggerItem } from "@/components/animations/stagger-children";
import { CtaButton } from "@/components/shared/cta-button";
import { ArchitectureDiagram } from "@/components/shared/architecture-diagram";
import { CaseStudyLeadGate } from "@/components/shared/case-study-lead-gate";
import { TESTIMONIALS } from "@/lib/constants";
import { getCaseStudy, getAllCaseStudySlugs } from "@/lib/case-studies";

const TECH_STACK_GROUP_LABELS: Record<string, string> = {
  frontend: "Frontend",
  backend: "Backend",
  database: "Database",
  auth: "Auth",
  payments: "Payments",
  ai: "AI",
  astrology: "Astrology Engine",
  email: "Email",
  infrastructure: "Infrastructure",
  monitoring: "Monitoring",
  testing: "Testing",
  ci: "CI / Deploy",
};

export function generateStaticParams() {
  return getAllCaseStudySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cs = getCaseStudy(slug);
  if (!cs) return {};
  return {
    title: cs.metaTitle,
    description: cs.metaDescription,
    alternates: { canonical: `/projects/${cs.slug}` },
    openGraph: {
      title: cs.metaTitle,
      description: cs.metaDescription,
      type: "article",
      locale: "bg_BG",
      url: `/projects/${cs.slug}`,
      siteName: "ЛЕВЕЛ 8",
      images: [{ url: cs.heroImage, width: 1200, height: 630, alt: cs.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: cs.metaTitle,
      description: cs.metaDescription,
      images: [{ url: cs.heroImage, alt: cs.name }],
    },
  };
}

function getDomain(url: string) {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cs = getCaseStudy(slug);
  if (!cs) notFound();

  const testimonial = cs.testimonialId
    ? TESTIMONIALS.find((t) => t.id === cs.testimonialId)
    : null;

  const caseStudyJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: cs.metaTitle,
    description: cs.metaDescription,
    image: `https://level8.bg${cs.heroImage}`,
    author: {
      "@type": "Organization",
      name: "\u041B\u0415\u0412\u0415\u041B 8 \u0415\u041E\u041E\u0414",
      url: "https://level8.bg",
    },
    publisher: {
      "@type": "Organization",
      name: "\u041B\u0415\u0412\u0415\u041B 8",
      logo: { "@type": "ImageObject", url: "https://level8.bg/icon.svg" },
    },
    mainEntityOfPage: `https://level8.bg/projects/${cs.slug}`,
    about: {
      "@type": "WebSite",
      name: cs.name,
      url: cs.heroImage ? `https://level8.bg/projects/${cs.slug}` : undefined,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "\u041D\u0430\u0447\u0430\u043B\u043E", item: "https://level8.bg" },
      { "@type": "ListItem", position: 2, name: "\u041F\u043E\u0440\u0442\u0444\u043E\u043B\u0438\u043E", item: "https://level8.bg/#portfolio" },
      { "@type": "ListItem", position: 3, name: cs.name },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(caseStudyJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Navbar />
      <main className="min-h-screen pt-20 md:pt-24">
        {/* ── Hero ── */}
        <section className="relative py-12 md:py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {/* Back link */}
            <FadeIn>
              <Link
                href="/#portfolio"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-neon transition-colors mb-8 md:mb-12"
              >
                <ArrowLeft size={16} />
                <span>Назад към портфолиото</span>
              </Link>
            </FadeIn>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Screenshot with browser frame */}
              <FadeIn>
                <div className="rounded-2xl border border-border overflow-hidden bg-black/30">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-black/40 border-b border-border/30">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
                    </div>
                    <span className="flex-1 text-center font-mono-terminal text-[10px] text-muted-foreground/50 truncate">
                      {getDomain(cs.liveUrl)}
                    </span>
                  </div>
                  <div className="relative aspect-video">
                    <Image
                      src={cs.heroImage}
                      alt={`Screenshot на ${cs.name}`}
                      fill
                      priority
                      className="object-cover object-top"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                </div>
              </FadeIn>

              {/* Project info */}
              <FadeIn delay={0.1}>
                <div className="space-y-6">
                  <div>
                    <span className="font-mono-terminal text-neon/40 text-xs tracking-[0.25em] uppercase">
                      {"// "}{cs.category.toUpperCase()}
                    </span>
                    <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mt-2">
                      {cs.name}
                    </h1>
                    <p className="text-lg text-muted-foreground mt-2">
                      {cs.tagline}
                    </p>
                  </div>

                  {/* Primary metric badge */}
                  <div className="inline-flex items-center gap-3 rounded-xl border border-neon/30 bg-neon/5 px-5 py-3">
                    <span className="font-display text-2xl md:text-3xl font-bold text-neon">
                      {cs.primaryMetric.value}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {cs.primaryMetric.label}
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {cs.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-md bg-neon/5 border border-neon/10 text-[11px] font-mono-terminal text-neon/60"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Meta: duration + year */}
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} className="text-neon/60" />
                      {cs.duration}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-neon/60" />
                      {cs.year}
                    </span>
                  </div>

                  {/* External link */}
                  <a
                    href={cs.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-bold font-display uppercase tracking-wider text-neon hover:text-foreground transition-colors"
                  >
                    Посети сайта <ExternalLink size={14} />
                  </a>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        <CircuitDivider />

        {/* ── Challenge ── */}
        <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <FadeIn>
              <span className="font-mono-terminal text-neon/40 text-xs tracking-[0.25em] uppercase">
                {"// ПРЕДИЗВИКАТЕЛСТВОТО"}
              </span>
              <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground mt-4 mb-6">
                {cs.challenge.title}
              </h2>
              <div className="space-y-4">
                {cs.challenge.paragraphs.map((p, i) => (
                  <p key={i} className="text-base md:text-lg text-muted-foreground leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>

        <CircuitDivider />

        {/* ── Solution ── */}
        <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-surface">
          <div className="mx-auto max-w-3xl">
            <FadeIn>
              <span className="font-mono-terminal text-neon/40 text-xs tracking-[0.25em] uppercase">
                {"// РЕШЕНИЕТО"}
              </span>
              <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground mt-4 mb-6">
                {cs.solution.title}
              </h2>
              <div className="space-y-4 mb-8">
                {cs.solution.paragraphs.map((p, i) => (
                  <p key={i} className="text-base md:text-lg text-muted-foreground leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>
            </FadeIn>

            <StaggerChildren className="space-y-3">
              {cs.solution.features.map((feature) => (
                <StaggerItem key={feature}>
                  <div className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="font-mono-terminal text-neon text-xs mt-0.5 flex-shrink-0">
                      [+]
                    </span>
                    {feature}
                  </div>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </section>

        {/* ── Architecture (optional deep-dive) ── */}
        {cs.architecture && (
          <>
            <CircuitDivider />
            <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-5xl">
                <FadeIn>
                  <span className="font-mono-terminal text-neon/40 text-xs tracking-[0.25em] uppercase">
                    {"// АРХИТЕКТУРА"}
                  </span>
                  <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground mt-4 mb-6">
                    Как е подредено това отвътре
                  </h2>
                  <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-8 max-w-3xl">
                    {cs.architecture.summary}
                  </p>
                </FadeIn>
                <FadeIn delay={0.1}>
                  <ArchitectureDiagram
                    nodes={cs.architecture.diagram.nodes}
                    edges={cs.architecture.diagram.edges}
                  />
                </FadeIn>
                {cs.architecture.dataFlow.length > 0 && (
                  <FadeIn delay={0.15}>
                    <div className="mt-10">
                      <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                        <Activity size={18} className="text-neon" />
                        Data flows
                      </h3>
                      <ul className="space-y-3">
                        {cs.architecture.dataFlow.map((flow, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-3 text-sm md:text-base text-muted-foreground leading-relaxed"
                          >
                            <span className="font-mono-terminal text-neon/70 text-xs mt-1 flex-shrink-0 w-6">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <span>{flow}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </FadeIn>
                )}
              </div>
            </section>
          </>
        )}

        {/* ── Technical Decisions (optional) ── */}
        {cs.technicalDecisions && cs.technicalDecisions.length > 0 && (
          <>
            <CircuitDivider />
            <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-surface">
              <div className="mx-auto max-w-4xl">
                <FadeIn>
                  <span className="font-mono-terminal text-neon/40 text-xs tracking-[0.25em] uppercase">
                    {"// ТЕХНИЧЕСКИ РЕШЕНИЯ"}
                  </span>
                  <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground mt-4 mb-3">
                    Защо точно тези технологии
                  </h2>
                  <p className="text-base text-muted-foreground mb-10 max-w-2xl">
                    Всеки tradeoff е избор срещу нещо друго. Ето решенията, които взехме, и защо.
                  </p>
                </FadeIn>
                <div className="space-y-5">
                  {cs.technicalDecisions.map((decision, i) => (
                    <FadeIn key={i} delay={i * 0.05}>
                      <div className="rounded-2xl border border-border bg-background p-6 md:p-7">
                        <div className="flex items-start gap-3 mb-4">
                          <Lightbulb size={18} className="text-neon shrink-0 mt-1" />
                          <h3 className="font-display text-lg md:text-xl font-bold text-foreground">
                            {decision.question}
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-sm md:text-base">
                          <span className="font-mono-terminal text-neon/60 text-xs uppercase tracking-wider pt-0.5">
                            Избрахме
                          </span>
                          <span className="text-foreground font-medium">{decision.chose}</span>

                          <span className="font-mono-terminal text-muted-foreground/60 text-xs uppercase tracking-wider pt-0.5">
                            Отхвърлихме
                          </span>
                          <span className="text-muted-foreground">
                            {decision.rejected.join(", ")}
                          </span>

                          <span className="font-mono-terminal text-muted-foreground/60 text-xs uppercase tracking-wider pt-0.5">
                            Защо
                          </span>
                          <span className="text-muted-foreground leading-relaxed">
                            {decision.reasoning}
                          </span>

                          <span className="font-mono-terminal text-orange-400/60 text-xs uppercase tracking-wider pt-0.5">
                            Tradeoff
                          </span>
                          <span className="text-muted-foreground leading-relaxed italic">
                            {decision.tradeoff}
                          </span>
                        </div>
                      </div>
                    </FadeIn>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        <CircuitDivider />

        {/* ── Tech Stack (simple or detailed) ── */}
        <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <FadeIn>
              <span className="font-mono-terminal text-neon/40 text-xs tracking-[0.25em] uppercase block mb-6">
                {"// ТЕХНОЛОГИИ"}
              </span>
              {cs.techStackDetailed ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {Object.entries(cs.techStackDetailed).map(([group, items]) => {
                    if (!items || items.length === 0) return null;
                    return (
                      <div
                        key={group}
                        className="rounded-xl border border-border bg-surface p-5"
                      >
                        <h3 className="font-display text-sm font-bold text-neon mb-3 tracking-wider uppercase">
                          {TECH_STACK_GROUP_LABELS[group] ?? group}
                        </h3>
                        <ul className="space-y-1.5">
                          {items.map((item: string) => (
                            <li
                              key={item}
                              className="text-sm text-muted-foreground font-mono-terminal flex items-start gap-2"
                            >
                              <span className="text-neon/40 mt-0.5">→</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {cs.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-4 py-2 rounded-lg bg-neon/5 border border-neon/10 text-sm font-mono-terminal text-neon/70"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </FadeIn>
          </div>
        </section>

        {/* ── Code Highlights (optional) ── */}
        {cs.codeHighlights && cs.codeHighlights.length > 0 && (
          <>
            <CircuitDivider />
            <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-surface">
              <div className="mx-auto max-w-4xl">
                <FadeIn>
                  <span className="font-mono-terminal text-neon/40 text-xs tracking-[0.25em] uppercase">
                    {"// CODE HIGHLIGHTS"}
                  </span>
                  <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground mt-4 mb-3">
                    Най-интересните parчетa код
                  </h2>
                  <p className="text-base text-muted-foreground mb-10 max-w-2xl">
                    Санитизирани snippets с обяснение защо е направено така.
                  </p>
                </FadeIn>
                <div className="space-y-6">
                  {cs.codeHighlights.map((highlight, i) => (
                    <FadeIn key={i} delay={i * 0.05}>
                      <div className="rounded-2xl border border-border bg-background overflow-hidden">
                        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-border/60 bg-black/40">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileCode2 size={14} className="text-neon shrink-0" />
                            <span className="font-mono-terminal text-xs text-muted-foreground truncate">
                              {highlight.filePath}
                            </span>
                          </div>
                        </div>
                        <div className="p-5 md:p-6">
                          <h3 className="font-display text-lg font-bold text-foreground mb-2">
                            {highlight.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                            {highlight.why}
                          </p>
                          <pre className="text-[11px] md:text-xs font-mono-terminal leading-relaxed overflow-x-auto bg-black/60 text-neon/80 p-4 rounded-lg border border-border/40">
                            <code>{highlight.snippet}</code>
                          </pre>
                        </div>
                      </div>
                    </FadeIn>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {/* ── Challenges (optional) ── */}
        {cs.challenges && cs.challenges.length > 0 && (
          <>
            <CircuitDivider />
            <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-4xl">
                <FadeIn>
                  <span className="font-mono-terminal text-neon/40 text-xs tracking-[0.25em] uppercase">
                    {"// CHALLENGES & FIXES"}
                  </span>
                  <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground mt-4 mb-3">
                    Какво счупи production и как го оправихме
                  </h2>
                </FadeIn>
                <div className="space-y-5 mt-8">
                  {cs.challenges.map((ch, i) => (
                    <FadeIn key={i} delay={i * 0.05}>
                      <div className="rounded-2xl border border-border bg-surface p-6 md:p-7">
                        <div className="flex items-start gap-3 mb-4">
                          <Wrench size={18} className="text-orange-400 shrink-0 mt-1" />
                          <h3 className="font-display text-lg md:text-xl font-bold text-foreground">
                            {ch.title}
                          </h3>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <span className="font-mono-terminal text-orange-400/70 text-xs uppercase tracking-wider block mb-1">
                              Проблем
                            </span>
                            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                              {ch.problem}
                            </p>
                          </div>
                          <div>
                            <span className="font-mono-terminal text-neon/70 text-xs uppercase tracking-wider block mb-1">
                              Решение
                            </span>
                            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                              {ch.solution}
                            </p>
                          </div>
                          {ch.filesPaths && ch.filesPaths.length > 0 && (
                            <div className="pt-1 flex flex-wrap gap-2">
                              {ch.filesPaths.map((fp) => (
                                <span
                                  key={fp}
                                  className="inline-flex items-center gap-1 font-mono-terminal text-[11px] text-muted-foreground/70 bg-black/30 border border-border/40 px-2 py-1 rounded"
                                >
                                  <FileCode2 size={10} />
                                  {fp}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </FadeIn>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {/* ── Lead Capture Gate (mid-article, after challenges) ── */}
        <CircuitDivider />
        <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <FadeIn>
              <CaseStudyLeadGate projectName={cs.name} />
            </FadeIn>
          </div>
        </section>

        {/* ── Performance (optional) ── */}
        {cs.performance && (
          <>
            <CircuitDivider />
            <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-surface">
              <div className="mx-auto max-w-4xl">
                <FadeIn>
                  <span className="font-mono-terminal text-neon/40 text-xs tracking-[0.25em] uppercase">
                    {"// PERFORMANCE"}
                  </span>
                  <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground mt-4 mb-3">
                    Реални числа, не маркетинг
                  </h2>
                  {cs.performance.notes && (
                    <p className="text-sm md:text-base text-muted-foreground mb-8 max-w-3xl leading-relaxed">
                      {cs.performance.notes}
                    </p>
                  )}
                </FadeIn>

                {cs.performance.lighthouse && (
                  <FadeIn delay={0.1}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      {Object.entries(cs.performance.lighthouse).map(([k, v]) => (
                        <div
                          key={k}
                          className="rounded-xl border border-border bg-background p-5 text-center"
                        >
                          <div className="font-display text-3xl font-bold text-neon">
                            {v}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
                            {k === "bestPractices" ? "Best Practices" : k}
                          </div>
                        </div>
                      ))}
                    </div>
                  </FadeIn>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cs.performance.coreWebVitals && (
                    <FadeIn delay={0.15}>
                      <div className="rounded-xl border border-border bg-background p-5">
                        <h3 className="font-mono-terminal text-xs text-muted-foreground uppercase tracking-wider mb-3">
                          Core Web Vitals
                        </h3>
                        <dl className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">LCP</dt>
                            <dd className="font-mono-terminal text-neon/80">
                              {cs.performance.coreWebVitals.lcp}
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">INP</dt>
                            <dd className="font-mono-terminal text-neon/80">
                              {cs.performance.coreWebVitals.inp}
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">CLS</dt>
                            <dd className="font-mono-terminal text-neon/80">
                              {cs.performance.coreWebVitals.cls}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </FadeIn>
                  )}
                  {cs.performance.bundleSize && (
                    <FadeIn delay={0.2}>
                      <div className="rounded-xl border border-border bg-background p-5">
                        <h3 className="font-mono-terminal text-xs text-muted-foreground uppercase tracking-wider mb-3">
                          Bundle Size
                        </h3>
                        <dl className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">First Load JS</dt>
                            <dd className="font-mono-terminal text-neon/80">
                              {cs.performance.bundleSize.firstLoadJs}
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">Largest route</dt>
                            <dd className="font-mono-terminal text-neon/80">
                              {cs.performance.bundleSize.largestRoute}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </FadeIn>
                  )}
                </div>
              </div>
            </section>
          </>
        )}

        {/* ── Living Metrics (optional) ── */}
        {cs.livingMetrics && (
          <>
            <CircuitDivider />
            <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-4xl">
                <FadeIn>
                  <span className="font-mono-terminal text-neon/40 text-xs tracking-[0.25em] uppercase">
                    {"// LIVING METRICS"}
                  </span>
                  <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground mt-4 mb-3">
                    Текущо състояние
                  </h2>
                  {cs.livingMetrics.notes && (
                    <p className="text-xs text-muted-foreground/70 italic mb-6">
                      {cs.livingMetrics.notes}
                    </p>
                  )}
                </FadeIn>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(cs.livingMetrics)
                    .filter(([k]) => k !== "notes")
                    .map(([k, v]) => (
                      <div
                        key={k}
                        className="rounded-xl border border-border bg-surface p-4"
                      >
                        <div className="font-mono-terminal text-xs text-muted-foreground/70 uppercase tracking-wider mb-1">
                          {k.replace(/([A-Z])/g, " $1").toLowerCase()}
                        </div>
                        <div className="text-sm font-display font-semibold text-foreground">
                          {v}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </section>
          </>
        )}

        {/* ── Lessons Learned (optional) ── */}
        {cs.lessonsLearned && cs.lessonsLearned.length > 0 && (
          <>
            <CircuitDivider />
            <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-surface">
              <div className="mx-auto max-w-4xl">
                <FadeIn>
                  <span className="font-mono-terminal text-neon/40 text-xs tracking-[0.25em] uppercase">
                    {"// LESSONS LEARNED"}
                  </span>
                  <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground mt-4 mb-3">
                    Какво бихме направили иначе
                  </h2>
                  <p className="text-base text-muted-foreground mb-10 max-w-2xl">
                    Честно за грешките, защото те правят следващия проект по-добър.
                  </p>
                </FadeIn>
                <div className="space-y-5">
                  {cs.lessonsLearned.map((lesson, i) => (
                    <FadeIn key={i} delay={i * 0.05}>
                      <div className="rounded-2xl border border-border bg-background p-6 md:p-7">
                        <div className="flex items-start gap-3 mb-3">
                          <Sparkles size={18} className="text-neon shrink-0 mt-1" />
                          <h3 className="font-display text-lg md:text-xl font-bold text-foreground">
                            {lesson.title}
                          </h3>
                        </div>
                        <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
                          {lesson.detail}
                        </p>
                        <div className="border-l-2 border-neon/40 pl-4 py-1">
                          <span className="font-mono-terminal text-neon/70 text-xs uppercase tracking-wider block mb-1">
                            Друг път би направил
                          </span>
                          <p className="text-sm text-muted-foreground italic leading-relaxed">
                            {lesson.wouldDoDifferently}
                          </p>
                        </div>
                      </div>
                    </FadeIn>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        <CircuitDivider />

        {/* ── Results ── */}
        <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-surface">
          <div className="mx-auto max-w-4xl">
            <FadeIn>
              <div className="text-center mb-10 md:mb-14">
                <span className="font-mono-terminal text-neon/40 text-xs tracking-[0.25em] uppercase">
                  {"// РЕЗУЛТАТИ"}
                </span>
                <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground mt-4">
                  {cs.results.title}
                </h2>
                <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                  {cs.results.description}
                </p>
              </div>
            </FadeIn>

            <StaggerChildren className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {cs.results.metrics.map((metric) => (
                <StaggerItem key={metric.label}>
                  <div className="rounded-2xl border border-border bg-background p-5 md:p-6 text-center">
                    <span className="font-display text-2xl md:text-3xl font-bold text-neon block">
                      {metric.value}
                    </span>
                    <span className="text-xs md:text-sm text-muted-foreground mt-1 block">
                      {metric.label}
                    </span>
                  </div>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </section>

        {/* ── Testimonial (conditional) ── */}
        {testimonial && (
          <>
            <CircuitDivider />
            <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-3xl">
                <FadeIn>
                  <div className="rounded-2xl border border-border bg-surface p-8 md:p-10 relative">
                    <Quote
                      size={32}
                      className="text-neon/20 absolute top-6 left-6"
                      aria-hidden="true"
                    />
                    <blockquote className="text-base md:text-lg text-muted-foreground leading-relaxed italic pl-6 md:pl-8">
                      &ldquo;{testimonial.quote}&rdquo;
                    </blockquote>
                    <div className="mt-6 pl-6 md:pl-8 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-neon/10 border border-neon/20 flex items-center justify-center text-neon font-display font-bold text-sm">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {testimonial.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {testimonial.role}, {testimonial.company}
                        </p>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              </div>
            </section>
          </>
        )}

        <CircuitDivider />

        {/* ── CTA ── */}
        <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <FadeIn>
              <span className="font-mono-terminal text-neon/40 text-xs tracking-[0.25em] uppercase">
                {"// СЛЕДВАЩА СТЪПКА"}
              </span>
              <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground mt-4 mb-3">
                Имате подобен проект?
              </h2>
              <p className="text-base md:text-lg text-muted-foreground mb-8">
                Нека поговорим за вашата идея. Безплатна 30-минутна консултация, без ангажимент.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <CtaButton href="/#contact" variant="neon">
                  Безплатна консултация
                </CtaButton>
                <CtaButton href="/#portfolio" variant="outline">
                  Вижте портфолиото
                </CtaButton>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
