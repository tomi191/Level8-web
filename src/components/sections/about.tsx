"use client";

import { Code2, BarChart3, Handshake } from "lucide-react";
import { ABOUT, ABOUT_SECTION } from "@/lib/constants";
import { SectionWrapper } from "@/components/layout/section-wrapper";
import { FadeIn } from "@/components/animations/fade-in";
import { StaggerChildren, StaggerItem } from "@/components/animations/stagger-children";

const iconMap = { Code2, BarChart3, Handshake } as const;

export function About() {
  return (
    <SectionWrapper id="about" className="bg-data-stream">
      {/* Section heading */}
      <FadeIn>
        <div className="text-center mb-12 md:mb-16">
          <span className="font-mono-terminal text-neon/40 text-xs tracking-[0.25em] uppercase">
            {"// "}{ABOUT_SECTION.tag}
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mt-4">
            {ABOUT_SECTION.title}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon to-emerald-400">
              {ABOUT_SECTION.titleAccent}
            </span>
          </h2>
          <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            {ABOUT_SECTION.subtitle}
          </p>
        </div>
      </FadeIn>

      {/* Story + Stats two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-16 md:mb-20">
        {/* Story paragraphs — left 3/5 */}
        <FadeIn className="lg:col-span-3 space-y-5">
          {ABOUT.story.map((paragraph, i) => (
            <p key={i} className="text-base md:text-lg text-muted-foreground leading-relaxed">
              {paragraph}
            </p>
          ))}
        </FadeIn>

        {/* Stats card — right 2/5 */}
        <FadeIn direction="right" delay={0.2} className="lg:col-span-2">
          <div className="rounded-2xl border border-border bg-surface overflow-hidden h-full">
            {/* Terminal chrome */}
            <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/5">
              <span className="w-2 h-2 rounded-full bg-red-500/50" />
              <span className="w-2 h-2 rounded-full bg-yellow-500/50" />
              <span className="w-2 h-2 rounded-full bg-green-500/50" />
              <span className="font-mono-terminal text-[10px] text-muted-foreground/50 ml-2 tracking-wider">
                level8 stats --team
              </span>
            </div>
            {/* Stats 2x2 grid */}
            <div className="p-6 md:p-8 grid grid-cols-2 gap-6">
              {ABOUT.stats.map((stat) => (
                <div key={stat.label} className="flex flex-col">
                  <span className="text-2xl md:text-3xl font-display font-bold text-neon">
                    {stat.value}
                  </span>
                  <span className="text-sm text-muted-foreground mt-1">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>

      {/* Values grid — 3 cards */}
      <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {ABOUT.values.map((value) => {
          const Icon = iconMap[value.icon as keyof typeof iconMap];
          return (
            <StaggerItem key={value.title}>
              <div className="rounded-2xl border border-border bg-surface p-6 md:p-8 h-full flex flex-col group hover:border-neon/30 transition-all duration-300">
                <div className="w-12 h-12 rounded-lg bg-neon/10 border border-neon/20 flex items-center justify-center mb-5 text-neon group-hover:bg-neon group-hover:text-primary-foreground transition-colors duration-300">
                  <Icon size={24} />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </div>
            </StaggerItem>
          );
        })}
      </StaggerChildren>
    </SectionWrapper>
  );
}
