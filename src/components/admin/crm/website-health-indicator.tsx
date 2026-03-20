"use client";

import { cn } from "@/lib/utils";

interface WebsiteHealthIndicatorProps {
  status: "healthy" | "warning" | "critical" | "unknown";
  label: string;
  detail: string;
}

const STATUS_CONFIG: Record<
  WebsiteHealthIndicatorProps["status"],
  { dotClass: string; borderClass: string }
> = {
  healthy: {
    dotClass: "bg-emerald-400",
    borderClass: "border-emerald-500/20",
  },
  warning: {
    dotClass: "bg-amber-400",
    borderClass: "border-amber-500/20",
  },
  critical: {
    dotClass: "bg-red-400",
    borderClass: "border-red-500/20",
  },
  unknown: {
    dotClass: "bg-gray-400",
    borderClass: "border-border",
  },
};

export function WebsiteHealthIndicator({
  status,
  label,
  detail,
}: WebsiteHealthIndicatorProps) {
  const cfg = STATUS_CONFIG[status];

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border bg-surface p-4",
        cfg.borderClass
      )}
    >
      <span
        className={cn(
          "block w-2.5 h-2.5 rounded-full shrink-0 mt-1",
          cfg.dotClass
        )}
      />
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground leading-snug">
          {label}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
          {detail}
        </p>
      </div>
    </div>
  );
}
