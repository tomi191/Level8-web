"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  AdminNotification,
  NotificationType,
  NotificationSeverity,
} from "@/types/crm";

// ============================================================
// Admin Notification System
// Telegram + Email + Dashboard notifications for Level 8 CRM
// ============================================================

const TELEGRAM_API = "https://api.telegram.org/bot";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://level8.bg";

// --- Telegram: Personal message to admin ---

async function sendAdminTelegram(text: string): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!botToken || !adminChatId) return false;

  try {
    const res = await fetch(`${TELEGRAM_API}${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: adminChatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
    const data = await res.json();
    return !!data.ok;
  } catch {
    return false;
  }
}

// --- Email: Admin notification ---

async function sendAdminEmail(
  subject: string,
  html: string
): Promise<boolean> {
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: "LEVEL 8 CRM <noreply@level8.bg>",
      to: "contact@level8.bg",
      subject,
      html,
    });
    return !error;
  } catch {
    return false;
  }
}

// --- CRUD ---

export async function createNotification(params: {
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  actionUrl?: string;
  sendTelegram?: boolean;
  sendEmail?: boolean;
}): Promise<AdminNotification | null> {
  const supabase = await createClient();

  // Check for duplicate (same type + entity within last hour)
  if (params.entityId) {
    const { data: existing } = await supabase
      .from("admin_notifications")
      .select("id")
      .eq("type", params.type)
      .eq("entity_id", params.entityId)
      .gte("created_at", new Date(Date.now() - 3600000).toISOString())
      .limit(1);
    if (existing && existing.length > 0) return null;
  }

  let telegramSent = false;
  let emailSent = false;

  // Send Telegram if requested
  if (params.sendTelegram !== false) {
    const emoji =
      params.severity === "urgent"
        ? "\u{1F6A8}"
        : params.severity === "warning"
          ? "\u{26A0}\u{FE0F}"
          : "\u{1F4CB}";
    const tgText = [
      `${emoji} <b>${params.title}</b>`,
      "",
      params.message,
      "",
      params.actionUrl
        ? `\u{1F449} <a href="${SITE_URL}${params.actionUrl}">Отвори в CRM</a>`
        : "",
    ]
      .filter(Boolean)
      .join("\n");
    telegramSent = await sendAdminTelegram(tgText);
  }

  // Send Email if requested (warning + urgent)
  if (
    params.sendEmail ||
    params.severity === "warning" ||
    params.severity === "urgent"
  ) {
    const accentColor =
      params.severity === "urgent"
        ? "#ef4444"
        : params.severity === "warning"
          ? "#f59e0b"
          : "#39ff14";
    const html = buildNotificationEmailHtml(
      params.title,
      params.message,
      accentColor,
      params.actionUrl
    );
    emailSent = await sendAdminEmail(
      `[Level 8 CRM] ${params.title}`,
      html
    );
  }

  const { data, error } = await supabase
    .from("admin_notifications")
    .insert({
      type: params.type,
      severity: params.severity,
      title: params.title,
      message: params.message,
      entity_type: params.entityType || null,
      entity_id: params.entityId || null,
      action_url: params.actionUrl || null,
      telegram_sent: telegramSent,
      email_sent: emailSent,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create notification:", error.message);
    return null;
  }
  return data as unknown as AdminNotification;
}

export async function getUnreadNotifications(
  limit = 20
): Promise<AdminNotification[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("admin_notifications")
    .select("*")
    .eq("is_read", false)
    .eq("is_dismissed", false)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as unknown as AdminNotification[]) || [];
}

export async function getUnreadCount(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("admin_notifications")
    .select("*", { count: "exact", head: true })
    .eq("is_read", false)
    .eq("is_dismissed", false);
  return count || 0;
}

export async function markNotificationRead(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("admin_notifications")
    .update({ is_read: true })
    .eq("id", id);
  revalidatePath("/admin");
}

export async function markAllNotificationsRead(): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("admin_notifications")
    .update({ is_read: true })
    .eq("is_read", false);
  revalidatePath("/admin");
}

export async function dismissNotification(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("admin_notifications")
    .update({ is_dismissed: true })
    .eq("id", id);
  revalidatePath("/admin");
}

// --- Billing Reminder Helpers ---

export async function sendBillingReminder(params: {
  serviceId: string;
  clientName: string;
  serviceName: string;
  domain: string | null;
  amount: number;
  currency: string;
  dueDate: string;
  daysUntil: number;
}): Promise<void> {
  const severity: NotificationSeverity =
    params.daysUntil <= 0
      ? "urgent"
      : params.daysUntil <= 3
        ? "warning"
        : "info";

  const daysText =
    params.daysUntil <= 0
      ? "ДНЕС"
      : params.daysUntil === 1
        ? "утре"
        : `след ${params.daysUntil} дни`;

  const formattedAmount = new Intl.NumberFormat("bg-BG", {
    minimumFractionDigits: 2,
  }).format(params.amount);

  const message = [
    `\u{1F3E2} ${params.clientName}`,
    params.domain ? `\u{1F310} ${params.domain}` : null,
    `\u{1F4B0} ${params.serviceName} \u2014 ${formattedAmount} ${params.currency}`,
    `\u{1F4C5} \u041F\u0430\u0434\u0435\u0436: ${params.dueDate}`,
    `\u{23F3} ${daysText}`,
  ]
    .filter(Boolean)
    .join("\n");

  const title =
    params.daysUntil <= 0
      ? `\u0424\u0430\u043A\u0442\u0443\u0440\u0430 \u0437\u0430 ${params.clientName} \u0438\u0437\u0442\u0438\u0447\u0430 \u0414\u041D\u0415\u0421!`
      : `\u0424\u0430\u043A\u0442\u0443\u0440\u0430 \u0437\u0430 ${params.clientName} \u2014 ${daysText}`;

  await createNotification({
    type: "billing_upcoming",
    severity,
    title,
    message,
    entityType: "service",
    entityId: params.serviceId,
    actionUrl: "/admin/crm/invoices/new",
    sendTelegram: true,
    sendEmail: severity !== "info",
  });
}

// --- Email HTML builder ---

function buildNotificationEmailHtml(
  title: string,
  message: string,
  accentColor: string,
  actionUrl?: string
): string {
  const escapedTitle = title.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const escapedMessage = message
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/\n/g, "<br>");

  return `<!DOCTYPE html>
<html lang="bg">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td style="padding:24px 32px;border-bottom:1px solid rgba(57,255,20,0.15);">
          <span style="font-size:20px;font-weight:700;color:#39ff14;letter-spacing:2px;">LEVEL 8</span>
          <span style="font-size:10px;color:rgba(57,255,20,0.4);margin-left:8px;letter-spacing:3px;text-transform:uppercase;">CRM</span>
        </td></tr>
        <tr><td style="padding:32px;background-color:#141414;border:1px solid #222;">
          <div style="border-left:4px solid ${accentColor};padding-left:16px;margin-bottom:24px;">
            <h1 style="margin:0;font-size:18px;font-weight:700;color:#fafafa;">${escapedTitle}</h1>
          </div>
          <div style="font-size:14px;line-height:1.7;color:#a1a1aa;">
            ${escapedMessage}
          </div>
          ${actionUrl ? `<div style="margin-top:24px;"><a href="${SITE_URL}${actionUrl}" style="display:inline-block;padding:10px 24px;background-color:${accentColor};color:#000;font-weight:600;font-size:13px;text-decoration:none;border-radius:8px;">Отвори в CRM</a></div>` : ""}
        </td></tr>
        <tr><td style="padding:16px 32px;text-align:center;">
          <span style="font-size:11px;color:rgba(255,255,255,0.2);">LEVEL 8 EOOD \u2022 \u0433\u0440. \u0412\u0430\u0440\u043D\u0430 \u2022 EIK 208697165</span>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
