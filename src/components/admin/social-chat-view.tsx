"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, AlertTriangle } from "lucide-react";
import {
  sendManualReply,
  escalateToHuman,
  approveResponse,
  rejectResponse,
} from "@/lib/social-agent-actions";
import type {
  SocialConversation,
  SocialMessage,
} from "@/lib/social-agent/types";

interface ChatViewProps {
  conversation: SocialConversation;
  messages: SocialMessage[];
}

export function SocialChatView({ conversation, messages }: ChatViewProps) {
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [localMessages, setLocalMessages] = useState(messages);

  async function handleSend() {
    if (!replyText.trim() || sending) return;
    setSending(true);
    try {
      await sendManualReply(conversation.id, replyText.trim());
      setLocalMessages((prev) => [
        ...prev,
        {
          id: `temp-${Date.now()}`,
          conversation_id: conversation.id,
          direction: "outbound" as const,
          message_type: "text",
          content: replyText.trim(),
          ai_generated: false,
          ai_model: null,
          ai_confidence: null,
          approval_status: "auto_approved" as const,
          approved_by: null,
          approved_at: null,
          platform_message_id: null,
          platform_post_id: null,
          prompt_tokens: 0,
          completion_tokens: 0,
          sent_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          error: null,
        },
      ]);
      setReplyText("");
    } catch (err) {
      console.error("Send failed:", err);
    }
    setSending(false);
  }

  async function handleEscalate() {
    await escalateToHuman(conversation.id);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-h-[700px]">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-border/50">
        <span className="text-sm font-medium text-foreground">
          {conversation.user_name || conversation.platform_user_id}
        </span>
        <Badge
          variant="outline"
          className="text-[10px] font-mono border-purple-500/30 text-purple-400"
        >
          {conversation.platform}
        </Badge>
        {conversation.escalated_to_human && (
          <Badge variant="outline" className="text-[10px] font-mono border-amber-500/30 text-amber-400">
            <AlertTriangle size={10} className="mr-1" />
            Ескалиран
          </Badge>
        )}
        <div className="ml-auto">
          {!conversation.escalated_to_human && (
            <button
              onClick={handleEscalate}
              className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
            >
              Ескалирай
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {localMessages.map((msg) => {
          const isInbound = msg.direction === "inbound";
          const isDraft = msg.direction === "outbound_draft";

          return (
            <div
              key={msg.id}
              className={`flex ${isInbound ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                  isInbound
                    ? "bg-white/5 border border-border/30"
                    : isDraft
                      ? "bg-amber-500/10 border border-amber-500/20"
                      : "bg-neon/10 border border-neon/20"
                }`}
              >
                {/* AI badge */}
                {msg.ai_generated && (
                  <div className="flex items-center gap-1 mb-1">
                    <Bot size={10} className="text-neon/60" />
                    <span className="text-[10px] font-mono text-neon/40">
                      AI {msg.ai_confidence != null ? `${Math.round(msg.ai_confidence * 100)}%` : ""}
                    </span>
                    {isDraft && (
                      <span className="text-[10px] font-mono text-amber-400/60 ml-1">
                        DRAFT
                      </span>
                    )}
                  </div>
                )}

                {/* Content */}
                <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                  {msg.content}
                </p>

                {/* Timestamp */}
                <span className="text-[10px] text-muted-foreground/30 mt-1 block">
                  {new Date(msg.created_at).toLocaleTimeString("bg-BG", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>

                {/* Draft actions */}
                {isDraft && msg.approval_status === "pending" && (
                  <div className="flex gap-2 mt-2 pt-2 border-t border-amber-500/10">
                    <button
                      onClick={() => approveResponse(msg.id)}
                      className="text-[10px] font-bold text-neon hover:text-neon/80"
                    >
                      Одобри
                    </button>
                    <button
                      onClick={() => rejectResponse(msg.id)}
                      className="text-[10px] font-bold text-red-400 hover:text-red-300"
                    >
                      Отхвърли
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Reply input */}
      <div className="px-4 py-3 border-t border-border/50">
        <div className="flex gap-2">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Напиши отговор..."
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-neon/30 focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!replyText.trim() || sending}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-neon text-black hover:bg-neon/80 transition-colors disabled:opacity-30"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
