import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod/v4";

/**
 * Viber Webhook Endpoint
 *
 * Handles incoming events from Viber Public Account API
 * Required for sending messages to Viber channel
 *
 * Security: Verifies HMAC-SHA256 signature to prevent unauthorized requests
 */

const VIBER_AUTH_TOKEN = process.env.VIBER_AUTH_TOKEN || "";

// Zod schema for Viber webhook payload validation
const ViberEventSchema = z.object({
  event: z.string(),
  timestamp: z.number().optional(),
  message_token: z.number().optional(),
  user: z
    .object({
      id: z.string(),
      name: z.string().optional(),
    })
    .optional(),
  message: z
    .object({
      text: z.string().optional(),
      type: z.string().optional(),
    })
    .optional(),
});

/**
 * Verifies the HMAC-SHA256 signature from Viber
 * @param body - Raw request body as string
 * @param signature - X-Viber-Content-Signature header value
 * @returns true if signature is valid
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
        // User subscribed to channel
        console.log("[Viber Webhook] New subscriber:", body.user?.id);
        return NextResponse.json({ status: 0, status_message: "ok" });

      case "unsubscribed":
        // User unsubscribed from channel
        console.log("[Viber Webhook] User unsubscribed:", body.user?.id);
        return NextResponse.json({ status: 0, status_message: "ok" });

      case "conversation_started":
        // User started conversation with channel
        console.log("[Viber Webhook] Conversation started");
        return NextResponse.json({ status: 0, status_message: "ok" });

      case "message":
        // Received message from user
        console.log("[Viber Webhook] Message received:", body.message?.text);
        return NextResponse.json({ status: 0, status_message: "ok" });

      case "delivered":
        // Message delivered
        return NextResponse.json({ status: 0, status_message: "ok" });

      case "seen":
        // Message seen
        return NextResponse.json({ status: 0, status_message: "ok" });

      case "failed":
        // Message failed
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
