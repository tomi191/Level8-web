"use server";

import { requireAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clientSchema, websiteSchema, invoiceSchema, clientServiceSchema } from "@/lib/crm-schemas";
import type { Json } from "@/types/database";
import type {
  CrmClient,
  CrmWebsite,
  CrmInvoice,
  CrmWebsiteWithClient,
  CrmInvoiceWithClient,
  CrmDashboardStats,
  CrmActivityLog,
  CrmCloudflareCache,
  CrmClientService,
  CrmClientServiceWithRelations,
  CrmClientContact,
  CrmReminder,
  PlatformDetectionResult,
  ExpiringDomain,
  EntityType,
  ActivityAction,
  BillingPipelineData,
  BillingPipelineItem,
} from "@/types/crm";

async function requireCrmAdmin() {
  const { supabase, user } = await requireAdmin();
  return { db: supabase, user };
}

// ============================================================
// Activity Logging
// ============================================================

async function logCrmActivity(
  db: Awaited<ReturnType<typeof requireCrmAdmin>>["db"],
  params: {
    entity_type: EntityType;
    entity_id: string;
    action: ActivityAction;
    actor: string;
    description?: string;
    changes?: Record<string, { old: unknown; new: unknown }>;
  }
) {
  await db.from("crm_activity_log").insert({
    entity_type: params.entity_type,
    entity_id: params.entity_id,
    action: params.action,
    actor: params.actor,
    description: params.description ?? null,
    changes: (params.changes as Json) ?? null,
  });
}

// ============================================================
// Helper: clean empty strings to null
// ============================================================
function cleanEmpty<T extends Record<string, unknown>>(obj: T): T {
  const cleaned = { ...obj };
  for (const key of Object.keys(cleaned)) {
    if (cleaned[key] === "") {
      (cleaned as Record<string, unknown>)[key] = null;
    }
  }
  return cleaned;
}

// ============================================================
// Clients
// ============================================================

export async function getCrmClients(opts?: {
  status?: string;
  search?: string;
  includeArchived?: boolean;
}): Promise<CrmClient[]> {
  const { db } = await requireCrmAdmin();
  let query = db
    .from("crm_clients")
    .select("*")
    .order("company_name", { ascending: true });

  if (!opts?.includeArchived) {
    query = query.eq("is_archived", false);
  }
  if (opts?.status) {
    query = query.eq("status", opts.status);
  }
  if (opts?.search) {
    query = query.ilike("company_name", `%${opts.search}%`);
  }

  const { data } = await query;
  return (data ?? []) as unknown as CrmClient[];
}

export async function getCrmClient(id: string): Promise<CrmClient | null> {
  const { db } = await requireCrmAdmin();
  const { data } = await db
    .from("crm_clients")
    .select("*")
    .eq("id", id)
    .single();
  return data as unknown as CrmClient | null;
}

export async function createCrmClient(formData: FormData) {
  const { db, user } = await requireCrmAdmin();

  const raw = Object.fromEntries(formData.entries());
  const tagsStr = formData.get("tags") as string;
  const contactsStr = formData.get("contacts") as string;
  const parsed = clientSchema.parse({
    ...raw,
    tags: tagsStr ? tagsStr.split(",").map((t) => t.trim()).filter(Boolean) : [],
    is_internal: formData.get("is_internal") === "true",
  });

  // Parse contacts JSON from form
  let contacts: CrmClientContact[] = [];
  if (contactsStr) {
    try {
      contacts = JSON.parse(contactsStr) as CrmClientContact[];
    } catch {
      // Ignore malformed JSON
    }
  }

  const cleaned = cleanEmpty(parsed);
  const { data, error } = await db
    .from("crm_clients")
    .insert({ ...cleaned, contacts: contacts as unknown as Json })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await logCrmActivity(db, {
    entity_type: "client",
    entity_id: data.id,
    action: "created",
    actor: user.email || "admin",
    description: `Създаден клиент: ${parsed.company_name}`,
  });

  revalidatePath("/admin/crm");
  revalidatePath("/admin/crm/clients");
  return { success: true, id: data.id };
}

export async function updateCrmClient(id: string, formData: FormData) {
  const { db, user } = await requireCrmAdmin();

  const raw = Object.fromEntries(formData.entries());
  const tagsStr = formData.get("tags") as string;
  const contactsStr = formData.get("contacts") as string;
  const parsed = clientSchema.parse({
    ...raw,
    tags: tagsStr ? tagsStr.split(",").map((t) => t.trim()).filter(Boolean) : [],
    is_internal: formData.get("is_internal") === "true",
  });

  // Parse contacts JSON from form
  let contacts: CrmClientContact[] = [];
  if (contactsStr) {
    try {
      contacts = JSON.parse(contactsStr) as CrmClientContact[];
    } catch {
      // Ignore malformed JSON
    }
  }

  const cleaned = cleanEmpty(parsed);
  const { error } = await db
    .from("crm_clients")
    .update({ ...cleaned, contacts: contacts as unknown as Json })
    .eq("id", id);

  if (error) throw new Error(error.message);

  await logCrmActivity(db, {
    entity_type: "client",
    entity_id: id,
    action: "updated",
    actor: user.email || "admin",
    description: `Обновен клиент: ${parsed.company_name}`,
  });

  revalidatePath("/admin/crm");
  revalidatePath("/admin/crm/clients");
  revalidatePath(`/admin/crm/clients/${id}`);
  return { success: true };
}

export async function archiveCrmClient(id: string) {
  const { db, user } = await requireCrmAdmin();
  const { error } = await db
    .from("crm_clients")
    .update({ is_archived: true })
    .eq("id", id);
  if (error) throw new Error(error.message);

  await logCrmActivity(db, {
    entity_type: "client",
    entity_id: id,
    action: "archived",
    actor: user.email || "admin",
  });

  revalidatePath("/admin/crm");
  revalidatePath("/admin/crm/clients");
  redirect("/admin/crm/clients");
}

