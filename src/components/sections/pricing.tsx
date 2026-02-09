"use client";

import { PRICING, PRICING_SECTION } from "@/lib/constants";
import { SectionWrapper } from "@/components/layout/section-wrapper";
import { Card, CardContent } from "@/components/ui/card";
import { CtaButton } from "@/components/shared/cta-button";
import { FadeIn } from "@/components/animations/fade-in";
import { StaggerChildren, StaggerItem } from "@/components/animations/stagger-children";
import { cn } from "@/lib/utils";

const elevatedIds = new Set(["ai-bot", "custom"]);

export function Pricing() {
  return (
    <SectionWrapper id="pricing">
      {/* Section header */}
      <FadeIn>
        <div className="text-center mb-12 md:mb-16">
          <span className="font-mono-terminal text-neon/60 text-xs tracking-[0.25em] uppercase">
            {"// "}{PRICING_SECTION.tag}
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mt-4">
            {PRICING_SECTION.title}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon to-emerald-400">
              {PRICING_SECTION.titleAccent}
            </span>
          </h2>
          <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            {PRICING_SECTION.subtitle}
          </p>
        </div>
      </FadeIn>

      {/* Mobile: horizontal scroll / Desktop: 5-col grid */}
      <StaggerChildren className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory gap-6 pb-4 lg:grid lg:grid-cols-5 lg:overflow-visible lg:pb-0">
        {PRICING.map((tier) => (
          <StaggerItem
            key={tier.id}
            className={cn(
              "snap-center min-w-[280px] flex-shrink-0 lg:min-w-0 lg:flex-shrink",
              elevatedIds.has(tier.id) && "lg:-translate-y-4"
            )}
          >
            <Card
              className={cn(
                "bg-surface border-border hover:-translate-y-1 transition-all duration-300 group h-full flex flex-col relative",
                tier.highlighted && "border-neon/50 glow-neon",
                tier.badge === "Premium" && "border-gold/50 glow-gold"
              )}
            >
              {/* Floating badge */}
              {tier.badge && (
                <div
                  className={cn(
                    "absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold font-display tracking-wider whitespace-nowrap z-20",
                    tier.badge === "Premium"
                      ? "bg-gold text-primary-foreground"
                      : "bg-neon text-primary-foreground"
                  )}
                >
                  {tier.highlighted ? "НАЙ-ПОПУЛЯРЕН" : "VIP РЕШЕНИЕ"}
                </div>
              )}

              <CardContent className="p-6 flex flex-col flex-1">
                {/* Terminal chrome header */}
                <div className="flex items-center gap-1.5 mb-4 pb-3 border-b border-white/5">
                  <span className="w-2 h-2 rounded-full bg-red-500/50" />
                  <span className="w-2 h-2 rounded-full bg-yellow-500/50" />
                  <span className="w-2 h-2 rounded-full bg-green-500/50" />
                  <span className="font-mono-terminal text-[10px] text-muted-foreground/50 ml-2 tracking-wider">
                    {tier.id}.config
                  </span>
                </div>
                <span className="font-mono-terminal text-sm font-bold tracking-widest text-muted-foreground mb-4">
                  $ {tier.name.toLowerCase()}
                </span>

                <div className="mb-2">
                  <span className="font-display text-3xl md:text-4xl font-bold text-foreground">
                    {tier.price.includes("По") ? "" : `${tier.price} \u20AC`}
                  </span>
                  {tier.price.includes("По") && (
                    <span className="font-display text-xl font-bold text-foreground">
                      {tier.price}
                    </span>
                  )}
                  {tier.period && (
                    <span className="text-sm text-muted-foreground ml-1">
                      {tier.period}
                    </span>
                  )}
                </div>

                <p className="text-sm text-muted-foreground mb-6">
                  {tier.description}
                </p>

                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "font-mono-terminal text-xs mt-0.5 flex-shrink-0",
                          tier.badge === "Premium" ? "text-gold" : "text-neon"
                        )}
                      >
                        [+]
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <CtaButton
                  href="#contact"
                  variant={
                    tier.highlighted
                      ? "neon"
                      : tier.badge === "Premium"
                        ? "gold"
                        : "outline"
                  }
                  className="w-full"
                >
                  {tier.cta}
                </CtaButton>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
      </StaggerChildren>

      {/* "Not sure?" CTA banner */}
      <FadeIn delay={0.3}>
        <div className="mt-16 rounded-2xl border border-border bg-gradient-to-r from-surface to-neon/5 p-8 md:p-12 flex flex-col md:flex-row items-center gap-6 md:gap-12">
          <div className="flex-1 text-center md:text-left">
            <h3 className="font-display text-xl md:text-2xl font-bold text-foreground mb-2">
              {PRICING_SECTION.unsure.title}
            </h3>
            <p className="text-sm md:text-base text-muted-foreground">
              {PRICING_SECTION.unsure.subtitle}
            </p>
          </div>
          <CtaButton href="#contact" variant="neon" className="whitespace-nowrap">
            {PRICING_SECTION.unsure.cta}
          </CtaButton>
        </div>
      </FadeIn>
    </SectionWrapper>
  );
}
