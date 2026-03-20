"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Pencil,
  Calendar,
  CreditCard,
  RefreshCw,
  Plus,
  Archive,
  Trash2,
  StickyNote,
  Activity,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { archiveCrmService } from "@/lib/crm-actions";
import { ConfirmDialog } from "@/components/admin/crm/confirm-dialog";
import { toast } from "sonner";
import type {
  CrmClientServiceWithRelations,
  CrmActivityLog,
  ServiceStatus,
  ActivityAction,
} from "@/types/crm";

interface ServiceDetailProps {
  service: CrmClientServiceWithRelations;
  activities: CrmActivityLog[];
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
  monthly: "Месечно",
  quarterly: "Тримесечно",
  yearly: "Годишно",
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
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "\u2014";
  return new Date(dateStr).toLocaleDateString("bg-BG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(amount: number): string {
  return (
    new Intl.NumberFormat("bg-BG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + " \u20ac"
  );
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

export function ServiceDetail({
  service,
  activities,
}: ServiceDetailProps) {
  const [isPending, startTransition] = useTransition();
  const statusCfg =
    STATUS_CONFIG[service.status as ServiceStatus] ?? STATUS_CONFIG.active;

  function handleArchive() {
    startTransition(async () => {
      try {
        await archiveCrmService(service.id);
        toast.success("Услугата е архивирана");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Възникна грешка"
        );
      }
    });
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin/crm/services"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={14} />
        Всички услуги
      </Link>

      {/* Header card */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="px-5 py-4 border-b border-border/50">
          <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
            // УСЛУГА
          </span>
        </div>

        <div className="p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <Package size={20} className="text-neon/60" />
                <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  {service.name}
                </h1>
                <Badge
                  variant="outline"
                  className={cn("text-xs font-mono", statusCfg.className)}
                >
                  {statusCfg.label}
                </Badge>
              </div>

              <Link
                href={`/admin/crm/clients/${service.crm_clients.id}`}
                className="text-sm text-muted-foreground hover:text-neon transition-colors inline-block"
              >
                {service.crm_clients.company_name}
              </Link>

              {/* Info grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CreditCard
                    size={14}
                    className="text-muted-foreground/40 shrink-0"
                  />
                  <span className="text-xs text-muted-foreground/50">
                    Цена:
                  </span>
                  <span className="font-mono text-foreground">
                    {formatAmount(service.price)}
                  </span>
                  <span className="text-muted-foreground/50">
                    / {BILLING_CYCLE_LABELS[service.billing_cycle]?.toLowerCase() ?? service.billing_cycle}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Package
                    size={14}
                    className="text-muted-foreground/40 shrink-0"
                  />
                  {SERVICE_TYPE_LABELS[service.service_type] ??
                    service.service_type}
                </div>
                {service.crm_websites && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-xs text-muted-foreground/50">
                      Сайт:
                    </span>
                    <Link
                      href={`/admin/crm/websites/${service.crm_websites.id}`}
                      className="hover:text-neon transition-colors"
                    >
                      {service.crm_websites.domain}
                    </Link>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar
                    size={14}
                    className="text-muted-foreground/40 shrink-0"
                  />
                  <span className="text-xs text-muted-foreground/50">
                    Начало:
                  </span>
                  {formatDate(service.start_date)}
                </div>
                {service.end_date && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar
                      size={14}
                      className="text-muted-foreground/40 shrink-0"
                    />
                    <span className="text-xs text-muted-foreground/50">
                      Край:
                    </span>
                    {formatDate(service.end_date)}
                  </div>
                )}
                {service.next_billing_date && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar
                      size={14}
                      className="text-muted-foreground/40 shrink-0"
                    />
                    <span className="text-xs text-muted-foreground/50">
                      След. фактуриране:
                    </span>
                    {formatDate(service.next_billing_date)}
                  </div>
                )}
                {service.auto_renew && (
                  <div className="flex items-center gap-2 text-neon/70">
                    <RefreshCw size={14} className="shrink-0" />
                    Авто-подновяване
                  </div>
                )}
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex flex-wrap gap-2 shrink-0">
              <Link
                href={`/admin/crm/services/${service.id}/edit`}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border border-neon/20 bg-neon/5",
                  "px-3 py-2 text-sm font-medium text-neon",
                  "hover:bg-neon/10 hover:border-neon/40 transition-colors"
                )}
              >
                <Pencil size={14} />
                Редактирай
              </Link>
              <ConfirmDialog
                trigger={
                  <Button
                    variant="ghost"
                    className="text-muted-foreground hover:text-red-400"
                  >
                    <Archive size={14} className="mr-2" />
                    {"Архивирай"}
                  </Button>
                }
                title={"Архивиране на услуга"}
                description={`Сигурни ли сте, че искате да архивирате "${service.name}"?`}
                confirmLabel={"Архивирай"}
                variant="warning"
                onConfirm={handleArchive}
                isPending={isPending}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {service.notes && (
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50">
            <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
              // БЕЛЕЖКИ
            </span>
          </div>
          <div className="p-5">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {service.notes}
            </p>
          </div>
        </div>
      )}

      {/* Activity log */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="px-5 py-4 border-b border-border/50">
          <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
            // АКТИВНОСТ
          </span>
          <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
            История
          </h2>
        </div>

        {activities.length === 0 ? (
          <div className="p-8 text-center">
            <Activity
              size={28}
              className="mx-auto text-muted-foreground/20 mb-3"
            />
            <p className="font-mono text-sm text-muted-foreground/50">
              $ crm activity --entity=service
            </p>
            <p className="font-mono text-sm text-muted-foreground/50 mt-1">
              0 results found
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
                  <div
                    className={cn(
                      "rounded-lg p-1.5 shrink-0 mt-0.5",
                      config.iconClass
                    )}
                  >
                    <ActionIcon size={14} />
                  </div>
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
                  <span className="text-xs text-muted-foreground/40 shrink-0 mt-0.5">
                    {formatRelativeTime(activity.created_at)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
