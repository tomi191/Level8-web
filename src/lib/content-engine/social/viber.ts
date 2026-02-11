/**
 * Viber Channel Adapter
 *
 * Sends rich media messages to a Viber public channel.
 */

export interface ViberConfig {
  authToken: string;
  channelId: string;
}

export interface ViberPostParams {
  title: string;
  url: string;
  imageUrl?: string;
  excerpt?: string;
}

const VIBER_POST_URL = "https://chatapi.viber.com/pa/post";

export async function sendToViberChannel(
  config: ViberConfig,
  params: ViberPostParams
): Promise<{ success: boolean; error?: string }> {
  const buttons = [
    {
      Columns: 6,
      Rows: 3,
      ActionType: "open-url",
      ActionBody: params.url,
      Image: params.imageUrl || "",
      TextSize: "small",
    },
    {
      Columns: 6,
      Rows: 2,
      ActionType: "none",
      ActionBody: "none",
      Text: `<font color="#ffffff"><b>${escapeHtml(params.title)}</b></font>${
        params.excerpt
          ? `<br><font color="#aaaaaa" size="12">${escapeHtml(params.excerpt.substring(0, 120))}</font>`
          : ""
      }`,
      TextSize: "medium",
      TextVAlign: "middle",
      TextHAlign: "left",
      BgColor: "#0a0a0a",
    },
    {
      Columns: 3,
      Rows: 1,
      ActionType: "open-url",
      ActionBody: params.url,
      Text: `<font color="#0a0a0a"><b>\u041F\u0440\u043E\u0447\u0435\u0442\u0438</b></font>`,
      TextSize: "regular",
      TextVAlign: "middle",
      TextHAlign: "center",
      BgColor: "#39FF14",
    },
    {
      Columns: 3,
      Rows: 1,
      ActionType: "open-url",
      ActionBody: params.url,
      Text: `<font color="#39FF14">\u041A\u043E\u043C\u0435\u043D\u0442\u0438\u0440\u0430\u0439</font>`,
      TextSize: "regular",
      TextVAlign: "middle",
      TextHAlign: "center",
      BgColor: "#1a1a1a",
    },
  ];

  const body = {
    auth_token: config.authToken,
    from: config.channelId,
    type: "rich_media",
    min_api_version: 7,
    rich_media: {
      Type: "rich_media",
      ButtonsGroupColumns: 6,
      ButtonsGroupRows: 6,
      BgColor: "#0a0a0a",
      Buttons: buttons,
    },
  };

  try {
    const response = await fetch(VIBER_POST_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    // LOG RESPONSE FOR DEBUGGING
    console.log("[Viber API] Response:", {
      status: data.status,
      status_message: data.status_message,
      message_token: data.message_token,
    });

    if (data.status !== 0) {
      console.error("[Viber API] Error response:", data);
      return {
        success: false,
        error: `Viber API error: ${data.status_message || data.status}`,
      };
    }

    console.log("[Viber API] Message sent successfully!");
    return { success: true };
  } catch (err) {
    console.error("[Viber API] Request failed:", err);
    return {
      success: false,
      error: `Viber request failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
