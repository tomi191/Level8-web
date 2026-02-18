import { Fragment } from "react";
import { HERO } from "@/lib/constants";
import { CtaButton } from "@/components/shared/cta-button";
import { AnimatedEight } from "@/components/animations/animated-eight";
import { TypingText } from "@/components/animations/typing-text";
import { SectionWrapper } from "@/components/layout/section-wrapper";
import { GridSpotlight } from "@/components/animations/grid-spotlight";

export function Hero() {
  return (
    <SectionWrapper
      id="hero"
      className="min-h-dvh flex items-center pt-24 md:pt-20 bg-grid-pattern overflow-hidden"
    >
      <GridSpotlight />

      {/* Ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-neon/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      {/* Vignette overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_30%,oklch(0.07_0_0)_75%)]" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Text side */}
        <div className="space-y-6">
          {/* Badge — CSS fade-up */}
          <div className="hero-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neon/30 bg-neon/5 w-fit">
              <span className="w-2 h-2 rounded-full bg-neon animate-pulse" />
              <span className="text-xs font-display font-medium text-neon tracking-widest uppercase">
                {HERO.badge}
              </span>
            </div>
          </div>

          {/* H1 — CSS transform-only entrance (no opacity delay = instant LCP) */}
          <h1 className="hero-title-enter font-display text-5xl md:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1]">
            {HERO.title}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
              {HERO.titleLine2}
            </span>
            <br />
            <span className="text-neon text-glow-neon glitch-hover">{HERO.titleAccent}</span>
          </h1>

          {/* Subtitle — terminal typing effect */}
          <TypingText
            text={HERO.subtitle}
            className="text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed"
            delay={0.8}
            as="p"
          />

          {/* CTAs — CSS fade-up with delay */}
          <div
            className="flex flex-col sm:flex-row gap-4 hero-fade-up"
            style={{ animationDelay: "0.35s" }}
          >
            <CtaButton href="#contact" variant="neon">
              {HERO.cta}
            </CtaButton>
            <CtaButton href="#services" variant="outline">
              {HERO.ctaSecondary}
            </CtaButton>
          </div>

          {/* Stats bar — CSS fade-up with delay */}
          <div
            className="flex items-center gap-6 mt-8 pt-8 border-t border-white/10 hero-fade-up"
            style={{ animationDelay: "0.5s" }}
          >
            {HERO.stats.map((stat, i) => (
              <Fragment key={stat.label}>
                {i > 0 && <div className="w-px h-10 bg-white/10" />}
                <div className="flex flex-col">
                  <span className="text-2xl font-display font-bold font-mono-terminal text-neon/90 text-glow-neon">
                    {stat.value}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {stat.label}
                  </span>
                </div>
              </Fragment>
            ))}
          </div>
        </div>

        {/* Animated 8 — dramatic reveal */}
        <div className="flex flex-col items-center justify-center lg:items-end">
          <div
            className="flex items-center justify-center lg:justify-end hero-fade-up"
            style={{ animationDelay: "0.3s" }}
          >
            <AnimatedEight />
          </div>
          {/* System status indicator */}
          <div className="mt-4 flex items-center gap-2 justify-center lg:justify-end opacity-40">
            <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse" />
            <span className="font-mono-terminal text-xs text-neon tracking-wider glitch-loop">
              SYSTEM ONLINE
            </span>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
