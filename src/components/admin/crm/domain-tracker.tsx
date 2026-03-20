"use client";

import {
  Globe,
  ShieldCheck,
  ShieldAlert,
  Server,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  ExpiringDomain,
  CrmWebsiteWithClient,
  DomainUrgency,
} from "@/types/crm";

interface DomainTrackerProps {
  domains: ExpiringDomain[];
  allWebsites: CrmWebsiteWithClient[];
}

// --- Helpers ---

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatExpiryDate(dateStr: string | null): string {
  if (!dateStr) return "\—";
  return new Date(dateStr).toLocaleDateString("bg-BG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getExpiryType(domain: ExpiringDomain): string {
  if (!domain.earliest_expiry) return "\—";
  const hasDomain = domain.domain_expiry_date === domain.earliest_expiry;
  const hasSsl = domain.ssl_expiry_date === domain.earliest_expiry;
  if (hasDomain && hasSsl) return "Domain + SSL";
  if (hasDomain) return "Domain";
  if (hasSsl) return "SSL";
  return "\—";
}

// --- Urgency grouping for timeline ---

interface TimelineGroup {
  key: string;
  label: string;
  colorClass: string;
  dotClass: string;
  headerBg: string;
  items: ExpiringDomain[];
}

function groupByUrgency(domains: ExpiringDomain[]): TimelineGroup[] {
  const expired: ExpiringDomain[] = [];
  const thisWeek: ExpiringDomain[] = [];
  const thisMonth: ExpiringDomain[] = [];
  const threeMonths: ExpiringDomain[] = [];
  const sixMonths: ExpiringDomain[] = [];

  for (const d of domains) {
    const days = daysUntil(d.earliest_expiry);
    if (days === null) continue;
    if (days <= 0) expired.push(d);
    else if (days <= 7) thisWeek.push(d);
    else if (days <= 30) thisMonth.push(d);
    else if (days <= 90) threeMonths.push(d);
    else if (days <= 180) sixMonths.push(d);
  }

  const groups: TimelineGroup[] = [];

  if (expired.length > 0) {
    groups.push({
      key: "expired",
      label: "Изтекли",
      colorClass: "text-red-400",
      dotClass: "bg-red-500",
      headerBg: "bg-red-500/5 border-red-500/20",
      items: expired,
    });
  }
  if (thisWeek.length > 0) {
    groups.push({
      key: "this-week",
      label: "Тази седмица",
      colorClass: "text-red-400",
      dotClass: "bg-red-500 animate-pulse",
      headerBg: "bg-red-500/5 border-red-500/20",
      items: thisWeek,
    });
  }
  if (thisMonth.length > 0) {
    groups.push({
      key: "this-month",
      label: "Този месец",
      colorClass: "text-amber-400",
      dotClass: "bg-amber-500",
      headerBg: "bg-amber-500/5 border-amber-500/20",
      items: thisMonth,
    });
  }
  if (threeMonths.length > 0) {
    groups.push({
      key: "three-months",
      label: "3 месеца",
      colorClass: "text-foreground",
      dotClass: "bg-blue-500",
      headerBg: "bg-blue-500/5 border-blue-500/20",
      items: threeMonths,
    });
  }
  if (sixMonths.length > 0) {
    groups.push({
      key: "six-months",
      label: "6 месеца",
      colorClass: "text-muted-foreground",
      dotClass: "bg-gray-500",
      headerBg: "bg-gray-500/5 border-gray-500/20",
      items: sixMonths,
    });
  }

  return groups;
}

// --- Urgency color for days ---

function getDaysColor(days: number | null): string {
  if (days === null) return "text-muted-foreground/30";
  if (days <= 0) return "text-red-400";
  if (days <= 7) return "text-red-400";
  if (days <= 30) return "text-amber-400";
  return "text-emerald-400";
}

function getDotColor(days: number | null): string {
  if (days === null) return "bg-gray-500";
  if (days <= 0) return "bg-red-500";
  if (days <= 7) return "bg-red-500 animate-pulse";
  if (days <= 30) return "bg-amber-500";
  return "bg-emerald-500";
}

// --- Build website expiry rows ---

interface WebsiteExpiryRow {
  id: string;
  domain: string;
  company_name: string;
  expiry_type: string;
  expiry_date: string | null;
  days: number | null;
  auto_renew: boolean;
}

function buildAllWebsiteRows(
  websites: CrmWebsiteWithClient[]
): WebsiteExpiryRow[] {
  const rows: WebsiteExpiryRow[] = [];

  for (const ws of websites) {
    // Domain expiry
    if (ws.domain_expiry_date) {
      rows.push({
        id: `${ws.id}-domain`,
        domain: ws.domain,
        company_name: ws.crm_clients.company_name,
        expiry_type: "Domain",
        expiry_date: ws.domain_expiry_date,
        days: daysUntil(ws.domain_expiry_date),
        auto_renew: ws.domain_auto_renew,
      });
    }
    // SSL expiry
    if (ws.ssl_expiry_date) {
      rows.push({
        id: `${ws.id}-ssl`,
        domain: ws.domain,
        company_name: ws.crm_clients.company_name,
        expiry_type: "SSL",
        expiry_date: ws.ssl_expiry_date,
        days: daysUntil(ws.ssl_expiry_date),
        auto_renew: false,
      });
    }
    // Hosting renewal
    if (ws.hosting_renewal_date) {
      rows.push({
        id: `${ws.id}-hosting`,
        domain: ws.domain,
        company_name: ws.crm_clients.company_name,
        expiry_type: "Хостинг",
        expiry_date: ws.hosting_renewal_date,
        days: daysUntil(ws.hosting_renewal_date),
        auto_renew: false,
      });
    }
  }

  // Sort by days ascending (most urgent first), nulls last
  rows.sort((a, b) => {
    if (a.days === null && b.days === null) return 0;
    if (a.days === null) return 1;
    if (b.days === null) return -1;
    return a.days - b.days;
  });

  return rows;
}

// --- Summary stats ---

function computeStats(
  domains: ExpiringDomain[],
  allWebsites: CrmWebsiteWithClient[]
) {
  // Count unique domains from websites
  const totalDomains = allWebsites.length;

  // Expiring soon = within 30 days
  let expiringSoon = 0;
  let expiredCount = 0;
  for (const d of domains) {
    const days = daysUntil(d.earliest_expiry);
    if (days !== null) {
      if (days <= 0) expiredCount++;
      else if (days <= 30) expiringSoon++;
    }
  }

  return { totalDomains, expiringSoon, expiredCount };
}

// ============================================================
// Component
// ============================================================

export function DomainTracker({
  domains,
  allWebsites,
}: DomainTrackerProps) {
  const stats = computeStats(domains, allWebsites);
  const groups = groupByUrgency(domains);
  const allRows = buildAllWebsiteRows(allWebsites);

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg p-2 bg-neon/10 text-neon">
              <Globe size={18} />
            </div>
            <div>
              <p className="font-mono text-2xl font-bold text-foreground">
                {stats.totalDomains}
              </p>
              <p className="text-xs text-muted-foreground">
                Общо домейни
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg p-2 bg-amber-500/10 text-amber-400">
              <Clock size={18} />
            </div>
            <div>
              <p className="font-mono text-2xl font-bold text-foreground">
                {stats.expiringSoon}
              </p>
              <p className="text-xs text-muted-foreground">
                Изтичат скоро (&lt;30 дни)
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg p-2 bg-red-500/10 text-red-400">
              <XCircle size={18} />
            </div>
            <div>
              <p className="font-mono text-2xl font-bold text-foreground">
                {stats.expiredCount}
              </p>
              <p className="text-xs text-muted-foreground">
                Изтекли
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline view - grouped by urgency */}
      {groups.length > 0 && (
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50">
            <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
              // TIMELINE
            </span>
            <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
              Изтичащи домейни и SSL
            </h2>
          </div>

          <div className="divide-y divide-border/30">
            {groups.map((group) => (
              <div key={group.key}>
                {/* Group header */}
                <div
                  className={cn(
                    "px-5 py-2.5 border-b border-border/20",
                    group.headerBg
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full shrink-0",
                        group.dotClass
                      )}
                    />
                    <span
                      className={cn(
                        "font-mono text-xs font-bold tracking-wider uppercase",
                        group.colorClass
                      )}
                    >
                      {group.label}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground/40 ml-1">
                      ({group.items.length})
                    </span>
                  </div>
                </div>

                {/* Group items */}
                {group.items.map((domain) => {
                  const days = daysUntil(domain.earliest_expiry);
                  const expiryType = getExpiryType(domain);

                  return (
                    <div
                      key={domain.id}
                      className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Urgency dot */}
                      <span
                        className={cn(
                          "w-2 h-2 rounded-full shrink-0",
                          getDotColor(days)
                        )}
                      />

                      {/* Domain + company */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Globe
                            size={14}
                            className="text-muted-foreground/40 shrink-0"
                          />
                          <span className="text-sm font-medium text-foreground truncate">
                            {domain.domain}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground/50 mt-0.5 truncate pl-[22px]">
                          {domain.company_name}
                        </p>
                      </div>

                      {/* Expiry type badge */}
                      <span
                        className={cn(
                          "text-[10px] font-mono px-2 py-0.5 rounded-full border shrink-0 hidden sm:inline-flex",
                          days !== null && days <= 0
                            ? "border-red-500/20 text-red-400/70 bg-red-500/5"
                            : days !== null && days <= 7
                              ? "border-red-500/20 text-red-400/70 bg-red-500/5"
                              : days !== null && days <= 30
                                ? "border-amber-500/20 text-amber-400/70 bg-amber-500/5"
                                : "border-emerald-500/20 text-emerald-400/70 bg-emerald-500/5"
                        )}
                      >
                        {expiryType}
                      </span>

                      {/* Auto-renew indicator */}
                      {domain.domain_auto_renew && (
                        <span className="hidden md:block shrink-0" aria-label="Авто-подновяване включено">
                          <CheckCircle size={14} className="text-emerald-400" />
                        </span>
                      )}

                      {/* Days countdown */}
                      <div className="text-right shrink-0 min-w-[70px]">
                        {days !== null ? (
                          <>
                            <span
                              className={cn(
                                "font-mono text-sm font-bold block",
                                getDaysColor(days)
                              )}
                            >
                              {days <= 0
                                ? "Изтекъл"
                                : `${days} ${days === 1 ? "ден" : "дни"}`}
                            </span>
                            <span className="text-[10px] text-muted-foreground/40 block">
                              {formatExpiryDate(domain.earliest_expiry)}
                            </span>
                          </>
                        ) : (
                          <span className="font-mono text-xs text-muted-foreground/30">
                            ---
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All websites - full table */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="px-5 py-4 border-b border-border/50">
          <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
            // ВСИЧКИ САЙТОВЕ
          </span>
          <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
            Пълен списък
          </h2>
          <p className="text-xs text-muted-foreground/50 mt-0.5">
            Домейни, SSL сертификати и хостинг подновявания за всички сайтове
          </p>
        </div>

        {allRows.length === 0 ? (
          <div className="p-8 text-center">
            <Globe
              size={28}
              className="mx-auto text-muted-foreground/20 mb-3"
            />
            <p className="font-mono text-sm text-muted-foreground/50">
              $ crm domains --all
            </p>
            <p className="font-mono text-sm text-muted-foreground/50 mt-1">
              0 results found
            </p>
            <p className="text-xs text-muted-foreground/30 mt-3">
              Няма сайтове с въведени дати за домейн, SSL или хостинг.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {allRows.map((row) => (
              <div
                key={row.id}
                className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors"
              >
                {/* Urgency dot */}
                <span
                  className={cn(
                    "w-2 h-2 rounded-full shrink-0",
                    getDotColor(row.days)
                  )}
                />

                {/* Domain + company */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {row.expiry_type === "SSL" ? (
                      <ShieldCheck
                        size={14}
                        className="text-muted-foreground/40 shrink-0"
                      />
                    ) : row.expiry_type === "Хостинг" ? (
                      <Server
                        size={14}
                        className="text-muted-foreground/40 shrink-0"
                      />
                    ) : (
                      <Globe
                        size={14}
                        className="text-muted-foreground/40 shrink-0"
                      />
                    )}
                    <span className="text-sm font-medium text-foreground truncate">
                      {row.domain}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground/50 mt-0.5 truncate pl-[22px]">
                    {row.company_name}
                  </p>
                </div>

                {/* Type badge */}
                <span
                  className={cn(
                    "text-[10px] font-mono px-2 py-0.5 rounded-full border shrink-0 hidden sm:inline-flex",
                    row.expiry_type === "SSL"
                      ? "border-blue-500/20 text-blue-400/70 bg-blue-500/5"
                      : row.expiry_type === "Хостинг"
                        ? "border-purple-500/20 text-purple-400/70 bg-purple-500/5"
                        : "border-neon/20 text-neon/70 bg-neon/5"
                  )}
                >
                  {row.expiry_type}
                </span>

                {/* Auto-renew */}
                {row.auto_renew && (
                  <span className="hidden md:block shrink-0" aria-label="Авто-подновяване включено">
                    <CheckCircle size={14} className="text-emerald-400" />
                  </span>
                )}

                {/* Date + days */}
                <div className="text-right shrink-0 min-w-[90px]">
                  <span className="text-xs text-muted-foreground block">
                    {formatExpiryDate(row.expiry_date)}
                  </span>
                  {row.days !== null && (
                    <span
                      className={cn(
                        "font-mono text-[11px] font-bold block mt-0.5",
                        getDaysColor(row.days)
                      )}
                    >
                      {row.days <= 0
                        ? "Изтекъл"
                        : `${row.days} ${row.days === 1 ? "ден" : "дни"}`}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
