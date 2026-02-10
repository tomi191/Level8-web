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
        toast.success("\u0421\u0442\u0430\u0442\u0443\u0441\u044A\u0442 \u0435 \u043F\u0440\u043E\u043C\u0435\u043D\u0435\u043D");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "\u0413\u0440\u0435\u0448\u043A\u0430");
      }
    });
  }

  function handleDeleteEmail(id: string) {
    if (!confirm("\u0421\u0438\u0433\u0443\u0440\u043D\u0438 \u043B\u0438 \u0441\u0442\u0435?")) return;
    startTransition(async () => {
      try {
        await deleteEmailSubscriber(id);
        toast.success("\u0418\u0437\u0442\u0440\u0438\u0442\u043E");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "\u0413\u0440\u0435\u0448\u043A\u0430");
      }
    });
  }

  function handleDeletePush(id: string) {
    if (!confirm("\u0421\u0438\u0433\u0443\u0440\u043D\u0438 \u043B\u0438 \u0441\u0442\u0435?")) return;
    startTransition(async () => {
      try {
        await deletePushSubscriber(id);
        toast.success("\u0418\u0437\u0442\u0440\u0438\u0442\u043E");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "\u0413\u0440\u0435\u0448\u043A\u0430");
      }
    });
  }

  function handleSendManualPush() {
    if (!pushTitle.trim()) {
      toast.error("\u0412\u044A\u0432\u0435\u0434\u0435\u0442\u0435 \u0437\u0430\u0433\u043B\u0430\u0432\u0438\u0435");
      return;
    }
    startTransition(async () => {
      try {
        const result = await sendManualPush(pushTitle, pushBody, pushUrl);
        toast.success(`Push \u0438\u0437\u043F\u0440\u0430\u0442\u0435\u043D\u043E \u0434\u043E ${result.sent} \u0430\u0431\u043E\u043D\u0430\u0442\u0438`);
        setPushTitle("");
        setPushBody("");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "\u0413\u0440\u0435\u0448\u043A\u0430");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "\u0412\u0441\u0438\u0447\u043A\u0438 email", value: stats.totalEmail, icon: Users, color: "text-blue-400" },
          { label: "\u0410\u043A\u0442\u0438\u0432\u043D\u0438", value: stats.activeEmail, icon: UserCheck, color: "text-neon" },
          { label: "\u041E\u0442\u043F\u0438\u0441\u0430\u043D\u0438", value: stats.unsubscribedEmail, icon: UserX, color: "text-red-400" },
          { label: "Push \u0430\u0431\u043E\u043D\u0430\u0442\u0438", value: stats.totalPush, icon: Bell, color: "text-amber-400" },
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
          {"\u0418\u0417\u041F\u0420\u0410\u0422\u0418 \u0418\u0417\u0412\u0415\u0421\u0422\u0418\u0415"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            value={pushTitle}
            onChange={(e) => setPushTitle(e.target.value)}
            placeholder={"\u0417\u0430\u0433\u043B\u0430\u0432\u0438\u0435..."}
            className="bg-background border-border focus:border-neon/50"
          />
          <Input
            value={pushBody}
            onChange={(e) => setPushBody(e.target.value)}
            placeholder={"\u0422\u0435\u043A\u0441\u0442 (\u043E\u043F\u0446\u0438\u043E\u043D\u0430\u043B\u043D\u043E)..."}
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
          {"\u0418\u0437\u043F\u0440\u0430\u0442\u0438 Push \u0434\u043E \u0432\u0441\u0438\u0447\u043A\u0438"}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {([
          { key: "email" as Tab, label: "Email \u0430\u0431\u043E\u043D\u0430\u0442\u0438", icon: Mail, count: stats.totalEmail },
          { key: "push" as Tab, label: "Push \u0430\u0431\u043E\u043D\u0430\u0442\u0438", icon: Bell, count: stats.totalPush },
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
            <p className="p-6 text-center text-muted-foreground text-sm">{"\u041D\u044F\u043C\u0430 email \u0430\u0431\u043E\u043D\u0430\u0442\u0438"}</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background/50">
                  <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground/70">Email</th>
                  <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground/70">{"\u0421\u0442\u0430\u0442\u0443\u0441"}</th>
                  <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground/70">{"\u0410\u0431\u043E\u043D\u0438\u0440\u0430\u043D"}</th>
                  <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground/70">{"\u041E\u0442\u043F\u0438\u0441\u0430\u043D"}</th>
                  <th className="text-right px-4 py-3 font-mono text-xs text-muted-foreground/70">{"\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F"}</th>
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
                        {sub.status === "active" ? "\u0410\u043A\u0442\u0438\u0432\u0435\u043D" : "\u041E\u0442\u043F\u0438\u0441\u0430\u043D"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs font-mono">
                      {new Date(sub.subscribed_at).toLocaleDateString("bg-BG")}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs font-mono">
                      {sub.unsubscribed_at
                        ? new Date(sub.unsubscribed_at).toLocaleDateString("bg-BG")
                        : "\u2014"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggle(sub.id)}
                          disabled={isPending}
                          className="h-7 px-2 text-muted-foreground hover:text-foreground"
                          title={sub.status === "active" ? "\u0414\u0435\u0430\u043A\u0442\u0438\u0432\u0438\u0440\u0430\u0439" : "\u0410\u043A\u0442\u0438\u0432\u0438\u0440\u0430\u0439"}
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
            <p className="p-6 text-center text-muted-foreground text-sm">{"\u041D\u044F\u043C\u0430 push \u0430\u0431\u043E\u043D\u0430\u0442\u0438"}</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background/50">
                  <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground/70">Endpoint</th>
                  <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground/70">{"\u0414\u0430\u0442\u0430"}</th>
                  <th className="text-right px-4 py-3 font-mono text-xs text-muted-foreground/70">{"\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F"}</th>
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
