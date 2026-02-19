import { getQueueItems } from "@/lib/social-agent-actions";
import { SocialQueueTable } from "@/components/admin/social-queue-table";

export default async function SocialQueuePage() {
  const queue = await getQueueItems();

  return (
    <div className="space-y-6">
      <div>
        <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
          // ОПАШКА ЗА ОДОБРЕНИЕ
        </span>
        <h1 className="font-display text-2xl font-bold text-foreground mt-1">
          AI чернови за одобрение
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Преглед и одобрение на AI генерирани отговори преди изпращане.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <SocialQueueTable messages={queue.messages} />
      </div>
    </div>
  );
}
