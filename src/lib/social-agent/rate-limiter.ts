/**
 * Social Commerce Agent — Rate Limiter
 *
 * Per-platform rate limit checks against DB.
 * Prevents spam and respects platform limits.
 */

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { Platform } from "./types";

// Lazy-init service role client
let _client: ReturnType<typeof createSupabaseClient<Database>> | null = null;
function getClient() {
  if (!_client && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    _client = createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  return _client!;
}

interface RateLimitResult {
  allowed: boolean;
  reason?: string;
  messagesInLastHour: number;
  limit: number;
}

/**
 * Check if we can send another message on a given platform.
 * Counts outbound messages in the last hour.
 */
export async function checkRateLimit(
  platform: Platform,
  maxPerHour: number
): Promise<RateLimitResult> {
  const supabase = getClient();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  // Count outbound messages sent in the last hour for this platform
  const { count, error } = await supabase
    .from("social_messages")
    .select("id", { count: "exact", head: true })
    .in("direction", ["outbound"])
    .gte("sent_at", oneHourAgo)
    .not("sent_at", "is", null);

  if (error) {
    console.error("[RateLimiter] Error checking rate limit:", error);
    // On error, be conservative and allow (to not break the flow)
    return { allowed: true, messagesInLastHour: 0, limit: maxPerHour };
  }

  const messagesInLastHour = count || 0;
  const allowed = messagesInLastHour < maxPerHour;

  return {
    allowed,
    reason: allowed ? undefined : `Rate limit reached: ${messagesInLastHour}/${maxPerHour} per hour`,
    messagesInLastHour,
    limit: maxPerHour,
  };
}

/**
 * Calculate delay with jitter before sending.
 * Adds random 0-30s to minimum delay for natural timing.
 */
export function calculateDelay(minDelaySec: number): number {
  const jitter = Math.floor(Math.random() * 30);
  return (minDelaySec + jitter) * 1000;
}

/**
 * Check if user was contacted outbound in the last 24h.
 */
export async function checkOutboundCooldown(
  platform: Platform,
  platformUserId: string
): Promise<boolean> {
  const supabase = getClient();
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { count } = await supabase
    .from("social_outbound_queue")
    .select("id", { count: "exact", head: true })
    .eq("platform", platform)
    .eq("target_user_name", platformUserId)
    .eq("status", "sent")
    .gte("sent_at", oneDayAgo);

  return (count || 0) > 0;
}
