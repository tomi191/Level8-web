"use client";

import { AnimatePresence, motion } from "motion/react";
import { useChatbot } from "@/hooks/use-chatbot";
import { useScrollTrigger } from "@/hooks/use-scroll-trigger";
import { ChatWindow } from "./chat-window";

export function ChatWidget() {
  const { state, currentStep, open, close, trigger, selectOption, submitContact } =
    useChatbot();

  const { shouldNotify } = useScrollTrigger(trigger);
  const showBadge = shouldNotify && !state.hasTriggered;

  return (
    <>
      {/* Chat window */}
      <AnimatePresence>
        {state.isOpen && !state.isMinimized && (
          <ChatWindow
            messages={state.messages}
            currentStep={currentStep}
            isTyping={state.isTyping}
            messageQueueEmpty={state.messageQueue.length === 0}
            contactSubmitted={state.contactSubmitted}
            onSelectOption={selectOption}
            onSubmitContact={submitContact}
            onClose={close}
          />
        )}
      </AnimatePresence>

      {/* Floating bubble */}
      {(state.isMinimized || !state.isOpen) && (
        <motion.button
          onClick={state.hasTriggered ? open : trigger}
          className="fixed bottom-6 right-4 sm:right-6 z-50 w-14 h-14 rounded-full bg-neon text-primary-foreground flex items-center justify-center shadow-lg glow-neon hover:glow-neon-strong transition-all"
          initial={{ scale: 0, opacity: 0 }}
          animate={
            showBadge
              ? { scale: 1, opacity: 1, y: [0, -8, 0] }
              : { scale: 1, opacity: 1 }
          }
          transition={
            showBadge
              ? { y: { duration: 0.6, repeat: 3, ease: "easeInOut" }, type: "spring", stiffness: 260, damping: 20, delay: 0.2 }
              : { type: "spring", stiffness: 260, damping: 20, delay: 1 }
          }
          aria-label="Отвори чата"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>

          {/* Notification badge */}
          {showBadge && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
              1
            </span>
          )}
        </motion.button>
      )}
    </>
  );
}