export async function deleteCrmClient(id: string) {
  const { db, user } = await requireCrmAdmin();
  await logCrmActivity(db, {
    entity_type: "client",
    entity_id: id,
    action: "deleted",
    actor: user.email || "admin",
  });
  await db.from("crm_clients").delete().eq("id", id);
  revalidatePath("/admin/crm");
  revalidatePath("/admin/crm/clients");
  redirect("/admin/crm/clients");
}

// ============================================================
// Websites
// ============================================================

export async function getCrmWebsites(opts?: {
  clientId?: string;
  status?: string;
  search?: string;
}): Promise<CrmWebsiteWithClient[]> {
  const { db } = await requireCrmAdmin();
  let query = db
    .from("crm_websites")
    .select("*, crm_clients(id, company_name, email, phone)")
    .eq("is_archived", false)
    .order("domain", { ascending: true });

  if (opts?.clientId) {
    query = query.eq("client_id", opts.clientId);
  }
  if (opts?.status) {
    query = query.eq("status", opts.status);
  }
  if (opts?.search) {
    query = query.ilike("domain", `%${opts.search}%`);
  }

  const { data } = await query;
  return (data ?? []) as unknown as CrmWebsiteWithClient[];
}

export async function getCrmWebsite(id: string): Promise<CrmWebsiteWithClient | null> {
  const { db } = await requireCrmAdmin();
  const { data } = await db
    .from("crm_websites")
    .select("*, crm_clients(id, company_name, email, phone)")
    .eq("id", id)
    .single();
  return data as unknown as CrmWebsiteWithClient | null;
}

export async function createCrmWebsite(formData: FormData) {
  const { db, user } = await requireCrmAdmin();

  const raw = Object.fromEntries(formData.entries());
  const tagsStr = formData.get("tags") as string;
  const parsed = websiteSchema.parse({
    ...raw,
    domain_auto_renew: raw.domain_auto_renew === "true",
    tags: tagsStr ? tagsStr.split(",").map((t) => t.trim()).filter(Boolean) : [],
  });

  const cleaned = cleanEmpty(parsed);
  const { data, error } = await db
    .from("crm_websites")
    .insert(cleaned)
    .select()
    .single();

  if (error) throw new Error(error.message);

  await logCrmActivity(db, {
    entity_type: "website",
    entity_id: data.id,
    action: "created",
    actor: user.email || "admin",
    description: `Добавен сайт: ${parsed.domain}`,
  });

  revalidatePath("/admin/crm");
  revalidatePath("/admin/crm/websites");
  revalidatePath(`/admin/crm/clients/${parsed.client_id}`);
  return { success: true, id: data.id };
}

export async function updateCrmWebsite(id: string, formData: FormData) {
  const { db, user } = await requireCrmAdmin();

  const raw = Object.fromEntries(formData.entries());
  const tagsStr = formData.get("tags") as string;
  const parsed = websiteSchema.parse({
    ...raw,
    domain_auto_renew: raw.domain_auto_renew === "true",
    tags: tagsStr ? tagsStr.split(",").map((t) => t.trim()).filter(Boolean) : [],
  });

  const cleaned = cleanEmpty(parsed);
  const { error } = await db
    .from("crm_websites")
    .update(cleaned)
    .eq("id", id);

  if (error) throw new Error(error.message);

  await logCrmActivity(db, {
    entity_type: "website",
    entity_id: id,
    action: "updated",
    actor: user.email || "admin",
    description: `Обновен сайт: ${parsed.domain}`,
  });

  revalidatePath("/admin/crm");
  revalidatePath("/admin/crm/websites");
  revalidatePath(`/admin/crm/websites/${id}`);
  return { success: true };
}

export async function archiveCrmWebsite(id: string) {
  const { db, user } = await requireCrmAdmin();
  await db.from("crm_websites").update({ is_archived: true }).eq("id", id);

  await logCrmActivity(db, {
    entity_type: "website",
    entity_id: id,
    action: "archived",
    actor: user.email || "admin",
  });

  revalidatePath("/admin/crm");
  revalidatePath("/admin/crm/websites");
}

// ============================================================
// Invoices
// ============================================================

export async function getCrmInvoices(opts?: {
  clientId?: string;
  status?: string;
}): Promise<CrmInvoiceWithClient[]> {
  const { db } = await requireCrmAdmin();
  let query = db
    .from("crm_invoices")
    .select("*, crm_clients(id, company_name, email)")
    .eq("is_archived", false)
    .order("created_at", { ascending: false });

  if (opts?.clientId) {
    query = query.eq("client_id", opts.clientId);
  }
  if (opts?.status) {
    query = query.eq("status", opts.status);
  }

  const { data } = await query;
  return (data ?? []) as unknown as CrmInvoiceWithClient[];
}

export async function getCrmInvoice(id: string): Promise<CrmInvoiceWithClient | null> {
  const { db } = await requireCrmAdmin();
  const { data } = await db
    .from("crm_invoices")
    .select("*, crm_clients(id, company_name, email)")
    .eq("id", id)
    .single();
  return data as unknown as CrmInvoiceWithClient | null;
}

export async function getNextInvoiceNumber(): Promise<string> {
  const { db } = await requireCrmAdmin();
  const { data } = await db.rpc("crm_next_invoice_number");
  return (data as string) || "L8-2026-0001";
}

