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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MoreHorizontal,
  Pencil,
  Archive,
  Trash2,
  Search,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { archiveCrmClient, deleteCrmClient } from "@/lib/crm-actions";
import { ConfirmDialog } from "@/components/admin/crm/confirm-dialog";
import { SortableHeader } from "@/components/admin/crm/sortable-header";
import { useSortable } from "@/hooks/use-sortable";
import { toast } from "sonner";
import type { CrmClient, ClientStatus } from "@/types/crm";

interface ClientListProps {
  clients: CrmClient[];
}

const STATUS_CONFIG: Record<
  ClientStatus,
  { label: string; dotClass: string }
> = {
  active: { label: "Активен", dotClass: "bg-emerald-400" },
  inactive: { label: "Неактивен", dotClass: "bg-gray-400" },
  paused: { label: "На пауза", dotClass: "bg-amber-400" },
  lead: { label: "Lead", dotClass: "bg-blue-400" },
};

type FilterKey = "all" | ClientStatus;

const FILTER_OPTIONS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Всички" },
  { key: "active", label: "Активни" },
  { key: "inactive", label: "Неактивни" },
  { key: "lead", label: "Lead" },
];

export function ClientList({ clients }: ClientListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterKey>("all");
  // Local filtering
  const filtered = clients.filter((c) => {
    // Status filter
    if (statusFilter !== "all" && c.status !== statusFilter) return false;

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchesName = c.company_name.toLowerCase().includes(q);
      const matchesEik = c.eik?.toLowerCase().includes(q) ?? false;
      const matchesContact =
        c.contact_person?.toLowerCase().includes(q) ?? false;
      if (!matchesName && !matchesEik && !matchesContact) return false;
    }

    return true;
  });

  const { sortedItems: sorted, sortConfig, toggleSort } = useSortable(filtered, "company_name");

  function handleArchive(id: string) {
    startTransition(async () => {
      try {
        await archiveCrmClient(id);
        toast.success("Клиентът е архивиран");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Възникна грешка"
        );
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteCrmClient(id);
        toast.success("Клиентът е изтрит");
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
            placeholder="Търси по фирма, ЕИК, контакт..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background border-border focus:border-neon/50"
          />
        </div>

        <div className="flex gap-1 rounded-lg border border-border p-1 bg-background shrink-0">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setStatusFilter(opt.key)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
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
          <Users size={32} className="mx-auto text-muted-foreground/20 mb-3" />
          <p className="font-mono text-sm text-muted-foreground/50">
            $ crm clients --list{statusFilter !== "all" ? ` --status=${statusFilter}` : ""}
            {search ? ` --search="${search}"` : ""}
          </p>
          <p className="font-mono text-sm text-muted-foreground/50 mt-1">
            0 results found
          </p>
          <p className="text-xs text-muted-foreground/30 mt-3">
            {search || statusFilter !== "all"
              ? "Няма клиенти, отговарящи на филтрите."
              : "Все още няма добавени клиенти."}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <SortableHeader label="ФИРМА" sortKey="company_name" sortConfig={sortConfig} onSort={toggleSort} />
                <TableHead className="font-mono text-[10px] text-muted-foreground/50 tracking-wider hidden md:table-cell">
                  ЕИК
                </TableHead>
                <TableHead className="font-mono text-[10px] text-muted-foreground/50 tracking-wider hidden lg:table-cell">
                  КОНТАКТ
                </TableHead>
                <TableHead className="font-mono text-[10px] text-muted-foreground/50 tracking-wider hidden lg:table-cell">
                  ТЕЛЕФОН
                </TableHead>
                <SortableHeader label="СТАТУС" sortKey="status" sortConfig={sortConfig} onSort={toggleSort} className="hidden sm:table-cell text-center" />
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((client) => {
                const statusCfg = STATUS_CONFIG[client.status];

                return (
                  <TableRow
                    key={client.id}
                    onClick={() =>
                      router.push(`/admin/crm/clients/${client.id}`)
                    }
                    className="cursor-pointer border-border/30 transition-colors hover:bg-white/[0.02]"
                  >
                    <TableCell className="font-medium text-sm">
                      <div>
                        <span className="text-foreground">
                          {client.company_name}
                        </span>
                        {client.tags.length > 0 && (
                          <div className="flex gap-1 mt-0.5">
                            {client.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="inline-block text-[10px] font-mono px-1.5 py-0 rounded bg-neon/5 text-neon/60 border border-neon/10"
                              >
                                {tag}
                              </span>
                            ))}
                            {client.tags.length > 3 && (
                              <span className="text-[10px] text-muted-foreground/40">
                                +{client.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground font-mono hidden md:table-cell">
                      {client.eik || "\u2014"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">
                      {client.contact_person || "\u2014"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">
                      {client.phone || "\u2014"}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center justify-center gap-1.5">
                        <span
                          className={cn(
                            "block w-2 h-2 rounded-full shrink-0",
                            statusCfg.dotClass
                          )}
                        />
                        <span className="text-xs text-muted-foreground">
                          {statusCfg.label}
                        </span>
                      </div>
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
                                `/admin/crm/clients/${client.id}/edit`
                              );
                            }}
                          >
                            <Pencil size={14} className="mr-2" />
                            {"Редактирай"}
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
                            title={"Архивиране на клиент"}
                            description={`Сигурни ли сте, че искате да архивирате ${client.company_name}? Клиентът няма да се показва в листата.`}
                            confirmLabel={"Архивирай"}
                            variant="warning"
                            onConfirm={() => handleArchive(client.id)}
                            isPending={isPending}
                          />
                          <ConfirmDialog
                            trigger={
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                className="text-red-400 focus:text-red-400 focus:bg-red-500/10"
                              >
                                <Trash2 size={14} className="mr-2" />
                                {"Изтрий"}
                              </DropdownMenuItem>
                            }
                            title={"Изтриване на клиент"}
                            description={`Това действие е необратимо. Клиентът "${client.company_name}" и всички свързани данни ще бъдат изтрити завинаги.`}
                            confirmLabel={"Изтрий завинаги"}
                            variant="destructive"
                            onConfirm={() => handleDelete(client.id)}
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
