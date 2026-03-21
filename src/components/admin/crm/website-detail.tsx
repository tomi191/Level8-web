"use client";

import { useTransition } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Pencil,
  ExternalLink,
  Globe,
  Server,
  Cloud,
  RefreshCw,
  BarChart3,
  Eye,
  HardDrive,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Plus,
  Archive,
  Trash2,
  CreditCard,
  StickyNote,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { syncWebsite } from "@/lib/cloudflare-actions";
import { toast } from "sonner";
import { WebsiteHealthIndicator } from "@/components/admin/crm/website-health-indicator";
import { PlatformDetectButton } from "@/components/admin/crm/platform-detect-button";
import { HubConnection } from "@/components/admin/crm/hub-connection";
import { HubEventsFeed } from "@/components/admin/crm/hub-events-feed";
import type {
  CrmWebsiteWithClient,
  CrmActivityLog,
  CrmCloudflareCache,
  WebsiteStatus,
  ActivityAction,
  HubConnectionStatus,
  HubEvent,
  HubFlowInstance,
} from "@/types/crm";
import type { CFDnsRecord, CFAnalyticsResult, HealthStatus } from "@/types/cloudflare";

interface WebsiteDetailProps {
  website: CrmWebsiteWithClient;
  cfCache: CrmCloudflareCache[];
  activities: CrmActivityLog[];
  hubStatus: HubConnectionStatus | null;
  hubEvents: HubEvent[];
  hubFlowInstances: HubFlowInstance[];
}

const STATUS_CONFIG: Record<
  WebsiteStatus,
  { label: string; dotClass: string; badgeClass: string }
> = {
  active: {
    label: "Активен",
    dotClass: "bg-emerald-400",
    badgeClass: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  },
  maintenance: {
    label: "Поддръжка",
    dotClass: "bg-amber-400",
    badgeClass: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  },
  development: {
    label: "В разработка",
    dotClass: "bg-blue-400",
    badgeClass: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  },
  archived: {
    label: "Архивиран",
    dotClass: "bg-gray-400",
    badgeClass: "border-gray-500/20 bg-gray-500/10 text-gray-400",
  },
};

const PLATFORM_LABELS: Record<string, string> = {
  wordpress: "WordPress",
  nextjs: "Next.js",
  shopify: "Shopify",
  custom: "Custom",
};

const HOSTING_LABELS: Record<string, string> = {
  superhosting: "SuperHosting",
  vercel: "Vercel",
  netlify: "Netlify",
  other: "Друг",
};

const ACTION_ICON_MAP: Record<
  ActivityAction,
  { icon: typeof Plus; iconClass: string }
> = {
  created: { icon: Plus, iconClass: "text-emerald-400 bg-emerald-500/10" },
  updated: { icon: Pencil, iconClass: "text-blue-400 bg-blue-500/10" },
  archived: { icon: Archive, iconClass: "text-amber-400 bg-amber-500/10" },
  deleted: { icon: Trash2, iconClass: "text-red-400 bg-red-500/10" },
  payment_received: {
    icon: CreditCard,
    iconClass: "text-neon bg-neon/10",
  },
  note_added: {
    icon: StickyNote,
    iconClass: "text-purple-400 bg-purple-500/10",
  },
  status_changed: {
    icon: StickyNote,
    iconClass: "text-blue-400 bg-blue-500/10",
  },
};