export async function createCrmInvoice(formData: FormData) {
  const { db, user } = await requireCrmAdmin();

  const raw = Object.fromEntries(formData.entries());
  const itemsStr = formData.get("items_json") as string;
  const parsed = invoiceSchema.parse({
    ...raw,
    amount: parseFloat(raw.amount as string),
    vat_amount: parseFloat((raw.vat_amount as string) || "0"),
    total_amount: parseFloat(raw.total_amount as string),
    is_recurring: raw.is_recurring === "true",
    items: itemsStr ? JSON.parse(itemsStr) : [],
  });

  const invoiceNumber = await getNextInvoiceNumber();
  const cleaned = cleanEmpty(parsed);

  const { data, error } = await db
    .from("crm_invoices")
    .insert({
      ...cleaned,
      invoice_number: invoiceNumber,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await logCrmActivity(db, {
    entity_type: "invoice",
    entity_id: data.id,
    action: "created",
    actor: user.email || "admin",
    description: `Създадена фактура ${invoiceNumber}`,
  });

  revalidatePath("/admin/crm");
  revalidatePath("/admin/crm/invoices");
  return { success: true, id: data.id, invoice_number: invoiceNumber };
}

export async function updateCrmInvoice(id: string, formData: FormData) {
  const { db, user } = await requireCrmAdmin();

  const raw = Object.fromEntries(formData.entries());
  const itemsStr = formData.get("items_json") as string;
  const parsed = invoiceSchema.parse({
    ...raw,
    amount: parseFloat(raw.amount as string),
    vat_amount: parseFloat((raw.vat_amount as string) || "0"),
    total_amount: parseFloat(raw.total_amount as string),
    is_recurring: raw.is_recurring === "true",
    items: itemsStr ? JSON.parse(itemsStr) : [],
  });

  const cleaned = cleanEmpty(parsed);
  const { error } = await db
    .from("crm_invoices")
    .update(cleaned)
    .eq("id", id);

  if (error) throw new Error(error.message);

  await logCrmActivity(db, {
    entity_type: "invoice",
    entity_id: id,
    action: "updated",
    actor: user.email || "admin",
  });

  revalidatePath("/admin/crm");
  revalidatePath("/admin/crm/invoices");
  revalidatePath(`/admin/crm/invoices/${id}`);
  return { success: true };
}

export async function markInvoicePaid(id: string) {
  const { db, user } = await requireCrmAdmin();
  const { error } = await db
    .from("crm_invoices")
    .update({
      status: "paid",
      paid_date: new Date().toISOString().split("T")[0],
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  await logCrmActivity(db, {
    entity_type: "invoice",
    entity_id: id,
    action: "payment_received",
    actor: user.email || "admin",
  });

  revalidatePath("/admin/crm");
  revalidatePath("/admin/crm/invoices");
  revalidatePath(`/admin/crm/invoices/${id}`);
}

export async function markInvoiceOverdue(id: string) {
  const { db } = await requireCrmAdmin();
  await db.from("crm_invoices").update({ status: "overdue" }).eq("id", id);
  revalidatePath("/admin/crm");
  revalidatePath("/admin/crm/invoices");
}

export async function archiveCrmInvoice(id: string) {
  const { db, user } = await requireCrmAdmin();
  await db.from("crm_invoices").update({ is_archived: true }).eq("id", id);

  await logCrmActivity(db, {
    entity_type: "invoice",
    entity_id: id,
    action: "archived",
    actor: user.email || "admin",
  });

  revalidatePath("/admin/crm");
  revalidatePath("/admin/crm/invoices");
}

// ============================================================
// Send Invoice Email
// ============================================================

export async function sendInvoiceEmail(invoiceId: string): Promise<void> {
  const { db, user } = await requireCrmAdmin();

  // Fetch invoice with full client data (including billing_email, eik, address, city)
  const { data: invoice } = await db
    .from("crm_invoices")
    .select("*, crm_clients(id, company_name, email, billing_email, eik, address, city, payment_method)")
    .eq("id", invoiceId)
    .single();

  if (!invoice) throw new Error("Фактурата не е намерена");

  const client = invoice.crm_clients as unknown as {
    id: string;
    company_name: string;
    email: string | null;
    billing_email: string | null;
    eik: string | null;
    address: string | null;
    city: string | null;
    payment_method: string | null;
  };

  const recipientEmail = client.billing_email || client.email;
  if (!recipientEmail) throw new Error("Клиентът няма имейл адрес");

  // Get PDF from Storage (uploaded from MicroInvest)
  if (!invoice.pdf_url) throw new Error("Няма качен PDF. Качете PDF от MicroInvest преди да изпратите.");

  const { data: pdfData, error: downloadError } = await db.storage
    .from("crm-invoices")
    .download(invoice.pdf_url);

  if (downloadError || !pdfData) throw new Error(`Грешка при изтегляне на PDF: ${downloadError?.message}`);

  const pdfArrayBuffer = await pdfData.arrayBuffer();
  const pdfBase64 = Buffer.from(pdfArrayBuffer).toString("base64");

  // Generate email HTML
  const { generateInvoiceEmailHtml } = await import("@/lib/crm-emails");
  const html = generateInvoiceEmailHtml({
    invoiceNumber: invoice.invoice_number,
    issueDate: invoice.issue_date,
    dueDate: invoice.due_date,
    amount: invoice.amount,
    vatAmount: invoice.vat_amount,
    totalAmount: invoice.total_amount,
    clientName: client.company_name,
    description: invoice.description,
  });

  // Send via Resend
  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { error: sendError } = await resend.emails.send({
    from: "LEVEL 8 <noreply@level8.bg>",
    to: recipientEmail,
    subject: `Фактура ${invoice.invoice_number} от ЛЕВЕЛ 8`,
    html,
    attachments: [
      {
        filename: `${invoice.invoice_number}.pdf`,
        content: pdfBase64,
      },
    ],
  });

  if (sendError) throw new Error(`Грешка при изпращане: ${sendError.message}`);

  // Update notification_sent flag
  await db
    .from("crm_invoices")
    .update({
      notification_sent: true,
      notification_sent_at: new Date().toISOString(),
    })
    .eq("id", invoiceId);

  // Update status to 'sent' if currently draft or pending
  if (invoice.status === 'draft' || invoice.status === 'pending') {
    await db.from("crm_invoices").update({ status: "sent" }).eq("id", invoiceId);
  }

  // Log activity
  await logCrmActivity(db, {
    entity_type: "invoice",
    entity_id: invoiceId,
    action: "updated",
    actor: user.email || "admin",
    description: `Фактура изпратена на ${recipientEmail}`,
  });

  revalidatePath("/admin/crm/invoices");
  revalidatePath(`/admin/crm/invoices/${invoiceId}`);
}

export async function uploadInvoicePdf(invoiceId: string, formData: FormData) {
  const { db, user } = await requireCrmAdmin();

  const file = formData.get("pdf") as File;
  if (!file || file.size === 0) throw new Error("Не е избран файл");
  if (file.type !== "application/pdf") throw new Error("Файлът трябва да е PDF");
  if (file.size > 10 * 1024 * 1024) throw new Error("Файлът е твърде голям (макс. 10MB)");

  // Fetch invoice to get invoice_number for filename
  const { data: invoice } = await db
    .from("crm_invoices")
    .select("invoice_number")
    .eq("id", invoiceId)
    .single();

  if (!invoice) throw new Error("Фактурата не е намерена");

  const storagePath = `${invoiceId}/${invoice.invoice_number}.pdf`;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error: uploadError } = await db.storage
    .from("crm-invoices")
    .upload(storagePath, buffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadError) throw new Error(`Грешка при качване: ${uploadError.message}`);

  // Save path to invoice record
  await db
    .from("crm_invoices")
    .update({ pdf_url: storagePath })
    .eq("id", invoiceId);

  await logCrmActivity(db, {
    entity_type: "invoice",
    entity_id: invoiceId,
    action: "updated",
    actor: user.email || "admin",
    description: `PDF качен: ${invoice.invoice_number}.pdf`,
  });

  revalidatePath("/admin/crm/invoices");
  revalidatePath(`/admin/crm/invoices/${invoiceId}`);
}

export async function deleteInvoicePdf(invoiceId: string) {
  const { db, user } = await requireCrmAdmin();

  const { data: invoice } = await db
    .from("crm_invoices")
    .select("pdf_url, invoice_number")
    .eq("id", invoiceId)
    .single();

  if (!invoice?.pdf_url) throw new Error("Няма качен PDF");

  await db.storage.from("crm-invoices").remove([invoice.pdf_url]);

  await db
    .from("crm_invoices")
    .update({ pdf_url: null })
    .eq("id", invoiceId);

  await logCrmActivity(db, {
    entity_type: "invoice",
    entity_id: invoiceId,
    action: "updated",
    actor: user.email || "admin",
    description: `PDF изтрит: ${invoice.invoice_number}.pdf`,
  });

  revalidatePath("/admin/crm/invoices");
  revalidatePath(`/admin/crm/invoices/${invoiceId}`);
}

// ============================================================
// Services
// ============================================================

export async function getClientServices(clientId: string): Promise<CrmClientService[]> {
  const { db } = await requireCrmAdmin();
  const { data } = await db
    .from("crm_client_services")
    .select("*")
    .eq("client_id", clientId)
    .eq("is_archived", false)
    .order("created_at", { ascending: false });
  return (data ?? []) as unknown as CrmClientService[];
}

export async function getCrmServices(opts?: {
  clientId?: string;
  status?: string;
  search?: string;
}): Promise<CrmClientServiceWithRelations[]> {
  const { db } = await requireCrmAdmin();
  let query = db
    .from("crm_client_services")
    .select("*, crm_clients(id, company_name), crm_websites(id, domain)")
    .eq("is_archived", false)
    .order("created_at", { ascending: false });

  if (opts?.clientId) {
    query = query.eq("client_id", opts.clientId);
  }
  if (opts?.status) {
    query = query.eq("status", opts.status);
  }
  if (opts?.search) {
    query = query.ilike("name", `%${opts.search}%`);
  }

  const { data } = await query;
  return (data ?? []) as unknown as CrmClientServiceWithRelations[];
}

export async function getCrmService(id: string): Promise<CrmClientServiceWithRelations | null> {
  const { db } = await requireCrmAdmin();
  const { data } = await db
    .from("crm_client_services")
    .select("*, crm_clients(id, company_name), crm_websites(id, domain)")
    .eq("id", id)
    .single();
  return data as unknown as CrmClientServiceWithRelations | null;
}

export async function createCrmService(formData: FormData) {
  const { db, user } = await requireCrmAdmin();

  const raw = Object.fromEntries(formData.entries());
  const parsed = clientServiceSchema.parse({
    ...raw,
    price: parseFloat(raw.price as string),
    auto_renew: raw.auto_renew === "true",
  });

  const cleaned = cleanEmpty(parsed);
  const { data, error } = await db
    .from("crm_client_services")
    .insert(cleaned)
    .select()
    .single();

  if (error) throw new Error(error.message);

  await logCrmActivity(db, {
    entity_type: "service",
    entity_id: data.id,
    action: "created",
    actor: user.email || "admin",
    description: `\u0421\u044A\u0437\u0434\u0430\u0434\u0435\u043D\u0430 \u0443\u0441\u043B\u0443\u0433\u0430: ${parsed.name}`,
  });

  revalidatePath("/admin/crm");
  revalidatePath("/admin/crm/services");
  revalidatePath(`/admin/crm/clients/${parsed.client_id}`);
  return { success: true, id: data.id };
}

export async function updateCrmService(id: string, formData: FormData) {
  const { db, user } = await requireCrmAdmin();

  const raw = Object.fromEntries(formData.entries());
  const parsed = clientServiceSchema.parse({
    ...raw,
    price: parseFloat(raw.price as string),
    auto_renew: raw.auto_renew === "true",
  });

  const cleaned = cleanEmpty(parsed);
  const { error } = await db
    .from("crm_client_services")
    .update(cleaned)
    .eq("id", id);

  if (error) throw new Error(error.message);

  await logCrmActivity(db, {
    entity_type: "service",
    entity_id: id,
    action: "updated",
    actor: user.email || "admin",
    description: `\u041E\u0431\u043D\u043E\u0432\u0435\u043D\u0430 \u0443\u0441\u043B\u0443\u0433\u0430: ${parsed.name}`,
  });

  revalidatePath("/admin/crm");
  revalidatePath("/admin/crm/services");
  revalidatePath(`/admin/crm/services/${id}`);
  return { success: true };
}

export async function archiveCrmService(id: string) {
  const { db, user } = await requireCrmAdmin();
  await db.from("crm_client_services").update({ is_archived: true }).eq("id", id);

  await logCrmActivity(db, {
    entity_type: "service",
    entity_id: id,
    action: "archived",
    actor: user.email || "admin",
  });

  revalidatePath("/admin/crm");
  revalidatePath("/admin/crm/services");
}

// ============================================================
// Platform Detection
// ============================================================

export async function detectWebsitePlatform(
  websiteId: string
): Promise<PlatformDetectionResult> {
  const { db, user } = await requireCrmAdmin();

  const { data: site } = await db
    .from("crm_websites")
    .select("id, domain, url")
    .eq("id", websiteId)
    .single();

  if (!site) return { platform: null, platform_version: null, signals: [], error: "Site not found" };

  const targetUrl = site.url || `https://${site.domain}`;
  const signals: string[] = [];
  let platform: string | null = null;
  let platform_version: string | null = null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Level8Bot/1.0)" },
      redirect: "follow",
    });
    clearTimeout(timeout);

    const html = await res.text();
    const headers = Object.fromEntries(res.headers.entries());

    // WordPress detection
    if (html.includes("wp-content/") || html.includes("wp-includes/")) {
      signals.push("wp-content/wp-includes in HTML");
      platform = "wordpress";
    }
    if (html.includes("/wp-json/")) {
      signals.push("wp-json API endpoint");
      platform = "wordpress";
    }
    const wpGenMatch = html.match(/content="WordPress\s+([\d.]+)"/i);
    if (wpGenMatch) {
      signals.push(`generator meta: WordPress ${wpGenMatch[1]}`);
      platform = "wordpress";
      platform_version = wpGenMatch[1];
    }

    // Next.js detection
    if (html.includes("/_next/") || html.includes("__NEXT_DATA__")) {
      signals.push("_next paths or __NEXT_DATA__ in HTML");
      platform = "nextjs";
    }
    if (headers["x-nextjs-cache"]) {
      signals.push("x-nextjs-cache header");
      platform = "nextjs";
    }
    if (headers["server"]?.toLowerCase().includes("vercel") || headers["x-vercel-id"]) {
      signals.push("Vercel hosting detected");
      if (!platform) platform = "nextjs";
    }

    // Shopify detection
    if (html.includes("cdn.shopify.com") || html.includes("Shopify.theme")) {
      signals.push("Shopify CDN/theme in HTML");
      platform = "shopify";
    }

    // Custom / unknown
    if (!platform && signals.length === 0) {
      signals.push("No known platform signals detected");
      platform = "custom";
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return {
      platform: null,
      platform_version: null,
      signals: [],
      error: `Fetch failed: ${message}`,
    };
  }

  // Update the website record
  await db
    .from("crm_websites")
    .update({
      platform,
      platform_version,
      platform_detected_at: new Date().toISOString(),
    })
    .eq("id", websiteId);

  await logCrmActivity(db, {
    entity_type: "website",
    entity_id: websiteId,
    action: "updated",
    actor: user.email || "admin",
    description: `Platform detected: ${platform}${platform_version ? ` v${platform_version}` : ""} (${signals.length} signals)`,
  });

  revalidatePath("/admin/crm/websites");
  revalidatePath(`/admin/crm/websites/${websiteId}`);

  return { platform, platform_version, signals };
}

