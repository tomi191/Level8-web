"use client";

import { motion } from "motion/react";
import type { ChatOption } from "@/types/chatbot";
import { ChatIconText } from "./chat-icon-text";

interface ChatOptionsProps {
  options: ChatOption[];
  onSelect: (option: ChatOption) => void;
}

export function ChatOptions({ options, onSelect }: ChatOptionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-2 mt-2"
    >
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onSelect(option)}
          className="text-left text-sm px-4 py-2.5 rounded-xl border border-neon/30 text-neon hover:bg-neon/10 transition-all duration-200 active:scale-[0.98]"
        >
          <ChatIconText text={option.label} />
        </button>
      ))}
    </motion.div>
  );
}
