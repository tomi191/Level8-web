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
  Search,
  Globe,
  ExternalLink,
  Cpu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { archiveCrmWebsite, detectAllPlatforms, syncAllDomainsRdap } from "@/lib/crm-actions";
import { ConfirmDialog } from "@/components/admin/crm/confirm-dialog";
import { SortableHeader } from "@/components/admin/crm/sortable-header";
import { useSortable } from "@/hooks/use-sortable";
import { toast } from "sonner";
import type {
  CrmWebsiteWithClient,
  WebsiteStatus,
  WebsitePlatform,
} from "@/types/crm";

interface WebsiteListProps {
  websites: CrmWebsiteWithClient[];
}

const STATUS_CONFIG: Record<
  WebsiteStatus,
  { label: string; dotClass: string }
> = {
  active: { label: "Активен", dotClass: "bg-emerald-400" },
  maintenance: { label: "Поддръжка", dotClass: "bg-amber-400" },
  development: { label: "В разработка", dotClass: "bg-blue-400" },
  archived: { label: "Архивиран", dotClass: "bg-gray-400" },
};

type PlatformFilterKey = "all" | WebsitePlatform;

const PLATFORM_FILTER_OPTIONS: { key: PlatformFilterKey; label: string }[] = [
  { key: "all", label: "Всички" },
  { key: "wordpress", label: "WordPress" },
  { key: "nextjs", label: "Next.js" },
  { key: "shopify", label: "Shopify" },
  { key: "custom", label: "Custom" },
];

