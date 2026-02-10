import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  accent?: boolean;
}

export function StatCard({ label, value, icon: Icon, accent }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-surface p-5 md:p-6 transition-colors",
        accent ? "border-neon/30 bg-neon/5" : "border-border"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono text-muted-foreground/60 tracking-wider uppercase">
          {label}
        </span>
        <Icon
          size={18}
          className={cn(accent ? "text-neon" : "text-muted-foreground/40")}
        />
      </div>
      <span
        className={cn(
          "font-display text-3xl md:text-4xl font-bold block",
          accent ? "text-neon" : "text-foreground"
        )}
      >
        {value}
      </span>
    </div>
  );
}
