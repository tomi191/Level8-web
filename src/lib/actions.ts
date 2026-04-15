"use server";

import { Resend } from "resend";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { contactFormSchema, leadMagnetSchema, chatContactSchema } from "./validations";
import type { FormState } from "@/types";
import type { Database } from "@/types/database";

const resend = new Resend(process.env.RESEND_API_KEY);
const TO_EMAIL = "contact@level8.bg";
const FROM_EMAIL = "LEVEL 8 <noreply@level8.bg>";

// Lazy-init Supabase service role client for server-side inserts
let _supabase: SupabaseClient<Database> | null = null;
function getSupabase() {
  if (!_supabase && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    _supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  return _supabase;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

interface AttributionMeta {
  session_id?: string | null;
  source_page?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  referrer?: string | null;
  user_agent?: string | null;
}

function extractAttribution(formData: FormData): AttributionMeta {
  const get = (k: string) => {
    const v = formData.get(k);
    return typeof v === "string" && v.length > 0 ? v.slice(0, 500) : null;
  };
  return {
    session_id: get("_session_id"),
    source_page: get("_source_page"),
    utm_source: get("_utm_source"),
    utm_medium: get("_utm_medium"),
    utm_campaign: get("_utm_campaign"),
    utm_content: get("_utm_content"),
    utm_term: get("_utm_term"),
    referrer: get("_referrer"),
    user_agent: get("_user_agent"),
  };
}

/**
 * Mark the visitor_session as having a submission (for linking lead → session).
 */
async function markSessionSubmitted(sessionId: string | null | undefined) {
  if (!sessionId) return;
  try {
    await getSupabase()
      ?.from("visitor_sessions")
      .update({ has_submission: true })
      .eq("session_id", sessionId);
  } catch {
    // non-blocking
  }
}

function renderAttributionHtml(m: AttributionMeta): string {
  const rows: string[] = [];
  if (m.source_page) rows.push(`<li><strong>Страница:</strong> ${escapeHtml(m.source_page)}</li>`);
  if (m.utm_source) rows.push(`<li><strong>UTM Source:</strong> ${escapeHtml(m.utm_source)}</li>`);
  if (m.utm_medium) rows.push(`<li><strong>UTM Medium:</strong> ${escapeHtml(m.utm_medium)}</li>`);
  if (m.utm_campaign) rows.push(`<li><strong>UTM Campaign:</strong> ${escapeHtml(m.utm_campaign)}</li>`);
  if (m.referrer) rows.push(`<li><strong>Referrer:</strong> ${escapeHtml(m.referrer)}</li>`);
  if (rows.length === 0) return "";
  return `<hr/><h3>Контекст</h3><ul>${rows.join("")}</ul>`;
}

export async function submitContactForm(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const raw = {
    name: formData.get("name"),
    phone: formData.get("phone"),
    website: formData.get("website"),
    message: formData.get("message"),
    consent: formData.get("consent") === "on",
  };

  const result = contactFormSchema.safeParse(raw);

  if (!result.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const path = String(issue.path[0]);
      if (!fieldErrors[path]) fieldErrors[path] = [];
      fieldErrors[path].push(issue.message);
    }
    return {
      success: false,
      message: "Моля, коригирайте грешките във формата.",
      errors: fieldErrors,
    };
  }

  const { name, phone, website, message } = result.data;
  const meta = extractAttribution(formData);

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: TO_EMAIL,
    subject: `Ново запитване от ${escapeHtml(name)}`,
    html: `
      <h2>Ново запитване от level8.bg</h2>
      <p><strong>Име:</strong> ${escapeHtml(name)}</p>
      <p><strong>Телефон:</strong> ${escapeHtml(phone)}</p>
      ${website ? `<p><strong>Уебсайт:</strong> ${escapeHtml(website)}</p>` : ""}
      <p><strong>Съобщение:</strong></p>
      <p>${escapeHtml(message)}</p>
      ${renderAttributionHtml(meta)}
    `,
  });

  if (error) {
    console.error("Resend error:", error);
    return {
      success: false,
      message: "Възникна грешка при изпращането. Моля, опитайте отново.",
    };
  }

  try {
    await getSupabase()?.from("submissions").insert({
      type: "contact",
      name,
      phone,
      website: website || null,
      message,
      ...meta,
    });
    await markSessionSubmitted(meta.session_id);
  } catch (e) {
    console.error("Supabase insert error:", e);
  }

  return {
    success: true,
    message: "Благодарим! Ще се свържем с вас до 24 часа.",
  };
}

