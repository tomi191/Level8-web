"use client";

import { motion } from "motion/react";
import { HERO } from "@/lib/constants";
import { CtaButton } from "@/components/shared/cta-button";
import { AnimatedEight } from "@/components/animations/animated-eight";
import { SectionWrapper } from "@/components/layout/section-wrapper";

export function Hero() {
  return (
    <SectionWrapper id="hero" className="min-h-screen flex items-center pt-24 md:pt-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Text side */}
        <div className="space-y-6">
          <motion.h1
            className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0 }}
          >
            {HERO.title}
            <br />
            <span className="text-neon text-glow-neon">{HERO.titleAccent}</span>
          </motion.h1>

          <motion.p
            className="text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {HERO.subtitle}
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <CtaButton href="#contact" variant="neon">
              {HERO.cta}
            </CtaButton>
            <CtaButton href="#services" variant="outline">
              {HERO.ctaSecondary}
            </CtaButton>
          </motion.div>
        </div>

        {/* Animated 8 */}
        <motion.div
          className="flex items-center justify-center lg:justify-end"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <AnimatedEight />
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
