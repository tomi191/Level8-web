"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import type { ChatMessage as ChatMessageType } from "@/types/chatbot";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isBot = message.sender === "bot";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("flex", isBot ? "justify-start" : "justify-end")}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isBot
            ? "bg-surface text-foreground rounded-bl-sm"
            : "bg-neon text-primary-foreground rounded-br-sm"
        )}
      >
        {message.text}
      </div>
    </motion.div>
  );
}
