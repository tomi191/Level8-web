"use client";

import { ABOUT } from "@/lib/constants";
import { SectionWrapper } from "@/components/layout/section-wrapper";
import { SectionHeading } from "@/components/shared/section-heading";
import { FadeIn } from "@/components/animations/fade-in";

export function About() {
  return (
    <SectionWrapper id="about" className="bg-data-stream">
      <FadeIn>
        <SectionHeading title={ABOUT.title} />
      </FadeIn>

      <FadeIn>
        <div className="max-w-3xl mx-auto space-y-4">
          {ABOUT.story.map((paragraph, i) => (
            <p key={i} className="text-base md:text-lg text-muted-foreground leading-relaxed text-center">
              {paragraph}
            </p>
          ))}
        </div>
      </FadeIn>
    </SectionWrapper>
  );
}