export async function detectAllPlatforms(): Promise<{
  total: number;
  detected: number;
  errors: number;
}> {
  const { db } = await requireCrmAdmin();

  const { data: sites } = await db
    .from("crm_websites")
    .select("id")
    .is("platform", null)
    .eq("is_archived", false);

  if (!sites || sites.length === 0) return { total: 0, detected: 0, errors: 0 };

  let detected = 0;
  let errors = 0;

  for (const site of sites) {
    const result = await detectWebsitePlatform(site.id);
    if (result.error) {
      errors++;
    } else {
      detected++;
    }
    // 500ms delay between requests
    await new Promise((r) => setTimeout(r, 500));
  }

  return { total: sites.length, detected, errors };
}

// ============================================================
// Overdue Check
// ============================================================

export async function runOverdueCheck(): Promise<{ marked: number }> {
  const { db } = await requireCrmAdmin();
  const { data } = await db.rpc("crm_auto_mark_overdue");
  revalidatePath("/admin/crm");
  revalidatePath("/admin/crm/invoices");
  return { marked: (data as number) ?? 0 };
}

// ============================================================
// Dashboard
// ============================================================

export async function getCrmDashboardStats(): Promise<CrmDashboardStats> {
  const { db } = await requireCrmAdmin();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const in60Days = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const [clientsRes, websitesRes, revenueRes, expiringRes, overdueRes, pendingRes, mrrRes] =
    await Promise.all([
      db
        .from("crm_clients")
        .select("id", { count: "exact", head: true })
        .eq("is_archived", false),
      db
        .from("crm_websites")
        .select("id", { count: "exact", head: true })
        .eq("is_archived", false)
        .eq("status", "active"),
      db
        .from("crm_invoices")
        .select("total_amount")
        .eq("status", "paid")
        .gte("paid_date", monthStart.split("T")[0]),
      db
        .from("crm_websites")
        .select("id", { count: "exact", head: true })
        .eq("is_archived", false)
        .or(`domain_expiry_date.lte.${in60Days},ssl_expiry_date.lte.${in60Days}`),
      db
        .from("crm_invoices")
        .select("id", { count: "exact", head: true })
        .eq("status", "overdue")
        .eq("is_archived", false),
      db
        .from("crm_invoices")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending")
        .eq("is_archived", false),
      db
        .from("crm_mrr_summary")
        .select("mrr, active_services")
        .single(),
    ]);

  const revenue = (revenueRes.data ?? []).reduce(
    (sum: number, inv: { total_amount: number }) => sum + (Number(inv.total_amount) || 0),
    0
  );

  return {
    totalClients: clientsRes.count ?? 0,
    activeWebsites: websitesRes.count ?? 0,
    revenueThisMonth: revenue,
    expiringDomains: expiringRes.count ?? 0,
    overdueInvoices: overdueRes.count ?? 0,
    pendingInvoices: pendingRes.count ?? 0,
    mrr: Number(mrrRes.data?.mrr) || 0,
    activeServices: Number(mrrRes.data?.active_services) || 0,
  };
}

