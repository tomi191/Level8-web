"use client";

import { PAIN_POINTS, PAIN_SECTION } from "@/lib/constants";
import { SectionWrapper } from "@/components/layout/section-wrapper";
import { SectionHeading } from "@/components/shared/section-heading";
import { IconCard } from "@/components/shared/icon-card";
import { FadeIn } from "@/components/animations/fade-in";
import { StaggerChildren, StaggerItem } from "@/components/animations/stagger-children";

export function PainPoints() {
  return (
    <SectionWrapper id="problem">
      <FadeIn>
        <SectionHeading title={PAIN_SECTION.title} subtitle={PAIN_SECTION.subtitle} />
      </FadeIn>

      <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PAIN_POINTS.map((point) => (
          <StaggerItem key={point.title}>
            <IconCard
              icon={point.icon}
              title={point.title}
              description={point.description}
            />
          </StaggerItem>
        ))}
      </StaggerChildren>

      <FadeIn delay={0.4}>
        <p className="mt-12 text-center text-lg md:text-xl font-medium text-neon text-glow-neon">
          {PAIN_SECTION.solution}
        </p>
      </FadeIn>
    </SectionWrapper>
  );
}
