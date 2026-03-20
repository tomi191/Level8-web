"use client";

import { Globe, ShieldCheck, AlertTriangle, XCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExpiringDomain, DomainUrgency } from "@/types/crm";

interface CrmDomainTimelineProps {
  domains: ExpiringDomain[];
}

const URGENCY_CONFIG: Record<
  DomainUrgency,
  { label: string; dotClass: string; textClass: string; icon: typeof AlertTriangle }
> = {
  expired: {
    label: "Изтекъл",
    dotClass: "bg-red-500",
    textClass: "text-red-400",
    icon: XCircle,
  },
  critical: {
    label: "Критично",
    dotClass: "bg-red-500 animate-pulse",
    textClass: "text-red-400",
    icon: AlertTriangle,
  },
  warning: {
    label: "Внимание",
    dotClass: "bg-amber-500",
    textClass: "text-amber-400",
    icon: AlertTriangle,
  },
  ok: {
    label: "OK",
    dotClass: "bg-emerald-500",
    textClass: "text-emerald-400",
    icon: CheckCircle,
  },
};

function formatExpiryDate(dateStr: string | null): string {
  if (!dateStr) return "---";
  const date = new Date(dateStr);
  return date.toLocaleDateString("bg-BG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getExpiryType(domain: ExpiringDomain): string {
  if (!domain.earliest_expiry) return "---";

  const hasDomainExpiry = domain.domain_expiry_date === domain.earliest_expiry;
  const hasSslExpiry = domain.ssl_expiry_date === domain.earliest_expiry;

  if (hasDomainExpiry && hasSslExpiry) return "Домейн + SSL";
  if (hasDomainExpiry) return "Домейн";
  if (hasSslExpiry) return "SSL";
  return "---";
}

export function CrmDomainTimeline({ domains }: CrmDomainTimelineProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden">
      <div className="px-5 py-4 border-b border-border/50">
        <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
          // ДОМЕЙНИ
        </span>
        <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
          Изтичащи домейни и SSL
        </h2>
      </div>

      {domains.length === 0 ? (
        <div className="p-8 text-center">
          <p className="font-mono text-sm text-muted-foreground/50">
            $ crm domains --expiring --limit 20
          </p>
          <p className="font-mono text-sm text-muted-foreground/50 mt-1">
            0 results found
          </p>
          <p className="text-xs text-muted-foreground/30 mt-3">
            Няма домейни или SSL сертификати, изтичащи скоро.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border/30">
          {domains.map((domain) => {
            const config = URGENCY_CONFIG[domain.urgency];
            const UrgencyIcon = config.icon;
            const days = daysUntil(domain.earliest_expiry);
            const expiryType = getExpiryType(domain);

            return (
              <div
                key={domain.id}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
              >
                {/* Urgency dot */}
                <span
                  className={cn("w-2 h-2 rounded-full shrink-0", config.dotClass)}
                />

                {/* Domain + company */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Globe size={14} className="text-muted-foreground/40 shrink-0" />
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
                    domain.urgency === "expired" || domain.urgency === "critical"
                      ? "border-red-500/20 text-red-400/70 bg-red-500/5"
                      : domain.urgency === "warning"
                        ? "border-amber-500/20 text-amber-400/70 bg-amber-500/5"
                        : "border-emerald-500/20 text-emerald-400/70 bg-emerald-500/5"
                  )}
                >
                  {expiryType}
                </span>

                {/* Days countdown */}
                <div className="text-right shrink-0 min-w-[70px]">
                  {days !== null ? (
                    <>
                      <span
                        className={cn(
                          "font-mono text-sm font-bold block",
                          config.textClass
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

                {/* Urgency icon */}
                <UrgencyIcon size={14} className={cn("shrink-0", config.textClass)} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