export async function getExpiringDomains(): Promise<ExpiringDomain[]> {
  const { db } = await requireCrmAdmin();
  const { data } = await db
    .from("crm_expiring_domains")
    .select("*")
    .limit(20);
  return (data ?? []) as unknown as ExpiringDomain[];
}

export async function getOverdueInvoices(): Promise<CrmInvoiceWithClient[]> {
  const { db } = await requireCrmAdmin();
  const { data } = await db
    .from("crm_invoices")
    .select("*, crm_clients(id, company_name, email)")
    .in("status", ["overdue", "pending"])
    .lt("due_date", new Date().toISOString().split("T")[0])
    .eq("is_archived", false)
    .order("due_date", { ascending: true })
    .limit(10);
  return (data ?? []) as unknown as CrmInvoiceWithClient[];
}

export async function getUpcomingBilling(): Promise<CrmClientServiceWithRelations[]> {
  const { db } = await requireCrmAdmin();
  const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  const { data } = await db
    .from("crm_client_services")
    .select("*, crm_clients(id, company_name), crm_websites(id, domain)")
    .eq("status", "active")
    .eq("is_archived", false)
    .lte("next_billing_date", in30Days)
    .not("next_billing_date", "is", null)
    .order("next_billing_date", { ascending: true })
    .limit(20);
  return (data ?? []) as unknown as CrmClientServiceWithRelations[];
}

