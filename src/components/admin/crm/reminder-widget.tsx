"use client";

import { useState, useTransition } from "react";
import { Bell, X, Clock, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { dismissCrmReminder, snoozeCrmReminder } from "@/lib/crm-actions";
import type { CrmReminder } from "@/types/crm";

const ENTITY_LINKS: Record<string, (id: string) => string> = {
  client: (id) => `/admin/crm/clients/${id}`,
  website: (id) => `/admin/crm/websites/${id}`,
  invoice: (id) => `/admin/crm/invoices/${id}`,
  service: (id) => `/admin/crm/services/${id}`,
  domain: (id) => `/admin/crm/domains`,
};

const ENTITY_LABELS: Record<string, string> = {
  client: "Клиент",
  website: "Сайт",
  invoice: "Фактура",
  domain: "Домейн",
  service: "Услуга",
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "\u2014";
  return new Date(dateStr).toLocaleDateString("bg-BG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isOverdue(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

function ReminderItem({ reminder }: { reminder: CrmReminder }) {
  const [isPending, startTransition] = useTransition();
  const [showSnooze, setShowSnooze] = useState(false);

  const handleDismiss = () => {
    startTransition(async () => {
      await dismissCrmReminder(reminder.id);
    });
  };

  const handleSnooze = (days: number) => {
    startTransition(async () => {
      await snoozeCrmReminder(reminder.id, days);
      setShowSnooze(false);
    });
  };

  const overdue = isOverdue(reminder.due_date);
  const entityLink = ENTITY_LINKS[reminder.entity_type]?.(reminder.entity_id);

  return (
    <div
      className={cn(
        "group relative rounded-xl border p-4 transition-colors",
        overdue
          ? "border-red-500/30 bg-red-500/[0.03]"
          : "border-border/50 bg-white/[0.02] hover:bg-white/[0.04]",
        isPending && "opacity-50 pointer-events-none"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {entityLink ? (
            <a
              href={entityLink}
              className="font-medium text-sm text-foreground hover:text-neon transition-colors line-clamp-1"
            >
              {reminder.title}
            </a>
          ) : (
            <span className="font-medium text-sm text-foreground line-clamp-1">
              {reminder.title}
            </span>
          )}

          {reminder.description && (
            <p className="text-xs text-muted-foreground/60 mt-0.5 line-clamp-1">
              {reminder.description}
            </p>
          )}

          <div className="flex items-center gap-3 mt-2">
            <span className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-wider">
              {ENTITY_LABELS[reminder.entity_type] || reminder.entity_type}
            </span>
            <span
              className={cn(
                "text-[11px] font-mono",
                overdue ? "text-red-400" : "text-muted-foreground/60"
              )}
            >
              {formatDate(reminder.due_date)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Snooze */}
          <div className="relative">
            <button
              onClick={() => setShowSnooze(!showSnooze)}
              className={cn(
                "rounded-lg p-1.5 text-muted-foreground/40 transition-colors",
                "hover:bg-white/[0.06] hover:text-neon/70"
              )}
              title="Отложи"
            >
              <Clock size={14} />
            </button>

            {showSnooze && (
              <div className="absolute right-0 top-full mt-1 z-10 rounded-lg border border-border bg-surface shadow-xl py-1 min-w-[120px]">
                {[
                  { days: 1, label: "1 ден" },
                  { days: 3, label: "3 дни" },
                  { days: 7, label: "7 дни" },
                ].map(({ days, label }) => (
                  <button
                    key={days}
                    onClick={() => handleSnooze(days)}
                    className="w-full text-left px-3 py-1.5 text-xs text-muted-foreground hover:bg-white/[0.06] hover:text-foreground transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dismiss */}
          <button
            onClick={handleDismiss}
            className={cn(
              "rounded-lg p-1.5 text-muted-foreground/40 transition-colors",
              "hover:bg-red-500/10 hover:text-red-400"
            )}
            title="Отхвърли"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function ReminderWidget({
  reminders,
}: {
  reminders: CrmReminder[];
}) {
  if (reminders.length === 0) return null;

  const overdueCount = reminders.filter((r) => isOverdue(r.due_date)).length;

  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden">
      <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
        <div>
          <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
            // НАПОМНЯНИЯ
          </span>
          <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
            Предстоящи
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {overdueCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 border border-red-500/20 px-2.5 py-0.5 text-[11px] font-mono text-red-400">
              {overdueCount} просрочени
            </span>
          )}
          <Bell size={18} className="text-neon/40" />
        </div>
      </div>
      <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
        {reminders.map((reminder) => (
          <ReminderItem key={reminder.id} reminder={reminder} />
        ))}
      </div>
    </div>
  );
}
