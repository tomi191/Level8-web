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
  Zap,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { FadeIn } from "@/components/animations/fade-in";
import { CtaButton } from "@/components/shared/cta-button";
import { ArchitectureDiagram } from "@/components/shared/architecture-diagram";
import { CaseStudyLeadGate } from "@/components/shared/case-study-lead-gate";
import { SectionDivider } from "@/components/shared/section-divider";
import { CaseStudyTOC } from "@/components/shared/case-study-toc";
import { ShowcaseLive } from "@/components/shared/showcase-live";
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

  // Build TOC items based on available sections
  const tocItems = [
    { id: "sec-challenge", label: "Challenge", number: "01" },
    { id: "sec-solution", label: "Solution", number: "02" },
    ...(cs.architecture ? [{ id: "sec-architecture", label: "Architecture", number: "03" }] : []),
    ...(cs.technicalDecisions?.length ? [{ id: "sec-decisions", label: "Decisions", number: "04" }] : []),
    { id: "sec-stack", label: "Tech Stack", number: "05" },
    ...(cs.codeHighlights?.length ? [{ id: "sec-code", label: "Code", number: "06" }] : []),
    ...(cs.challenges?.length ? [{ id: "sec-challenges", label: "Fixes", number: "07" }] : []),
    ...(cs.performance ? [{ id: "sec-perf", label: "Performance", number: "08" }] : []),
    ...(cs.lessonsLearned?.length ? [{ id: "sec-lessons", label: "Lessons", number: "09" }] : []),
    { id: "sec-results", label: "Results", number: "10" },
  ];

  // Showcase slides for hero monitor
  const desktops = (cs.screenshots ?? []).filter((s) => s.device === "desktop");
  const mobiles = (cs.screenshots ?? []).filter((s) => s.device === "mobile");
  const showcaseSlides = desktops
    .filter((d) => d.path)
    .map((d, i) => ({
      path: d.path!,
      label: d.caption ?? d.path!,
      fallbackDesktop: d.src,
      fallbackMobile: mobiles[i]?.src,
    }));

  // Hero stat tiles — primaryMetric + up to 3 living metrics
  const livingKeys = cs.livingMetrics
    ? Object.keys(cs.livingMetrics).filter((k) => k !== "notes")
    : [];
  const pickLivingKeys = ["migrations", "routes", "cronJobs", "monthlyOrganicTraffic"].filter(
    (k) => livingKeys.includes(k)
  );
  const statTiles: Array<{ value: string; label: string }> = [
    { value: cs.primaryMetric.value, label: cs.primaryMetric.label },
    ...pickLivingKeys.slice(0, 3).map((k) => ({
      value: cs.livingMetrics![k] ?? "",
      label: k.replace(/([A-Z])/g, " $1").toLowerCase(),
    })),
  ];

  const caseStudyJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: cs.metaTitle,
    description: cs.metaDescription,
    image: `https://level8.bg${cs.heroImage}`,
    author: {
      "@type": "Organization",
      name: "ЛЕВЕЛ 8 ЕООД",
      url: "https://level8.bg",
    },
    publisher: {
      "@type": "Organization",
      name: "ЛЕВЕЛ 8",
      logo: { "@type": "ImageObject", url: "https://level8.bg/icon.svg" },
    },
    mainEntityOfPage: `https://level8.bg/projects/${cs.slug}`,
    about: { "@type": "WebSite", name: cs.name },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Начало", item: "https://level8.bg" },
      { "@type": "ListItem", position: 2, name: "Проекти", item: "https://level8.bg/projects" },
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
      <main className="min-h-screen pt-20 md:pt-24 relative">
        {/* Grid background texture */}
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none opacity-[0.025] z-0"
          style={{
            backgroundImage:
              "linear-gradient(#39ff14 1px, transparent 1px), linear-gradient(90deg, #39ff14 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* ── Breadcrumb bar ── */}
        <div className="border-b border-border/40 bg-background/60 backdrop-blur sticky top-0 md:top-[4.5rem] z-30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2.5 flex items-center gap-3 text-xs font-mono-terminal">
            <Link href="/projects" className="text-muted-foreground hover:text-neon transition-colors inline-flex items-center gap-1.5">
              <ArrowLeft size={12} />
              projects
            </Link>
            <span className="text-muted-foreground/30">/</span>
            <span className="text-neon truncate">{cs.slug}</span>
            <span className="text-muted-foreground/30 hidden sm:inline">//</span>
            <span className="text-muted-foreground/60 hidden sm:inline">case study</span>
            <span className="flex-1" />
            <a
              href={cs.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-muted-foreground hover:text-neon transition-colors"
            >
              {getDomain(cs.liveUrl)}
              <ExternalLink size={10} />
            </a>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* HERO — title row + showcase monitor (lg:col-span-7) + stats  */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 md:pt-12 pb-4">
          <FadeIn>
            <div className="flex items-center gap-2 font-mono-terminal text-[10px] text-neon/60 tracking-[0.25em] uppercase mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse" />
              {cs.category}
              <span className="text-muted-foreground/40">·</span>
              <span className="text-muted-foreground">{cs.year}</span>
              <span className="text-muted-foreground/40">·</span>
              <span className="text-muted-foreground inline-flex items-center gap-1">
                <Clock size={11} /> {cs.duration}
              </span>
            </div>

            <div className="flex items-end justify-between gap-6 flex-wrap">
              <div className="max-w-3xl">
                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.05] mb-3">
                  {cs.name}
                </h1>
                <p className="text-base md:text-lg text-muted-foreground mb-4 max-w-2xl">
                  {cs.tagline}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {cs.tags.slice(0, 6).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-surface/60 border border-border/50 text-[10px] font-mono-terminal text-muted-foreground/80"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <a
                href={cs.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-neon/40 bg-neon/5 hover:bg-neon/10 text-neon px-4 py-2.5 text-sm font-medium transition-colors shrink-0"
              >
                Посети сайта <ExternalLink size={14} />
              </a>
            </div>
          </FadeIn>
        </section>

        <section className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12 md:pb-16">
          <FadeIn delay={0.1}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
              {/* LEFT: Showcase monitor + phone (7 cols) */}
              <div className="lg:col-span-7 min-w-0">
                {showcaseSlides.length > 0 ? (
                  <ShowcaseLive liveBase={cs.liveUrl} slides={showcaseSlides} />
                ) : (
                  <div className="rounded-2xl border border-border bg-surface overflow-hidden aspect-[16/10] relative">
                    <Image
                      src={cs.heroImage}
                      alt={cs.name}
                      fill
                      priority
                      className="object-cover object-top"
                      sizes="(max-width: 1024px) 100vw, 60vw"
                    />
                  </div>
                )}
              </div>

              {/* RIGHT: Stat grid (5 cols) */}
              <div className="lg:col-span-5 grid grid-cols-2 gap-4 md:gap-5 auto-rows-fr">
                {statTiles.slice(0, 4).map((tile, i) => (
                  <div
                    key={i}
                    className={`rounded-2xl border bg-surface p-5 md:p-6 flex flex-col justify-end relative overflow-hidden min-h-[130px] ${
                      i === 0
                        ? "border-neon/40 bg-gradient-to-br from-neon/10 to-transparent col-span-2 md:col-span-1"
                        : "border-border"
                    }`}
                  >
                    <div
                      aria-hidden="true"
                      className={`absolute top-3 right-3 font-mono-terminal text-[10px] tracking-wider uppercase ${
                        i === 0 ? "text-neon/60" : "text-muted-foreground/40"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div
                      className={`font-display text-3xl md:text-4xl font-bold leading-none mb-1.5 ${
                        i === 0 ? "text-neon" : "text-foreground"
                      }`}
                    >
                      {tile.value}
                    </div>
                    <div className="text-xs text-muted-foreground leading-tight">
                      {tile.label}
                    </div>
                  </div>
                ))}

                {statTiles.length < 4 &&
                  Array.from({ length: 4 - statTiles.length }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="rounded-2xl border border-border/40 bg-surface/40 p-5 flex items-center justify-center min-h-[130px]"
                    >
                      <span className="font-mono-terminal text-[10px] text-muted-foreground/40">
                        [ data pending ]
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </FadeIn>
        </section>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* BODY — two-column with sticky TOC                            */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_240px] gap-10 items-start">
            {/* MAIN CONTENT */}
            <article className="space-y-16 md:space-y-20 min-w-0">
              {/* ── CHALLENGE ── */}
              <section>
                <FadeIn>
                  <SectionDivider number="01" title="Challenge" id="sec-challenge" />
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-10 items-start">
                    <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground leading-tight">
                      {cs.challenge.title}
                    </h2>
                    <div className="space-y-4">
                      {cs.challenge.paragraphs.map((p, i) => (
                        <p
                          key={i}
                          className="text-base md:text-lg text-muted-foreground leading-relaxed"
                        >
                          {p}
                        </p>
                      ))}
                    </div>
                  </div>
                </FadeIn>
              </section>

              {/* ── 02 // SOLUTION ── */}
              <section>
                <FadeIn>
                  <SectionDivider number="02" title="Solution" id="sec-solution" />
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-10 items-start">
                    <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground leading-tight">
                      {cs.solution.title}
                    </h2>
                    <div>
                      <div className="space-y-4 mb-8">
                        {cs.solution.paragraphs.map((p, i) => (
                          <p
                            key={i}
                            className="text-base md:text-lg text-muted-foreground leading-relaxed"
                          >
                            {p}
                          </p>
                        ))}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {cs.solution.features.map((feature) => (
                          <div
                            key={feature}
                            className="flex items-start gap-2.5 p-3 rounded-lg border border-border/50 bg-surface/40"
                          >
                            <span className="font-mono-terminal text-neon text-xs mt-0.5 flex-shrink-0">
                              [+]
                            </span>
                            <span className="text-sm text-muted-foreground leading-snug">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </FadeIn>
              </section>

              {/* ── 03 // ARCHITECTURE (full-bleed breakout) ── */}
              {cs.architecture && (
                <section>
                  <FadeIn>
                    <SectionDivider number="03" title="Architecture" id="sec-architecture" />
                    <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground leading-tight mt-8 mb-4">
                      Как е подредено отвътре
                    </h2>
                    <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-8 max-w-3xl">
                      {cs.architecture.summary}
                    </p>
                  </FadeIn>

                  {/* Breakout: -mx beyond article container */}
                  <FadeIn delay={0.1}>
                    <div className="relative -mx-4 sm:-mx-6 lg:-mx-0 xl:-mx-0">
                      <ArchitectureDiagram
                        nodes={cs.architecture.diagram.nodes}
                        edges={cs.architecture.diagram.edges}
                      />
                    </div>
                  </FadeIn>

                  {cs.architecture.dataFlow.length > 0 && (
                    <FadeIn delay={0.15}>
                      <div className="mt-10">
                        <div className="flex items-center gap-2 font-mono-terminal text-xs text-neon/60 uppercase tracking-[0.2em] mb-5">
                          <Activity size={14} />
                          Data flows
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {cs.architecture.dataFlow.map((flow, i) => (
                            <div
                              key={i}
                              className="rounded-xl border border-border bg-surface/60 p-5 relative"
                            >
                              <div className="font-display text-3xl text-neon/20 absolute top-3 right-4 leading-none">
                                {String(i + 1).padStart(2, "0")}
                              </div>
                              <p className="text-sm text-muted-foreground leading-relaxed pr-10">
                                {flow}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </FadeIn>
                  )}
                </section>
              )}

              {/* ── 04 // TECHNICAL DECISIONS (bento 2-col) ── */}
              {cs.technicalDecisions && cs.technicalDecisions.length > 0 && (
                <section>
                  <FadeIn>
                    <SectionDivider number="04" title="Decisions" id="sec-decisions" />
                    <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground leading-tight mt-8 mb-3">
                      Защо точно тези технологии
                    </h2>
                    <p className="text-base text-muted-foreground mb-8 max-w-2xl">
                      Всеки tradeoff е избор срещу нещо друго.
                    </p>
                  </FadeIn>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cs.technicalDecisions.map((d, i) => (
                      <FadeIn key={i} delay={i * 0.05}>
                        <div className="rounded-2xl border border-border bg-surface p-5 md:p-6 h-full relative overflow-hidden group hover:border-neon/30 transition-colors">
                          <div
                            aria-hidden="true"
                            className="absolute top-4 right-5 font-mono-terminal text-[10px] text-muted-foreground/40 uppercase tracking-wider"
                          >
                            Q.{String(i + 1).padStart(2, "0")}
                          </div>
                          <div className="flex items-start gap-2.5 mb-5 pr-10">
                            <Lightbulb size={16} className="text-neon shrink-0 mt-1" />
                            <h3 className="font-display text-lg font-bold text-foreground leading-snug">
                              {d.question}
                            </h3>
                          </div>
                          <dl className="space-y-3 text-sm">
                            <div className="flex items-baseline gap-3">
                              <dt className="font-mono-terminal text-[10px] text-neon/70 uppercase tracking-wider w-16 shrink-0">
                                Chose
                              </dt>
                              <dd className="text-foreground font-medium">{d.chose}</dd>
                            </div>
                            <div className="flex items-baseline gap-3">
                              <dt className="font-mono-terminal text-[10px] text-muted-foreground/60 uppercase tracking-wider w-16 shrink-0">
                                Rejected
                              </dt>
                              <dd className="text-muted-foreground/80">
                                {d.rejected.join(", ")}
                              </dd>
                            </div>
                            <div className="flex items-baseline gap-3">
                              <dt className="font-mono-terminal text-[10px] text-muted-foreground/60 uppercase tracking-wider w-16 shrink-0">
                                Why
                              </dt>
                              <dd className="text-muted-foreground leading-relaxed">
                                {d.reasoning}
                              </dd>
                            </div>
                            <div className="flex items-baseline gap-3 pt-2 mt-2 border-t border-border/40">
                              <dt className="font-mono-terminal text-[10px] text-orange-400/70 uppercase tracking-wider w-16 shrink-0">
                                Tradeoff
                              </dt>
                              <dd className="text-muted-foreground/90 italic leading-relaxed">
                                {d.tradeoff}
                              </dd>
                            </div>
                          </dl>
                        </div>
                      </FadeIn>
                    ))}
                  </div>
                </section>
              )}

              {/* ── 05 // TECH STACK ── */}
              <section>
                <FadeIn>
                  <SectionDivider number="05" title="Stack" id="sec-stack" />
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground leading-tight mt-8 mb-8">
                    Технологии
                  </h2>
                </FadeIn>
                {cs.techStackDetailed ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.entries(cs.techStackDetailed).map(([group, items]) => {
                      if (!items || items.length === 0) return null;
                      return (
                        <FadeIn key={group}>
                          <div className="rounded-xl border border-border bg-surface/60 p-4">
                            <div className="flex items-center gap-1.5 font-mono-terminal text-[10px] text-neon/80 uppercase tracking-[0.15em] mb-3">
                              <span className="text-neon/40">{">"}</span>
                              {TECH_STACK_GROUP_LABELS[group] ?? group}
                            </div>
                            <ul className="space-y-1.5">
                              {items.map((item: string) => (
                                <li
                                  key={item}
                                  className="text-xs text-muted-foreground font-mono-terminal leading-snug"
                                >
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </FadeIn>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {cs.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1.5 rounded-md bg-neon/5 border border-neon/20 text-sm font-mono-terminal text-neon/80"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </section>

              {/* ── 06 // CODE HIGHLIGHTS (horizontal scroll) ── */}
              {cs.codeHighlights && cs.codeHighlights.length > 0 && (
                <section>
                  <FadeIn>
                    <SectionDivider number="06" title="Code in the wild" id="sec-code" />
                    <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground leading-tight mt-8 mb-3">
                      Парчета от кухнята
                    </h2>
                    <p className="text-base text-muted-foreground mb-8 max-w-2xl">
                      Санитизирани snippets с обяснение защо е направено така.
                    </p>
                  </FadeIn>
                  <div className="relative -mx-4 sm:-mx-6 lg:mx-0">
                    <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 px-4 sm:px-6 lg:px-0 scrollbar-thin">
                      {cs.codeHighlights.map((h, i) => (
                        <div
                          key={i}
                          className="snap-start shrink-0 w-[90%] sm:w-[560px] rounded-2xl border border-border bg-surface overflow-hidden flex flex-col"
                        >
                          <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-border/60 bg-black/40">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileCode2 size={13} className="text-neon shrink-0" />
                              <span className="font-mono-terminal text-[11px] text-muted-foreground truncate">
                                {h.filePath}
                              </span>
                            </div>
                            <span className="font-mono-terminal text-[10px] text-muted-foreground/50 shrink-0">
                              {String(i + 1).padStart(2, "0")}/{String(cs.codeHighlights!.length).padStart(2, "0")}
                            </span>
                          </div>
                          <div className="p-5">
                            <h3 className="font-display text-base font-bold text-foreground mb-1.5 leading-tight">
                              {h.title}
                            </h3>
                            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                              {h.why}
                            </p>
                          </div>
                          <pre className="text-[10px] md:text-[11px] font-mono-terminal leading-relaxed overflow-x-auto bg-black/70 text-neon/85 p-4 m-0 flex-1">
                            <code>{h.snippet}</code>
                          </pre>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 px-4 sm:px-6 lg:px-0 text-[10px] font-mono-terminal text-muted-foreground/50">
                      ← swipe →
                    </div>
                  </div>
                </section>
              )}

              {/* ── 07 // CHALLENGES (bento 2-col) ── */}
              {cs.challenges && cs.challenges.length > 0 && (
                <section>
                  <FadeIn>
                    <SectionDivider number="07" title="Fixes" id="sec-challenges" />
                    <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground leading-tight mt-8 mb-8">
                      Какво счупи production
                    </h2>
                  </FadeIn>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-fr">
                    {cs.challenges.map((ch, i) => (
                      <FadeIn key={i} delay={i * 0.05}>
                        <div className="rounded-2xl border border-border bg-surface p-5 md:p-6 h-full">
                          <div className="flex items-start gap-2.5 mb-4">
                            <Wrench size={16} className="text-orange-400 shrink-0 mt-1" />
                            <h3 className="font-display text-base md:text-lg font-bold text-foreground leading-snug">
                              {ch.title}
                            </h3>
                          </div>
                          <div className="space-y-3 text-sm">
                            <div>
                              <span className="font-mono-terminal text-[10px] text-orange-400/80 uppercase tracking-wider block mb-1">
                                Problem
                              </span>
                              <p className="text-muted-foreground leading-relaxed">
                                {ch.problem}
                              </p>
                            </div>
                            <div>
                              <span className="font-mono-terminal text-[10px] text-neon/80 uppercase tracking-wider block mb-1">
                                Fix
                              </span>
                              <p className="text-muted-foreground leading-relaxed">
                                {ch.solution}
                              </p>
                            </div>
                            {ch.filesPaths && ch.filesPaths.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/40">
                                {ch.filesPaths.map((fp) => (
                                  <span
                                    key={fp}
                                    className="inline-flex items-center gap-1 font-mono-terminal text-[10px] text-muted-foreground/70 bg-black/30 border border-border/40 px-1.5 py-0.5 rounded"
                                  >
                                    <FileCode2 size={9} />
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
                </section>
              )}

              {/* ── LEAD GATE (full-width inside article) ── */}
              <section>
                <FadeIn>
                  <CaseStudyLeadGate projectName={cs.name} />
                </FadeIn>
              </section>

              {/* ── 08 // PERFORMANCE ── */}
              {cs.performance && (
                <section>
                  <FadeIn>
                    <SectionDivider number="08" title="Performance" id="sec-perf" />
                    <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground leading-tight mt-8 mb-3">
                      Реални числа
                    </h2>
                    {cs.performance.notes && (
                      <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-8 max-w-3xl">
                        {cs.performance.notes}
                      </p>
                    )}
                  </FadeIn>
                  {cs.performance.lighthouse && (
                    <FadeIn delay={0.1}>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        {Object.entries(cs.performance.lighthouse).map(([k, v]) => (
                          <div
                            key={k}
                            className="rounded-xl border border-border bg-surface p-4 relative overflow-hidden"
                          >
                            <div className="font-display text-4xl md:text-5xl font-bold text-neon leading-none mb-1">
                              {v}
                            </div>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono-terminal">
                              {k === "bestPractices" ? "Best Practices" : k}
                            </div>
                            {/* micro sparkline bar */}
                            <div className="mt-2 h-0.5 bg-border/50 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-neon"
                                style={{ width: `${Math.min(100, v as number)}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </FadeIn>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {cs.performance.coreWebVitals && (
                      <FadeIn delay={0.15}>
                        <div className="rounded-xl border border-border bg-surface p-5">
                          <div className="flex items-center gap-1.5 font-mono-terminal text-[10px] text-neon/70 uppercase tracking-[0.15em] mb-3">
                            <Zap size={12} />
                            Core Web Vitals
                          </div>
                          <dl className="grid grid-cols-3 gap-2">
                            {Object.entries(cs.performance.coreWebVitals).map(([k, v]) => (
                              <div key={k}>
                                <dt className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono-terminal">
                                  {k}
                                </dt>
                                <dd className="font-mono-terminal text-sm text-foreground mt-0.5">
                                  {v}
                                </dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                      </FadeIn>
                    )}
                    {cs.performance.bundleSize && (
                      <FadeIn delay={0.2}>
                        <div className="rounded-xl border border-border bg-surface p-5">
                          <div className="flex items-center gap-1.5 font-mono-terminal text-[10px] text-neon/70 uppercase tracking-[0.15em] mb-3">
                            <FileCode2 size={12} />
                            Bundle size
                          </div>
                          <dl className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <dt className="text-muted-foreground text-xs">first load js</dt>
                              <dd className="font-mono-terminal text-foreground">
                                {cs.performance.bundleSize.firstLoadJs}
                              </dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-muted-foreground text-xs">largest route</dt>
                              <dd className="font-mono-terminal text-foreground text-xs">
                                {cs.performance.bundleSize.largestRoute}
                              </dd>
                            </div>
                          </dl>
                        </div>
                      </FadeIn>
                    )}
                  </div>
                </section>
              )}

              {/* ── LIVING METRICS (dense grid) ── */}
              {cs.livingMetrics && (
                <section>
                  <FadeIn>
                    <div className="flex items-baseline justify-between gap-4 mb-4 flex-wrap">
                      <h3 className="font-display text-xl md:text-2xl font-bold text-foreground">
                        Живи метрики
                      </h3>
                      {cs.livingMetrics.notes && (
                        <span className="text-[11px] text-muted-foreground/60 italic font-mono-terminal">
                          {cs.livingMetrics.notes}
                        </span>
                      )}
                    </div>
                  </FadeIn>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(cs.livingMetrics)
                      .filter(([k]) => k !== "notes")
                      .map(([k, v]) => (
                        <div
                          key={k}
                          className="rounded-lg border border-border/60 bg-surface/60 p-3"
                        >
                          <div className="font-mono-terminal text-[9px] text-muted-foreground/70 uppercase tracking-wider mb-1">
                            {k.replace(/([A-Z])/g, " $1").toLowerCase()}
                          </div>
                          <div className="text-sm font-mono-terminal font-semibold text-foreground">
                            {v}
                          </div>
                        </div>
                      ))}
                  </div>
                </section>
              )}

              {/* ── 09 // LESSONS (alternating asymmetric) ── */}
              {cs.lessonsLearned && cs.lessonsLearned.length > 0 && (
                <section>
                  <FadeIn>
                    <SectionDivider number="09" title="Lessons" id="sec-lessons" />
                    <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground leading-tight mt-8 mb-3">
                      Какво бихме направили иначе
                    </h2>
                    <p className="text-base text-muted-foreground mb-8 max-w-2xl">
                      Честно за грешките. Те правят следващия проект по-добър.
                    </p>
                  </FadeIn>
                  <div className="space-y-4">
                    {cs.lessonsLearned.map((lesson, i) => {
                      const isOdd = i % 2 === 1;
                      return (
                        <FadeIn key={i} delay={i * 0.05}>
                          <div
                            className={`grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4 md:gap-6 ${
                              isOdd ? "md:pl-12" : ""
                            }`}
                          >
                            <div className="flex md:flex-col items-center md:items-start gap-3 md:gap-1">
                              <div className="font-display text-4xl md:text-5xl font-bold text-neon/20 leading-none">
                                {String(i + 1).padStart(2, "0")}
                              </div>
                              <Sparkles
                                size={14}
                                className="text-neon hidden md:block mt-2"
                              />
                            </div>
                            <div className="rounded-2xl border border-border bg-surface p-5 md:p-6">
                              <h3 className="font-display text-lg md:text-xl font-bold text-foreground leading-snug mb-3">
                                {lesson.title}
                              </h3>
                              <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
                                {lesson.detail}
                              </p>
                              <div className="border-l-2 border-neon/40 pl-4 py-1">
                                <span className="font-mono-terminal text-[10px] text-neon/70 uppercase tracking-wider block mb-1">
                                  Would do differently
                                </span>
                                <p className="text-sm text-muted-foreground italic leading-relaxed">
                                  {lesson.wouldDoDifferently}
                                </p>
                              </div>
                            </div>
                          </div>
                        </FadeIn>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* ── 10 // RESULTS ── */}
              <section>
                <FadeIn>
                  <SectionDivider number="10" title="Results" id="sec-results" />
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground leading-tight mt-8 mb-3">
                    {cs.results.title}
                  </h2>
                  <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-8 max-w-3xl">
                    {cs.results.description}
                  </p>
                </FadeIn>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {cs.results.metrics.map((metric, i) => (
                    <FadeIn key={metric.label} delay={i * 0.05}>
                      <div className="rounded-2xl border border-border bg-surface p-5 md:p-6 relative overflow-hidden group">
                        <div className="font-display text-3xl md:text-4xl font-bold text-neon leading-none mb-2">
                          {metric.value}
                        </div>
                        <div className="text-xs md:text-sm text-muted-foreground leading-tight">
                          {metric.label}
                        </div>
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 bg-gradient-to-br from-neon/0 to-neon/5 opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                    </FadeIn>
                  ))}
                </div>
              </section>

              {/* ── TESTIMONIAL ── */}
              {testimonial && (
                <section>
                  <FadeIn>
                    <div className="rounded-2xl border border-border bg-gradient-to-br from-surface to-background p-8 md:p-10 relative overflow-hidden">
                      <Quote
                        size={48}
                        className="text-neon/10 absolute top-6 left-6"
                        aria-hidden="true"
                      />
                      <blockquote className="text-base md:text-xl text-foreground leading-relaxed pl-10 md:pl-14 font-display italic">
                        „{testimonial.quote}"
                      </blockquote>
                      <div className="mt-6 pl-10 md:pl-14 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-neon/10 border border-neon/30 flex items-center justify-center text-neon font-display font-bold text-sm">
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
                </section>
              )}

              {/* ── FINAL CTA ── */}
              <section>
                <FadeIn>
                  <div className="rounded-2xl border border-neon/30 bg-gradient-to-br from-neon/5 via-transparent to-transparent p-8 md:p-12 text-center">
                    <div className="font-mono-terminal text-[10px] text-neon/60 tracking-[0.25em] uppercase mb-3">
                      // next up
                    </div>
                    <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
                      Имаш подобен проект?
                    </h2>
                    <p className="text-base text-muted-foreground mb-6 max-w-lg mx-auto">
                      30-минутна безплатна консултация. Без ангажимент.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                      <CtaButton href="/#contact" variant="neon">
                        Безплатна консултация
                      </CtaButton>
                      <CtaButton href="/projects" variant="outline">
                        Виж други проекти
                      </CtaButton>
                    </div>
                  </div>
                </FadeIn>
              </section>
            </article>

            {/* TOC — sticky sidebar on xl+ */}
            <CaseStudyTOC items={tocItems} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
