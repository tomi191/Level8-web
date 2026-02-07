export interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: number;
}

export interface ChatOption {
  id: string;
  label: string;
  nextStep: string;
}

export interface ChatStep {
  id: string;
  messages: string[];
  options?: ChatOption[];
  isContactForm?: boolean;
  isThankYou?: boolean;
}

export interface ChatState {
  isOpen: boolean;
  isMinimized: boolean;
  currentStep: string;
  messages: ChatMessage[];
  isTyping: boolean;
  messageQueue: string[];
  hasTriggered: boolean;
  contactSubmitted: boolean;
}

export type ChatAction =
  | { type: "OPEN" }
  | { type: "CLOSE" }
  | { type: "MINIMIZE" }
  | { type: "TRIGGER" }
  | { type: "SELECT_OPTION"; option: ChatOption }
  | { type: "ADD_BOT_MESSAGE"; text: string }
  | { type: "SET_TYPING"; isTyping: boolean }
  | { type: "PROCESS_QUEUE" }
  | { type: "SUBMIT_CONTACT"; name: string; phone: string }
  | { type: "ADD_USER_MESSAGE"; text: string };
