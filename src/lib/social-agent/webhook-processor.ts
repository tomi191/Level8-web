/**
 * Social Commerce Agent — Webhook Processor
 *
 * Shared pipeline for all inbound webhook events.
 * Handles: dedup → conversation upsert → save message → AI generate → send.
 */

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { createDefaultConfig } from "../content-engine/config";
import { generateResponse } from "./ai-responder";
import { checkRateLimit } from "./rate-limiter";
import { determineApproval } from "./guardrails";
import type {
  InboundMessage,
  ProcessingResult,
  SocialAgentConfig,
  SocialMessage,
} from "./types";

// Lazy-init service role client
let _client: ReturnType<typeof createSupabaseClient<Database>> | null = null;
function getClient() {
  if (
    !_client &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    _client = createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  return _client!;
}

/**
 * Load agent config for a platform + global fallback.
 */
async function loadConfig(
  platform: string
): Promise<{ global: SocialAgentConfig | null; platform: SocialAgentConfig | null }> {
  const supabase = getClient();

  const { data } = await supabase
    .from("social_agent_config")
    .select("*")
    .in("platform", [platform, "global"]);

  const configs = (data || []) as unknown as SocialAgentConfig[];
  return {
    global: configs.find((c) => c.platform === "global") || null,
    platform: configs.find((c) => c.platform === platform) || null,
  };
}

/**
 * Check for duplicate message by platform_message_id.
 */
async function isDuplicate(platformMessageId: string | undefined): Promise<boolean> {
  if (!platformMessageId) return false;

  const supabase = getClient();
  const { count } = await supabase
    .from("social_messages")
    .select("id", { count: "exact", head: true })
    .eq("platform_message_id", platformMessageId);

  return (count || 0) > 0;
}

/**
 * Find or create a conversation.
 */
async function upsertConversation(msg: InboundMessage): Promise<string> {
  const supabase = getClient();

  // Try to find existing conversation
  let query = supabase
    .from("social_conversations")
    .select("id")
    .eq("platform", msg.platform)
    .eq("platform_user_id", msg.platformUserId);

  if (msg.threadId) {
    query = query.eq("thread_id", msg.threadId);
  } else {
    query = query.is("thread_id", null);
  }

  const { data: existing } = await query.single();

  if (existing) {
    // Update last_message_at
    await supabase
      .from("social_conversations")
      .update({
        last_message_at: new Date().toISOString(),
        user_name: msg.userName || undefined,
        user_avatar: msg.userAvatar || undefined,
      })
      .eq("id", existing.id);
    return existing.id;
  }

  // Create new conversation
  const { data: created, error } = await supabase
    .from("social_conversations")
    .insert({
      platform: msg.platform,
      platform_user_id: msg.platformUserId,
      user_name: msg.userName || null,
      user_avatar: msg.userAvatar || null,
      conversation_type: msg.conversationType || "conversation",
      thread_id: msg.threadId || null,
    })
    .select("id")
    .single();

  if (error || !created) {
    throw new Error(`Failed to create conversation: ${error?.message}`);
  }

  return created.id;
}

/**
 * Save an inbound message to DB.
 */
async function saveInboundMessage(
  conversationId: string,
  msg: InboundMessage
): Promise<string> {
  const supabase = getClient();

  const { data, error } = await supabase
    .from("social_messages")
    .insert({
      conversation_id: conversationId,
      direction: "inbound",
      message_type: msg.messageType || "text",
      content: msg.messageText,
      platform_message_id: msg.platformMessageId || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`Failed to save message: ${error?.message}`);
  }

  return data.id;
}

/**
 * Save AI response (as outbound or draft).
 */
async function saveAIResponse(
  conversationId: string,
  content: string,
  direction: "outbound" | "outbound_draft",
  approvalStatus: "auto_approved" | "pending",
  model: string,
  confidence: number,
  promptTokens: number,
  completionTokens: number
): Promise<string> {
  const supabase = getClient();

  const { data, error } = await supabase
    .from("social_messages")
    .insert({
      conversation_id: conversationId,
      direction,
      content,
      ai_generated: true,
      ai_model: model,
      ai_confidence: confidence,
      approval_status: approvalStatus,
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      sent_at: approvalStatus === "auto_approved" ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`Failed to save AI response: ${error?.message}`);
  }

  return data.id;
}

/**
 * Log AI usage to ai_usage_logs table.
 */
async function logAIUsage(
  model: string,
  promptTokens: number,
  completionTokens: number,
  feature: string
) {
  const supabase = getClient();

  await supabase.from("ai_usage_logs").insert({
    model,
    prompt_tokens: promptTokens,
    completion_tokens: completionTokens,
    feature,
    cost_usd: 0, // TODO: calculate from model registry
  });
}

/**
 * Get conversation history for context.
 */
async function getConversationHistory(
  conversationId: string,
  limit = 10
): Promise<SocialMessage[]> {
  const supabase = getClient();

  const { data } = await supabase
    .from("social_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .in("direction", ["inbound", "outbound"])
    .order("created_at", { ascending: true })
    .limit(limit);

  return (data || []) as unknown as SocialMessage[];
}

/**
 * Main processing pipeline for inbound messages.
 */
export async function processInboundMessage(
  msg: InboundMessage
): Promise<ProcessingResult> {
  try {
    // 1. Deduplicate
    if (await isDuplicate(msg.platformMessageId)) {
      return { success: true, action: "blocked", error: "Duplicate message" };
    }

    // 2. Load config
    const configs = await loadConfig(msg.platform);
    const platformConfig = configs.platform;
    const globalConfig = configs.global;
    const effectiveConfig = { ...globalConfig, ...platformConfig };

    // 3. Check blocked users
    const blockedUsers = (effectiveConfig?.blocked_users as string[]) || [];
    if (blockedUsers.includes(msg.platformUserId)) {
      return { success: true, action: "blocked", error: "User is blocked" };
    }

    // 4. Find/create conversation
    const conversationId = await upsertConversation(msg);

    // 5. Save inbound message
    const messageId = await saveInboundMessage(conversationId, msg);

    // 6. Check rate limits
    const maxPerHour = effectiveConfig?.max_messages_per_hour ?? 20;
    const rateLimit = await checkRateLimit(msg.platform, maxPerHour);
    if (!rateLimit.allowed) {
      return {
        success: true,
        conversationId,
        messageId,
        action: "rate_limited",
        error: rateLimit.reason,
      };
    }

    // 7. Check if auto-respond is enabled
    const autoRespond =
      msg.conversationType === "comment_thread"
        ? effectiveConfig?.auto_respond_comments ?? false
        : effectiveConfig?.auto_respond_dms ?? true;

    // 8. Get conversation history for context
    const history = await getConversationHistory(conversationId);

    // 9. Generate AI response
    const contentEngineConfig = createDefaultConfig();
    const aiResponse = await generateResponse(contentEngineConfig, {
      platform: msg.platform,
      userMessage: msg.messageText,
      conversationHistory: history,
      globalSystemPrompt: globalConfig?.system_prompt || null,
      platformSystemPrompt: platformConfig?.system_prompt || null,
      escalationKeywords: (effectiveConfig?.escalation_keywords as string[]) || undefined,
      aiModel: effectiveConfig?.ai_model || undefined,
      temperature: effectiveConfig?.temperature ?? 0.7,
      maxTokens: effectiveConfig?.max_tokens ?? 500,
    });

    // 10. Determine approval status
    const approvalStatus = determineApproval(
      aiResponse.confidence,
      autoRespond,
      aiResponse.shouldEscalate
    );

    // 11. Handle escalation
    if (aiResponse.shouldEscalate) {
      const supabase = getClient();
      await supabase
        .from("social_conversations")
        .update({
          escalated_to_human: true,
          escalated_at: new Date().toISOString(),
        })
        .eq("id", conversationId);
    }

    // 12. Save AI response
    const direction = approvalStatus === "auto_approved" ? "outbound" : "outbound_draft";
    const responseId = await saveAIResponse(
      conversationId,
      aiResponse.content,
      direction,
      approvalStatus,
      aiResponse.model,
      aiResponse.confidence,
      aiResponse.promptTokens,
      aiResponse.completionTokens
    );

    // 13. Log AI usage
    await logAIUsage(
      aiResponse.model,
      aiResponse.promptTokens,
      aiResponse.completionTokens,
      `social_agent_${msg.platform}`
    );

    // 14. Return result — caller is responsible for actually sending
    return {
      success: true,
      conversationId,
      messageId: responseId,
      aiResponse,
      action: aiResponse.shouldEscalate
        ? "escalated"
        : approvalStatus === "auto_approved"
          ? "responded"
          : "queued_for_approval",
    };
  } catch (err) {
    console.error("[WebhookProcessor] Error:", err);
    return {
      success: false,
      action: "error",
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
