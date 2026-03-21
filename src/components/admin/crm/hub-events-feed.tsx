"use client";

import { useState } from "react";
import {
  ShoppingCart,
  CreditCard,
  MessageCircle,
  UserPlus,
  Mail,
  Bell,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { HubEvent, HubTablesConfig } from "@/types/crm";

interface HubEventsFeedProps {
  events: HubEvent[];
  tablesConfig: HubTablesConfig;
}

const TABLE_ICONS: Record<string, typeof Bell> = {
  shop_orders: ShoppingCart,
  subscriptions: CreditCard,
  support_tickets: MessageCircle,
  profiles: UserPlus,
  newsletter_subscribers: Mail,
};

const TABLE_COLORS: Record<string, string> = {
  shop_orders: "text-emerald-400 bg-emerald-500/10",
  subscriptions: "text-blue-400 bg-blue-500/10",
  support_tickets: "text-amber-400 bg-amber-500/10",
  profiles: "text-neon bg-neon/10",
  newsletter_subscribers: "text-purple-400 bg-purple-500/10",
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
  if (diffMin < 60) return `${diffMin} мин`;
  if (diffHr < 24) return `${diffHr}ч`;
  if (diffDays < 7) return `${diffDays}д`;

  return new Date(dateStr).toLocaleDateString("bg-BG", {
    day: "numeric",
    month: "short",
  });
}

function extractFieldValues(
  record: Record<string, unknown> | null,
  fields: string[]
): string {
  if (!record || fields.length === 0) return "";
  return fields
    .map((f) => (record[f] !== undefined && record[f] !== null ? String(record[f]) : null))
    .filter(Boolean)
    .join(" \u2014 ");
}

export function HubEventsFeed({ events, tablesConfig }: HubEventsFeedProps) {
  const [showAll, setShowAll] = useState(false);
  const visibleEvents = showAll ? events : events.slice(0, 10);
  const hasMore = events.length > 10;

  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden">
      <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
        <div>
          <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
            // СЪБИТИЯ
          </span>
          <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
            Последна активност
          </h2>
        </div>
        <span className="text-xs font-mono text-muted-foreground/40">
          {events.length} {events.length === 1 ? "събитие" : "събития"}
        </span>
      </div>

      <div className="divide-y divide-border/20">
        {visibleEvents.map((event) => {
          const config = tablesConfig[event.table_name];
          const Icon = TABLE_ICONS[event.table_name] || Bell;
          const colorClass = TABLE_COLORS[event.table_name] || "text-muted-foreground bg-muted-foreground/10";
          const label = config?.label || event.table_name;
          const notifyFields = config?.notify_fields || [];
          const details = extractFieldValues(event.record_data, notifyFields);

          return (
            <div
              key={event.id}
              className="flex items-start gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors"
            >
              {/* Icon */}
              <div className={cn("rounded-lg p-1.5 shrink-0 mt-0.5", colorClass)}>
                <Icon size={14} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-foreground font-medium">
                    {label}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground/30 uppercase">
                    {event.event_type}
                  </span>
                  {event.notified && (
                    <span className="text-[10px] text-neon/40" title="Telegram изпратен">
                      <Bell size={10} />
                    </span>
                  )}
                </div>
                {details && (
                  <p className="text-xs text-muted-foreground/60 font-mono mt-0.5 truncate">
                    {details}
                  </p>
                )}
              </div>

              {/* Time */}
              <span className="text-[10px] text-muted-foreground/30 shrink-0 mt-1 font-mono">
                {formatRelativeTime(event.created_at)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Show more */}
      {hasMore && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full px-5 py-3 border-t border-border/20 text-xs font-mono text-neon/60 hover:text-neon hover:bg-white/[0.02] transition-colors flex items-center justify-center gap-1"
        >
          <ChevronDown size={12} />
          Покажи всички ({events.length})
        </button>
      )}

      {/* Empty state hint */}
      {events.length === 0 && (
        <div className="p-8 text-center">
          <Bell size={24} className="mx-auto text-muted-foreground/20 mb-3" />
          <p className="text-sm text-muted-foreground/50 font-mono">
            Няма записани събития все още.
          </p>
          <p className="text-xs text-muted-foreground/30 mt-1">
            Събитията ще се появят при нови записи в конфигурираните таблици.
          </p>
        </div>
      )}
    </div>
  );
}
