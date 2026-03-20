import { cn } from "@/lib/utils";

interface TerminalWindowProps {
  title: string;
  badge?: string;
  badgeColor?: "green" | "gold" | "blue";
  children: React.ReactNode;
  className?: string;
  dots?: boolean;
  titleRight?: React.ReactNode;
  /** Smaller dots for compact usage (cards) */
  compact?: boolean;
}

export function TerminalWindow({
  title,
  badge,
  badgeColor = "green",
  children,
  className,
  dots = true,
  titleRight,
  compact = false,
}: TerminalWindowProps) {
  const dotSize = compact ? "w-2 h-2" : "w-2.5 h-2.5";

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface overflow-hidden",
        className
      )}
    >
      {/* Title bar */}
      <div
        className={cn(
          "flex items-center gap-2.5 border-b border-border/50 bg-white/[0.02]",
          compact ? "px-3 py-1.5" : "px-4 py-2.5"
        )}
      >
        {dots && (
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={cn(dotSize, "rounded-full bg-[#ff5f57]")} />
            <span className={cn(dotSize, "rounded-full bg-[#febc2e]")} />
            <span className={cn(dotSize, "rounded-full bg-[#28c840]")} />
          </div>
        )}
        <span
          className={cn(
            "font-mono text-muted-foreground/50 flex-1 truncate",
            compact ? "text-[11px]" : "text-xs"
          )}
        >
          {title}
        </span>
        {badge && (
          <span
            className={cn(
              "text-[9px] font-mono px-1.5 py-0.5 rounded-full shrink-0",
              badgeColor === "green" &&
                "bg-neon/10 text-neon/70 border border-neon/20",
              badgeColor === "gold" &&
                "bg-gold/10 text-gold/70 border border-gold/20",
              badgeColor === "blue" &&
                "bg-info/10 text-info/70 border border-info/20"
            )}
          >
            {badge}
          </span>
        )}
        {titleRight}
      </div>
      {/* Content */}
      {children}
    </div>
  );
}
