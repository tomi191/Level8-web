/**
 * Telegram Channel Publishing
 *
 * Uses Telegram Bot API to send messages to a channel.
 * - sendPhoto with caption for posts with images
 * - sendMessage with parse_mode: "HTML" for text-only posts
 * - Caption max 1024 chars, message max 4096 chars
 */

import type { ContentEngineConfig } from "../config";

const TELEGRAM_API_BASE = "https://api.telegram.org/bot";

export interface TelegramPostParams {
  title: string;
  url: string;
  imageUrl?: string;
  excerpt?: string;
}

export interface TelegramPostResult {
  success: boolean;
  messageId?: number;
  error?: string;
}

/**
 * Send a message (photo + caption or text) to a Telegram channel.
 *
 * When imageUrl is provided, uses sendPhoto (caption max 1024 chars).
 * Otherwise uses sendMessage (text max 4096 chars).
 * HTML parse mode: <b>, <i>, <a href="..."> are supported.
 */
export async function sendToTelegramChannel(
  config: ContentEngineConfig,
  params: TelegramPostParams
): Promise<TelegramPostResult> {
  const log = config.logger;

  try {
    if (!config.telegram) throw new Error("Telegram config not set");
    const { botToken, channelId } = config.telegram;

    if (!botToken || !channelId) {
      throw new Error("Telegram bot token or channel ID missing");
    }

    log?.info("Sending to Telegram channel", { title: params.title });

    const caption = buildCaption(params);

    let response: Response;
    let data: Record<string, unknown>;

    if (params.imageUrl) {
      // sendPhoto — caption max 1024 chars
      const truncatedCaption = truncate(caption, 1024);
      response = await fetch(`${TELEGRAM_API_BASE}${botToken}/sendPhoto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: channelId,
          photo: params.imageUrl,
          caption: truncatedCaption,
          parse_mode: "HTML",
        }),
      });
      data = await response.json();
    } else {
      // sendMessage — text max 4096 chars
      const truncatedText = truncate(caption, 4096);
      response = await fetch(`${TELEGRAM_API_BASE}${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: channelId,
          text: truncatedText,
          parse_mode: "HTML",
          disable_web_page_preview: false,
        }),
      });
      data = await response.json();
    }

    if (!data.ok) {
      const errMsg =
        typeof data.description === "string"
          ? data.description
          : JSON.stringify(data);
      throw new Error(`Telegram API error: ${errMsg}`);
    }

    const result = data.result as { message_id?: number } | undefined;
    const messageId = result?.message_id;
    log?.info("Telegram message sent", { messageId });

    return { success: true, messageId };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    log?.error("Telegram send failed", { error: msg });
    return { success: false, error: msg };
  }
}

function buildCaption(params: TelegramPostParams): string {
  const parts: string[] = [];
  parts.push(`<b>${escapeHtml(params.title)}</b>`);
  if (params.excerpt) {
    parts.push("");
    parts.push(escapeHtml(truncate(params.excerpt, 200)));
  }
  parts.push("");
  parts.push(`\u{1F449} <a href="${params.url}">Прочети повече</a>`);
  return parts.join("\n");
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max - 1) + "…";
}