export async function submitLeadMagnet(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const raw = { email: formData.get("email") };
  const result = leadMagnetSchema.safeParse(raw);

  if (!result.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const path = String(issue.path[0]);
      if (!fieldErrors[path]) fieldErrors[path] = [];
      fieldErrors[path].push(issue.message);
    }
    return {
      success: false,
      message: "Моля, въведете валиден имейл.",
      errors: fieldErrors,
    };
  }

  const { email } = result.data;
  const meta = extractAttribution(formData);

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: TO_EMAIL,
    subject: "Нова заявка за безплатен одит",
    html: `
      <h2>Заявка за безплатен дигитален одит</h2>
      <p><strong>Имейл:</strong> ${escapeHtml(email)}</p>
      ${renderAttributionHtml(meta)}
    `,
  });

  if (error) {
    console.error("Resend error:", error);
    return {
      success: false,
      message: "Възникна грешка. Моля, опитайте отново.",
    };
  }

  try {
    await getSupabase()?.from("submissions").insert({
      type: "lead",
      email,
      ...meta,
    });
    await markSessionSubmitted(meta.session_id);
  } catch (e) {
    console.error("Supabase insert error:", e);
  }

  return {
    success: true,
    message: "Благодарим! Ще получите одита до 12 часа.",
  };
}

export interface ChatHistoryMsg {
  role: "user" | "bot";
  text: string;
  timestamp?: string;
}

export async function submitChatContact(data: {
  name: string;
  phone: string;
  email?: string | null;
  consent: boolean;
  chat_history?: ChatHistoryMsg[];
  attribution?: AttributionMeta;
}): Promise<FormState> {
  const result = chatContactSchema.safeParse({
    name: data.name,
    phone: data.phone,
    consent: data.consent,
  });

  if (!result.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const path = String(issue.path[0]);
      if (!fieldErrors[path]) fieldErrors[path] = [];
      fieldErrors[path].push(issue.message);
    }
    return {
      success: false,
      message: "Моля, попълнете всички полета коректно.",
      errors: fieldErrors,
    };
  }

  const { name, phone } = result.data;
  const email = (data.email || "").trim() || null;
  const chatHistory = Array.isArray(data.chat_history) ? data.chat_history.slice(-50) : null;
  const meta = data.attribution || {};

  const chatHistoryHtml = chatHistory && chatHistory.length > 0
    ? `<h3>Разговор</h3><ol>${chatHistory.map((m) => `<li><strong>${m.role === "user" ? "Потребител" : "Бот"}:</strong> ${escapeHtml(m.text)}</li>`).join("")}</ol>`
    : "";

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: TO_EMAIL,
    subject: `Чатбот контакт: ${escapeHtml(name)}`,
    html: `
      <h2>Нов контакт от чатбота</h2>
      <p><strong>Име:</strong> ${escapeHtml(name)}</p>
      <p><strong>Телефон:</strong> ${escapeHtml(phone)}</p>
      ${email ? `<p><strong>Имейл:</strong> ${escapeHtml(email)}</p>` : ""}
      ${chatHistoryHtml}
      ${renderAttributionHtml(meta)}
    `,
  });

  if (error) {
    console.error("Resend error:", error);
    return {
      success: false,
      message: "Възникна грешка. Моля, опитайте отново.",
    };
  }

  try {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.from("submissions").insert({
        type: "chat",
        name,
        phone,
        email,
        message: chatHistory && chatHistory.length > 0
          ? chatHistory.map((m) => `${m.role === "user" ? "👤" : "🤖"} ${m.text}`).join("\n")
          : null,
        chat_history: chatHistory as unknown as never,
        ...meta,
      });
      await markSessionSubmitted(meta.session_id);
    }
  } catch {
    // Silent fail — email already sent
  }

  return {
    success: true,
    message: "Благодарим! Ще се свържем с вас скоро.",
  };
}
