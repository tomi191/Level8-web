"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/admin";
import { encrypt } from "./crypto";
import { testConnection, discoverSchema, browseTable } from "./connect";
import type {
  HubTablesConfig,
  HubTableConfig,
  HubSchemaTable,
  HubConnectionStatus,
  HubOverviewProject,
  HubEvent,
} from "@/types/crm";
import type { Json } from "@/types/database";

async function requireHubAdmin() {
  const { supabase, user } = await requireAdmin();
  return { db: supabase, user };
}

// ============================================================
// Connect / Disconnect
// ============================================================

export async function connectHub(
  websiteId: string,
  projectUrl: string,
  serviceRoleKey: string
): Promise<{ success: boolean; error?: string }> {
  const { db, user } = await requireHubAdmin();

  if (!projectUrl.startsWith("https://") || !projectUrl.includes(".supabase.co")) {
    return { success: false, error: "URL \u0442\u0440\u044F\u0431\u0432\u0430 \u0434\u0430 \u0435 Supabase project URL (https://xxx.supabase.co)" };
  }

  const test = await testConnection(projectUrl, serviceRoleKey);
  if (!test.ok) {
    return { success: false, error: `\u041D\u0435\u0443\u0441\u043F\u0435\u0448\u043D\u0430 \u0432\u0440\u044A\u0437\u043A\u0430: ${test.error}` };
  }

  const encryptedKey = encrypt(serviceRoleKey);
  const webhookToken = crypto.randomBytes(24).toString("hex");

  const { error } = await db
    .from("crm_websites")
    .update({
      supabase_project_url: projectUrl.replace(/\/$/, ""),
      supabase_key_encrypted: encryptedKey,
      hub_connected: true,
      hub_last_sync: new Date().toISOString(),
      hub_webhook_token: webhookToken,
    })
    .eq("id", websiteId);

  if (error) return { success: false, error: error.message };

  await db.from("crm_activity_log").insert({
    entity_type: "website",
    entity_id: websiteId,
    action: "updated",
    actor: user.email || "admin",
    description: "Hub \u0441\u0432\u044A\u0440\u0437\u0430\u043D \u043A\u044A\u043C Supabase \u043F\u0440\u043E\u0435\u043A\u0442",
  });

  revalidatePath(`/admin/crm/websites/${websiteId}`);
  revalidatePath("/admin/crm");
  return { success: true };
}

export async function disconnectHub(
  websiteId: string
): Promise<{ success: boolean; error?: string }> {
  const { db, user } = await requireHubAdmin();

  const { error } = await db
    .from("crm_websites")
    .update({
      supabase_project_url: null,
      supabase_key_encrypted: null,
      hub_connected: false,
      hub_last_sync: null,
      hub_webhook_token: null,
      hub_tables_config: {},
    })
    .eq("id", websiteId);

  if (error) return { success: false, error: error.message };

  await db.from("crm_activity_log").insert({
    entity_type: "website",
    entity_id: websiteId,
    action: "updated",
    actor: user.email || "admin",
    description: "Hub \u0440\u0430\u0437\u043A\u0430\u0447\u0435\u043D \u043E\u0442 Supabase \u043F\u0440\u043E\u0435\u043A\u0442",
  });

  revalidatePath(`/admin/crm/websites/${websiteId}`);
  revalidatePath("/admin/crm");
  return { success: true };
}

// ============================================================
// Schema Discovery
// ============================================================

export async function discoverHubSchema(
  websiteId: string
): Promise<{ tables: HubSchemaTable[]; error?: string }> {
  const { db } = await requireHubAdmin();

  const { data: website, error } = await db
    .from("crm_websites")
    .select("supabase_project_url, supabase_key_encrypted, hub_connected")
    .eq("id", websiteId)
    .single();

  if (error || !website) return { tables: [], error: "\u0421\u0430\u0439\u0442\u044A\u0442 \u043D\u0435 \u0435 \u043D\u0430\u043C\u0435\u0440\u0435\u043D" };
  if (!website.hub_connected || !website.supabase_project_url || !website.supabase_key_encrypted) {
    return { tables: [], error: "Hub \u043D\u0435 \u0435 \u0441\u0432\u044A\u0440\u0437\u0430\u043D" };
  }

  try {
    const tables = await discoverSchema(
      website.supabase_project_url,
      website.supabase_key_encrypted
    );

    await db
      .from("crm_websites")
      .update({ hub_last_sync: new Date().toISOString() })
      .eq("id", websiteId);

    revalidatePath(`/admin/crm/websites/${websiteId}`);
    return { tables };
  } catch (err) {
    return {
      tables: [],
      error: err instanceof Error ? err.message : "Schema discovery \u043D\u0435\u0443\u0441\u043F\u0435\u0448\u043D\u0430",
    };
  }
}

// ============================================================
// Browse Table Data
// ============================================================

