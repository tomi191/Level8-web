"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Mail,
  Bell,
  Users,
  UserCheck,
  UserX,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Send,
} from "lucide-react";
import {
  deleteEmailSubscriber,
  toggleEmailSubscriber,
  deletePushSubscriber,
  sendManualPush,
} from "@/lib/blog-actions";
import { toast } from "sonner";

interface EmailSubscriber {
  id: string;
  email: string;
  status: string;
  subscribed_at: string;
  unsubscribed_at: string | null;
}

interface PushSubscriber {
  id: string;
  endpoint: string;
  keys_p256dh: string;
  keys_auth: string;
  created_at: string;
}

interface Stats {
  totalEmail: number;
  activeEmail: number;
  unsubscribedEmail: number;
  totalPush: number;
}

type Tab = "email" | "push";

export function SubscribersContent({
  stats,
  emailSubscribers,
  pushSubscribers,
}: {
  stats: Stats;
  emailSubscribers: EmailSubscriber[];
  pushSubscribers: PushSubscriber[];
}) {
  const [tab, setTab] = useState<Tab>("email");
  const [isPending, startTransition] = useTransition();
  const [pushTitle, setPushTitle] = useState("");
  const [pushBody, setPushBody] = useState("");
  const [pushUrl, setPushUrl] = useState("https://level8.bg/blog");

  function handleToggle(id: string) {
    startTransition(async () => {
      try {
        await toggleEmailSubscriber(id);
        toast.success("Статусът е променен");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Грешка");
      }
    });
  }

  function handleDeleteEmail(id: string) {
    if (!confirm("Сигурни ли сте?")) return;
    startTransition(async () => {
      try {
        await deleteEmailSubscriber(id);
        toast.success("Изтрито");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Грешка");
      }
    });
  }

  function handleDeletePush(id: string) {
    if (!confirm("Сигурни ли сте?")) return;
    startTransition(async () => {
      try {
        await deletePushSubscriber(id);
        toast.success("Изтрито");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Грешка");
      }
    });
  }

  function handleSendManualPush() {
    if (!pushTitle.trim()) {
      toast.error("Въведете заглавие");
      return;
    }
    startTransition(async () => {
      try {
        const result = await sendManualPush(pushTitle, pushBody, pushUrl);
        toast.success(`Push изпратено до ${result.sent} абонати`);
        setPushTitle("");
        setPushBody("");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Грешка");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Всички email", value: stats.totalEmail, icon: Users, color: "text-blue-400" },
          { label: "Активни", value: stats.activeEmail, icon: UserCheck, color: "text-neon" },
          { label: "Отписани", value: stats.unsubscribedEmail, icon: UserX, color: "text-red-400" },
          { label: "Push абонати", value: stats.totalPush, icon: Bell, color: "text-amber-400" },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-border bg-surface p-4 space-y-2"
          >
            <div className="flex items-center gap-2">
              <card.icon size={16} className={card.color} />
              <span className="text-xs text-muted-foreground font-mono">{card.label}</span>
            </div>
            <p className={`text-2xl font-bold font-display ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Manual Push */}
      <div className="rounded-2xl border border-border bg-surface p-4 space-y-3">
        <h3 className="font-mono text-xs text-neon/60 tracking-wider flex items-center gap-1.5">
          <Send size={14} />
          {"ИЗПРАТИ ИЗВЕСТИЕ"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            value={pushTitle}
            onChange={(e) => setPushTitle(e.target.value)}
            placeholder={"Заглавие..."}
            className="bg-background border-border focus:border-neon/50"
          />
          <Input
            value={pushBody}
            onChange={(e) => setPushBody(e.target.value)}
            placeholder={"Текст (опционално)..."}
            className="bg-background border-border focus:border-neon/50"
          />
          <Input
            value={pushUrl}
            onChange={(e) => setPushUrl(e.target.value)}
            placeholder="URL..."
            className="bg-background border-border focus:border-neon/50"
          />
        </div>
        <Button
          size="sm"
          onClick={handleSendManualPush}
          disabled={isPending || !pushTitle.trim()}
          className="bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20"
        >
          {isPending ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : <Bell size={14} className="mr-1.5" />}
          {"Изпрати Push до всички"}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {([
          { key: "email" as Tab, label: "Email абонати", icon: Mail, count: stats.totalEmail },
          { key: "push" as Tab, label: "Push абонати", icon: Bell, count: stats.totalPush },
        ]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px flex items-center gap-1.5 ${
              tab === t.key
                ? "border-neon text-neon"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon size={14} />
            {t.label}
            <span className="ml-1 text-xs bg-white/5 px-1.5 py-0.5 rounded-full">{t.count}</span>
          </button>
        ))}
      </div>

      {/* Email Table */}
      {tab === "email" && (
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          {emailSubscribers.length === 0 ? (
            <p className="p-6 text-center text-muted-foreground text-sm">{"Няма email абонати"}</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background/50">
                  <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground/70">Email</th>
                  <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground/70">{"Статус"}</th>
                  <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground/70">{"Абониран"}</th>
                  <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground/70">{"Отписан"}</th>
                  <th className="text-right px-4 py-3 font-mono text-xs text-muted-foreground/70">{"Действия"}</th>
                </tr>
              </thead>
              <tbody>
                {emailSubscribers.map((sub) => (
                  <tr key={sub.id} className="border-b border-border/50 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-foreground">{sub.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        sub.status === "active"
                          ? "bg-neon/10 text-neon border border-neon/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}>
                        {sub.status === "active" ? "Активен" : "Отписан"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs font-mono">
                      {new Date(sub.subscribed_at).toLocaleDateString("bg-BG")}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs font-mono">
                      {sub.unsubscribed_at
                        ? new Date(sub.unsubscribed_at).toLocaleDateString("bg-BG")
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggle(sub.id)}
                          disabled={isPending}
                          className="h-7 px-2 text-muted-foreground hover:text-foreground"
                          title={sub.status === "active" ? "Деактивирай" : "Активирай"}
                        >
                          {sub.status === "active" ? <ToggleRight size={14} className="text-neon" /> : <ToggleLeft size={14} />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEmail(sub.id)}
                          disabled={isPending}
                          className="h-7 px-2 text-muted-foreground hover:text-red-400"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Push Table */}
      {tab === "push" && (
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          {pushSubscribers.length === 0 ? (
            <p className="p-6 text-center text-muted-foreground text-sm">{"Няма push абонати"}</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background/50">
                  <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground/70">Endpoint</th>
                  <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground/70">{"Дата"}</th>
                  <th className="text-right px-4 py-3 font-mono text-xs text-muted-foreground/70">{"Действия"}</th>
                </tr>
              </thead>
              <tbody>
                {pushSubscribers.map((sub) => (
                  <tr key={sub.id} className="border-b border-border/50 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-foreground font-mono text-xs max-w-xs truncate">
                      {sub.endpoint.length > 60
                        ? sub.endpoint.substring(0, 60) + "..."
                        : sub.endpoint}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs font-mono">
                      {new Date(sub.created_at).toLocaleDateString("bg-BG")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePush(sub.id)}
                        disabled={isPending}
                        className="h-7 px-2 text-muted-foreground hover:text-red-400"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
