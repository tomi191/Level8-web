import { getSocialStats, getQueueItems, getConversations } from "@/lib/social-agent-actions";
import { SocialStatsCards } from "@/components/admin/social-stats-cards";
import { SocialQueueTable } from "@/components/admin/social-queue-table";
import { SocialConversationList } from "@/components/admin/social-conversation-list";
import Link from "next/link";

export default async function SocialDashboardPage() {
  const [stats, queue, conversations] = await Promise.all([
    getSocialStats(),
    getQueueItems(),
    getConversations(undefined, 1, 5),
  ]);

  return (
    <div className="space-y-8">
      {/* Stats */}
      <SocialStatsCards {...stats} />

      {/* Pending Approvals */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
          <div>
            <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
              // ЗА ОДОБРЕНИЕ
            </span>
            <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
              AI чернови
            </h2>
          </div>
          <Link
            href="/admin/social/queue"
            className="text-xs font-bold text-neon hover:text-foreground transition-colors uppercase tracking-wider"
          >
            Виж всички
          </Link>
        </div>
        <SocialQueueTable messages={queue.messages.slice(0, 5)} />
      </div>

      {/* Recent Conversations */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
          <div>
            <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
              // РАЗГОВОРИ
            </span>
            <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
              Последни разговори
            </h2>
          </div>
          <Link
            href="/admin/social/conversations"
            className="text-xs font-bold text-neon hover:text-foreground transition-colors uppercase tracking-wider"
          >
            Виж всички
          </Link>
        </div>
        <SocialConversationList conversations={conversations.conversations} />
      </div>
    </div>
  );
}
