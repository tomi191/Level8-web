"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Eye,
  CheckCircle,
  Archive,
  FileText,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { markInvoicePaid, archiveCrmInvoice } from "@/lib/crm-actions";
import { ConfirmDialog } from "@/components/admin/crm/confirm-dialog";
import { SortableHeader } from "@/components/admin/crm/sortable-header";
import { useSortable } from "@/hooks/use-sortable";
import { toast } from "sonner";
import type { CrmInvoiceWithClient, InvoiceStatus } from "@/types/crm";

interface InvoiceListProps {
  invoices: CrmInvoiceWithClient[];
}

const STATUS_CONFIG: Record<
  InvoiceStatus,
  { label: string; className: string }
> = {
  draft: {
    label: "Чернова",
    className: "border-gray-500/20 bg-gray-500/10 text-gray-400",
  },
  pending: {
    label: "Чакаща",
    className: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  },
  sent: {
    label: "Изпратена",
    className: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  },
  paid: {
    label: "Платена",
    className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  },
  overdue: {
    label: "Просрочена",
    className: "border-red-500/20 bg-red-500/10 text-red-400",
  },
  cancelled: {
    label: "Отменена",
    className:
      "border-gray-500/20 bg-gray-500/10 text-gray-400 line-through",
  },
};

type FilterKey = "all" | InvoiceStatus;

const FILTER_OPTIONS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Всички" },
  { key: "draft", label: "Чернова" },
  { key: "pending", label: "Чакащи" },
  { key: "sent", label: "Изпратени" },
  { key: "paid", label: "Платени" },
  { key: "overdue", label: "Просрочени" },
  { key: "cancelled", label: "Отменени" },
];

function formatAmount(amount: number): string {
  return (
    new Intl.NumberFormat("bg-BG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + " \u20ac"
  );
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "\u2014";
  return new Date(dateStr).toLocaleDateString("bg-BG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function InvoiceList({ invoices }: InvoiceListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterKey>("all");

  // Local filtering
  const filtered = invoices.filter((inv) => {
    if (statusFilter !== "all" && inv.status !== statusFilter) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchesNumber = inv.invoice_number.toLowerCase().includes(q);
      const matchesClient = inv.crm_clients.company_name
        .toLowerCase()
        .includes(q);
      const matchesDesc = inv.description?.toLowerCase().includes(q) ?? false;
      if (!matchesNumber && !matchesClient && !matchesDesc) return false;
    }

    return true;
  });

  const { sortedItems: sorted, sortConfig, toggleSort } = useSortable(filtered, "due_date", "desc");

  function handleMarkPaid(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    startTransition(async () => {
      try {
        await markInvoicePaid(id);
        toast.success("Фактурата е маркирана като платена");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Възникна грешка"
        );
      }
    });
  }

  function handleArchive(id: string) {
    startTransition(async () => {
      try {
        await archiveCrmInvoice(id);
        toast.success("Фактурата е архивирана");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Възникна грешка"
        );
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40"
          />
          <Input
            placeholder="Търси по номер, клиент, описание..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background border-border focus:border-neon/50"
          />
        </div>

        <div className="flex gap-1 rounded-lg border border-border p-1 bg-background shrink-0 overflow-x-auto">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setStatusFilter(opt.key)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap",
                statusFilter === opt.key
                  ? "bg-neon/10 text-neon border border-neon/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03] border border-transparent"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <FileText
            size={32}
            className="mx-auto text-muted-foreground/20 mb-3"
          />
          <p className="font-mono text-sm text-muted-foreground/50">
            $ crm invoices --list
            {statusFilter !== "all" ? ` --status=${statusFilter}` : ""}
            {search ? ` --search="${search}"` : ""}
          </p>
          <p className="font-mono text-sm text-muted-foreground/50 mt-1">
            0 results found
          </p>
          <p className="text-xs text-muted-foreground/30 mt-3">
            {search || statusFilter !== "all"
              ? "Няма фактури, отговарящи на филтрите."
              : "Все още няма създадени фактури."}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <SortableHeader label="НОМЕР" sortKey="invoice_number" sortConfig={sortConfig} onSort={toggleSort} />
                <TableHead className="font-mono text-[10px] text-muted-foreground/50 tracking-wider hidden md:table-cell">
                  КЛИЕНТ
                </TableHead>
                <TableHead className="font-mono text-[10px] text-muted-foreground/50 tracking-wider hidden lg:table-cell">
                  ОПИСАНИЕ
                </TableHead>
                <SortableHeader label="СУМА" sortKey="total_amount" sortConfig={sortConfig} onSort={toggleSort} className="text-right" />
                <SortableHeader label="ПАДЕЖ" sortKey="due_date" sortConfig={sortConfig} onSort={toggleSort} className="hidden sm:table-cell" />
                <SortableHeader label="СТАТУС" sortKey="status" sortConfig={sortConfig} onSort={toggleSort} className="text-center" />
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((inv) => {
                const statusCfg = STATUS_CONFIG[inv.status];

                return (
                  <TableRow
                    key={inv.id}
                    onClick={() =>
                      router.push(`/admin/crm/invoices/${inv.id}`)
                    }
                    className="cursor-pointer border-border/30 transition-colors hover:bg-white/[0.02]"
                  >
                    <TableCell className="font-mono text-sm text-foreground">
                      {inv.invoice_number}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                      {inv.crm_clients.company_name}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden lg:table-cell max-w-[200px] truncate">
                      {inv.description || inv.service_type || "\u2014"}
                    </TableCell>
                    <TableCell className="text-sm font-mono text-foreground text-right">
                      {formatAmount(inv.total_amount)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">
                      {formatDate(inv.due_date)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-mono",
                          statusCfg.className
                        )}
                      >
                        {statusCfg.label}
                      </Badge>
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
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(
                                `/admin/crm/invoices/${inv.id}`
                              );
                            }}
                          >
                            <Eye size={14} className="mr-2" />
                            Преглед
                          </DropdownMenuItem>
                          {(inv.status === "pending" ||
                            inv.status === "sent" ||
                            inv.status === "overdue") && (
                            <DropdownMenuItem
                              onClick={(e) =>
                                handleMarkPaid(
                                  e as unknown as React.MouseEvent,
                                  inv.id
                                )
                              }
                              className="text-emerald-400 focus:text-emerald-400 focus:bg-emerald-500/10"
                            >
                              <CheckCircle size={14} className="mr-2" />
                              Маркирай платена
                            </DropdownMenuItem>
                          )}
                          <ConfirmDialog
                            trigger={
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Archive size={14} className="mr-2" />
                                {"Архивирай"}
                              </DropdownMenuItem>
                            }
                            title={"Архивиране на фактура"}
                            description={`Сигурни ли сте, че искате да архивирате фактура ${inv.invoice_number}?`}
                            confirmLabel={"Архивирай"}
                            variant="warning"
                            onConfirm={() => handleArchive(inv.id)}
                            isPending={isPending}
                          />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Loading overlay */}
      {isPending && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="font-mono text-sm text-neon animate-pulse">
            processing...
          </div>
        </div>
      )}
    </div>
  );
}
