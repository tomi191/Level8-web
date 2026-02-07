"use client";

import { useReducer, useCallback, useEffect, useRef } from "react";
import type { ChatState, ChatAction, ChatMessage, ChatOption } from "@/types/chatbot";
import { CHATBOT_FLOW } from "@/lib/chatbot-flow";

const initialState: ChatState = {
  isOpen: false,
  isMinimized: true,
  currentStep: "welcome",
  messages: [],
  isTyping: false,
  messageQueue: [],
  hasTriggered: false,
  contactSubmitted: false,
};

function createMessage(sender: "bot" | "user", text: string): ChatMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    sender,
    text,
    timestamp: Date.now(),
  };
}

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "OPEN":
      return { ...state, isOpen: true, isMinimized: false };
    case "CLOSE":
      return { ...state, isMinimized: true };
    case "MINIMIZE":
      return { ...state, isMinimized: true };
    case "TRIGGER": {
      if (state.hasTriggered) return state;
      const step = CHATBOT_FLOW.welcome;
      return {
        ...state,
        hasTriggered: true,
        isOpen: true,
        isMinimized: false,
        currentStep: "welcome",
        messageQueue: step.messages,
        isTyping: true,
      };
    }
    case "SELECT_OPTION": {
      const userMsg = createMessage("user", action.option.label);
      const nextStep = CHATBOT_FLOW[action.option.nextStep];
      if (!nextStep) return state;
      return {
        ...state,
        currentStep: action.option.nextStep,
        messages: [...state.messages, userMsg],
        messageQueue: nextStep.messages,
        isTyping: true,
      };
    }
    case "ADD_BOT_MESSAGE": {
      const botMsg = createMessage("bot", action.text);
      return {
        ...state,
        messages: [...state.messages, botMsg],
      };
    }
    case "ADD_USER_MESSAGE": {
      const msg = createMessage("user", action.text);
      return {
        ...state,
        messages: [...state.messages, msg],
      };
    }
    case "SET_TYPING":
      return { ...state, isTyping: action.isTyping };
    case "PROCESS_QUEUE": {
      if (state.messageQueue.length === 0) {
        return { ...state, isTyping: false };
      }
      const [next, ...rest] = state.messageQueue;
      const botMsg = createMessage("bot", next);
      return {
        ...state,
        messages: [...state.messages, botMsg],
        messageQueue: rest,
        isTyping: rest.length > 0,
      };
    }
    case "SUBMIT_CONTACT": {
      const userMsg = createMessage("user", `${action.name} - ${action.phone}`);
      const thankStep = CHATBOT_FLOW.thank_you;
      return {
        ...state,
        contactSubmitted: true,
        currentStep: "thank_you",
        messages: [...state.messages, userMsg],
        messageQueue: thankStep.messages,
        isTyping: true,
      };
    }
    default:
      return state;
  }
}

export function useChatbot() {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const queueTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Process message queue with delays
  useEffect(() => {
    if (state.messageQueue.length > 0 && state.isTyping) {
      const delay = 600 + Math.random() * 600; // 600-1200ms
      queueTimerRef.current = setTimeout(() => {
        dispatch({ type: "PROCESS_QUEUE" });
      }, delay);
    }
    return () => {
      if (queueTimerRef.current) clearTimeout(queueTimerRef.current);
    };
  }, [state.messageQueue, state.isTyping, state.messages.length]);

  const open = useCallback(() => dispatch({ type: "OPEN" }), []);
  const close = useCallback(() => dispatch({ type: "CLOSE" }), []);
  const trigger = useCallback(() => dispatch({ type: "TRIGGER" }), []);
  const selectOption = useCallback(
    (option: ChatOption) => dispatch({ type: "SELECT_OPTION", option }),
    []
  );
  const submitContact = useCallback(
    (name: string, phone: string) => dispatch({ type: "SUBMIT_CONTACT", name, phone }),
    []
  );

  const currentStep = CHATBOT_FLOW[state.currentStep];

  return {
    state,
    currentStep,
    open,
    close,
    trigger,
    selectOption,
    submitContact,
  };
}
