"use client";

import { ABOUT } from "@/lib/constants";
import { SectionWrapper } from "@/components/layout/section-wrapper";
import { SectionHeading } from "@/components/shared/section-heading";
import { FadeIn } from "@/components/animations/fade-in";

export function About() {
  return (
    <SectionWrapper id="about">
      <FadeIn>
        <SectionHeading title={ABOUT.title} />
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <FadeIn direction="left">
          <div className="space-y-4">
            {ABOUT.story.map((paragraph, i) => (
              <p key={i} className="text-base md:text-lg text-muted-foreground leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </FadeIn>

        <FadeIn direction="right" delay={0.2}>
          <div className="bg-surface rounded-2xl border border-border p-8">
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-6 font-semibold">
              {ABOUT.clients}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ABOUT.clientLogos.map((client) => (
                <div
                  key={client.name}
                  className="p-5 rounded-lg border border-border bg-background/50 hover:border-neon/30 transition-all"
                >
                  <p className="font-display text-lg font-bold text-foreground mb-1">
                    {client.name}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {client.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </SectionWrapper>
  );
}
