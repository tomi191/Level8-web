/**
 * Social Commerce Agent — Viber Messaging
 *
 * Sends messages to individual Viber users via send_message API.
 * Different from channel posting (which uses /pa/post).
 */

const VIBER_API_BASE = "https://chatapi.viber.com";

interface ViberSendResult {
  success: boolean;
  messageToken?: number;
  error?: string;
}

/**
 * Send a text message to a Viber user.
 */
export async function sendViberMessage(
  authToken: string,
  receiverId: string,
  text: string,
  senderName = "Level 8",
  senderAvatar = "https://level8.bg/logo-192.png"
): Promise<ViberSendResult> {
  try {
    const response = await fetch(`${VIBER_API_BASE}/pa/send_message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Viber-Auth-Token": authToken,
      },
      body: JSON.stringify({
        receiver: receiverId,
        type: "text",
        text,
        sender: {
          name: senderName,
          avatar: senderAvatar,
        },
      }),
    });

    const data = await response.json();

    if (data.status === 0) {
      return { success: true, messageToken: data.message_token };
    }

    return {
      success: false,
      error: `Viber API error: ${data.status_message || data.status}`,
    };
  } catch (err) {
    return {
      success: false,
      error: `Viber send failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * Send a welcome message with keyboard buttons to a new Viber user.
 * Returns the welcome message as a response body (for conversation_started event).
 */
export function buildWelcomeResponse(
  senderName = "Level 8",
  senderAvatar = "https://level8.bg/logo-192.png"
) {
  return {
    sender: {
      name: senderName,
      avatar: senderAvatar,
    },
    type: "text",
    text: "Здравейте! \ud83d\udc4b Аз съм AI асистентът на Level 8. Мога да ви помогна с информация за нашите услуги по уеб разработка, SEO и автоматизация. Как мога да ви бъда полезен?",
    keyboard: {
      Type: "keyboard",
      DefaultHeight: false,
      Buttons: [
        {
          ActionType: "reply",
          ActionBody: "Услуги и цени",
          Text: "Услуги и цени",
          TextSize: "regular",
          BgColor: "#39FF14",
          Columns: 3,
          Rows: 1,
        },
        {
          ActionType: "reply",
          ActionBody: "Искам консултация",
          Text: "Искам консултация",
          TextSize: "regular",
          BgColor: "#7360f2",
          TextColor: "#FFFFFF",
          Columns: 3,
          Rows: 1,
        },
        {
          ActionType: "open-url",
          ActionBody: "https://level8.bg",
          Text: "level8.bg",
          TextSize: "regular",
          BgColor: "#1a1a1a",
          TextColor: "#39FF14",
          Columns: 6,
          Rows: 1,
        },
      ],
    },
  };
}
