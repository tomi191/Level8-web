"use client";

import Link from "next/link";
import { CalendarClock, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CrmClientServiceWithRelations } from "@/types/crm";

interface CrmUpcomingBillingProps {
  services: CrmClientServiceWithRelations[];
}

const BILLING_CYCLE_LABELS: Record<string, string> = {
  monthly: "мес.",
  quarterly: "трим.",
  yearly: "год.",
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "\u2014";
  return new Date(dateStr).toLocaleDateString("bg-BG", {
    day: "numeric",
    month: "short",
  });
}

function daysUntil(dateStr: string): number {
  return Math.ceil(
    (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
}

function formatPrice(price: number): string {
  return (
    new Intl.NumberFormat("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price) + " \u20ac"
  );
}

export function CrmUpcomingBilling({ services }: CrmUpcomingBillingProps) {
  if (services.length === 0) return null;

  const overdueServices = services.filter(
    (s) => s.next_billing_date && daysUntil(s.next_billing_date) <= 0
  );
  const upcomingServices = services.filter(
    (s) => s.next_billing_date && daysUntil(s.next_billing_date) > 0
  );

  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden">
      <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
        <div>
          <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
            {"// "}ПРЕДСТОЯЩИ ПЛАЩАНИЯ
          </span>
          <h2 className="font-display text-lg font-bold text-foreground mt-0.5 flex items-center gap-2">
            <CalendarClock size={16} className="text-muted-foreground/50" />
            Предстоящо фактуриране ({services.length})
          </h2>
        </div>
        <Link
          href="/admin/crm/services"
          className="text-xs text-neon/60 hover:text-neon transition-colors"
        >
          Всички услуги
        </Link>
      </div>

      {/* Overdue billing alert */}
      {overdueServices.length > 0 && (
        <div className="px-5 py-2.5 bg-red-500/5 border-b border-red-500/10 text-xs text-red-400">
          <span className="font-bold">{overdueServices.length}</span>{" "}
          {overdueServices.length === 1
            ? "услуга е с изтекъл срок за фактуриране"
            : "услуги са с изтекъл срок за фактуриране"}
        </div>
      )}

      <div className="divide-y divide-border/20">
        {services.map((svc) => {
          const days = svc.next_billing_date
            ? daysUntil(svc.next_billing_date)
            : null;
          const isOverdue = days !== null && days <= 0;
          const isUrgent = days !== null && days <= 7;

          return (
            <Link
              key={svc.id}
              href={`/admin/crm/services/${svc.id}`}
              className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors group"
            >
              <div
                className={cn(
                  "rounded-lg p-1.5 shrink-0",
                  isOverdue
                    ? "bg-red-500/10 text-red-400"
                    : isUrgent
                      ? "bg-amber-500/10 text-amber-400"
                      : "bg-neon/10 text-neon/60"
                )}
              >
                <Package size={14} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground truncate">
                    {svc.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground/40 truncate">
                    {svc.crm_clients?.company_name}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground/50 mt-0.5">
                  <span>
                    {formatPrice(svc.price)}/
                    {BILLING_CYCLE_LABELS[svc.billing_cycle] ?? svc.billing_cycle}
                  </span>
                  {svc.crm_websites?.domain && (
                    <span className="truncate">{svc.crm_websites.domain}</span>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0">
                {svc.next_billing_date && (
                  <>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[9px] font-mono",
                        isOverdue
                          ? "border-red-500/20 bg-red-500/10 text-red-400"
                          : isUrgent
                            ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                            : "border-border bg-transparent text-muted-foreground"
                      )}
                    >
                      {isOverdue
                        ? `${Math.abs(days!)} дни закъснение`
                        : `след ${days} ${days === 1 ? "ден" : "дни"}`}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground/30 block mt-0.5">
                      {formatDate(svc.next_billing_date)}
                    </span>
                  </>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
