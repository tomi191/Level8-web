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
  Archive,
  Package,
  Search,
  Pencil,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { archiveCrmService } from "@/lib/crm-actions";
import { ConfirmDialog } from "@/components/admin/crm/confirm-dialog";
import { toast } from "sonner";
import type { CrmClientServiceWithRelations, ServiceStatus } from "@/types/crm";

interface ServiceListProps {
  services: CrmClientServiceWithRelations[];
}

const STATUS_CONFIG: Record<
  ServiceStatus,
  { label: string; className: string }
> = {
  active: {
    label: "Активна",
    className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  },
  paused: {
    label: "Паузирана",
    className: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  },
  cancelled: {
    label: "Отказана",
    className: "border-red-500/20 bg-red-500/10 text-red-400",
  },
};

const SERVICE_TYPE_LABELS: Record<string, string> = {
  hosting: "Хостинг",
  maintenance: "Поддръжка",
  development: "Разработка",
  seo: "SEO",
  design: "Дизайн",
  other: "Друго",
};

const BILLING_CYCLE_LABELS: Record<string, string> = {
  monthly: "мес.",
  quarterly: "трим.",
  yearly: "год.",
};

type FilterKey = "all" | ServiceStatus;

const FILTER_OPTIONS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Всички" },
  { key: "active", label: "Активни" },
  { key: "paused", label: "Паузирани" },
  { key: "cancelled", label: "Отказани" },
];

function formatPrice(price: number, cycle: string): string {
  const formatted = new Intl.NumberFormat("bg-BG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
  return `${formatted} \u20ac/${BILLING_CYCLE_LABELS[cycle] ?? cycle}`;
}

function monthlyEquivalent(price: number, cycle: string): string | null {
  if (cycle === "monthly") return null;
  const monthly =
    cycle === "quarterly" ? price / 3 : cycle === "yearly" ? price / 12 : price;
  return `\u2248 ${new Intl.NumberFormat("bg-BG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(monthly)} \u20ac/\u043C\u0435\u0441.`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "\u2014";
  return new Date(dateStr).toLocaleDateString("bg-BG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ServiceList({ services }: ServiceListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterKey>("all");

  const filtered = services.filter((svc) => {
    if (statusFilter !== "all" && svc.status !== statusFilter) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchesName = svc.name.toLowerCase().includes(q);
      const matchesClient = svc.crm_clients.company_name
        .toLowerCase()
        .includes(q);
      if (!matchesName && !matchesClient) return false;
    }

    return true;
  });

  function handleArchive(id: string) {
    startTransition(async () => {
      try {
        await archiveCrmService(id);
        toast.success("Услугата е архивирана");
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
            placeholder={"Търси по име, клиент..."}
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
          <Package
            size={32}
            className="mx-auto text-muted-foreground/20 mb-3"
          />
          <p className="font-mono text-sm text-muted-foreground/50">
            $ crm services --list
            {statusFilter !== "all" ? ` --status=${statusFilter}` : ""}
            {search ? ` --search="${search}"` : ""}
          </p>
          <p className="font-mono text-sm text-muted-foreground/50 mt-1">
            0 results found
          </p>
          <p className="text-xs text-muted-foreground/30 mt-3">
            {search || statusFilter !== "all"
              ? "Няма услуги, отговарящи на филтрите."
              : "Все още няма създадени услуги."}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="font-mono text-[10px] text-muted-foreground/50 tracking-wider">
                  УСЛУГА
                </TableHead>
                <TableHead className="font-mono text-[10px] text-muted-foreground/50 tracking-wider hidden md:table-cell">
                  КЛИЕНТ
                </TableHead>
                <TableHead className="font-mono text-[10px] text-muted-foreground/50 tracking-wider hidden lg:table-cell text-center">
                  ТИП
                </TableHead>
                <TableHead className="font-mono text-[10px] text-muted-foreground/50 tracking-wider text-right">
                  ЦЕНА
                </TableHead>
                <TableHead className="font-mono text-[10px] text-muted-foreground/50 tracking-wider hidden sm:table-cell">
                  СЛЕД. ФАКТУРИРАНЕ
                </TableHead>
                <TableHead className="font-mono text-[10px] text-muted-foreground/50 tracking-wider text-center">
                  СТАТУС
                </TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((svc) => {
                const statusCfg =
                  STATUS_CONFIG[svc.status as ServiceStatus] ?? STATUS_CONFIG.active;
                const equiv = monthlyEquivalent(svc.price, svc.billing_cycle);

                return (
                  <TableRow
                    key={svc.id}
                    onClick={() =>
                      router.push(`/admin/crm/services/${svc.id}`)
                    }
                    className="cursor-pointer border-border/30 transition-colors hover:bg-white/[0.02]"
                  >
                    <TableCell className="text-sm text-foreground font-medium">
                      {svc.name}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                      {svc.crm_clients.company_name}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-center">
                      <Badge
                        variant="outline"
                        className="text-[10px] font-mono border-border/50 text-muted-foreground"
                      >
                        {SERVICE_TYPE_LABELS[svc.service_type] ??
                          svc.service_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-sm font-mono text-foreground block">
                        {formatPrice(svc.price, svc.billing_cycle)}
                      </span>
                      {equiv && (
                        <span className="text-[10px] text-muted-foreground/50 font-mono block">
                          {equiv}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">
                      {formatDate(svc.next_billing_date)}
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
                                `/admin/crm/services/${svc.id}`
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
                                `/admin/crm/services/${svc.id}/edit`
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
                            title={"Архивиране на услуга"}
                            description={`Сигурни ли сте, че искате да архивирате "${svc.name}"?`}
                            confirmLabel={"Архивирай"}
                            variant="warning"
                            onConfirm={() => handleArchive(svc.id)}
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
