import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createNotification } from "@/lib/admin-notifications";
import type { HubTablesConfig, HubTableConfig } from "@/types/crm";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: Record<string, unknown> | null;
  schema: string;
  old_record: Record<string, unknown> | null;
}

export async function POST(request: NextRequest) {
  const token = request.headers.get("x-hub-token") ||
    request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 401 });
  }

  const db = getServiceClient();

  const { data: website, error: lookupErr } = await db
    .from("crm_websites")
    .select("id, domain, hub_connected, hub_tables_config, crm_clients(company_name)")
    .eq("hub_webhook_token", token)
    .single();

  if (lookupErr || !website) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  if (!website.hub_connected) {
    return NextResponse.json({ error: "Hub not connected" }, { status: 403 });
  }

  let payload: WebhookPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!payload.type || !payload.table) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { data: hubEvent } = await db.from("hub_events").insert({
    website_id: website.id,
    event_type: payload.type,
    table_name: payload.table,
    record_data: payload.record,
  }).select("id").single();

  const config = (website.hub_tables_config || {}) as unknown as HubTablesConfig;
  const tableConfig = config[payload.table];

  if (tableConfig?.notify && payload.type === "INSERT") {
    const client = website.crm_clients as unknown as { company_name: string } | null;
    const message = buildNotificationMessage(
      tableConfig,
      payload.record,
      website.domain,
      client?.company_name || "\u2014"
    );

    await createNotification({
      type: "hub_event",
      severity: "info",
      title: `${tableConfig.label || payload.table} \u2014 ${website.domain}`,
      message,
      entityType: "website",
      entityId: website.id,
      actionUrl: `/admin/crm/websites/${website.id}`,
      sendTelegram: true,
      sendEmail: false,
    });

    // Mark event as notified
    if (hubEvent?.id) {
      await db.from("hub_events").update({ notified: true }).eq("id", hubEvent.id);
    }
  }

  return NextResponse.json({ ok: true });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildNotificationMessage(
  config: HubTableConfig,
  record: Record<string, unknown> | null,
  domain: string,
  clientName: string
): string {
  if (!record) return `\u041D\u043E\u0432 \u0437\u0430\u043F\u0438\u0441 \u0432 ${config.label} \u043D\u0430 ${domain}`;

  let msg = config.message_template || `\u041D\u043E\u0432 ${config.label}`;

  for (const [key, value] of Object.entries(record)) {
    msg = msg.replace(`{${key}}`, escapeHtml(String(value ?? "\u2014")));
  }

  const fields = config.notify_fields || [];
  const details = fields
    .map((f) => (record[f] !== undefined ? `${f}: ${escapeHtml(String(record[f]))}` : null))
    .filter(Boolean)
    .join("\n");

  return [
    `\uD83C\uDFE2 ${clientName}`,
    `\uD83C\uDF10 ${domain}`,
    `\uD83D\uDCCB ${msg}`,
    details ? `\n${details}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