const PLATFORM_LABELS: Record<string, string> = {
  wordpress: "WordPress",
  nextjs: "Next.js",
  shopify: "Shopify",
  custom: "Custom",
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "\u2014";
  return new Date(dateStr).toLocaleDateString("bg-BG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const now = new Date();
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function WebsiteList({ websites }: WebsiteListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] =
    useState<PlatformFilterKey>("all");

  // Local filtering
  const filtered = websites.filter((w) => {
    // Platform filter
    if (platformFilter !== "all" && w.platform !== platformFilter) return false;

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchesDomain = w.domain.toLowerCase().includes(q);
      const matchesClient =
        w.crm_clients?.company_name?.toLowerCase().includes(q) ?? false;
      const matchesName = w.name?.toLowerCase().includes(q) ?? false;
      if (!matchesDomain && !matchesClient && !matchesName) return false;
    }

    return true;
  });

  const { sortedItems: sorted, sortConfig, toggleSort } = useSortable(filtered, "domain");

  function handleArchive(id: string) {
    startTransition(async () => {
      try {
        await archiveCrmWebsite(id);
        toast.success("Сайтът е архивиран");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Възникна грешка"
        );
      }
    });
  }

  function handleDetectAll() {
    startTransition(async () => {
      try {
        const result = await detectAllPlatforms();
        if (result.errors > 0) {
          toast.warning(
            `Детектирани: ${result.detected}/${result.total}, грешки: ${result.errors}`
          );
        } else {
          toast.success(
            `Платформи детектирани: ${result.detected}/${result.total} сайта`
          );
        }
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Грешка при детекция"
        );
      }
    });
  }

  function handleRdapSync() {
    startTransition(async () => {
      try {
        const result = await syncAllDomainsRdap();
        if (result.failed > 0) {
          toast.warning(
            `RDAP: ${result.synced} синхронизирани, ${result.failed} неуспешни`
          );
        } else {
          toast.success(
            `RDAP: ${result.synced} домейна синхронизирани с реални данни`
          );
        }
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "RDAP грешка"
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
            placeholder="Търси по домейн, клиент, име..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background border-border focus:border-neon/50"
          />
        </div>

        <div className="flex gap-1 rounded-lg border border-border p-1 bg-background shrink-0 overflow-x-auto">
          {PLATFORM_FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setPlatformFilter(opt.key)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap",
                platformFilter === opt.key
                  ? "bg-neon/10 text-neon border border-neon/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03] border border-transparent"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={handleDetectAll}
          className="border-border text-muted-foreground hover:text-neon hover:border-neon/30 shrink-0"
        >
          <Cpu size={14} className={cn("mr-1.5", isPending && "animate-spin")} />
          {isPending ? "Detecting..." : "Detect All"}
        </Button>

        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={handleRdapSync}
          className="border-border text-muted-foreground hover:text-neon hover:border-neon/30 shrink-0"
        >
          <Globe size={14} className={cn("mr-1.5", isPending && "animate-spin")} />
          {isPending ? "Syncing..." : "RDAP Sync"}
        </Button>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <Globe
            size={32}
            className="mx-auto text-muted-foreground/20 mb-3"
          />
          <p className="font-mono text-sm text-muted-foreground/50">
            $ crm websites --list
            {platformFilter !== "all"
              ? ` --platform=${platformFilter}`
              : ""}
            {search ? ` --search="${search}"` : ""}
          </p>
          <p className="font-mono text-sm text-muted-foreground/50 mt-1">
            0 results found
          </p>
          <p className="text-xs text-muted-foreground/30 mt-3">
            {search || platformFilter !== "all"
              ? "Няма сайтове, отговарящи на филтрите."
              : "Все още няма добавени сайтове."}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <SortableHeader label="ДОМЕЙН" sortKey="domain" sortConfig={sortConfig} onSort={toggleSort} />
                <TableHead className="font-mono text-[10px] text-muted-foreground/50 tracking-wider hidden md:table-cell">
                  КЛИЕНТ
                </TableHead>
                <SortableHeader label="ПЛАТФОРМА" sortKey="platform" sortConfig={sortConfig} onSort={toggleSort} className="hidden lg:table-cell" />
                <TableHead className="font-mono text-[10px] text-muted-foreground/50 tracking-wider hidden xl:table-cell">
                  ХОСТИНГ
                </TableHead>
                <TableHead className="font-mono text-[10px] text-muted-foreground/50 tracking-wider hidden sm:table-cell text-center">
                  SSL
                </TableHead>
                <TableHead className="font-mono text-[10px] text-muted-foreground/50 tracking-wider hidden lg:table-cell">
                  ДОМЕЙН ИЗТИЧА
                </TableHead>
                <SortableHeader label="СТАТУС" sortKey="status" sortConfig={sortConfig} onSort={toggleSort} className="hidden sm:table-cell text-center" />
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((website) => {
                const statusCfg =
                  STATUS_CONFIG[website.status] ?? {
                    label: website.status,
                    dotClass: "bg-gray-400",
                  };

                // SSL indicator
                let sslDotClass = "bg-gray-400";
                let sslLabel = "\u2014";
                if (website.ssl_status === "active") {
                  sslDotClass = "bg-emerald-400";
                  sslLabel = "OK";
                } else if (website.ssl_status === "expired") {
                  sslDotClass = "bg-red-400";
                  sslLabel = "Expired";
                } else if (website.ssl_status === "none") {
                  sslDotClass = "bg-gray-400";
                  sslLabel = "None";
                }

                // Domain expiry
                const domainDays = daysUntil(website.domain_expiry_date);
                let domainExpiryColor = "text-muted-foreground";
                if (domainDays !== null) {
                  if (domainDays < 0) {
                    domainExpiryColor = "text-red-400";
                  } else if (domainDays < 7) {
                    domainExpiryColor = "text-red-400";
                  } else if (domainDays < 30) {
                    domainExpiryColor = "text-amber-400";
                  }
                }

                // CF dashboard URL
                const cfDashboardUrl = website.cloudflare_zone_id
                  ? `https://dash.cloudflare.com/${website.cloudflare_zone_id}`
                  : null;

                return (
                  <TableRow
                    key={website.id}
                    onClick={() =>
                      router.push(`/admin/crm/websites/${website.id}`)
                    }
                    className="cursor-pointer border-border/30 transition-colors hover:bg-white/[0.02]"
                  >
                    <TableCell className="font-medium text-sm">
                      <div>
                        <span className="text-foreground">
                          {website.domain}
                        </span>
                        {website.name && (
                          <span className="text-xs text-muted-foreground/50 ml-2">
                            ({website.name})
                          </span>
                        )}
                        {website.tags.length > 0 && (
                          <div className="flex gap-1 mt-0.5">
                            {website.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="inline-block text-[10px] font-mono px-1.5 py-0 rounded bg-neon/5 text-neon/60 border border-neon/10"
                              >
                                {tag}
                              </span>
                            ))}
                            {website.tags.length > 2 && (
                              <span className="text-[10px] text-muted-foreground/40">
                                +{website.tags.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                      {website.crm_clients?.company_name || "\u2014"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">
                      {website.platform
                        ? PLATFORM_LABELS[website.platform] ?? website.platform
                        : "\u2014"}
                      {website.platform_version && (
                        <span className="text-xs text-muted-foreground/40 ml-1">
                          v{website.platform_version}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden xl:table-cell capitalize">
                      {website.hosting_provider || "\u2014"}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span
                          className={cn(
                            "block w-2 h-2 rounded-full shrink-0",
                            sslDotClass
                          )}
                        />
                        <span className="text-xs text-muted-foreground font-mono">
                          {sslLabel}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-xs hidden lg:table-cell font-mono",
                        domainExpiryColor
                      )}
                    >
                      {formatDate(website.domain_expiry_date)}
                      {domainDays !== null && domainDays >= 0 && domainDays < 30 && (
                        <span className="ml-1 text-[10px]">
                          ({domainDays}d)
                        </span>
                      )}
                      {domainDays !== null && domainDays < 0 && (
                        <span className="ml-1 text-[10px]">
                          (expired)
                        </span>
                      )}
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
                                `/admin/crm/websites/${website.id}`
                              );
                            }}
                          >
                            <Pencil size={14} className="mr-2" />
                            Редактирай
                          </DropdownMenuItem>
                          {cfDashboardUrl && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(cfDashboardUrl, "_blank");
                              }}
                            >
                              <ExternalLink size={14} className="mr-2" />
                              CF Dashboard
                            </DropdownMenuItem>
                          )}
                          <ConfirmDialog
                            trigger={
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                className="text-red-400 focus:text-red-400 focus:bg-red-500/10"
                              >
                                <Archive size={14} className="mr-2" />
                                {"Архивирай"}
                              </DropdownMenuItem>
                            }
                            title={"Архивиране на сайт"}
                            description={`Сигурни ли сте, че искате да архивирате ${website.domain}? Сайтът няма да се показва в листата.`}
                            confirmLabel={"Архивирай"}
                            variant="warning"
                            onConfirm={() => handleArchive(website.id)}
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
