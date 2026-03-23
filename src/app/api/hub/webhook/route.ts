import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createNotification } from "@/lib/admin-notifications";
import {
  findTriggerFlow,
  createFlowInstance,
  attachToActiveFlow,
  isPartOfAnyFlow,
  getCorrelationValue,
} from "@/lib/hub/flows";
import type { HubTablesConfig, HubTableConfig, HubFlowConfig } from "@/types/crm";

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

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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
    .select("id, domain, hub_connected, hub_tables_config, hub_flow_config, crm_clients(company_name)")
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

  // Store event
  const { data: hubEvent } = await db.from("hub_events").insert({
    website_id: website.id,
    event_type: payload.type,
    table_name: payload.table,
    record_data: payload.record,
  }).select("id").single();

  const eventId = hubEvent?.id;
  const tablesConfig = (website.hub_tables_config || {}) as unknown as HubTablesConfig;
  const flowConfig = (website.hub_flow_config || {}) as unknown as HubFlowConfig;
  const tableConfig = tablesConfig[payload.table];
  const clientName = (website.crm_clients as unknown as { company_name: string } | null)?.company_name || "\u2014";

  // ============================================================
  // INSERT event handling
  // ============================================================
  if (payload.type === "INSERT" && eventId) {
    // Check if this table triggers a flow
    const trigger = findTriggerFlow(flowConfig, payload.table);
    if (trigger && payload.record) {
      const correlationValue = getCorrelationValue(trigger.flow, payload.table, payload.record);
      if (correlationValue) {
        await createFlowInstance(
          website.id,
          trigger.flowName,
          trigger.flow,
          String(correlationValue),
          eventId
        );
        // Flow event — DO NOT send Telegram (cron handles it)
        return NextResponse.json({ ok: true, flow: trigger.flowName });
      }
    }

    // Check if this table is expected in an active flow
    const flowInstanceId = await attachToActiveFlow(
      website.id,
      flowConfig,
      payload.table,
      payload.record,
      eventId
    );

    if (flowInstanceId) {
      // Attached to flow — DO NOT send Telegram
      return NextResponse.json({ ok: true, attached_to_flow: flowInstanceId });
    }

    // Standalone INSERT — send Telegram immediately (if configured)
    if (tableConfig?.notify) {
      const message = buildNotificationMessage(
        tableConfig,
        payload.record,
        website.domain,
        clientName
      );

      await createNotification({
        type: "hub_event" as any,
        severity: "info",
        title: `${tableConfig.label || payload.table} \u2014 ${website.domain}`,
        message,
        entityType: "website",
        entityId: website.id,
        actionUrl: `/admin/crm/websites/${website.id}`,
        sendTelegram: true,
        sendEmail: false,
      });

      await db.from("hub_events").update({ notified: true }).eq("id", eventId);
    }

    return NextResponse.json({ ok: true, standalone: true });
  }

  // ============================================================
  // UPDATE event handling (churn detection, payment status)
  // ============================================================
  if (payload.type === "UPDATE" && payload.record) {
    // Churn detection: subscriptions status → cancelled/expired
    if (payload.table === "subscriptions") {
      const status = payload.record.status as string | undefined;
      const oldStatus = payload.old_record?.status as string | undefined;
      if (status && oldStatus && status !== oldStatus &&
          (status === "cancelled" || status === "expired")) {
        const email = payload.record.email || payload.record.user_email || "";
        const plan = payload.record.plan_type || payload.record.plan || "";

        await createNotification({
          type: "hub_event" as any,
          severity: "warning",
          title: `\u26A0\uFE0F \u041E\u0442\u043A\u0430\u0437 \u043E\u0442 \u0430\u0431\u043E\u043D\u0430\u043C\u0435\u043D\u0442 \u2014 ${website.domain}`,
          message: [
            `\uD83C\uDFE2 ${clientName}`,
            `\uD83C\uDF10 ${website.domain}`,
            `\u26A0\uFE0F ${escapeHtml(String(email))} \u2014 ${escapeHtml(String(plan))}`,
            `${escapeHtml(String(oldStatus))} \u2192 ${escapeHtml(String(status))}`,
          ].join("\n"),
          entityType: "website",
          entityId: website.id,
          actionUrl: `/admin/crm/websites/${website.id}`,
          sendTelegram: true,
          sendEmail: true,
        });

        if (eventId) {
          await db.from("hub_events").update({ notified: true }).eq("id", eventId);
        }
      }
    }

    // Payment confirmation: shop_orders status → paid/completed
    if (payload.table === "shop_orders") {
      const status = payload.record.status as string | undefined;
      const oldStatus = payload.old_record?.status as string | undefined;
      if (status && oldStatus && status !== oldStatus &&
          (status === "paid" || status === "completed")) {
        const email = payload.record.customer_email || "";
        const amount = payload.record.total_amount || "";

        await createNotification({
          type: "hub_event" as any,
          severity: "info",
          title: `\u2705 \u041F\u043B\u0430\u0449\u0430\u043D\u0435 \u043F\u043E\u0442\u0432\u044A\u0440\u0434\u0435\u043D\u043E \u2014 ${website.domain}`,
          message: [
            `\uD83C\uDFE2 ${clientName}`,
            `\uD83C\uDF10 ${website.domain}`,
            `\u2705 ${escapeHtml(String(email))} \u2014 ${escapeHtml(String(amount))}\u043B\u0432`,
            `${escapeHtml(String(oldStatus))} \u2192 ${escapeHtml(String(status))}`,
          ].join("\n"),
          entityType: "website",
          entityId: website.id,
          actionUrl: `/admin/crm/websites/${website.id}`,
          sendTelegram: true,
          sendEmail: false,
        });

        if (eventId) {
          await db.from("hub_events").update({ notified: true }).eq("id", eventId);
        }
      }
    }

    return NextResponse.json({ ok: true, update: true });
  }

  return NextResponse.json({ ok: true });
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
