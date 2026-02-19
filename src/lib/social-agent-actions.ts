"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { sendViberMessage } from "@/lib/social-agent/viber-messaging";
import type {
  SocialConversation,
  SocialMessage,
  SocialAgentConfig,
  SocialOutboundItem,
  Platform,
  AllPlatforms,
} from "@/lib/social-agent/types";

// Lazy-init service role client (bypasses RLS)
let _serviceClient: ReturnType<typeof createSupabaseClient<Database>> | null = null;
function getServiceSupabase() {
  if (
    !_serviceClient &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    _serviceClient = createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  return _serviceClient!;
}

/**
 * Verify admin access for all actions.
 */
async function requireAdminAccess() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

// ============ APPROVAL ACTIONS ============

/**
 * Approve a pending AI draft and send it.
 */
export async function approveResponse(messageId: string) {
  const user = await requireAdminAccess();
  const supabase = getServiceSupabase();

  // Get the message + conversation
  const { data: message } = await supabase
    .from("social_messages")
    .select("*, conversation:social_conversations(*)")
    .eq("id", messageId)
    .single();

  if (!message) throw new Error("Message not found");

  const msg = message as unknown as SocialMessage & {
    conversation: SocialConversation;
  };

  // Send the message on the appropriate platform
  let sendError: string | null = null;

  if (msg.conversation.platform === "viber") {
    const authToken = process.env.VIBER_AUTH_TOKEN || "";
    const result = await sendViberMessage(
      authToken,
      msg.conversation.platform_user_id,
      msg.content
    );
    if (!result.success) sendError = result.error || "Send failed";
  }
  // TODO: Facebook and Instagram sending in Phase 2-3

  // Update message status
  await supabase
    .from("social_messages")
    .update({
      direction: "outbound",
      approval_status: "approved",
      approved_by: user.email || user.id,
      approved_at: new Date().toISOString(),
      sent_at: sendError ? null : new Date().toISOString(),
      error: sendError,
    })
    .eq("id", messageId);

  return { success: !sendError, error: sendError };
}

/**
 * Reject a pending AI draft.
 */
export async function rejectResponse(messageId: string) {
  const user = await requireAdminAccess();
  const supabase = getServiceSupabase();

  await supabase
    .from("social_messages")
    .update({
      approval_status: "rejected",
      approved_by: user.email || user.id,
      approved_at: new Date().toISOString(),
    })
    .eq("id", messageId);

  return { success: true };
}

/**
 * Edit an AI draft, then approve and send.
 */
export async function editAndApprove(messageId: string, newContent: string) {
  const user = await requireAdminAccess();
  const supabase = getServiceSupabase();

  // Update content first
  await supabase
    .from("social_messages")
    .update({ content: newContent })
    .eq("id", messageId);

  // Then approve (which sends)
  return approveResponse(messageId);
}

/**
 * Escalate a conversation to human handling.
 */
export async function escalateToHuman(conversationId: string) {
  await requireAdminAccess();
  const supabase = getServiceSupabase();

  await supabase
    .from("social_conversations")
    .update({
      escalated_to_human: true,
      escalated_at: new Date().toISOString(),
    })
    .eq("id", conversationId);

  return { success: true };
}

/**
 * Send a manual reply from admin.
 */
export async function sendManualReply(conversationId: string, content: string) {
  const user = await requireAdminAccess();
  const supabase = getServiceSupabase();

  // Get conversation
  const { data: conv } = await supabase
    .from("social_conversations")
    .select("*")
    .eq("id", conversationId)
    .single();

  if (!conv) throw new Error("Conversation not found");

  const conversation = conv as unknown as SocialConversation;

  // Send on platform
  let sendError: string | null = null;

  if (conversation.platform === "viber") {
    const authToken = process.env.VIBER_AUTH_TOKEN || "";
    const result = await sendViberMessage(
      authToken,
      conversation.platform_user_id,
      content
    );
    if (!result.success) sendError = result.error || "Send failed";
  }

  // Save to DB
  await supabase.from("social_messages").insert({
    conversation_id: conversationId,
    direction: "outbound",
    content,
    ai_generated: false,
    approval_status: "auto_approved",
    approved_by: user.email || user.id,
    approved_at: new Date().toISOString(),
    sent_at: sendError ? null : new Date().toISOString(),
    error: sendError,
  });

  return { success: !sendError, error: sendError };
}

// ============ OUTBOUND QUEUE ============

/**
 * Approve an outbound queue item and mark for sending.
 */
export async function approveOutbound(queueId: string) {
  const user = await requireAdminAccess();
  const supabase = getServiceSupabase();

  await supabase
    .from("social_outbound_queue")
    .update({
      status: "approved",
      approved_by: user.email || user.id,
    })
    .eq("id", queueId);

  return { success: true };
}

/**
 * Reject an outbound queue item.
 */
export async function rejectOutbound(queueId: string) {
  const user = await requireAdminAccess();
  const supabase = getServiceSupabase();

  await supabase
    .from("social_outbound_queue")
    .update({
      status: "rejected",
      approved_by: user.email || user.id,
    })
    .eq("id", queueId);

  return { success: true };
}

// ============ DATA FETCHING ============

/**
 * Get pending approval items (messages + outbound).
 */
export async function getQueueItems() {
  await requireAdminAccess();
  const supabase = getServiceSupabase();

  // Pending message drafts
  const { data: messages } = await supabase
    .from("social_messages")
    .select("*, conversation:social_conversations(*)")
    .eq("approval_status", "pending")
    .order("created_at", { ascending: false })
    .limit(50);

  // Pending outbound items
  const { data: outbound } = await supabase
    .from("social_outbound_queue")
    .select("*")
    .in("status", ["pending_approval", "pending_generation"])
    .order("created_at", { ascending: false })
    .limit(50);

  return {
    messages: (messages || []) as unknown as (SocialMessage & {
      conversation: SocialConversation;
    })[],
    outbound: (outbound || []) as unknown as SocialOutboundItem[],
  };
}

/**
 * Get paginated conversation list.
 */
export async function getConversations(
  platform?: Platform,
  page = 1,
  pageSize = 20
) {
  await requireAdminAccess();
  const supabase = getServiceSupabase();

  let query = supabase
    .from("social_conversations")
    .select("*", { count: "exact" })
    .order("last_message_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (platform) {
    query = query.eq("platform", platform);
  }

  const { data, count } = await query;

  return {
    conversations: (data || []) as unknown as SocialConversation[],
    total: count || 0,
    page,
    pageSize,
  };
}

/**
 * Get a single conversation with messages.
 */
export async function getConversationDetail(conversationId: string) {
  await requireAdminAccess();
  const supabase = getServiceSupabase();

  const { data: conversation } = await supabase
    .from("social_conversations")
    .select("*")
    .eq("id", conversationId)
    .single();

  const { data: messages } = await supabase
    .from("social_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  return {
    conversation: conversation as unknown as SocialConversation | null,
    messages: (messages || []) as unknown as SocialMessage[],
  };
}

// ============ SETTINGS ============

/**
 * Get all agent configs.
 */
export async function getAgentConfigs() {
  await requireAdminAccess();
  const supabase = getServiceSupabase();

  const { data } = await supabase
    .from("social_agent_config")
    .select("*")
    .order("platform");

  return (data || []) as unknown as SocialAgentConfig[];
}

/**
 * Update agent config for a platform.
 */
export async function updateAgentConfig(
  platform: AllPlatforms,
  config: Partial<
    Pick<
      SocialAgentConfig,
      | "ai_model"
      | "temperature"
      | "max_tokens"
      | "system_prompt"
      | "auto_respond_dms"
      | "auto_respond_comments"
      | "max_messages_per_hour"
      | "max_outbound_per_day"
      | "min_delay_between_messages_sec"
      | "escalation_keywords"
      | "blocked_users"
    >
  >
) {
  await requireAdminAccess();
  const supabase = getServiceSupabase();

  const updateData: Record<string, unknown> = {
    ...config,
    updated_at: new Date().toISOString(),
  };

  // Convert arrays to jsonb
  if (config.escalation_keywords) {
    updateData.escalation_keywords = JSON.stringify(config.escalation_keywords);
  }
  if (config.blocked_users) {
    updateData.blocked_users = JSON.stringify(config.blocked_users);
  }

  const { error } = await supabase
    .from("social_agent_config")
    .update(updateData)
    .eq("platform", platform);

  if (error) throw new Error(`Failed to update config: ${error.message}`);

  return { success: true };
}

// ============ STATS ============

/**
 * Get dashboard stats.
 */
export async function getSocialStats() {
  await requireAdminAccess();
  const supabase = getServiceSupabase();

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Parallel queries
  const [
    { count: totalConversations },
    { count: activeConversations },
    { count: pendingApprovals },
    { count: escalated },
    { count: messagesToday },
    { count: messagesThisWeek },
  ] = await Promise.all([
    supabase
      .from("social_conversations")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("social_conversations")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("social_messages")
      .select("id", { count: "exact", head: true })
      .eq("approval_status", "pending"),
    supabase
      .from("social_conversations")
      .select("id", { count: "exact", head: true })
      .eq("escalated_to_human", true)
      .eq("status", "active"),
    supabase
      .from("social_messages")
      .select("id", { count: "exact", head: true })
      .gte("created_at", today),
    supabase
      .from("social_messages")
      .select("id", { count: "exact", head: true })
      .gte("created_at", thisWeek),
  ]);

  return {
    totalConversations: totalConversations || 0,
    activeConversations: activeConversations || 0,
    pendingApprovals: pendingApprovals || 0,
    escalated: escalated || 0,
    messagesToday: messagesToday || 0,
    messagesThisWeek: messagesThisWeek || 0,
  };
}
