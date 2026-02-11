import { NextRequest, NextResponse } from "next/server";

/**
 * Viber Webhook Endpoint
 *
 * Handles incoming events from Viber Public Account API
 * Required for sending messages to Viber channel
 */

const VIBER_AUTH_TOKEN = process.env.VIBER_AUTH_TOKEN || "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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
