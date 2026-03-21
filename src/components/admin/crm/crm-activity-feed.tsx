"use client";

import {
  Plus,
  Pencil,
  Archive,
  Trash2,
  CreditCard,
  StickyNote,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { CrmActivityLog, ActivityAction, EntityType } from "@/types/crm";

interface CrmActivityFeedProps {
  activities: CrmActivityLog[];
}

const ACTION_CONFIG: Record<
  ActivityAction,
  { label: string; icon: typeof Plus; iconClass: string }
> = {
  created: {
    label: "Създаване",
    icon: Plus,
    iconClass: "text-emerald-400 bg-emerald-500/10",
  },
  updated: {
    label: "Обновяване",
    icon: Pencil,
    iconClass: "text-blue-400 bg-blue-500/10",
  },
  archived: {
    label: "Архивиране",
    icon: Archive,
    iconClass: "text-amber-400 bg-amber-500/10",
  },
  deleted: {
    label: "Изтриване",
    icon: Trash2,
    iconClass: "text-red-400 bg-red-500/10",
  },
  payment_received: {
    label: "Плащане",
    icon: CreditCard,
    iconClass: "text-neon bg-neon/10",
  },
  note_added: {
    label: "Бележка",
    icon: StickyNote,
    iconClass: "text-purple-400 bg-purple-500/10",
  },
  status_changed: {
    label: "Статус",
    icon: StickyNote,
    iconClass: "text-blue-400 bg-blue-500/10",
  },
};

const ENTITY_LABELS: Record<EntityType, string> = {
  client: "Клиент",
  website: "Сайт",
  invoice: "Фактура",
  domain: "Домейн",
  service: "Услуга",
  contract: "Договор",
};

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
  if (diffHr < 24) return `Преди ${diffHr} ${diffHr === 1 ? "час" : "часа"}`;
  if (diffDays < 7) return `Преди ${diffDays} ${diffDays === 1 ? "ден" : "дни"}`;

  return new Date(dateStr).toLocaleDateString("bg-BG", {
    day: "numeric",
    month: "short",
  });
}

export function CrmActivityFeed({ activities }: CrmActivityFeedProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden">
      <div className="px-5 py-4 border-b border-border/50">
        <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
          // ЖУРНАЛ
        </span>
        <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
          Последна активност
        </h2>
      </div>

      {activities.length === 0 ? (
        <div className="p-8 text-center">
          <p className="font-mono text-sm text-muted-foreground/50">
            $ crm activity --recent --limit 15
          </p>
          <p className="font-mono text-sm text-muted-foreground/50 mt-1">
            0 results found
          </p>
          <p className="text-xs text-muted-foreground/30 mt-3">
            Няма записана активност все още.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border/30">
          {activities.map((activity) => {
            const config = ACTION_CONFIG[activity.action] ?? {
              label: activity.action,
              icon: Activity,
              iconClass: "text-muted-foreground bg-muted-foreground/10",
            };
            const ActionIcon = config.icon;
            const entityLabel = ENTITY_LABELS[activity.entity_type] ?? activity.entity_type;

            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
              >
                {/* Action icon */}
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
                    {activity.description || (
                      <>
                        <span className="font-medium">{config.label}</span>
                        {" "}
                        <span className="text-muted-foreground">&mdash;</span>
                        {" "}
                        <span className="text-muted-foreground">{entityLabel}</span>
                      </>
                    )}
                  </p>

                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="outline"
                      className="text-[10px] font-mono border-border/50 text-muted-foreground/50 px-1.5 py-0"
                    >
                      {entityLabel}
                    </Badge>

                    {activity.actor && (
                      <span className="text-[10px] text-muted-foreground/30 font-mono truncate">
                        {activity.actor}
                      </span>
                    )}
                  </div>
                </div>

                {/* Relative time */}
                <span className="text-xs text-muted-foreground/40 shrink-0 mt-0.5">
                  {formatRelativeTime(activity.created_at)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