export async function browseHubTable(
  websiteId: string,
  tableName: string,
  page = 0,
  pageSize = 25
): Promise<{ rows: Record<string, unknown>[]; total: number; error?: string }> {
  const { db } = await requireHubAdmin();

  const { data: website, error } = await db
    .from("crm_websites")
    .select("supabase_project_url, supabase_key_encrypted, hub_connected")
    .eq("id", websiteId)
    .single();

  if (error || !website) return { rows: [], total: 0, error: "\u0421\u0430\u0439\u0442\u044A\u0442 \u043D\u0435 \u0435 \u043D\u0430\u043C\u0435\u0440\u0435\u043D" };
  if (!website.hub_connected || !website.supabase_project_url || !website.supabase_key_encrypted) {
    return { rows: [], total: 0, error: "Hub \u043D\u0435 \u0435 \u0441\u0432\u044A\u0440\u0437\u0430\u043D" };
  }

  try {
    return await browseTable(
      website.supabase_project_url,
      website.supabase_key_encrypted,
      tableName,
      page,
      pageSize
    );
  } catch (err) {
    return {
      rows: [],
      total: 0,
      error: err instanceof Error ? err.message : "\u0413\u0440\u0435\u0448\u043A\u0430 \u043F\u0440\u0438 \u0447\u0435\u0442\u0435\u043D\u0435",
    };
  }
}

// ============================================================
// Configure Tables
// ============================================================

export async function updateHubTableConfig(
  websiteId: string,
  tableName: string,
  config: HubTableConfig
): Promise<{ success: boolean; error?: string }> {
  const { db } = await requireHubAdmin();

  const { data: website, error: fetchErr } = await db
    .from("crm_websites")
    .select("hub_tables_config")
    .eq("id", websiteId)
    .single();

  if (fetchErr || !website) return { success: false, error: "\u0421\u0430\u0439\u0442\u044A\u0442 \u043D\u0435 \u0435 \u043D\u0430\u043C\u0435\u0440\u0435\u043D" };

  const currentConfig = (website.hub_tables_config || {}) as unknown as HubTablesConfig;
  const updatedConfig = { ...currentConfig, [tableName]: config };

  const { error } = await db
    .from("crm_websites")
    .update({ hub_tables_config: updatedConfig as unknown as Json })
    .eq("id", websiteId);

  if (error) return { success: false, error: error.message };

  revalidatePath(`/admin/crm/websites/${websiteId}`);
  return { success: true };
}

export async function removeHubTableConfig(
  websiteId: string,
  tableName: string
): Promise<{ success: boolean; error?: string }> {
  const { db } = await requireHubAdmin();

  const { data: website, error: fetchErr } = await db
    .from("crm_websites")
    .select("hub_tables_config")
    .eq("id", websiteId)
    .single();

  if (fetchErr || !website) return { success: false, error: "\u0421\u0430\u0439\u0442\u044A\u0442 \u043D\u0435 \u0435 \u043D\u0430\u043C\u0435\u0440\u0435\u043D" };

  const currentConfig = (website.hub_tables_config || {}) as unknown as HubTablesConfig;
  const { [tableName]: _, ...rest } = currentConfig;

  const { error } = await db
    .from("crm_websites")
    .update({ hub_tables_config: rest as unknown as Json })
    .eq("id", websiteId);

  if (error) return { success: false, error: error.message };

  revalidatePath(`/admin/crm/websites/${websiteId}`);
  return { success: true };
}

// ============================================================
// Hub Overview (Dashboard)
// ============================================================

export async function getHubOverview(): Promise<HubOverviewProject[]> {
  const { db } = await requireHubAdmin();

  const { data: websites, error } = await db
    .from("crm_websites")
    .select("id, domain, hub_connected, hub_last_sync, hub_tables_config, crm_clients(company_name)")
    .eq("hub_connected", true)
    .order("domain");

  if (error || !websites) return [];

  const websiteIds = websites.map((w) => w.id);
  if (websiteIds.length === 0) return [];

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: eventCounts } = await db
    .from("hub_events")
    .select("website_id")
    .in("website_id", websiteIds)
    .gte("created_at", oneDayAgo);

  const countMap = new Map<string, number>();
  for (const e of eventCounts || []) {
    countMap.set(e.website_id, (countMap.get(e.website_id) || 0) + 1);
  }

  return websites.map((w) => {
    const config = (w.hub_tables_config || {}) as unknown as HubTablesConfig;
    const client = w.crm_clients as unknown as { company_name: string } | null;
    return {
      website_id: w.id,
      domain: w.domain,
      client_name: client?.company_name || "\u2014",
      connected: w.hub_connected ?? false,
      last_sync: w.hub_last_sync,
      tables_configured: Object.keys(config).length,
      recent_events: countMap.get(w.id) || 0,
    };
  });
}

// ============================================================
// Hub Events
// ============================================================

export async function getHubEvents(
  websiteId: string,
  limit = 50
): Promise<HubEvent[]> {
  const { db } = await requireHubAdmin();

  const { data, error } = await db
    .from("hub_events")
    .select("*")
    .eq("website_id", websiteId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data || []) as unknown as HubEvent[];
}

// ============================================================
// Hub Connection Status
// ============================================================

export async function getHubConnectionStatus(
  websiteId: string
): Promise<HubConnectionStatus | null> {
  const { db } = await requireHubAdmin();

  const { data, error } = await db
    .from("crm_websites")
    .select("supabase_project_url, hub_connected, hub_last_sync, hub_webhook_token, hub_tables_config")
    .eq("id", websiteId)
    .single();

  if (error || !data) return null;

  return {
    connected: data.hub_connected ?? false,
    project_url: data.supabase_project_url,
    last_sync: data.hub_last_sync,
    webhook_token: data.hub_webhook_token,
    tables_config: (data.hub_tables_config || {}) as unknown as HubTablesConfig,
  };
}
