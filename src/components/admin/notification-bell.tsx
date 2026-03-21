"use client";

import { useState, useEffect, useTransition } from "react";
import { Bell, Check, CheckCheck, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  markNotificationRead,
  markAllNotificationsRead,
  dismissNotification,
} from "@/lib/admin-notifications";
import type { AdminNotification } from "@/types/crm";

const SEVERITY_STYLES = {
  urgent: "border-l-red-500 bg-red-500/[0.03]",
  warning: "border-l-amber-500 bg-amber-500/[0.03]",
  info: "border-l-neon bg-neon/[0.02]",
} as const;

const SEVERITY_DOT = {
  urgent: "bg-red-500",
  warning: "bg-amber-500",
  info: "bg-neon",
} as const;

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Сега";
  if (mins < 60) return `${mins} мин`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ч`;
  const days = Math.floor(hours / 24);
  return `${days} д`;
}

export function NotificationBell({
  initialNotifications,
  initialCount,
}: {
  initialNotifications: AdminNotification[];
  initialCount: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  // Poll for new notifications every 60s
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/admin/notifications");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications);
          setCount(data.count);
        }
      } catch { /* silent */ }
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  function handleMarkRead(id: string) {
    startTransition(async () => {
      await markNotificationRead(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setCount((c) => Math.max(0, c - 1));
    });
  }

  function handleMarkAll() {
    startTransition(async () => {
      await markAllNotificationsRead();
      setNotifications([]);
      setCount(0);
    });
  }

  function handleDismiss(id: string) {
    startTransition(async () => {
      await dismissNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setCount((c) => Math.max(0, c - 1));
    });
  }

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative flex items-center justify-center w-9 h-9 rounded-lg transition-colors",
          isOpen
            ? "bg-white/10 text-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
        )}
      >
        <Bell size={18} />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full ring-2 ring-surface">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 top-full mt-2 z-50 w-[380px] max-h-[480px] rounded-xl border border-border bg-surface shadow-2xl shadow-black/40 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-neon/40 tracking-[0.15em] uppercase">
                  // Известия
                </span>
                {count > 0 && (
                  <span className="text-[10px] font-mono text-muted-foreground/40 bg-white/5 rounded px-1.5 py-0.5">
                    {count}
                  </span>
                )}
              </div>
              {count > 0 && (
                <button
                  onClick={handleMarkAll}
                  disabled={isPending}
                  className="flex items-center gap-1 text-[11px] text-muted-foreground/50 hover:text-neon transition-colors disabled:opacity-50"
                >
                  <CheckCheck size={12} />
                  Прочетени
                </button>
              )}
            </div>

            {/* List */}
            <div className="overflow-y-auto max-h-[400px] divide-y divide-border/30">
              {notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <Bell
                    size={24}
                    className="mx-auto text-muted-foreground/15 mb-2"
                  />
                  <p className="text-xs font-mono text-muted-foreground/30">
                    $ notifications --empty
                  </p>
                  <p className="text-[11px] text-muted-foreground/20 mt-1">
                    Няма нови известия
                  </p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      "flex gap-3 px-4 py-3 border-l-2 transition-colors hover:bg-white/[0.02]",
                      SEVERITY_STYLES[n.severity]
                    )}
                  >
                    {/* Severity dot */}
                    <div className="pt-1 shrink-0">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          SEVERITY_DOT[n.severity]
                        )}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground leading-tight truncate">
                        {n.title}
                      </p>
                      <p className="text-xs text-muted-foreground/50 mt-0.5 line-clamp-2 whitespace-pre-line">
                        {n.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] font-mono text-muted-foreground/30">
                          {relativeTime(n.created_at)}
                        </span>
                        {n.telegram_sent && (
                          <span className="text-[9px] font-mono text-blue-400/40">
                            TG
                          </span>
                        )}
                        {n.email_sent && (
                          <span className="text-[9px] font-mono text-amber-400/40">
                            EM
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1 shrink-0">
                      {n.action_url && (
                        <a
                          href={n.action_url}
                          onClick={() => {
                            handleMarkRead(n.id);
                            setIsOpen(false);
                          }}
                          className="flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground/30 hover:text-neon hover:bg-neon/10 transition-colors"
                        >
                          <ExternalLink size={13} />
                        </a>
                      )}
                      <button
                        onClick={() => handleDismiss(n.id)}
                        disabled={isPending}
                        className="flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground/20 hover:text-foreground/60 hover:bg-white/5 transition-colors"
                      >
                        <Check size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
