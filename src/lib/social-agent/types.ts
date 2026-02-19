/**
 * Social Commerce Agent — TypeScript Types
 */

export type Platform = "facebook" | "instagram" | "viber";
export type AllPlatforms = Platform | "global";

export type ConversationType = "conversation" | "comment_thread";
export type ConversationStatus = "active" | "archived" | "blocked";

export type MessageDirection = "inbound" | "outbound" | "outbound_draft";
export type ApprovalStatus = "auto_approved" | "pending" | "approved" | "rejected";

export type OutboundActionType = "comment" | "dm" | "follow_up";
export type OutboundStatus =
  | "pending_generation"
  | "pending_approval"
  | "approved"
  | "rejected"
  | "sent"
  | "failed";
export type DiscoverySource = "hashtag_search" | "manual" | "engagement_reply";

// ============ Database Row Types ============

export interface SocialConversation {
  id: string;
  platform: Platform;
  platform_user_id: string;
  user_name: string | null;
  user_avatar: string | null;
  conversation_type: ConversationType;
  thread_id: string | null;
  status: ConversationStatus;
  escalated_to_human: boolean;
  escalated_at: string | null;
  last_message_at: string;
  created_at: string;
}

export interface SocialMessage {
  id: string;
  conversation_id: string;
  direction: MessageDirection;
  message_type: string;
  content: string;
  ai_generated: boolean;
  ai_model: string | null;
  ai_confidence: number | null;
  approval_status: ApprovalStatus;
  approved_by: string | null;
  approved_at: string | null;
  platform_message_id: string | null;
  platform_post_id: string | null;
  prompt_tokens: number;
  completion_tokens: number;
  sent_at: string | null;
  created_at: string;
  error: string | null;
}

export interface SocialOutboundItem {
  id: string;
  platform: Platform;
  action_type: OutboundActionType;
  target_post_url: string | null;
  target_user_name: string | null;
  target_post_content: string | null;
  discovery_source: DiscoverySource;
  ai_draft: string | null;
  ai_model: string | null;
  status: OutboundStatus;
  approved_by: string | null;
  sent_at: string | null;
  error: string | null;
  scheduled_for: string | null;
  created_at: string;
}

export interface SocialAgentConfig {
  id: string;
  platform: AllPlatforms;
  ai_model: string;
  temperature: number;
  max_tokens: number;
  system_prompt: string | null;
  auto_respond_dms: boolean;
  auto_respond_comments: boolean;
  max_messages_per_hour: number;
  max_outbound_per_day: number;
  min_delay_between_messages_sec: number;
  escalation_keywords: string[];
  blocked_users: string[];
  updated_at: string;
}

// ============ Processing Types ============

export interface InboundMessage {
  platform: Platform;
  platformUserId: string;
  userName?: string;
  userAvatar?: string;
  messageText: string;
  messageType?: string;
  platformMessageId?: string;
  threadId?: string;
  conversationType?: ConversationType;
}

export interface AIResponse {
  content: string;
  model: string;
  confidence: number;
  shouldEscalate: boolean;
  escalationReason?: string;
  promptTokens: number;
  completionTokens: number;
}

export interface ProcessingResult {
  success: boolean;
  conversationId?: string;
  messageId?: string;
  aiResponse?: AIResponse;
  error?: string;
  action: "responded" | "escalated" | "queued_for_approval" | "rate_limited" | "blocked" | "error";
}