export async function getRecentActivity(limit = 10): Promise<CrmActivityLog[]> {
  const { db } = await requireCrmAdmin();
  const { data } = await db
    .from("crm_activity_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as unknown as CrmActivityLog[];
}

// ============================================================
// Client's related data (for detail pages)
// ============================================================

export async function getClientWebsites(clientId: string): Promise<CrmWebsite[]> {
  const { db } = await requireCrmAdmin();
  const { data } = await db
    .from("crm_websites")
    .select("*")
    .eq("client_id", clientId)
    .eq("is_archived", false)
    .order("domain");
  return (data ?? []) as unknown as CrmWebsite[];
}

export async function getClientInvoices(clientId: string): Promise<CrmInvoice[]> {
  const { db } = await requireCrmAdmin();
  const { data } = await db
    .from("crm_invoices")
    .select("*")
    .eq("client_id", clientId)
    .eq("is_archived", false)
    .order("created_at", { ascending: false });
  return (data ?? []) as unknown as CrmInvoice[];
}

export async function getEntityActivity(
  entityType: EntityType,
  entityId: string
): Promise<CrmActivityLog[]> {
  const { db } = await requireCrmAdmin();
  const { data } = await db
    .from("crm_activity_log")
    .select("*")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false })
    .limit(20);
  return (data ?? []) as unknown as CrmActivityLog[];
}

// ============================================================
// Website Cloudflare Cache
// ============================================================

export async function getWebsiteCfCache(websiteId: string): Promise<CrmCloudflareCache[]> {
  const { db } = await requireCrmAdmin();
  const { data } = await db
    .from("crm_cloudflare_cache")
    .select("*")
    .eq("website_id", websiteId);
  return (data ?? []) as unknown as CrmCloudflareCache[];
}

// ============================================================
// Badge Counts (for sidebar)
// ============================================================

export async function getCrmBadgeCounts(): Promise<{
  overdueInvoices: number;
  expiringDomains: number;
}> {
  const { db } = await requireCrmAdmin();

  const [{ count: overdueCount }, { count: expiringCount }] =
    await Promise.all([
      db
        .from("crm_invoices")
        .select("*", { count: "exact", head: true })
        .eq("status", "overdue")
        .eq("is_archived", false),
      db
        .from("crm_expiring_domains")
        .select("*", { count: "exact", head: true }),
    ]);

  return {
    overdueInvoices: overdueCount ?? 0,
    expiringDomains: expiringCount ?? 0,
  };
}

// ============================================================
// Recurring Invoice Generation (server action wrapper)
// ============================================================

export async function generateRecurringInvoices(): Promise<{
  generated: number;
  errors: string[];
}> {
  const { db } = await requireCrmAdmin();

  const { generateRecurringInvoicesCore } = await import("@/lib/crm-billing");
  const result = await generateRecurringInvoicesCore(db);

  revalidatePath("/admin/crm", "layout");
  return result;
}

// ============================================================
// Revenue Per Client
// ============================================================

export async function getRevenueByClient(): Promise<{
  clientId: string;
  companyName: string;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  invoiceCount: number;
  lastPaymentDate: string | null;
}[]> {
  const { db } = await requireCrmAdmin();

  // Get all non-archived invoices with client data
  const { data: invoices } = await db
    .from("crm_invoices")
    .select("client_id, total_amount, status, paid_date, crm_clients(id, company_name)")
    .eq("is_archived", false);

  if (!invoices) return [];

  // Aggregate by client
  const clientMap = new Map<string, {
    companyName: string;
    totalPaid: number;
    totalPending: number;
    totalOverdue: number;
    invoiceCount: number;
    lastPaymentDate: string | null;
  }>();

  for (const inv of invoices) {
    const clientId = inv.client_id;
    const client = inv.crm_clients as unknown as { id: string; company_name: string };
    if (!clientId || !client) continue;

    const existing = clientMap.get(clientId) || {
      companyName: client.company_name,
      totalPaid: 0,
      totalPending: 0,
      totalOverdue: 0,
      invoiceCount: 0,
      lastPaymentDate: null,
    };

    existing.invoiceCount++;
    if (inv.status === "paid") {
      existing.totalPaid += inv.total_amount;
      if (!existing.lastPaymentDate || (inv.paid_date && inv.paid_date > existing.lastPaymentDate)) {
        existing.lastPaymentDate = inv.paid_date;
      }
    } else if (inv.status === "overdue") {
      existing.totalOverdue += inv.total_amount;
    } else {
      existing.totalPending += inv.total_amount;
    }

    clientMap.set(clientId, existing);
  }

  // Sort by total paid descending
  return Array.from(clientMap.entries())
    .map(([clientId, data]) => ({ clientId, ...data }))
    .sort((a, b) => b.totalPaid - a.totalPaid);
}

