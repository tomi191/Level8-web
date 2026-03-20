"use client";

import { useState } from "react";
import type { DesignTrend } from "@/types";
import { DESIGN_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { StaggerChildren, StaggerItem } from "@/components/animations/stagger-children";
import { DesignTrendCard } from "./design-trend-card";

interface DesignFilterTabsProps {
  trends: DesignTrend[];
}

export function DesignFilterTabs({ trends }: DesignFilterTabsProps) {
  const [active, setActive] = useState("all");

  const filtered = active === "all" ? trends : trends.filter((t) => t.category === active);

  return (
    <div>
      {/* Filter pills */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {DESIGN_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActive(cat.id)}
            aria-pressed={active === cat.id}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200",
              active === cat.id
                ? "bg-neon text-primary-foreground"
                : "bg-white/[0.05] text-muted-foreground hover:bg-white/[0.08] border border-white/[0.06]"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <StaggerChildren
        key={active}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        {filtered.map((trend) => (
          <StaggerItem key={trend.id}>
            <DesignTrendCard trend={trend} />
          </StaggerItem>
        ))}
      </StaggerChildren>
    </div>
  );
}
