"use client";
import { useState, useMemo } from "react";

export type SortDirection = "asc" | "desc";

export interface SortConfig {
  key: string;
  direction: SortDirection;
}

export function useSortable<T>(items: T[], defaultKey: string, defaultDir: SortDirection = "asc") {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: defaultKey, direction: defaultDir });

  const sortedItems = useMemo(() => {
    const sorted = [...items].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortConfig.key];
      const bVal = (b as Record<string, unknown>)[sortConfig.key];

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      let comparison = 0;
      if (typeof aVal === "string" && typeof bVal === "string") {
        comparison = aVal.localeCompare(bVal, "bg");
      } else if (typeof aVal === "number" && typeof bVal === "number") {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }

      return sortConfig.direction === "desc" ? -comparison : comparison;
    });
    return sorted;
  }, [items, sortConfig]);

  function toggleSort(key: string) {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  }

  return { sortedItems, sortConfig, toggleSort };
}
