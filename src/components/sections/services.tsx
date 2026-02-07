"use client";

import { SERVICES, SERVICES_SECTION } from "@/lib/constants";
import { SectionWrapper } from "@/components/layout/section-wrapper";
import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/animations/fade-in";
import { StaggerChildren, StaggerItem } from "@/components/animations/stagger-children";

export function Services() {
  return (
    <SectionWrapper id="services">
      <FadeIn>
        <SectionHeading
          title={SERVICES_SECTION.title}
          subtitle={SERVICES_SECTION.subtitle}
        />
      </FadeIn>

      <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SERVICES.map((service) => (
          <StaggerItem key={service.id}>
            <Card className="bg-surface border-border hover:border-neon/30 transition-all duration-300 group h-full">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl">{service.icon}</span>
                  <Badge
                    variant="outline"
                    className="border-neon/40 text-neon font-display text-xs tracking-widest"
                  >
                    {service.tag}
                  </Badge>
                </div>

                <h3 className="font-display text-xl md:text-2xl font-bold text-foreground mb-3 group-hover:text-neon transition-colors">
                  {service.title}
                </h3>

                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  {service.description}
                </p>

                <ul className="space-y-2">
                  {service.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <span className="text-neon text-xs">▸</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
      </StaggerChildren>
    </SectionWrapper>
  );
}
