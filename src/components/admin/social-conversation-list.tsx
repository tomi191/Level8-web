"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import type { SocialConversation } from "@/lib/social-agent/types";

const PLATFORM_LABELS: Record<string, string> = {
  viber: "Viber",
  facebook: "Facebook",
  instagram: "Instagram",
};

const PLATFORM_COLORS: Record<string, string> = {
  viber: "border-purple-500/30 text-purple-400",
  facebook: "border-blue-500/30 text-blue-400",
  instagram: "border-pink-500/30 text-pink-400",
};

interface ConversationListProps {
  conversations: SocialConversation[];
}

export function SocialConversationList({ conversations }: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="font-mono text-sm text-muted-foreground/50">
          $ ls conversations
        </p>
        <p className="font-mono text-sm text-muted-foreground/50 mt-1">
          0 conversations found
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border/30">
      {conversations.map((conv) => (
        <Link
          key={conv.id}
          href={`/admin/social/conversations/${conv.id}`}
          className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
        >
          {/* Status indicator */}
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              conv.escalated_to_human
                ? "bg-amber-400 animate-pulse"
                : conv.status === "active"
                  ? "bg-neon"
                  : "bg-muted-foreground/20"
            }`}
          />

          {/* User info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {conv.user_name || conv.platform_user_id}
            </p>
            <p className="text-xs text-muted-foreground/50">
              {new Date(conv.last_message_at).toLocaleString("bg-BG", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          {/* Platform badge */}
          <Badge
            variant="outline"
            className={`text-[10px] font-mono shrink-0 ${PLATFORM_COLORS[conv.platform]}`}
          >
            {PLATFORM_LABELS[conv.platform]}
          </Badge>

          {/* Escalation indicator */}
          {conv.escalated_to_human && (
            <AlertTriangle size={14} className="text-amber-400 shrink-0" />
          )}
        </Link>
      ))}
    </div>
  );
}
