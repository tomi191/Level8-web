import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod/v4";
import { processInboundMessage } from "@/lib/social-agent/webhook-processor";
import {
  sendViberMessage,
  buildWelcomeResponse,
} from "@/lib/social-agent/viber-messaging";

/**
 * Viber Webhook Endpoint
 *
 * Handles incoming events from Viber Public Account API.
 * Enhanced with AI Social Commerce Agent for auto-responses.
 *
 * Security: Verifies HMAC-SHA256 signature to prevent unauthorized requests.
 */

const VIBER_AUTH_TOKEN = process.env.VIBER_AUTH_TOKEN || "";

// Zod schema for Viber webhook payload validation
// Note: Viber uses "user" for conversation_started/subscribed, "sender" for message events
const ViberUserSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  avatar: z.string().optional(),
});

const ViberEventSchema = z.object({
  event: z.string(),
  timestamp: z.number().optional(),
  message_token: z.number().optional(),
  user_id: z.string().optional(), // used by "unsubscribed" event
  user: ViberUserSchema.optional(), // used by "conversation_started", "subscribed"
  sender: ViberUserSchema.optional(), // used by "message" event
  message: z
    .object({
      text: z.string().optional(),
      type: z.string().optional(),
      token: z.number().optional(),
    })
    .optional(),
});

/**
 * Verifies the HMAC-SHA256 signature from Viber
 */
function verifySignature(body: string, signature: string | null): boolean {
  if (!signature || !VIBER_AUTH_TOKEN) {
    return false;
  }

  const hash = crypto
    .createHmac("sha256", VIBER_AUTH_TOKEN)
    .update(body)
    .digest("hex");

  return hash === signature;
}

/**
 * Track subscription events in social_conversations.
 */
async function trackSubscription(
  userId: string,
  userName: string | undefined,
  status: "active" | "archived"
) {
  try {
    const { createClient } = await import("@supabase/supabase-js");
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return;
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Upsert conversation record
    await supabase.from("social_conversations").upsert(
      {
        platform: "viber",
        platform_user_id: userId,
        user_name: userName || null,
        conversation_type: "conversation",
        status,
        last_message_at: new Date().toISOString(),
      },
      { onConflict: "platform,platform_user_id,thread_id" }
    );
  } catch (err) {
    console.error("[Viber Webhook] Subscription tracking error:", err);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Read raw body for signature verification
    const bodyText = await request.text();
    const signature = request.headers.get("X-Viber-Content-Signature");

    // Verify signature (critical security check)
    if (!verifySignature(bodyText, signature)) {
      console.error("[Viber Webhook] Invalid signature - potential unauthorized request");
      return NextResponse.json(
        { status: 1, status_message: "Invalid signature" },
        { status: 403 }
      );
    }

    // Parse and validate payload
    const bodyJson = JSON.parse(bodyText);
    const validationResult = ViberEventSchema.safeParse(bodyJson);

    if (!validationResult.success) {
      console.error("[Viber Webhook] Invalid payload:", validationResult.error);
      return NextResponse.json(
        { status: 1, status_message: "Invalid payload" },
        { status: 400 }
      );
    }

    const body = validationResult.data;
    const event = body.event;

    console.log("[Viber Webhook] Received event:", event);

    // Handle different event types
    switch (event) {
      case "webhook":
        // Initial webhook setup validation
        console.log("[Viber Webhook] Setup validated");
        return NextResponse.json({ status: 0, status_message: "ok" });

      case "subscribed":
        console.log("[Viber Webhook] New subscriber:", body.user?.id);
        if (body.user?.id) {
          await trackSubscription(body.user.id, body.user.name, "active");
        }
        return NextResponse.json({ status: 0, status_message: "ok" });

      case "unsubscribed":
        // Viber sends only "user_id" (string) for unsubscribed events, not a user object
        console.log("[Viber Webhook] User unsubscribed:", body.user_id);
        if (body.user_id) {
          await trackSubscription(body.user_id, undefined, "archived");
        }
        return NextResponse.json({ status: 0, status_message: "ok" });

      case "conversation_started": {
        // User opened conversation — return welcome message with keyboard
        console.log("[Viber Webhook] Conversation started:", body.user?.id);
        if (body.user?.id) {
          await trackSubscription(body.user.id, body.user.name, "active");
        }
        // Return welcome message inline (Viber API allows this for conversation_started)
        const welcome = buildWelcomeResponse();
        return NextResponse.json(welcome);
      }

      case "message": {
        // Process message through AI pipeline
        // Viber sends "sender" (not "user") for message events
        const sender = body.sender;
        const userId = sender?.id;
        const messageText = body.message?.text;
        const messageToken = body.message?.token;

        if (!userId || !messageText) {
          // Non-text message (sticker, image, etc.) — acknowledge silently
          console.log("[Viber Webhook] Non-text or missing sender, skipping AI. sender:", !!sender, "text:", !!messageText);
          return NextResponse.json({ status: 0, status_message: "ok" });
        }

        console.log("[Viber Webhook] Processing message from", sender?.name, ":", messageText);

        // Run through AI pipeline
        const result = await processInboundMessage({
          platform: "viber",
          platformUserId: userId,
          userName: sender?.name,
          userAvatar: sender?.avatar,
          messageText,
          platformMessageId: messageToken?.toString(),
        });

        console.log("[Viber Webhook] Processing result:", result.action);

        // If auto-approved, send the response
        if (result.action === "responded" && result.aiResponse) {
          const sendResult = await sendViberMessage(
            VIBER_AUTH_TOKEN,
            userId,
            result.aiResponse.content
          );

          if (!sendResult.success) {
            console.error("[Viber Webhook] Failed to send response:", sendResult.error);
          }
        }

        // If escalated, send escalation message + the AI draft for reference
        if (result.action === "escalated" && result.aiResponse) {
          await sendViberMessage(
            VIBER_AUTH_TOKEN,
            userId,
            "Благодаря за интереса! Ще ви свържа с екипа ни за по-подробна информация. Очаквайте отговор скоро!"
          );
        }

        return NextResponse.json({ status: 0, status_message: "ok" });
      }

      case "delivered":
      case "seen":
        return NextResponse.json({ status: 0, status_message: "ok" });

      case "failed":
        console.error("[Viber Webhook] Message failed:", body);
        return NextResponse.json({ status: 0, status_message: "ok" });

      default:
        console.log("[Viber Webhook] Unknown event:", event);
        return NextResponse.json({ status: 0, status_message: "ok" });
    }
  } catch (error) {
    console.error("[Viber Webhook] Error:", error);
    return NextResponse.json(
      { status: 1, status_message: "error" },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: "ok",
    webhook: "viber",
    timestamp: new Date().toISOString(),
  });
}
