import { requireAdmin } from "@/lib/supabase/admin";
import { StatCard } from "@/components/admin/stat-card";
import { Inbox, Eye, CalendarDays, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import type { Submission } from "@/types/admin";

const TYPE_LABELS: Record<string, string> = {
  contact: "Контакт",
  lead: "Одит",
  chat: "Чатбот",
};

export default async function AdminDashboardPage() {
  const { supabase } = await requireAdmin();

  // Fetch stats
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [totalRes, unreadRes, weekRes, monthRes, recentRes] = await Promise.all([
    supabase.from("submissions").select("id", { count: "exact", head: true }),
    supabase
      .from("submissions")
      .select("id", { count: "exact", head: true })
      .eq("is_read", false)
      .eq("is_archived", false),
    supabase
      .from("submissions")
      .select("id", { count: "exact", head: true })
      .gte("created_at", weekAgo),
    supabase
      .from("submissions")
      .select("id", { count: "exact", head: true })
      .gte("created_at", monthAgo),
    supabase
      .from("submissions")
      .select("*")
      .eq("is_archived", false)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const total = totalRes.count ?? 0;
  const unread = unreadRes.count ?? 0;
  const thisWeek = weekRes.count ?? 0;
  const thisMonth = monthRes.count ?? 0;
  const recent = (recentRes.data ?? []) as Submission[];

  return (
    <div className="space-y-8">
      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard label="Общо заявки" value={total} icon={Inbox} />
        <StatCard label="Непрочетени" value={unread} icon={Eye} accent />
        <StatCard label="Тази седмица" value={thisWeek} icon={CalendarDays} />
        <StatCard label="Този месец" value={thisMonth} icon={TrendingUp} />
      </div>

      {/* Recent activity */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
          <div>
            <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
              // ПОСЛЕДНА АКТИВНОСТ
            </span>
            <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
              Скорошни заявки
            </h2>
          </div>
          <Link
            href="/admin/submissions"
            className="text-xs font-bold text-neon hover:text-foreground transition-colors uppercase tracking-wider"
          >
            Виж всички
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-mono text-sm text-muted-foreground/50">
              $ ls submissions --recent
            </p>
            <p className="font-mono text-sm text-muted-foreground/50 mt-1">
              0 results found
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {recent.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.02] transition-colors"
              >
                {/* Read indicator */}
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    sub.is_read ? "bg-muted-foreground/20" : "bg-neon animate-pulse"
                  }`}
                />

                {/* Name / Email */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {sub.name || sub.email || "Без име"}
                  </p>
                  {sub.phone && (
                    <p className="text-xs text-muted-foreground truncate">
                      {sub.phone}
                    </p>
                  )}
                </div>

                {/* Type badge */}
                <Badge
                  variant="outline"
                  className="text-[10px] font-mono border-neon/20 text-neon/60 shrink-0"
                >
                  {TYPE_LABELS[sub.type] || sub.type}
                </Badge>

                {/* Date */}
                <span className="text-xs text-muted-foreground/50 shrink-0 hidden sm:block">
                  {new Date(sub.created_at).toLocaleDateString("bg-BG", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
