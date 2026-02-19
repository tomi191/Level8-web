"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Check, X, Edit2, Send } from "lucide-react";
import {
  approveResponse,
  rejectResponse,
  editAndApprove,
} from "@/lib/social-agent-actions";
import type {
  SocialMessage,
  SocialConversation,
} from "@/lib/social-agent/types";

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

interface QueueTableProps {
  messages: (SocialMessage & { conversation: SocialConversation })[];
}

export function SocialQueueTable({ messages }: QueueTableProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  async function handleApprove(id: string) {
    setLoading(id);
    try {
      await approveResponse(id);
      setDismissed((prev) => new Set(prev).add(id));
    } catch (err) {
      console.error("Approve failed:", err);
    }
    setLoading(null);
  }

  async function handleReject(id: string) {
    setLoading(id);
    try {
      await rejectResponse(id);
      setDismissed((prev) => new Set(prev).add(id));
    } catch (err) {
      console.error("Reject failed:", err);
    }
    setLoading(null);
  }

  async function handleEditApprove(id: string) {
    setLoading(id);
    try {
      await editAndApprove(id, editContent);
      setDismissed((prev) => new Set(prev).add(id));
      setEditingId(null);
    } catch (err) {
      console.error("Edit+Approve failed:", err);
    }
    setLoading(null);
  }

  const visible = messages.filter((m) => !dismissed.has(m.id));

  if (visible.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="font-mono text-sm text-muted-foreground/50">
          $ ls queue --pending
        </p>
        <p className="font-mono text-sm text-muted-foreground/50 mt-1">
          0 items awaiting approval
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border/30">
      {visible.map((msg) => (
        <div key={msg.id} className="px-5 py-4 space-y-3">
          {/* Header */}
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className={`text-[10px] font-mono ${PLATFORM_COLORS[msg.conversation.platform]}`}
            >
              {PLATFORM_LABELS[msg.conversation.platform]}
            </Badge>
            <span className="text-sm font-medium text-foreground">
              {msg.conversation.user_name || msg.conversation.platform_user_id}
            </span>
            {msg.ai_confidence != null && (
              <span className="text-[10px] font-mono text-muted-foreground/50">
                AI: {Math.round(msg.ai_confidence * 100)}%
              </span>
            )}
            <span className="text-xs text-muted-foreground/40 ml-auto">
              {new Date(msg.created_at).toLocaleString("bg-BG", {
                hour: "2-digit",
                minute: "2-digit",
                day: "numeric",
                month: "short",
              })}
            </span>
          </div>

          {/* AI Draft Content */}
          {editingId === msg.id ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground resize-none"
                rows={4}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditApprove(msg.id)}
                  disabled={loading === msg.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neon text-black text-xs font-bold hover:bg-neon/80 transition-colors disabled:opacity-50"
                >
                  <Send size={12} />
                  Изпрати
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Отказ
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-neon/5 border border-neon/10 px-3 py-2">
              <p className="text-sm text-foreground/80 whitespace-pre-wrap">
                {msg.content}
              </p>
            </div>
          )}

          {/* Actions */}
          {editingId !== msg.id && (
            <div className="flex gap-2">
              <button
                onClick={() => handleApprove(msg.id)}
                disabled={loading === msg.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neon/10 border border-neon/20 text-neon text-xs font-bold hover:bg-neon/20 transition-colors disabled:opacity-50"
              >
                <Check size={12} />
                Одобри
              </button>
              <button
                onClick={() => {
                  setEditingId(msg.id);
                  setEditContent(msg.content);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Edit2 size={12} />
                Редактирай
              </button>
              <button
                onClick={() => handleReject(msg.id)}
                disabled={loading === msg.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400 text-xs hover:bg-red-500/10 transition-colors disabled:opacity-50"
              >
                <X size={12} />
                Отхвърли
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
