"use client";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { SortConfig } from "@/hooks/use-sortable";

interface SortableHeaderProps {
  label: string;
  sortKey: string;
  sortConfig: SortConfig;
  onSort: (key: string) => void;
  className?: string;
}

export function SortableHeader({ label, sortKey, sortConfig, onSort, className }: SortableHeaderProps) {
  const isActive = sortConfig.key === sortKey;
  const Icon = isActive
    ? (sortConfig.direction === "asc" ? ArrowUp : ArrowDown)
    : ArrowUpDown;

  return (
    <TableHead
      className={cn(
        "font-mono text-[10px] tracking-wider cursor-pointer select-none hover:text-neon/60 transition-colors",
        isActive ? "text-neon/70" : "text-muted-foreground/50",
        className
      )}
      onClick={() => onSort(sortKey)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <Icon size={10} className={isActive ? "text-neon/50" : "text-muted-foreground/30"} />
      </span>
    </TableHead>
  );
}