// ============================================================
// Helpers
// ============================================================

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "\—";
  return new Date(dateStr).toLocaleDateString("bg-BG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffSec < 60) return "Току-що";
  if (diffMin < 60) return `Преди ${diffMin} мин`;
  if (diffHr < 24)
    return `Преди ${diffHr} ${diffHr === 1 ? "час" : "часа"}`;
  if (diffDays < 7)
    return `Преди ${diffDays} ${diffDays === 1 ? "ден" : "дни"}`;

  return new Date(dateStr).toLocaleDateString("bg-BG", {
    day: "numeric",
    month: "short",
  });
}

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const now = new Date();
  const target = new Date(dateStr);
  return Math.ceil(
    (target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString("bg-BG");
}

function formatBytes(bytes: number): string {
  if (bytes >= 1_073_741_824) return `${(bytes / 1_073_741_824).toFixed(2)} GB`;
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  if (bytes >= 1_024) return `${(bytes / 1_024).toFixed(0)} KB`;
  return `${bytes} B`;
}

function computeHealthStatus(
  dateStr: string | null,
  thresholdCritical = 7,
  thresholdWarning = 30
): HealthStatus {
  const days = daysUntil(dateStr);
  if (days === null) return "unknown";
  if (days < 0) return "critical";
  if (days < thresholdCritical) return "critical";
  if (days < thresholdWarning) return "warning";
  return "healthy";
}

// ============================================================
// Component
// ============================================================

export function WebsiteDetail({
  website,
  cfCache,
  activities,
  hubStatus,
  hubEvents,
  hubFlowInstances,
}: WebsiteDetailProps) {
  const [isPending, startTransition] = useTransition();
  const statusCfg = STATUS_CONFIG[website.status];

  // --- Extract CF data from cache ---
  const analytics7dCache = cfCache.find(
    (c) => c.data_type === "analytics_7d"
  );
  const analytics7d = analytics7dCache?.data as unknown as CFAnalyticsResult | null;

  const dnsCache = cfCache.find((c) => c.data_type === "dns_records");
  const dnsRecords = (dnsCache?.data as unknown as CFDnsRecord[]) ?? [];

  const lastSync = cfCache.length > 0
    ? cfCache.reduce((latest, c) =>
        c.fetched_at > latest ? c.fetched_at : latest, cfCache[0].fetched_at
      )
    : null;

  // --- Compute health indicators ---
  const sslHealth: HealthStatus =
    website.ssl_status === "none"
      ? "unknown"
      : website.ssl_status === "expired"
        ? "critical"
        : computeHealthStatus(website.ssl_expiry_date);

  const sslDetail =
    website.ssl_status === "none"
      ? "Няма SSL"
      : website.ssl_status === "expired"
        ? "Изтекъл SSL сертификат"
        : website.ssl_expiry_date
          ? `Изтича ${formatDate(website.ssl_expiry_date)}`
          : "Няма данни за дата";

  const domainHealth: HealthStatus = computeHealthStatus(
    website.domain_expiry_date
  );
  const domainDays = daysUntil(website.domain_expiry_date);
  const domainDetail = website.domain_expiry_date
    ? domainDays !== null && domainDays < 0
      ? `Изтекъл преди ${Math.abs(domainDays)} дни`
      : `Изтича ${formatDate(website.domain_expiry_date)}${domainDays !== null ? ` (${domainDays}d)` : ""}`
    : "Няма дата";

  const hostingHealth: HealthStatus = computeHealthStatus(
    website.hosting_renewal_date,
    7,
    30
  );
  const hostingDetail = website.hosting_renewal_date
    ? `Подновяване ${formatDate(website.hosting_renewal_date)}`
    : "Няма данни";

  const cfHealth: HealthStatus = website.cloudflare_zone_id
    ? "healthy"
    : "unknown";
  const cfDetail = website.cloudflare_zone_id
    ? `Zone: ${website.cloudflare_zone_id.slice(0, 12)}...`
    : "Няма свързана зона";

  // --- External links ---
  const externalLinks: { label: string; url: string; icon: typeof Globe }[] =
    [];
  if (website.ga4_property_id) {
    externalLinks.push({
      label: "Google Analytics",
      url: `https://analytics.google.com/analytics/web/#/p${website.ga4_property_id}/reports`,
      icon: BarChart3,
    });
  }
  if (website.gsc_property_url) {
    externalLinks.push({
      label: "Search Console",
      url: `https://search.google.com/search-console?resource_id=${encodeURIComponent(website.gsc_property_url)}`,
      icon: Globe,
    });
  }
  if (website.cloudflare_zone_id) {
    externalLinks.push({
      label: "CF Dashboard",
      url: `https://dash.cloudflare.com/${website.cloudflare_zone_id}`,
      icon: Cloud,
    });
  }
  if (website.cms_admin_url) {
    externalLinks.push({
      label: "CMS Admin",
      url: website.cms_admin_url,
      icon: Server,
    });
  }

  function handleSync() {
    startTransition(async () => {
      try {
        const result = await syncWebsite(website.id);
        if ("error" in result && result.error) {
          toast.error(result.error);
        } else {
          toast.success("Cloudflare данните са синхронизирани");
        }
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Грешка при синхронизация"
        );
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/admin/crm/websites"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={14} />
        Всички сайтове
      </Link>

      {/* ============================================================ */}
      {/* Header card */}
      {/* ============================================================ */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="px-5 py-4 border-b border-border/50">
          <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
            // САЙТ
          </span>
        </div>

        <div className="p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            {/* Website info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  {website.domain}
                </h1>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                    statusCfg.badgeClass
                  )}
                >
                  <span
                    className={cn(
                      "block w-1.5 h-1.5 rounded-full",
                      statusCfg.dotClass
                    )}
                  />
                  {statusCfg.label}
                </span>
              </div>

              {website.name && (
                <p className="text-sm text-muted-foreground">{website.name}</p>
              )}

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="text-muted-foreground/40">Клиент:</span>
                <Link
                  href={`/admin/crm/clients/${website.crm_clients.id}`}
                  className="text-neon hover:underline"
                >
                  {website.crm_clients.company_name}
                </Link>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="text-muted-foreground/40">Платформа:</span>
                {website.platform ? (
                  <span>
                    {PLATFORM_LABELS[website.platform] ?? website.platform}
                    {website.platform_version && (
                      <span className="text-xs text-muted-foreground/40 ml-1">
                        v{website.platform_version}
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="text-muted-foreground/40">{"\u2014"}</span>
                )}
                <PlatformDetectButton
                  websiteId={website.id}
                  mode="single"
                  variant="ghost"
                  size="sm"
                />
              </div>

              {/* Tags */}
              {website.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {website.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-neon/5 text-neon/60 border border-neon/10"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="flex flex-wrap gap-2 shrink-0">
              <Link
                href={`/admin/crm/websites/${website.id}/edit`}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border border-neon/20 bg-neon/5",
                  "px-3 py-2 text-sm font-medium text-neon",
                  "hover:bg-neon/10 hover:border-neon/40 transition-colors"
                )}
              >
                <Pencil size={14} />
                Редактирай
              </Link>
              {website.url && (
                <a
                  href={website.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg border border-border",
                    "px-3 py-2 text-sm font-medium text-foreground",
                    "hover:bg-white/[0.03] hover:border-border/80 transition-colors"
                  )}
                >
                  <ExternalLink size={14} />
                  Отвори сайта
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* Health Check */}
      {/* ============================================================ */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
          <div>
            <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
              // HEALTH CHECK
            </span>
            <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
              Състояние
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            disabled={isPending}
            onClick={handleSync}
            className="text-neon hover:text-neon hover:bg-neon/10"
          >
            <RefreshCw
              size={14}
              className={cn("mr-1.5", isPending && "animate-spin")}
            />
            {isPending ? "Sync..." : "Sync Now"}
          </Button>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <WebsiteHealthIndicator
            status={sslHealth}
            label="SSL"
            detail={sslDetail}
          />
          <WebsiteHealthIndicator
            status={domainHealth}
            label="Домейн"
            detail={domainDetail}
          />
          <WebsiteHealthIndicator
            status={hostingHealth}
            label="Хостинг"
            detail={hostingDetail}
          />
          <WebsiteHealthIndicator
            status={cfHealth}
            label="Cloudflare"
            detail={cfDetail}
          />
        </div>
        {lastSync && (
          <div className="px-5 pb-4">
            <p className="text-[10px] text-muted-foreground/30 font-mono">
              Последен sync: {formatRelativeTime(lastSync)}
            </p>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* External Links */}
      {/* ============================================================ */}
      {externalLinks.length > 0 && (
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50">
            <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
              // ВРЪЗКИ
            </span>
            <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
              Външни линкове
            </h2>
          </div>
          <div className="p-5 flex flex-wrap gap-2">
            {externalLinks.map((link) => {
              const LinkIcon = link.icon;
              return (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg border border-border",
                    "px-3 py-2 text-sm font-medium text-foreground",
                    "hover:bg-white/[0.03] hover:border-border/80 transition-colors"
                  )}
                >
                  <LinkIcon size={14} className="text-muted-foreground/60" />
                  {link.label}
                  <ExternalLink size={12} className="text-muted-foreground/30" />
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* Domain info + Hosting info cards side by side */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Domain info */}
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50">
            <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
              // ДОМЕЙН
            </span>
            <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
              Домейн
            </h2>
          </div>
          <div className="p-5 space-y-3">
            <InfoRow
              label="Регистратор"
              value={website.domain_registrar}
            />
            <InfoRow
              label="Изтича"
              value={formatDate(website.domain_expiry_date)}
              valueClass={
                domainHealth === "critical"
                  ? "text-red-400"
                  : domainHealth === "warning"
                    ? "text-amber-400"
                    : undefined
              }
            />
            <InfoRow
              label="Auto-renew"
              value={
                website.domain_auto_renew ? (
                  <span className="inline-flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 size={12} />
                    Да
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-red-400">
                    <XCircle size={12} />
                    Не
                  </span>
                )
              }
            />
          </div>
        </div>

        {/* Hosting info */}
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50">
            <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
              // ХОСТИНГ
            </span>
            <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
              Хостинг
            </h2>
          </div>
          <div className="p-5 space-y-3">
            <InfoRow
              label="Доставчик"
              value={
                website.hosting_provider
                  ? HOSTING_LABELS[website.hosting_provider] ??
                    website.hosting_provider
                  : null
              }
            />
            <InfoRow label="План" value={website.hosting_plan} />
            <InfoRow
              label="Подновяване"
              value={formatDate(website.hosting_renewal_date)}
              valueClass={
                hostingHealth === "critical"
                  ? "text-red-400"
                  : hostingHealth === "warning"
                    ? "text-amber-400"
                    : undefined
              }
            />
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* CF Analytics */}
      {/* ============================================================ */}
      {analytics7d && (
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50">
            <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
              // CF ANALYTICS (7 ДНИ)
            </span>
            <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
              Cloudflare Analytics
            </h2>
          </div>
          <div className="p-5 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <AnalyticsCard
              icon={Eye}
              label="Pageviews"
              value={formatNumber(analytics7d.pageviews)}
            />
            <AnalyticsCard
              icon={BarChart3}
              label="Visitors"
              value={formatNumber(analytics7d.unique_visitors)}
            />
            <AnalyticsCard
              icon={HardDrive}
              label="Bandwidth"
              value={formatBytes(analytics7d.bandwidth_bytes)}
            />
            <AnalyticsCard
              icon={ShieldAlert}
              label="Threats"
              value={formatNumber(analytics7d.threats)}
              valueClass={analytics7d.threats > 0 ? "text-red-400" : undefined}
            />
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* DNS Records */}
      {/* ============================================================ */}
      {dnsRecords.length > 0 && (
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50">
            <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
              // DNS RECORDS
            </span>
            <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
              DNS записи
            </h2>
            <p className="text-xs text-muted-foreground/40 mt-0.5">
              {dnsRecords.length} {dnsRecords.length === 1 ? "запис" : "записа"}
            </p>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="font-mono text-[10px] text-muted-foreground/50 tracking-wider">
                    TYPE
                  </TableHead>
                  <TableHead className="font-mono text-[10px] text-muted-foreground/50 tracking-wider">
                    NAME
                  </TableHead>
                  <TableHead className="font-mono text-[10px] text-muted-foreground/50 tracking-wider">
                    CONTENT
                  </TableHead>
                  <TableHead className="font-mono text-[10px] text-muted-foreground/50 tracking-wider text-center">
                    PROXIED
                  </TableHead>
                  <TableHead className="font-mono text-[10px] text-muted-foreground/50 tracking-wider text-right">
                    TTL
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dnsRecords.map((record) => (
                  <TableRow
                    key={record.id}
                    className="border-border/30 hover:bg-white/[0.02]"
                  >
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="font-mono text-[10px] border-border/50 text-muted-foreground px-1.5 py-0"
                      >
                        {record.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-mono text-foreground max-w-[200px] truncate">
                      {record.name}
                    </TableCell>
                    <TableCell className="text-sm font-mono text-muted-foreground max-w-[250px] truncate">
                      {record.content}
                    </TableCell>
                    <TableCell className="text-center">
                      {record.proxied ? (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-400">
                          <Cloud size={12} />
                          Да
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground/40">
                          Не
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono text-right">
                      {record.ttl === 1 ? "Auto" : `${record.ttl}s`}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* Hub */}
      {/* ============================================================ */}
      <HubConnection websiteId={website.id} status={hubStatus} />

      {/* ============================================================ */}
      {/* Hub Events Feed */}
      {/* ============================================================ */}
      {hubStatus?.connected && (hubEvents.length > 0 || hubFlowInstances.length > 0) && (
        <HubEventsFeed
          events={hubEvents}
          tablesConfig={hubStatus.tables_config}
          flowInstances={hubFlowInstances}
          flowConfig={hubStatus.flow_config}
        />
      )}

      {/* ============================================================ */}
      {/* Notes */}
      {/* ============================================================ */}
      {website.notes && (
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50">
            <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
              // БЕЛЕЖКИ
            </span>
            <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
              Вътрешни бележки
            </h2>
          </div>
          <div className="p-5">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {website.notes}
            </p>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* Activity Log */}
      {/* ============================================================ */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="px-5 py-4 border-b border-border/50">
          <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
            // ЖУРНАЛ
          </span>
          <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
            Активност
          </h2>
        </div>
        {activities.length === 0 ? (
          <div className="p-8 text-center">
            <Activity
              size={28}
              className="mx-auto text-muted-foreground/20 mb-3"
            />
            <p className="font-mono text-sm text-muted-foreground/50">
              $ crm activity --entity=website --id={website.id.slice(0, 8)}
            </p>
            <p className="font-mono text-sm text-muted-foreground/50 mt-1">
              0 results found
            </p>
            <p className="text-xs text-muted-foreground/30 mt-3">
              Няма записана активност.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {activities.map((activity) => {
              const config = ACTION_ICON_MAP[activity.action] ?? {
                icon: Activity,
                iconClass: "text-muted-foreground bg-muted-foreground/10",
              };
              const ActionIcon = config.icon;

              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      "rounded-lg p-1.5 shrink-0 mt-0.5",
                      config.iconClass
                    )}
                  >
                    <ActionIcon size={14} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-snug">
                      {activity.description || activity.action}
                    </p>
                    {activity.actor && (
                      <span className="text-[10px] text-muted-foreground/30 font-mono mt-0.5 block">
                        {activity.actor}
                      </span>
                    )}
                  </div>

                  {/* Time */}
                  <span className="text-xs text-muted-foreground/40 shrink-0 mt-0.5">
                    {formatRelativeTime(activity.created_at)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Loading overlay */}
      {isPending && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="font-mono text-sm text-neon animate-pulse">
            syncing cloudflare...
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Sub-components
// ============================================================

function InfoRow({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-muted-foreground/50 shrink-0">
        {label}
      </span>
      <span
        className={cn(
          "text-sm text-foreground font-mono text-right truncate",
          valueClass
        )}
      >
        {value || "\—"}
      </span>
    </div>
  );
}

function AnalyticsCard({
  icon: Icon,
  label,
  value,
  valueClass,
}: {
  icon: typeof Eye;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-4 space-y-2">
      <div className="flex items-center gap-2">
        <Icon size={14} className="text-muted-foreground/40" />
        <span className="text-xs text-muted-foreground/50">{label}</span>
      </div>
      <p
        className={cn(
          "text-xl font-mono font-bold text-foreground",
          valueClass
        )}
      >
        {value}
      </p>
    </div>
  );
}