// ============================================================
// Reminders (CRUD)
// ============================================================

export async function getCrmReminders(
  entityType?: string,
  entityId?: string
): Promise<CrmReminder[]> {
  const { db } = await requireCrmAdmin();
  let query = db
    .from("crm_reminders")
    .select("*")
    .order("due_date", { ascending: true });
  if (entityType) query = query.eq("entity_type", entityType);
  if (entityId) query = query.eq("entity_id", entityId);
  const { data } = await query;
  return (data ?? []) as unknown as CrmReminder[];
}

export async function getUpcomingReminders(): Promise<CrmReminder[]> {
  const { db } = await requireCrmAdmin();
  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data } = await db
    .from("crm_reminders")
    .select("*")
    .eq("status", "pending")
    .lte("remind_at", in7Days)
    .order("remind_at", { ascending: true })
    .limit(20);
  return (data ?? []) as unknown as CrmReminder[];
}

export async function createCrmReminder(formData: FormData) {
  const { db, user } = await requireCrmAdmin();
  const reminderData = {
    entity_type: formData.get("entity_type") as string,
    entity_id: formData.get("entity_id") as string,
    reminder_type: (formData.get("reminder_type") as string) || "custom",
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    due_date: formData.get("due_date") as string,
    remind_at:
      (formData.get("remind_at") as string) ||
      (formData.get("due_date") as string),
    is_auto: false,
    status: "pending" as const,
  };

  const { error } = await db.from("crm_reminders").insert(reminderData);
  if (error) throw new Error(error.message);

  await logCrmActivity(db, {
    entity_type: reminderData.entity_type as EntityType,
    entity_id: reminderData.entity_id,
    action: "created",
    actor: user.email || "admin",
    description: `\u0421\u044A\u0437\u0434\u0430\u0434\u0435\u043D\u043E \u043D\u0430\u043F\u043E\u043C\u043D\u044F\u043D\u0435: ${reminderData.title}`,
  });

  revalidatePath("/admin/crm");
}

export async function dismissCrmReminder(id: string) {
  const { db } = await requireCrmAdmin();
  const { error } = await db
    .from("crm_reminders")
    .update({ status: "dismissed" })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/crm");
}

