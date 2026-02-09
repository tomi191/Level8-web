"use client";

import {
  Code2, Layers, FileCode2, Braces, Database, Shield,
  Cloud, Server, Smartphone, Wind, Brain, CreditCard,
  Container, Zap,
} from "lucide-react";
import { useReducedMotion } from "motion/react";
import { TECH_STACK } from "@/lib/constants";

const iconMap = {
  Code2, Layers, FileCode2, Braces, Database, Shield,
  Cloud, Server, Smartphone, Wind, Brain, CreditCard,
  Container, Zap,
} as const;

function TechItem({ name, icon }: { name: string; icon: keyof typeof iconMap }) {
  const Icon = iconMap[icon];
  return (
    <div className="flex items-center gap-3 px-5 py-3 rounded-xl border border-white/5 bg-white/[0.02] hover:border-neon/30 hover:bg-neon/5 transition-all duration-300 shrink-0">
      <div className="size-8 rounded-md bg-white/5 flex items-center justify-center text-neon/60">
        <Icon size={18} />
      </div>
      <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
        {name}
      </span>
    </div>
  );
}

export function TechStack() {
  const prefersReducedMotion = useReducedMotion();
  const items = TECH_STACK.items;

  return (
    <section className="border-t border-white/5 py-10 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center font-mono-terminal text-xs text-neon/40 uppercase tracking-[0.25em] mb-8">
          {"// "}{TECH_STACK.label}
        </p>
      </div>

      {prefersReducedMotion ? (
        /* Static grid for reduced motion */
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {items.map((tech) => (
              <TechItem key={tech.name} name={tech.name} icon={tech.icon} />
            ))}
          </div>
        </div>
      ) : (
        /* Infinite marquee */
        <div
          className="relative group"
          style={{
            maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          }}
        >
          <div
            className="flex gap-6 w-max animate-[marquee_30s_linear_infinite] group-hover:[animation-play-state:paused]"
          >
            {/* Duplicate items for seamless loop */}
            {[...items, ...items].map((tech, i) => (
              <TechItem key={`${tech.name}-${i}`} name={tech.name} icon={tech.icon} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
