"use client";

import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { PORTFOLIO, PORTFOLIO_SECTION } from "@/lib/constants";
import { SectionWrapper } from "@/components/layout/section-wrapper";
import { FadeIn } from "@/components/animations/fade-in";
import { SpotlightCard } from "@/components/animations/spotlight-card";
import { DecryptedText } from "@/components/animations/decrypted-text";

function getDomain(url: string) {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

function ProjectCard({ project }: { project: (typeof PORTFOLIO)[number] }) {
  return (
    <SpotlightCard className="bg-surface border border-border rounded-2xl hover:border-neon/30 transition-all duration-300 group h-full">
      <div className="relative z-10 flex flex-col h-full">
        {/* Browser mockup frame */}
        <div className="m-3 mb-0 rounded-t-lg border border-border/50 overflow-hidden bg-black/30">
          <div className="flex items-center gap-2 px-3 py-2 bg-black/40 border-b border-border/30">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
            </div>
            <span className="flex-1 text-center font-mono-terminal text-[10px] text-muted-foreground/50 truncate">
              {getDomain(project.url)}
            </span>
          </div>
          <div className="relative aspect-video">
            <Image
              src={project.image}
              alt={`Screenshot на ${project.name}`}
              fill
              className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
              sizes="420px"
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-5 pt-4 flex flex-col flex-1">
          <span className="font-mono-terminal text-[10px] text-neon/40 tracking-[0.25em] mb-3 block">
            {`// ${project.tags[0].toUpperCase()}`}
          </span>

          <DecryptedText
            text={project.name}
            as="h3"
            className="font-display text-xl font-bold text-foreground mb-2 group-hover:text-neon transition-colors"
          />

          <p className="text-sm text-muted-foreground mb-3 leading-relaxed flex-1">
            {project.description}
          </p>

          {project.result && (
            <p className="text-xs font-bold text-neon mb-4 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-neon animate-pulse" aria-hidden="true" />
              {project.result}
            </p>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-md bg-neon/5 border border-neon/10 text-[11px] font-mono-terminal text-neon/60"
              >
                {tag}
              </span>
            ))}
          </div>

          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-bold font-display uppercase tracking-wider text-muted-foreground group-hover:text-neon transition-colors"
          >
            Виж сайта <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </SpotlightCard>
  );
}

export function Portfolio() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <SectionWrapper id="portfolio">
      <FadeIn>
        <div className="text-center mb-12 md:mb-16">
          <span className="font-mono-terminal text-neon/40 text-xs tracking-[0.25em] uppercase">
            {"// "}{PORTFOLIO_SECTION.tag}
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mt-4">
            {PORTFOLIO_SECTION.title}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon to-emerald-400 glitch-hover">
              {PORTFOLIO_SECTION.titleAccent}
            </span>
          </h2>
          <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            {PORTFOLIO_SECTION.subtitle}
          </p>
        </div>
      </FadeIn>

      {prefersReducedMotion ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PORTFOLIO.map((project) => (
            <div key={project.id}>
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      ) : (
        <div
          className="relative group overflow-hidden"
          style={{
            maskImage: "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
          }}
        >
          <div className="flex gap-6 w-max animate-[marquee_60s_linear_infinite] group-hover:[animation-play-state:paused]">
            {[...PORTFOLIO, ...PORTFOLIO].map((project, i) => (
              <div
                key={`${project.id}-${i}`}
                className="w-[85vw] sm:w-[400px] lg:w-[420px] shrink-0"
              >
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        </div>
      )}
    </SectionWrapper>
  );
}
