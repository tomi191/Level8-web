"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Database,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { browseHubTable } from "@/lib/hub/actions";

interface HubTableViewerProps {
  websiteId: string;
  tableName: string;
  onClose: () => void;
}

export function HubTableViewer({
  websiteId,
  tableName,
  onClose,
}: HubTableViewerProps) {
  const [isPending, startTransition] = useTransition();
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const pageSize = 25;

  function loadPage(p: number) {
    startTransition(async () => {
      const result = await browseHubTable(websiteId, tableName, p, pageSize);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setRows(result.rows);
      setTotal(result.total);
      setPage(p);
      setLoaded(true);
    });
  }

  if (!loaded && !isPending) {
    loadPage(0);
  }

  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden">
      <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database size={14} className="text-neon/40" />
          <span className="font-mono text-sm text-foreground font-bold">{tableName}</span>
          <span className="text-[10px] font-mono text-muted-foreground/40">
            {total.toLocaleString("bg-BG")} rows
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => loadPage(page)}
            disabled={isPending}
            className="text-neon hover:text-neon hover:bg-neon/10"
          >
            {isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              "\u041E\u043F\u0440\u0435\u0441\u043D\u0438"
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            {"\u0417\u0430\u0442\u0432\u043E\u0440\u0438"}
          </Button>
        </div>
      </div>

      {isPending && !loaded ? (
        <div className="p-8 text-center">
          <Loader2 size={24} className="mx-auto text-neon/40 animate-spin mb-3" />
          <p className="text-sm text-muted-foreground/50 font-mono">{"\u0417\u0430\u0440\u0435\u0436\u0434\u0430\u043D\u0435..."}</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="p-8 text-center">
          <Database size={28} className="mx-auto text-muted-foreground/20 mb-3" />
          <p className="text-sm text-muted-foreground/50 font-mono">{"\u041F\u0440\u0430\u0437\u043D\u0430 \u0442\u0430\u0431\u043B\u0438\u0446\u0430"}</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/30">
                  {columns.map((col) => (
                    <th
                      key={col}
                      className="px-3 py-2 text-left font-mono text-muted-foreground/40 font-normal whitespace-nowrap tracking-wider uppercase text-[10px]"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {rows.map((row, i) => (
                  <tr key={i} className="hover:bg-white/[0.02]">
                    {columns.map((col) => (
                      <td
                        key={col}
                        className="px-3 py-2 font-mono text-foreground max-w-[200px] truncate whitespace-nowrap"
                      >
                        {formatCellValue(row[col])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="px-5 py-3 border-t border-border/30 flex items-center justify-between">
              <span className="text-[10px] font-mono text-muted-foreground/40">
                {"\u0421\u0442\u0440."} {page + 1} / {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => loadPage(page - 1)}
                  disabled={page === 0 || isPending}
                  className="h-7 w-7 p-0"
                >
                  <ChevronLeft size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => loadPage(page + 1)}
                  disabled={page >= totalPages - 1 || isPending}
                  className="h-7 w-7 p-0"
                >
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return "\u2014";
  if (typeof value === "object") return JSON.stringify(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}
