"use client";

import { ChevronDown } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { PAIN_POINTS, PAIN_SECTION } from "@/lib/constants";
import { SectionWrapper } from "@/components/layout/section-wrapper";
import { FadeIn } from "@/components/animations/fade-in";
import { StaggerChildren, StaggerItem } from "@/components/animations/stagger-children";

const ELECTRIC_ARC =
  "M0,8 L8,8 L11,2 L14,14 L18,3 L22,13 L25,6 L30,11 L34,2 L38,14 L42,5 L46,12 L50,3 L54,13 L58,7 L62,11 L66,2 L70,14 L74,6 L78,10 L82,3 L86,13 L90,8 L94,4 L97,12 L100,8";

export function PainPoints() {
  return (
    <SectionWrapper id="problem">
      <FadeIn>
        <div className="text-center mb-12 md:mb-16">
          <span className="font-mono-terminal text-destructive/60 text-xs tracking-[0.25em] uppercase">
            {"// "}{PAIN_SECTION.tag}
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mt-4">
            {PAIN_SECTION.title}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800 glitch-hover">
              {PAIN_SECTION.titleAccent}
            </span>
          </h2>
          <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            {PAIN_SECTION.subtitle}
          </p>
        </div>
      </FadeIn>

      <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PAIN_POINTS.map((point, index) => {
          const Icon = point.icon;
          const BottomIcon = point.bottomIcon;
          return (
            <StaggerItem key={point.title}>
              <div className="bg-surface border-x border-b border-border rounded-2xl p-8 relative overflow-hidden pain-card-glow group h-full flex flex-col">
                {/* Red gradient overlay */}
                <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-red-900/20 to-transparent pointer-events-none" />

                {/* Electric arc wave */}
                <div className="absolute top-0 left-0 w-full pointer-events-none rounded-t-2xl overflow-hidden">
                  <svg className="w-full h-3" viewBox="0 0 100 16" preserveAspectRatio="none" fill="none">
                    <defs>
                      <filter id={`electric-glow-${index}`} x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    {/* Faint static trace */}
                    <path
                      d={ELECTRIC_ARC}
                      stroke="oklch(0.55 0.22 25 / 0.15)"
                      strokeWidth={0.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Traveling spark */}
                    <motion.path
                      d={ELECTRIC_ARC}
                      stroke="oklch(0.65 0.25 25)"
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      filter={`url(#electric-glow-${index})`}
                      initial={{ pathLength: 0.15, pathOffset: 0 }}
                      animate={{ pathOffset: [0, 1] }}
                      transition={{
                        duration: 1.8 + index * 0.4,
                        repeat: Infinity,
                        ease: "linear",
                        delay: index * 0.3,
                      }}
                    />
                  </svg>
                </div>

                <div className="relative z-10 flex-1">
                  {/* Pulsing icon container */}
                  <div className="relative size-12 mb-6">
                    <div className="absolute inset-0 rounded-lg bg-red-500/5 animate-ping" />
                    <div className="relative size-12 rounded-lg bg-red-900/20 border border-red-900/30 flex items-center justify-center text-destructive" aria-hidden="true">
                      <Icon size={28} strokeWidth={1.5} />
                    </div>
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                    {point.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {point.description}
                  </p>
                </div>

                {/* Bottom label */}
                <div className="relative z-10 mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                  <span className="text-destructive text-sm font-bold flex items-center gap-2">
                    <BottomIcon size={16} /> {point.bottomLabel}
                  </span>
                  <span className="font-mono-terminal text-[10px] text-red-500/30 tracking-wider glitch-hover group-hover:text-red-500/50">
                    ERR://CRITICAL
                  </span>
                </div>
              </div>
            </StaggerItem>
          );
        })}
      </StaggerChildren>

      {/* Solution CTA */}
      <FadeIn delay={0.4}>
        <div className="mt-12 flex flex-col items-center gap-4">
          <p className="text-neon font-display text-xl md:text-2xl font-bold drop-shadow-[0_0_10px_oklch(0.85_0.27_142/0.5)]">
            {PAIN_SECTION.solution}
          </p>
          <ChevronDown className="text-neon animate-bounce" size={28} />
        </div>
      </FadeIn>
    </SectionWrapper>
  );
}
