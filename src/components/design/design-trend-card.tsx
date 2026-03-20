"use client";

import type { ComponentType } from "react";
import type { DesignTrend } from "@/types";
import { CtaButton } from "@/components/shared/cta-button";
import { BentoGridPreview } from "./previews/bento-grid-preview";
import { GlassmorphismPreview } from "./previews/glassmorphism-preview";
import { DarkPremiumPreview } from "./previews/dark-premium-preview";
import { BoldTypographyPreview } from "./previews/bold-typography-preview";
import { MinimalistPreview } from "./previews/minimalist-preview";
import { NeobrutalismPreview } from "./previews/neobrutalism-preview";
import { ParallaxDepthPreview } from "./previews/parallax-depth-preview";
import { AuroraGradientPreview } from "./previews/aurora-gradient-preview";

const previewMap: Record<string, ComponentType> = {
  "bento-grid": BentoGridPreview,
  glassmorphism: GlassmorphismPreview,
  "dark-premium": DarkPremiumPreview,
  "bold-typography": BoldTypographyPreview,
  minimalist: MinimalistPreview,
  neobrutalism: NeobrutalismPreview,
  "parallax-depth": ParallaxDepthPreview,
  "aurora-gradient": AuroraGradientPreview,
};

interface DesignTrendCardProps {
  trend: DesignTrend;
}

export function DesignTrendCard({ trend }: DesignTrendCardProps) {
  const Preview = previewMap[trend.id];

  return (
    <div className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden hover:border-neon/20 transition-colors duration-300">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.03] border-b border-white/[0.06]">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 mx-3">
          <div className="bg-white/[0.05] rounded-md px-3 py-1 text-[10px] text-muted-foreground/50 font-mono truncate text-center">
            {trend.nameEn.toLowerCase().replace(/\s/g, "-")}.design
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="overflow-hidden">
        {Preview ? <Preview /> : null}
      </div>

      {/* Info section */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-wider">
            // {trend.nameEn}
          </div>
          <div className="text-[10px] text-muted-foreground/40 font-mono">
            {trend.year}
          </div>
        </div>

        <h3 className="text-lg font-bold text-foreground mb-2">
          {trend.name}
        </h3>

        <p className="text-sm text-muted-foreground/70 leading-relaxed mb-3">
          {trend.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {trend.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-[10px] rounded bg-white/[0.05] text-muted-foreground/60 border border-white/[0.06]"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* When to use */}
        <p className="text-xs text-muted-foreground/50 italic mb-4">
          {trend.whenToUse}
        </p>

        {/* CTA */}
        <CtaButton href="/#contact" variant="outline" className="w-full">
          {"Искам такъв сайт →"}
        </CtaButton>
      </div>
    </div>
  );
}
