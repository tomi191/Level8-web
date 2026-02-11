/**
 * Viber Channel Adapter
 *
 * Posts rich media messages to a Viber public channel feed.
 *
 * Key API details (learned from working vrachka.eu implementation):
 * - Endpoint: /pa/post (NOT /pa/broadcast_message which requires approval)
 * - Auth: X-Viber-Auth-Token header (NOT auth_token in body)
 * - from: superadmin user ID from get_account_info (NOT channel ID)
 */

export interface ViberConfig {
  authToken: string;
  channelId: string; // kept for reference, but `from` uses superadmin ID
}

export interface ViberPostParams {
  title: string;
  url: string;
  imageUrl?: string;
  excerpt?: string;
}

const VIBER_API_BASE = "https://chatapi.viber.com";
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;

/**
 * Fetch the superadmin user ID from Viber's get_account_info endpoint.
 * This ID is required as the `from` field in /pa/post calls.
 */
async function getSuperadminId(authToken: string): Promise<string> {
  const res = await fetch(`${VIBER_API_BASE}/pa/get_account_info`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Viber-Auth-Token": authToken,
    },
    body: JSON.stringify({}),
  });

  const data = await res.json();

  if (data.status !== 0) {
    throw new Error(
      `get_account_info failed: ${data.status_message || data.status}`
    );
  }

  const superadmin = data.members?.find(
    (m: { role: string }) => m.role === "superadmin"
  );

  if (!superadmin?.id) {
    throw new Error("No superadmin found in channel members");
  }

  console.log("[Viber] Superadmin ID:", superadmin.id);
  return superadmin.id;
}

/**
 * Build the rich media message payload.
 * 6 rows × 6 columns layout: image (3 rows) + title (1 row) + excerpt (1 row) + button (1 row)
 */
function buildRichMedia(params: ViberPostParams) {
  const buttons: Record<string, unknown>[] = [];

  // Image row (3 rows high)
  if (params.imageUrl) {
    buttons.push({
      Columns: 6,
      Rows: 3,
      ActionType: "open-url",
      ActionBody: params.url,
      Image: params.imageUrl,
    });
  }

  // Title row
  buttons.push({
    Columns: 6,
    Rows: 1,
    ActionType: "open-url",
    ActionBody: params.url,
    Text: `<font color="#FFFFFF"><b>${escapeHtml(params.title)}</b></font>`,
    TextSize: "medium",
    TextVAlign: "middle",
    TextHAlign: "center",
    BgColor: "#0a0a0a",
  });

  // Excerpt row
  if (params.excerpt) {
    buttons.push({
      Columns: 6,
      Rows: 1,
      ActionType: "open-url",
      ActionBody: params.url,
      Text: `<font color="#AAAAAA">${escapeHtml(truncate(params.excerpt, 120))}</font>`,
      TextSize: "small",
      TextVAlign: "top",
      TextHAlign: "center",
      BgColor: "#0a0a0a",
    });
  }

  // CTA button row
  buttons.push({
    Columns: 6,
    Rows: 1,
    ActionType: "open-url",
    ActionBody: params.url,
    Text: `<font color="#0a0a0a"><b>Прочети ▶</b></font>`,
    TextSize: "medium",
    TextVAlign: "middle",
    TextHAlign: "center",
    BgColor: "#39FF14",
  });

  const totalRows = (params.imageUrl ? 3 : 0) + 1 + (params.excerpt ? 1 : 0) + 1;

  return {
    Type: "rich_media",
    ButtonsGroupColumns: 6,
    ButtonsGroupRows: totalRows,
    Buttons: buttons,
  };
}

export async function sendToViberChannel(
  config: ViberConfig,
  params: ViberPostParams
): Promise<{ success: boolean; error?: string }> {
  try {
    // Step 1: Get superadmin user ID
    const fromId = await getSuperadminId(config.authToken);

    // Step 2: Build payload
    const body = {
      from: fromId,
      type: "rich_media",
      min_api_version: 7,
      rich_media: buildRichMedia(params),
    };

    // Step 3: POST to /pa/post with retry
    let lastError = "";
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(`${VIBER_API_BASE}/pa/post`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Viber-Auth-Token": config.authToken,
          },
          body: JSON.stringify(body),
        });

        const data = await response.json();

        console.log("[Viber API] Response:", {
          status: data.status,
          status_message: data.status_message,
          message_token: data.message_token,
          attempt,
        });

        if (data.status === 0) {
          console.log("[Viber API] Message posted successfully!");
          return { success: true };
        }

        lastError = `Viber API error: ${data.status_message || data.status}`;
        console.error(`[Viber API] Attempt ${attempt}/${MAX_RETRIES} failed:`, lastError);
      } catch (fetchErr) {
        lastError = `Fetch failed: ${fetchErr instanceof Error ? fetchErr.message : String(fetchErr)}`;
        console.error(`[Viber API] Attempt ${attempt}/${MAX_RETRIES} fetch error:`, lastError);
      }

      // Exponential backoff before retry
      if (attempt < MAX_RETRIES) {
        const delay = INITIAL_BACKOFF_MS * Math.pow(2, attempt - 1);
        console.log(`[Viber API] Retrying in ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }

    return { success: false, error: lastError };
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

function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max - 1) + "\u2026";
}
