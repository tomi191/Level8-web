"use client";

import { useState, useTransition } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, EyeOff, Archive, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  markSubmissionRead,
  archiveSubmission,
  deleteSubmission,
} from "@/lib/admin-actions";
import { SubmissionDetail } from "./submission-detail";
import { AdminEmptyState } from "./admin-empty-state";
import type { Submission } from "@/types/admin";
import { toast } from "sonner";

interface SubmissionsTableProps {
  submissions: Submission[];
  type: string;
}

export function SubmissionsTable({ submissions, type }: SubmissionsTableProps) {
  const [selected, setSelected] = useState<Submission | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (submissions.length === 0) {
    return <AdminEmptyState command={`ls submissions --type=${type}`} />;
  }

  function handleRowClick(sub: Submission) {
    setSelected(sub);
    setDetailOpen(true);
    if (!sub.is_read) {
      startTransition(async () => {
        await markSubmissionRead(sub.id, true);
      });
    }
  }

  function handleAction(
    e: React.MouseEvent,
    action: () => Promise<void>,
    message: string
  ) {
    e.stopPropagation();
    startTransition(async () => {
      await action();
      toast.success(message);
    });
  }

  return (
    <>
      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-8" />
              <TableHead className="font-mono text-[10px] text-muted-foreground/50 tracking-wider">
                {type === "lead" ? "EMAIL" : "ИМЕ"}
              </TableHead>
              {type !== "lead" && (
                <TableHead className="font-mono text-[10px] text-muted-foreground/50 tracking-wider hidden sm:table-cell">
                  ТЕЛЕФОН
                </TableHead>
              )}
              <TableHead className="font-mono text-[10px] text-muted-foreground/50 tracking-wider hidden md:table-cell">
                ДАТА
              </TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((sub) => (
              <TableRow
                key={sub.id}
                onClick={() => handleRowClick(sub)}
                className={cn(
                  "cursor-pointer border-border/30 transition-colors",
                  !sub.is_read && "border-l-2 border-l-neon bg-neon/[0.02]"
                )}
              >
                <TableCell className="w-8 px-3">
                  <span
                    className={cn(
                      "block w-2 h-2 rounded-full",
                      sub.is_read
                        ? "bg-muted-foreground/20"
                        : "bg-neon animate-pulse"
                    )}
                  />
                </TableCell>
                <TableCell className="font-medium text-sm">
                  {type === "lead" ? sub.email : sub.name || "Без име"}
                </TableCell>
                {type !== "lead" && (
                  <TableCell className="text-sm text-muted-foreground hidden sm:table-cell">
                    {sub.phone || "\u2014"}
                  </TableCell>
                )}
                <TableCell className="text-xs text-muted-foreground/60 hidden md:table-cell">
                  {new Date(sub.created_at).toLocaleDateString("bg-BG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell className="w-10 px-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal size={14} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-surface border-border"
                    >
                      <DropdownMenuItem
                        onClick={(e) =>
                          handleAction(
                            e as unknown as React.MouseEvent,
                            () => markSubmissionRead(sub.id, !sub.is_read),
                            sub.is_read ? "Непрочетено" : "Прочетено"
                          )
                        }
                      >
                        {sub.is_read ? (
                          <EyeOff size={14} className="mr-2" />
                        ) : (
                          <Eye size={14} className="mr-2" />
                        )}
                        {sub.is_read ? "Непрочетено" : "Прочетено"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) =>
                          handleAction(
                            e as unknown as React.MouseEvent,
                            () => archiveSubmission(sub.id),
                            "Архивирано"
                          )
                        }
                      >
                        <Archive size={14} className="mr-2" />
                        Архивирай
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) =>
                          handleAction(
                            e as unknown as React.MouseEvent,
                            () => deleteSubmission(sub.id),
                            "Изтрито"
                          )
                        }
                        className="text-red-400 focus:text-red-400 focus:bg-red-500/10"
                      >
                        <Trash2 size={14} className="mr-2" />
                        Изтрий
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <SubmissionDetail
        submission={selected}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </>
  );
}
