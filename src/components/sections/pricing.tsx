"use client";

import { PRICING, PRICING_SECTION } from "@/lib/constants";
import { SectionWrapper } from "@/components/layout/section-wrapper";
import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CtaButton } from "@/components/shared/cta-button";
import { FadeIn } from "@/components/animations/fade-in";
import { StaggerChildren, StaggerItem } from "@/components/animations/stagger-children";
import { cn } from "@/lib/utils";

export function Pricing() {
  return (
    <SectionWrapper id="pricing">
      <FadeIn>
        <SectionHeading
          title={PRICING_SECTION.title}
          subtitle={PRICING_SECTION.subtitle}
        />
      </FadeIn>

      <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {PRICING.map((tier) => (
          <StaggerItem key={tier.id}>
            <Card
              className={cn(
                "bg-surface border-border transition-all duration-300 group h-full flex flex-col",
                tier.highlighted && "border-neon/50 glow-neon",
                tier.badge === "Premium" && "border-gold/50 glow-gold"
              )}
            >
              <CardContent className="p-6 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-display text-sm font-bold tracking-widest text-muted-foreground">
                    {tier.name}
                  </span>
                  {tier.badge && (
                    <Badge
                      className={cn(
                        "text-xs font-semibold",
                        tier.badge === "Premium"
                          ? "bg-gold/20 text-gold border-gold/40"
                          : "bg-neon/20 text-neon border-neon/40"
                      )}
                      variant="outline"
                    >
                      {tier.badge}
                    </Badge>
                  )}
                </div>

                <div className="mb-2">
                  <span className="font-display text-3xl md:text-4xl font-bold text-foreground">
                    {tier.price.includes("По") ? "" : `${tier.price} лв.`}
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
                      <span className={cn(
                        "mt-0.5 text-xs flex-shrink-0",
                        tier.badge === "Premium" ? "text-gold" : "text-neon"
                      )}>
                        ✓
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <CtaButton
                  href="#contact"
                  variant={tier.highlighted ? "neon" : tier.badge === "Premium" ? "gold" : "outline"}
                  className="w-full"
                >
                  {tier.cta}
                </CtaButton>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
      </StaggerChildren>
    </SectionWrapper>
  );
}
