"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export interface MrrSnapshot {
  month: string;
  mrr: number;
  active_services: number;
}

interface MrrChartProps {
  snapshots: MrrSnapshot[];
}

const MONTH_LABELS: Record<number, string> = {
  0: "Яну",
  1: "Фев",
  2: "Мар",
  3: "Апр",
  4: "Май",
  5: "Юни",
  6: "Юли",
  7: "Авг",
  8: "Сеп",
  9: "Окт",
  10: "Ное",
  11: "Дек",
};

function formatAmount(amount: number): string {
  return (
    new Intl.NumberFormat("bg-BG", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + " \u20ac"
  );
}

export function MrrChart({ snapshots }: MrrChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (snapshots.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="px-5 py-4 border-b border-border/50">
          <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
            // MRR TREND
          </span>
          <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
            MRR история
          </h2>
        </div>
        <div className="p-8 text-center">
          <p className="font-mono text-sm text-muted-foreground/50">
            $ crm mrr --history
          </p>
          <p className="font-mono text-sm text-muted-foreground/50 mt-1">
            0 snapshots found
          </p>
          <p className="text-xs text-muted-foreground/30 mt-3">
            MRR данните ще се попълнят автоматично.
          </p>
        </div>
      </div>
    );
  }

  // Compute max value for bar heights
  const maxMrr = Math.max(...snapshots.map((s) => s.mrr), 1);

  // Growth percentages
  const growths = snapshots.map((s, i) => {
    if (i === 0) return null;
    const prev = snapshots[i - 1].mrr;
    if (prev === 0) return null;
    return ((s.mrr - prev) / prev) * 100;
  });

  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden">
      <div className="px-5 py-4 border-b border-border/50">
        <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
          // MRR TREND
        </span>
        <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
          MRR история
        </h2>
      </div>

      <div className="p-5">
        {/* Tooltip for hovered bar */}
        <div className="h-6 mb-2">
          {hoveredIdx !== null && (
            <div className="flex items-center gap-3 text-xs">
              <span className="font-mono text-neon font-bold">
                {formatAmount(snapshots[hoveredIdx].mrr)}
              </span>
              <span className="text-muted-foreground/60">
                {snapshots[hoveredIdx].active_services} услуги
              </span>
              {growths[hoveredIdx] !== null && growths[hoveredIdx] !== undefined && (
                <span
                  className={cn(
                    "font-mono",
                    growths[hoveredIdx]! >= 0 ? "text-emerald-400" : "text-red-400"
                  )}
                >
                  {growths[hoveredIdx]! >= 0 ? "+" : ""}
                  {growths[hoveredIdx]!.toFixed(1)}%
                </span>
              )}
            </div>
          )}
        </div>

        {/* Chart bars */}
        <div className="flex items-end gap-1.5 h-[140px]">
          {snapshots.map((snapshot, idx) => {
            const heightPct = (snapshot.mrr / maxMrr) * 100;
            const monthDate = new Date(snapshot.month);
            const monthLabel = MONTH_LABELS[monthDate.getMonth()] ?? "";
            const isHovered = hoveredIdx === idx;
            const growth = growths[idx];

            return (
              <div
                key={snapshot.month}
                className="flex-1 flex flex-col items-center gap-1"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Growth indicator */}
                <div className="h-4 flex items-center">
                  {growth !== null && growth !== undefined && (
                    <span
                      className={cn(
                        "text-[8px] font-mono transition-opacity",
                        isHovered ? "opacity-100" : "opacity-0",
                        growth >= 0 ? "text-emerald-400" : "text-red-400"
                      )}
                    >
                      {growth >= 0 ? "\u2191" : "\u2193"}
                    </span>
                  )}
                </div>

                {/* Bar */}
                <div className="w-full flex items-end h-[100px]">
                  <div
                    className={cn(
                      "w-full rounded-t-sm transition-all duration-200 cursor-pointer min-h-[4px]",
                      isHovered
                        ? "bg-neon shadow-[0_0_12px_rgba(57,255,20,0.3)]"
                        : "bg-neon/40 hover:bg-neon/60"
                    )}
                    style={{ height: `${Math.max(heightPct, 3)}%` }}
                  />
                </div>

                {/* Month label */}
                <span
                  className={cn(
                    "text-[9px] font-mono transition-colors",
                    isHovered ? "text-neon" : "text-muted-foreground/40"
                  )}
                >
                  {monthLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
