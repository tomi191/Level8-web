import { getConversations } from "@/lib/social-agent-actions";
import { SocialConversationList } from "@/components/admin/social-conversation-list";

interface PageProps {
  searchParams: Promise<{ platform?: string; page?: string }>;
}

export default async function SocialConversationsPage({ searchParams }: PageProps) {
  const { platform, page: pageStr } = await searchParams;
  const page = parseInt(pageStr || "1");
  const platformFilter = platform as "viber" | "facebook" | "instagram" | undefined;

  const result = await getConversations(platformFilter, page, 20);

  return (
    <div className="space-y-6">
      <div>
        <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
          // РАЗГОВОРИ
        </span>
        <h1 className="font-display text-2xl font-bold text-foreground mt-1">
          Всички разговори
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {result.total} разговора общо
        </p>
      </div>

      {/* Platform filter */}
      <div className="flex gap-2">
        {[
          { key: undefined, label: "Всички" },
          { key: "viber", label: "Viber" },
          { key: "facebook", label: "Facebook" },
          { key: "instagram", label: "Instagram" },
        ].map((filter) => (
          <a
            key={filter.key || "all"}
            href={filter.key ? `?platform=${filter.key}` : "?"}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              platform === filter.key || (!platform && !filter.key)
                ? "bg-neon/10 text-neon border border-neon/20"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent"
            }`}
          >
            {filter.label}
          </a>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <SocialConversationList conversations={result.conversations} />
      </div>

      {/* Pagination */}
      {result.total > 20 && (
        <div className="flex justify-center gap-2">
          {page > 1 && (
            <a
              href={`?page=${page - 1}${platform ? `&platform=${platform}` : ""}`}
              className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Предишна
            </a>
          )}
          <span className="px-4 py-2 text-sm text-muted-foreground">
            Стр. {page} / {Math.ceil(result.total / 20)}
          </span>
          {page * 20 < result.total && (
            <a
              href={`?page=${page + 1}${platform ? `&platform=${platform}` : ""}`}
              className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Следваща
            </a>
          )}
        </div>
      )}
    </div>
  );
}
