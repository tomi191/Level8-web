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
  Pencil,
  Archive,
  FileText,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { archiveCrmContract } from "@/lib/crm-contracts";
import { ConfirmDialog } from "@/components/admin/crm/confirm-dialog";
import { SortableHeader } from "@/components/admin/crm/sortable-header";
import { useSortable } from "@/hooks/use-sortable";
import { toast } from "sonner";
import type {
  CrmContractWithClient,
  ContractStatus,
  ContractType,
} from "@/types/crm";

interface ContractListProps {
  contracts: CrmContractWithClient[];
}

const STATUS_CONFIG: Record<
  ContractStatus,
  { label: string; className: string }
> = {
  draft: {
    label: "Чернова",
    className: "border-gray-500/20 bg-gray-500/10 text-gray-400",
  },
  sent: {
    label: "Изпратен",
    className: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  },
  signed: {
    label: "Подписан",
    className: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  },
  active: {
    label: "Активен",
    className: "border-neon/20 bg-neon/10 text-neon",
  },
  expired: {
    label: "Изтекъл",
    className: "border-red-500/20 bg-red-500/10 text-red-400",
  },
  terminated: {
    label: "Прекратен",
    className: "border-red-500/20 bg-red-500/10 text-red-400",
  },
};

const TYPE_CONFIG: Record<ContractType, { label: string; className: string }> =
  {
    maintenance: {
      label: "Поддръжка",
      className: "border-blue-500/20 bg-blue-500/10 text-blue-400",
    },
    development: {
      label: "Разработка",
      className: "border-purple-500/20 bg-purple-500/10 text-purple-400",
    },
    audit: {
      label: "Одит",
      className: "border-amber-500/20 bg-amber-500/10 text-amber-400",
    },
    other: {
      label: "Друго",
      className: "border-gray-500/20 bg-gray-500/10 text-gray-400",
    },
  };

type StatusFilterKey = "all" | ContractStatus;
type TypeFilterKey = "all" | ContractType;

const STATUS_FILTER_OPTIONS: { key: StatusFilterKey; label: string }[] = [
  { key: "all", label: "Всички" },
  { key: "draft", label: "Чернови" },
  { key: "active", label: "Активни" },
  { key: "signed", label: "Подписани" },
  { key: "expired", label: "Изтекли" },
];

const TYPE_FILTER_OPTIONS: { key: TypeFilterKey; label: string }[] = [
  { key: "all", label: "Всички" },
  { key: "maintenance", label: "Поддръжка" },
  { key: "development", label: "Разработка" },
  { key: "audit", label: "Одит" },
];

function formatAmount(amount: number | null): string {
  if (amount == null) return "\u2014";
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

export function ContractList({ contracts }: ContractListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilterKey>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilterKey>("all");

  // Local filtering
  const filtered = contracts.filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (typeFilter !== "all" && c.type !== typeFilter) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchesTitle = c.title.toLowerCase().includes(q);
      const matchesNumber =
        c.contract_number?.toLowerCase().includes(q) ?? false;
      const matchesClient = c.crm_clients.company_name
        .toLowerCase()
        .includes(q);
      if (!matchesTitle && !matchesNumber && !matchesClient) return false;
    }

    return true;
  });

  const {
    sortedItems: sorted,
    sortConfig,
    toggleSort,
  } = useSortable(filtered, "created_at", "desc");

  function handleArchive(id: string) {
    startTransition(async () => {
      try {
        await archiveCrmContract(id);
        toast.success("Договорът е архивиран");
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
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40"
            />
            <Input
              placeholder="Търси по заглавие, номер, клиент..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background border-border focus:border-neon/50"
            />
          </div>

          <div className="flex gap-1 rounded-lg border border-border p-1 bg-background shrink-0 overflow-x-auto">
            {STATUS_FILTER_OPTIONS.map((opt) => (
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

        <div className="flex gap-1 rounded-lg border border-border p-1 bg-background shrink-0 overflow-x-auto w-fit">
          {TYPE_FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setTypeFilter(opt.key)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap",
                typeFilter === opt.key
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
            $ crm contracts --list
            {statusFilter !== "all" ? ` --status=${statusFilter}` : ""}
            {typeFilter !== "all" ? ` --type=${typeFilter}` : ""}
            {search ? ` --search="${search}"` : ""}
          </p>
          <p className="font-mono text-sm text-muted-foreground/50 mt-1">
            0 results found
          </p>
          <p className="text-xs text-muted-foreground/30 mt-3">
            {search || statusFilter !== "all" || typeFilter !== "all"
              ? "Няма договори, отговарящи на филтрите."
              : "Все още няма създадени договори."}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <SortableHeader
                  label="НОМЕР"
                  sortKey="contract_number"
                  sortConfig={sortConfig}
                  onSort={toggleSort}
                />
                <TableHead className="font-mono text-[10px] text-muted-foreground/50 tracking-wider hidden md:table-cell">
                  КЛИЕНТ
                </TableHead>
                <TableHead className="font-mono text-[10px] text-muted-foreground/50 tracking-wider hidden lg:table-cell">
                  ТИП
                </TableHead>
                <SortableHeader
                  label="СТАТУС"
                  sortKey="status"
                  sortConfig={sortConfig}
                  onSort={toggleSort}
                  className="text-center"
                />
                <SortableHeader
                  label="МЕСЕЧНО/ОБЩО"
                  sortKey="monthly_price"
                  sortConfig={sortConfig}
                  onSort={toggleSort}
                  className="text-right hidden sm:table-cell"
                />
                <SortableHeader
                  label="ИЗТИЧА"
                  sortKey="expiry_date"
                  sortConfig={sortConfig}
                  onSort={toggleSort}
                  className="hidden sm:table-cell"
                />
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((c) => {
                const statusCfg = STATUS_CONFIG[c.status];
                const typeCfg = TYPE_CONFIG[c.type];

                return (
                  <TableRow
                    key={c.id}
                    onClick={() =>
                      router.push(`/admin/crm/contracts/${c.id}`)
                    }
                    className="cursor-pointer border-border/30 transition-colors hover:bg-white/[0.02]"
                  >
                    <TableCell className="font-mono text-sm text-foreground">
                      <div>
                        <span>{c.contract_number || "\u2014"}</span>
                        <span className="block text-xs text-muted-foreground/50 truncate max-w-[200px]">
                          {c.title}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                      {c.crm_clients.company_name}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-mono",
                          typeCfg.className
                        )}
                      >
                        {typeCfg.label}
                      </Badge>
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
                    <TableCell className="text-sm font-mono text-foreground text-right hidden sm:table-cell">
                      {c.monthly_price
                        ? formatAmount(c.monthly_price) + "/мес"
                        : formatAmount(c.total_amount)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">
                      {formatDate(c.expiry_date)}
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
                                `/admin/crm/contracts/${c.id}`
                              );
                            }}
                          >
                            <Eye size={14} className="mr-2" />
                            Преглед
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(
                                `/admin/crm/contracts/${c.id}/edit`
                              );
                            }}
                          >
                            <Pencil size={14} className="mr-2" />
                            Редактирай
                          </DropdownMenuItem>
                          <ConfirmDialog
                            trigger={
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Archive size={14} className="mr-2" />
                                {"Архивирай"}
                              </DropdownMenuItem>
                            }
                            title={"Архивиране на договор"}
                            description={`Сигурни ли сте, че искате да архивирате договор ${c.contract_number || c.title}?`}
                            confirmLabel={"Архивирай"}
                            variant="warning"
                            onConfirm={() => handleArchive(c.id)}
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