export async function snoozeCrmReminder(id: string, days: number) {
  const { db } = await requireCrmAdmin();
  const newDate = new Date();
  newDate.setDate(newDate.getDate() + days);
  const { error } = await db
    .from("crm_reminders")
    .update({
      status: "pending",
      remind_at: newDate.toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/crm");
}

// ============================================================
// MRR Snapshots (Task C)
// ============================================================

export interface MrrSnapshotRow {
  month: string;
  mrr: number;
  active_services: number;
}

export async function getMrrSnapshots(limit = 12): Promise<MrrSnapshotRow[]> {
  const { db } = await requireCrmAdmin();
  const { data } = await db
    .from("crm_mrr_snapshots")
    .select("month, mrr, active_services")
    .order("month", { ascending: true })
    .limit(limit);
  return (data ?? []).map((row) => ({
    month: row.month,
    mrr: Number(row.mrr),
    active_services: Number(row.active_services),
  }));
}

// ============================================================
// Billing Pipeline
// ============================================================

export async function getBillingPipelineData(): Promise<BillingPipelineData> {
  const { db } = await requireCrmAdmin();

  const now = new Date();
  const thirtyDaysLater = new Date(now);
  thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // 1. Active services with upcoming billing (next 30 days)
  const { data: services } = await db
    .from("crm_client_services")
    .select("*, crm_clients(id, company_name), crm_websites(id, domain)")
    .eq("status", "active")
    .not("next_billing_date", "is", null)
    .lte("next_billing_date", thirtyDaysLater.toISOString().split("T")[0])
    .order("next_billing_date", { ascending: true });

  // 2. All invoices (draft, pending with PDF, sent this month)
  const { data: invoices } = await db
    .from("crm_invoices")
    .select("*, crm_clients(id, company_name)")
    .in("status", ["draft", "pending", "sent"])
    .eq("is_archived", false)
    .order("due_date", { ascending: true });

  // 3. Paid this month count + total
  const { data: paidThisMonth } = await db
    .from("crm_invoices")
    .select("total_amount")
    .eq("status", "paid")
    .gte("paid_date", monthStart);

  // Map services → upcoming (only those without a matching invoice for the period)
  const upcoming: BillingPipelineItem[] = [];
  for (const svc of services ?? []) {
    const client = svc.crm_clients as unknown as { id: string; company_name: string };
    const website = svc.crm_websites as unknown as { id: string; domain: string } | null;
    const billingDate = svc.next_billing_date!;

    // Check if invoice already exists for this service + period
    const hasInvoice = (invoices ?? []).some(
      (inv) => inv.service_id === svc.id && inv.period_start === billingDate
    );
    if (hasInvoice) continue;

    const diffMs = new Date(billingDate).getTime() - now.getTime();
    const daysUntil = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    upcoming.push({
      id: svc.id,
      clientName: client.company_name,
      serviceName: svc.name,
      domain: website?.domain || null,
      amount: Number(svc.price),
      currency: svc.currency || "EUR",
      billingCycle: svc.billing_cycle,
      dueDate: billingDate,
      daysUntil,
      invoiceId: null,
      invoiceNumber: null,
      invoiceStatus: null,
      pdfUrl: null,
      serviceId: svc.id,
      clientId: client.id,
    });
  }

  // Map invoices → drafts, readyToSend, sent
  const drafts: BillingPipelineItem[] = [];
  const readyToSend: BillingPipelineItem[] = [];
  const sent: BillingPipelineItem[] = [];

  for (const inv of invoices ?? []) {
    const client = inv.crm_clients as unknown as { id: string; company_name: string };
    const diffMs = new Date(inv.due_date).getTime() - now.getTime();
    const daysUntil = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    const item: BillingPipelineItem = {
      id: inv.id,
      clientName: client.company_name,
      serviceName: inv.description || inv.service_type || "Фактура",
      domain: null,
      amount: Number(inv.total_amount),
      currency: inv.currency || "EUR",
      billingCycle: inv.recurring_interval || "",
      dueDate: inv.due_date,
      daysUntil,
      invoiceId: inv.id,
      invoiceNumber: inv.invoice_number,
      invoiceStatus: inv.status as BillingPipelineItem["invoiceStatus"],
      pdfUrl: inv.pdf_url,
      serviceId: inv.service_id || "",
      clientId: client.id,
    };

    if (inv.status === "sent") {
      sent.push(item);
    } else if (inv.pdf_url) {
      readyToSend.push(item);
    } else {
      drafts.push(item);
    }
  }

  const paidRows = paidThisMonth ?? [];
  return {
    upcoming,
    drafts,
    readyToSend,
    sent,
    paidThisMonth: paidRows.length,
    paidThisMonthTotal: paidRows.reduce((s, r) => s + Number(r.total_amount), 0),
  };
}

export async function generateDraftFromService(serviceId: string): Promise<string> {
  const { db, user } = await requireCrmAdmin();

  const { data: svc } = await db
    .from("crm_client_services")
    .select("*, crm_clients(id, company_name, billing_email, email)")
    .eq("id", serviceId)
    .single();

  if (!svc) throw new Error("Услугата не е намерена");

  const client = svc.crm_clients as unknown as {
    id: string; company_name: string; billing_email: string | null; email: string | null;
  };

  // Calculate period
  const periodStart = svc.next_billing_date || new Date().toISOString().split("T")[0];
  const startDate = new Date(periodStart);
  let periodEnd: string;
  if (svc.billing_cycle === "yearly") {
    const end = new Date(startDate);
    end.setFullYear(end.getFullYear() + 1);
    end.setDate(end.getDate() - 1);
    periodEnd = end.toISOString().split("T")[0];
  } else if (svc.billing_cycle === "quarterly") {
    const end = new Date(startDate);
    end.setMonth(end.getMonth() + 3);
    end.setDate(end.getDate() - 1);
    periodEnd = end.toISOString().split("T")[0];
  } else {
    const end = new Date(startDate);
    end.setMonth(end.getMonth() + 1);
    end.setDate(end.getDate() - 1);
    periodEnd = end.toISOString().split("T")[0];
  }

  // Due date = period start + 14 days
  const dueDate = new Date(startDate);
  dueDate.setDate(dueDate.getDate() + 14);

  // Auto invoice number
  const { data: numData } = await db.rpc("crm_next_invoice_number");
  const invoiceNumber = numData || `L8-${new Date().getFullYear()}-0000`;

  const amount = Number(svc.price);
  const vatAmount = Math.round(amount * 0.2 * 100) / 100;
  const totalAmount = Math.round((amount + vatAmount) * 100) / 100;

  const items = [
    {
      description: svc.name,
      qty: 1,
      unit_price: amount,
      total: amount,
    },
  ];

  const { data: invoice, error } = await db
    .from("crm_invoices")
    .insert({
      client_id: client.id,
      website_id: svc.website_id,
      service_id: svc.id,
      invoice_number: invoiceNumber,
      amount,
      vat_amount: vatAmount,
      total_amount: totalAmount,
      currency: svc.currency || "EUR",
      service_type: svc.service_type,
      description: svc.name,
      is_recurring: true,
      recurring_interval: svc.billing_cycle,
      period_start: periodStart,
      period_end: periodEnd,
      status: "draft",
      issue_date: new Date().toISOString().split("T")[0],
      due_date: dueDate.toISOString().split("T")[0],
      items: JSON.stringify(items),
    })
    .select("id")
    .single();

  if (error) throw new Error(`Грешка при създаване: ${error.message}`);

  await logCrmActivity(db, {
    entity_type: "invoice",
    entity_id: invoice!.id,
    action: "created",
    actor: user.email || "admin",
    description: `Чернова ${invoiceNumber} създадена от услуга "${svc.name}"`,
  });

  revalidatePath("/admin/crm");
  revalidatePath("/admin/crm/invoices");
  return invoice!.id;
}

export async function distributeInvoice(invoiceId: string): Promise<void> {
  // Uses existing sendInvoiceEmail + adds Telegram confirmation
  await sendInvoiceEmail(invoiceId);

  // Send admin Telegram confirmation
  const { db } = await requireCrmAdmin();
  const { data: inv } = await db
    .from("crm_invoices")
    .select("invoice_number, total_amount, currency, crm_clients(company_name)")
    .eq("id", invoiceId)
    .single();

  if (inv) {
    const client = inv.crm_clients as unknown as { company_name: string };
    const { createNotification } = await import("@/lib/admin-notifications");
    await createNotification({
      type: "billing_sent",
      severity: "info",
      title: `\u2705 \u0424\u0430\u043A\u0442\u0443\u0440\u0430 ${inv.invoice_number} \u0438\u0437\u043F\u0440\u0430\u0442\u0435\u043D\u0430`,
      message: `${client.company_name} \u2014 ${inv.total_amount} ${inv.currency}`,
      entityType: "invoice",
      entityId: invoiceId,
      actionUrl: `/admin/crm/invoices/${invoiceId}`,
      sendTelegram: true,
      sendEmail: false,
    });
  }
}
