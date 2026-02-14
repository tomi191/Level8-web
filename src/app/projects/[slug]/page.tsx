import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Clock, Calendar, Quote } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CircuitDivider } from "@/components/animations/circuit-divider";
import { FadeIn } from "@/components/animations/fade-in";
import { StaggerChildren, StaggerItem } from "@/components/animations/stagger-children";
import { CtaButton } from "@/components/shared/cta-button";
import { TESTIMONIALS } from "@/lib/constants";
import { getCaseStudy, getAllCaseStudySlugs } from "@/lib/case-studies";

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
      siteName: "\u041B\u0415\u0412\u0415\u041B 8",
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

  return (
    <>
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
                {"// \u041F\u0420\u0415\u0414\u0418\u0417\u0412\u0418\u041A\u0410\u0422\u0415\u041B\u0421\u0422\u0412\u041E\u0422\u041E"}
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
                {"// \u0420\u0415\u0428\u0415\u041D\u0418\u0415\u0422\u041E"}
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

        <CircuitDivider />

        {/* ── Tech Stack ── */}
        <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <FadeIn>
              <span className="font-mono-terminal text-neon/40 text-xs tracking-[0.25em] uppercase block mb-6">
                {"// \u0422\u0415\u0425\u041D\u041E\u041B\u041E\u0413\u0418\u0418"}
              </span>
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
            </FadeIn>
          </div>
        </section>

        <CircuitDivider />

        {/* ── Results ── */}
        <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-surface">
          <div className="mx-auto max-w-4xl">
            <FadeIn>
              <div className="text-center mb-10 md:mb-14">
                <span className="font-mono-terminal text-neon/40 text-xs tracking-[0.25em] uppercase">
                  {"// \u0420\u0415\u0417\u0423\u041B\u0422\u0410\u0422\u0418"}
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
                {"// \u0421\u041B\u0415\u0414\u0412\u0410\u0429\u0410 \u0421\u0422\u042A\u041F\u041A\u0410"}
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
