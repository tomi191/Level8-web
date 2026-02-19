import { getConversationDetail } from "@/lib/social-agent-actions";
import { SocialChatView } from "@/components/admin/social-chat-view";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ConversationDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { conversation, messages } = await getConversationDetail(id);

  if (!conversation) {
    redirect("/admin/social/conversations");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/social/conversations"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} />
          Назад
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <SocialChatView conversation={conversation} messages={messages} />
      </div>
    </div>
  );
}
