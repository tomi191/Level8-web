"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import type { ChatStep } from "@/types/chatbot";
import type { ChatMessage as ChatMessageType, ChatOption } from "@/types/chatbot";
import { ChatMessage } from "./chat-message";
import { ChatOptions } from "./chat-options";
import { ChatContactForm } from "./chat-contact-form";

interface ChatWindowProps {
  messages: ChatMessageType[];
  currentStep: ChatStep | undefined;
  isTyping: boolean;
  messageQueueEmpty: boolean;
  contactSubmitted: boolean;
  onSelectOption: (option: ChatOption) => void;
  onSubmitContact: (name: string, phone: string) => void;
  onClose: () => void;
}

export function ChatWindow({
  messages,
  currentStep,
  isTyping,
  messageQueueEmpty,
  contactSubmitted,
  onSelectOption,
  onSubmitContact,
  onClose,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isTyping]);

  const showOptions = messageQueueEmpty && !isTyping && currentStep?.options && !contactSubmitted;
  const showContactForm = messageQueueEmpty && !isTyping && currentStep?.isContactForm && !contactSubmitted;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed bottom-24 right-4 sm:right-6 w-[340px] sm:w-[380px] max-h-[500px] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-surface border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-neon animate-pulse" />
          <span className="font-display text-sm font-semibold text-foreground">
            Level 8 Architect
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors p-1"
          aria-label="Затвори чата"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-surface rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm">
              <motion.span
                className="inline-flex gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
              </motion.span>
            </div>
          </div>
        )}

        {showOptions && currentStep.options && (
          <ChatOptions options={currentStep.options} onSelect={onSelectOption} />
        )}

        {showContactForm && (
          <ChatContactForm onSubmit={onSubmitContact} />
        )}

        <div ref={messagesEndRef} />
      </div>
    </motion.div>
  );
}
