"use client";

import { ArrowRight, ChevronRight } from "lucide-react";
import { SERVICES, SERVICES_SECTION } from "@/lib/constants";
import { SectionWrapper } from "@/components/layout/section-wrapper";
import { Card, CardContent } from "@/components/ui/card";
import { FadeIn } from "@/components/animations/fade-in";
import { StaggerChildren, StaggerItem } from "@/components/animations/stagger-children";

export function Services() {
  return (
    <SectionWrapper id="services">
      <FadeIn>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              {SERVICES_SECTION.title}
            </h2>
            <p className="mt-4 text-base md:text-lg text-muted-foreground">
              {SERVICES_SECTION.subtitle}
            </p>
          </div>
          <a
            href="#services"
            aria-label={SERVICES_SECTION.viewAll}
            className="hidden md:inline-flex items-center gap-2 text-neon font-display font-bold text-sm tracking-wide hover:text-foreground transition-colors whitespace-nowrap"
          >
            {SERVICES_SECTION.viewAll} <ArrowRight size={16} />
          </a>
        </div>
      </FadeIn>

      <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {SERVICES.map((service) => {
          const ServiceIcon = service.icon;
          return (
            <StaggerItem key={service.id}>
              <Card className="bg-surface border-border hover:border-neon/30 transition-all duration-300 group h-full relative overflow-hidden holo-card">
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-b from-neon/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <CardContent className="p-6 md:p-8 relative z-10 flex flex-col h-full">
                  {/* Terminal tag */}
                  <span className="font-mono-terminal text-[10px] text-neon/40 tracking-[0.25em] mb-4 block">
                    {`// ${service.tag}`}
                  </span>

                  {/* Icon box */}
                  <div className="w-12 h-12 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center mb-6 text-neon group-hover:bg-neon group-hover:text-primary-foreground transition-colors duration-300">
                    <ServiceIcon size={24} />
                  </div>

                  <h3 className="font-display text-xl font-bold text-foreground mb-3 group-hover:text-neon transition-colors">
                    {service.title}
                  </h3>

                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                    {service.description}
                  </p>

                  <ul className="space-y-2 flex-1">
                    {service.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <span className="font-mono-terminal text-neon text-xs">&gt;</span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Learn more link */}
                  <a
                    href="#contact"
                    aria-label={`${SERVICES_SECTION.learnMore} за ${service.title}`}
                    className="inline-flex items-center text-xs font-bold font-display uppercase tracking-wider text-muted-foreground group-hover:text-neon transition-colors mt-6"
                  >
                    {SERVICES_SECTION.learnMore}{" "}
                    <ChevronRight className="ml-1" size={14} />
                  </a>
                </CardContent>
              </Card>
            </StaggerItem>
          );
        })}
      </StaggerChildren>
    </SectionWrapper>
  );
}
