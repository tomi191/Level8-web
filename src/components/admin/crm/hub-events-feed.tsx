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
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { HubEvent, HubTablesConfig, HubFlowInstance, HubFlowConfig } from "@/types/crm";

interface HubEventsFeedProps {
  events: HubEvent[];
  tablesConfig: HubTablesConfig;
  flowInstances: HubFlowInstance[];
  flowConfig: HubFlowConfig;
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

  if (diffSec < 60) return "\u0422\u043E\u043A\u0443-\u0449\u043E";
  if (diffMin < 60) return `${diffMin} \u043C\u0438\u043D`;
  if (diffHr < 24) return `${diffHr}\u0447`;
  if (diffDays < 7) return `${diffDays}\u0434`;

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

export function HubEventsFeed({ events, tablesConfig, flowInstances, flowConfig }: HubEventsFeedProps) {
  const [showAll, setShowAll] = useState(false);

  // Separate standalone events (no flow_instance_id) from flow events
  const standaloneEvents = events.filter((e) => !e.flow_instance_id);

  // Merge flows and standalone into a timeline sorted by date
  type TimelineItem =
    | { type: "flow"; data: HubFlowInstance; date: string }
    | { type: "event"; data: HubEvent; date: string };

  const timeline: TimelineItem[] = [
    ...flowInstances.map((fi) => ({
      type: "flow" as const,
      data: fi,
      date: fi.created_at,
    })),
    ...standaloneEvents.map((e) => ({
      type: "event" as const,
      data: e,
      date: e.created_at,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const visibleItems = showAll ? timeline : timeline.slice(0, 10);
  const hasMore = timeline.length > 10;
  const totalCount = timeline.length;

  if (totalCount === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden">
      <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
        <div>
          <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
            // \u0421\u042A\u0411\u0418\u0422\u0418\u042F
          </span>
          <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
            \u041F\u043E\u0441\u043B\u0435\u0434\u043D\u0430 \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442
          </h2>
        </div>
        <span className="text-xs font-mono text-muted-foreground/40">
          {totalCount} {totalCount === 1 ? "\u0441\u044A\u0431\u0438\u0442\u0438\u0435" : "\u0441\u044A\u0431\u0438\u0442\u0438\u044F"}
        </span>
      </div>

      <div className="divide-y divide-border/20">
        {visibleItems.map((item) =>
          item.type === "flow" ? (
            <FlowCard key={item.data.id} instance={item.data} flowConfig={flowConfig} />
          ) : (
            <StandaloneEventRow key={item.data.id} event={item.data} tablesConfig={tablesConfig} />
          )
        )}
      </div>

      {hasMore && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full px-5 py-3 border-t border-border/20 text-xs font-mono text-neon/60 hover:text-neon hover:bg-white/[0.02] transition-colors flex items-center justify-center gap-1"
        >
          <ChevronDown size={12} />
          \u041F\u043E\u043A\u0430\u0436\u0438 \u0432\u0441\u0438\u0447\u043A\u0438 ({totalCount})
        </button>
      )}
    </div>
  );
}

// ============================================================
// Flow Card — grouped pipeline display
// ============================================================

function FlowCard({
  instance,
  flowConfig,
}: {
  instance: HubFlowInstance;
  flowConfig: HubFlowConfig;
}) {
  const flowDef = flowConfig[instance.flow_name];
  const label = flowDef?.label || instance.flow_name;
  const Icon = TABLE_ICONS[flowDef?.trigger_table || ""] || Bell;
  const isComplete = instance.status === "completed";
  const isPartial = instance.status === "partial";
  const isPending = instance.status === "pending";

  const steps = instance.steps || {};
  const allTables = [
    ...(flowDef?.expected_tables || []),
    ...(flowDef?.optional_tables || []),
  ];

  return (
    <div className={cn(
      "px-5 py-3 hover:bg-white/[0.02] transition-colors",
      isPartial && "border-l-2 border-l-amber-400/50",
      isComplete && "border-l-2 border-l-emerald-400/30"
    )}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn(
          "rounded-lg p-1.5 shrink-0 mt-0.5",
          isComplete ? "text-emerald-400 bg-emerald-500/10" :
          isPartial ? "text-amber-400 bg-amber-500/10" :
          "text-blue-400 bg-blue-500/10"
        )}>
          <Icon size={14} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground font-medium">{label}</span>
            {isComplete && (
              <span className="text-[10px] font-mono text-emerald-400/60 bg-emerald-500/5 px-1.5 py-0.5 rounded">
                \u2705 \u0413\u043E\u0442\u043E\u0432\u043E
              </span>
            )}
            {isPartial && (
              <span className="text-[10px] font-mono text-amber-400/60 bg-amber-500/5 px-1.5 py-0.5 rounded">
                \u26A0\uFE0F \u041D\u0435\u043F\u044A\u043B\u043D\u043E
              </span>
            )}
            {isPending && (
              <span className="text-[10px] font-mono text-blue-400/60 bg-blue-500/5 px-1.5 py-0.5 rounded animate-pulse">
                \u23F3 \u0418\u0437\u0447\u0430\u043A\u0432\u0430
              </span>
            )}
          </div>

          <p className="text-xs text-muted-foreground/60 font-mono mt-0.5">
            {instance.correlation_value}
          </p>

          {/* Pipeline steps */}
          <div className="flex flex-wrap gap-2 mt-2">
            {allTables.map((table) => {
              const stepStatus = steps[table];
              const isOptional = flowDef?.optional_tables.includes(table);
              return (
                <span
                  key={table}
                  className={cn(
                    "inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded",
                    stepStatus === "completed"
                      ? "text-emerald-400/80 bg-emerald-500/5"
                      : stepStatus === "pending" && isPending
                        ? "text-blue-400/50 bg-blue-500/5"
                        : "text-red-400/60 bg-red-500/5"
                  )}
                >
                  {stepStatus === "completed" ? (
                    <CheckCircle2 size={10} />
                  ) : stepStatus === "pending" && isPending ? (
                    <span className="animate-pulse">{"\u23F3"}</span>
                  ) : (
                    <XCircle size={10} />
                  )}
                  {table}
                  {isOptional && stepStatus !== "completed" && (
                    <span className="text-muted-foreground/20">opt</span>
                  )}
                </span>
              );
            })}
          </div>
        </div>

        {/* Time */}
        <span className="text-[10px] text-muted-foreground/30 shrink-0 mt-1 font-mono">
          {formatRelativeTime(instance.created_at)}
        </span>
      </div>
    </div>
  );
}

// ============================================================
// Standalone Event Row (unchanged from before)
// ============================================================

function StandaloneEventRow({
  event,
  tablesConfig,
}: {
  event: HubEvent;
  tablesConfig: HubTablesConfig;
}) {
  const config = tablesConfig[event.table_name];
  const Icon = TABLE_ICONS[event.table_name] || Bell;
  const colorClass = TABLE_COLORS[event.table_name] || "text-muted-foreground bg-muted-foreground/10";
  const label = config?.label || event.table_name;
  const notifyFields = config?.notify_fields || [];
  const details = extractFieldValues(event.record_data, notifyFields);
  const isUpdate = event.event_type === "UPDATE";

  return (
    <div className="flex items-start gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors">
      <div className={cn("rounded-lg p-1.5 shrink-0 mt-0.5", colorClass)}>
        <Icon size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm text-foreground font-medium">{label}</span>
          <span className={cn(
            "text-[10px] font-mono uppercase",
            isUpdate ? "text-amber-400/40" : "text-muted-foreground/30"
          )}>
            {event.event_type}
          </span>
          {event.notified && (
            <span className="text-[10px] text-neon/40" title="Telegram \u0438\u0437\u043F\u0440\u0430\u0442\u0435\u043D">
              <Bell size={10} />
            </span>
          )}
        </div>
        {details && (
          <p className="text-xs text-muted-foreground/60 font-mono mt-0.5 truncate">{details}</p>
        )}
      </div>
      <span className="text-[10px] text-muted-foreground/30 shrink-0 mt-1 font-mono">
        {formatRelativeTime(event.created_at)}
      </span>
    </div>
  );
}
