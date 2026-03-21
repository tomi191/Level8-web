# Level 8 Hub Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a Hub to the CRM that connects to client Supabase projects, discovers their DB schema, browses data, and sends Telegram notifications for configured events.

**Architecture:** Encrypted Supabase credentials stored per website. Server-side schema discovery via information_schema. Webhook endpoint receives DB events from client projects, matches against per-table config, and sends Telegram notifications via existing admin-notifications infrastructure.

**Tech Stack:** Next.js 16 App Router, Supabase (local + remote clients), Node.js crypto (AES-256-GCM), Zod v4, Tailwind v4, shadcn/ui, Lucide icons, Telegram Bot API.

---

## Task 1: SQL Migration + Hub Types

**Files:**
- Create: `supabase/migrations/20260321_hub.sql`
- Modify: `src/types/crm.ts`

**Step 1: Create the migration file**

```sql
-- Level 8 Hub: centralized project management
-- New fields on crm_websites for Supabase connection
ALTER TABLE crm_websites
  ADD COLUMN IF NOT EXISTS supabase_project_url TEXT,
  ADD COLUMN IF NOT EXISTS supabase_key_encrypted TEXT,
  ADD COLUMN IF NOT EXISTS hub_tables_config JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS hub_connected BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS hub_last_sync TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS hub_webhook_token TEXT UNIQUE;

-- Index for webhook token lookups
CREATE INDEX IF NOT EXISTS idx_crm_websites_hub_webhook_token
  ON crm_websites(hub_webhook_token) WHERE hub_webhook_token IS NOT NULL;

-- Hub events log
CREATE TABLE IF NOT EXISTS hub_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID NOT NULL REFERENCES crm_websites(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_data JSONB,
  notified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hub_events_website_id ON hub_events(website_id);
CREATE INDEX IF NOT EXISTS idx_hub_events_created_at ON hub_events(created_at DESC);

-- RLS (disabled — admin-only access via service role)
ALTER TABLE hub_events ENABLE ROW LEVEL SECURITY;
```

**Step 2: Add Hub types to crm.ts**

Add these types at the end of `src/types/crm.ts`:

```typescript
// ============================================================
// Hub Types
// ============================================================

export interface HubTableConfig {
  label: string;
  icon: string;
  notify: boolean;
  notify_fields: string[];
  count_field: string;
  message_template: string;
}

export type HubTablesConfig = Record<string, HubTableConfig>;

export interface HubEvent {
  id: string;
  website_id: string;
  event_type: string;
  table_name: string;
  record_data: Record<string, unknown> | null;
  notified: boolean;
  created_at: string;
}

export interface HubSchemaTable {
  name: string;
  columns: HubSchemaColumn[];
  row_count: number;
}

export interface HubSchemaColumn {
  name: string;
  data_type: string;
  is_nullable: boolean;
  column_default: string | null;
}

export interface HubConnectionStatus {
  connected: boolean;
  project_url: string | null;
  last_sync: string | null;
  webhook_token: string | null;
  tables_config: HubTablesConfig;
}

export interface HubOverviewProject {
  website_id: string;
  domain: string;
  client_name: string;
  connected: boolean;
  last_sync: string | null;
  tables_configured: number;
  recent_events: number;
}
```

Also extend the existing `CrmWebsite` interface by adding after `updated_at`:

```typescript
  // Hub fields
  supabase_project_url: string | null;
  supabase_key_encrypted: string | null;
  hub_tables_config: HubTablesConfig;
  hub_connected: boolean;
  hub_last_sync: string | null;
  hub_webhook_token: string | null;
```

And add `"hub_event"` to the `NotificationType` union type.

**Step 3: Run the migration**

Run: `cd level8-web && npx supabase db push` (or apply via Supabase Dashboard SQL editor)

**Step 4: Commit**

```bash
git add supabase/migrations/20260321_hub.sql src/types/crm.ts
git commit -m "feat(hub): add migration + types for Level 8 Hub"
```

---

## Task 2: Crypto Module

**Files:**
- Create: `src/lib/hub/crypto.ts`

**Step 1: Create AES-256-GCM encryption module**

```typescript
import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function getKey(): Buffer {
  const key = process.env.HUB_ENCRYPTION_KEY;
  if (!key) throw new Error("HUB_ENCRYPTION_KEY is not set");
  // Key should be 64 hex chars = 32 bytes
  if (key.length !== 64) throw new Error("HUB_ENCRYPTION_KEY must be 64 hex characters (32 bytes)");
  return Buffer.from(key, "hex");
}

/**
 * Encrypt a plaintext string with AES-256-GCM.
 * Returns format: iv:authTag:ciphertext (all hex)
 */
export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

/**
 * Decrypt an AES-256-GCM encrypted string.
 * Expects format: iv:authTag:ciphertext (all hex)
 */
export function decrypt(encryptedText: string): string {
  const key = getKey();
  const parts = encryptedText.split(":");
  if (parts.length !== 3) throw new Error("Invalid encrypted format");

  const iv = Buffer.from(parts[0], "hex");
  const authTag = Buffer.from(parts[1], "hex");
  const ciphertext = parts[2];

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
```

**Step 2: Verify it compiles**

Run: `cd level8-web && npx tsc --noEmit src/lib/hub/crypto.ts` (or rely on full build later)

**Step 3: Commit**

```bash
git add src/lib/hub/crypto.ts
git commit -m "feat(hub): add AES-256-GCM encryption module"
```

---

## Task 3: Connect Module (Schema Discovery)

**Files:**
- Create: `src/lib/hub/connect.ts`

**Step 1: Create connect module**

```typescript
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { decrypt } from "./crypto";
import type { HubSchemaTable, HubSchemaColumn } from "@/types/crm";

/**
 * Create a Supabase client for a remote project using encrypted credentials.
 */
export function createHubClient(projectUrl: string, encryptedKey: string) {
  const serviceRoleKey = decrypt(encryptedKey);
  return createSupabaseClient(projectUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

/**
 * Test connection to a remote Supabase project.
 * Returns true if the connection is valid.
 */
export async function testConnection(
  projectUrl: string,
  serviceRoleKey: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const client = createSupabaseClient(projectUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });
    // Simple query to verify credentials
    const { error } = await client.from("_hub_ping").select("*").limit(0);
    // Error 42P01 = relation does not exist — that's fine, connection works
    if (error && !error.message.includes("does not exist")) {
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Connection failed",
    };
  }
}

/**
 * Discover public schema tables and their columns from a remote project.
 */
export async function discoverSchema(
  projectUrl: string,
  encryptedKey: string
): Promise<HubSchemaTable[]> {
  const client = createHubClient(projectUrl, encryptedKey);

  // Get all public tables
  const { data: tables, error: tablesError } = await client.rpc("", {}).then(
    () => ({ data: null, error: null })
  ).catch(() => ({ data: null, error: null }));

  // Use raw SQL via rpc — we need a helper function in the remote DB,
  // or we can use the REST API to query information_schema.
  // Since service_role has full access, query information_schema directly.
  const { data: tablesData, error: tErr } = await client
    .from("information_schema.tables" as string)
    .select("table_name")
    .eq("table_schema", "public")
    .eq("table_type", "BASE TABLE")
    .not("table_name", "like", "pg_%")
    .not("table_name", "like", "schema_%");

  // Supabase REST API doesn't expose information_schema directly.
  // Use the SQL endpoint via fetch instead.
  const serviceRoleKey = decrypt(encryptedKey);
  const result = await fetchSchema(projectUrl, serviceRoleKey);
  return result;
}

/**
 * Fetch schema via Supabase SQL endpoint (service_role required).
 */
async function fetchSchema(
  projectUrl: string,
  serviceRoleKey: string
): Promise<HubSchemaTable[]> {
  const sqlQuery = `
    SELECT
      t.table_name,
      json_agg(json_build_object(
        'name', c.column_name,
        'data_type', c.data_type,
        'is_nullable', c.is_nullable = 'YES',
        'column_default', c.column_default
      ) ORDER BY c.ordinal_position) AS columns
    FROM information_schema.tables t
    JOIN information_schema.columns c
      ON c.table_schema = t.table_schema AND c.table_name = t.table_name
    WHERE t.table_schema = 'public'
      AND t.table_type = 'BASE TABLE'
      AND t.table_name NOT LIKE 'pg_%'
      AND t.table_name NOT LIKE '_supabase_%'
    GROUP BY t.table_name
    ORDER BY t.table_name;
  `;

  const res = await fetch(`${projectUrl}/rest/v1/rpc/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      Prefer: "return=representation",
    },
  });

  // Actually, use the Supabase Management API or pg_net.
  // The simplest approach: use supabase-js .rpc() with a raw SQL function,
  // or just query each table via REST.
  // Let's use a direct SQL approach via the /pg endpoint if available,
  // or fall back to listing tables via REST API metadata.

  // Approach: Use the PostgREST schema cache endpoint
  const schemaRes = await fetch(`${projectUrl}/rest/v1/`, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
  });

  if (!schemaRes.ok) {
    throw new Error(`Schema discovery failed: ${schemaRes.status}`);
  }

  // PostgREST root returns OpenAPI spec with all tables
  const openApi = await schemaRes.json();
  const tableNames = Object.keys(openApi.definitions || {}).filter(
    (name) =>
      !name.startsWith("pg_") &&
      !name.startsWith("_") &&
      name !== "schema_migrations"
  );

  // For each table, get columns from the OpenAPI definitions
  const tables: HubSchemaTable[] = [];

  for (const tableName of tableNames) {
    const def = openApi.definitions[tableName];
    const columns: HubSchemaColumn[] = Object.entries(
      def?.properties || {}
    ).map(([colName, colDef]: [string, any]) => ({
      name: colName,
      data_type: colDef.format || colDef.type || "unknown",
      is_nullable: !(def.required || []).includes(colName),
      column_default: colDef.default ?? null,
    }));

    // Get row count with HEAD request
    const countRes = await fetch(
      `${projectUrl}/rest/v1/${tableName}?select=*`,
      {
        method: "HEAD",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          Prefer: "count=exact",
        },
      }
    );
    const contentRange = countRes.headers.get("content-range");
    const rowCount = contentRange
      ? parseInt(contentRange.split("/")[1] || "0", 10)
      : 0;

    tables.push({ name: tableName, columns, row_count: rowCount });
  }

  return tables;
}

/**
 * Browse table data from a remote project (read-only, paginated).
 */
export async function browseTable(
  projectUrl: string,
  encryptedKey: string,
  tableName: string,
  page = 0,
  pageSize = 25
): Promise<{ rows: Record<string, unknown>[]; total: number }> {
  const serviceRoleKey = decrypt(encryptedKey);

  // Validate table name to prevent injection
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
    throw new Error("Invalid table name");
  }

  const offset = page * pageSize;
  const res = await fetch(
    `${projectUrl}/rest/v1/${tableName}?select=*&order=created_at.desc.nullsfirst&offset=${offset}&limit=${pageSize}`,
    {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        Prefer: "count=exact",
      },
    }
  );

  if (!res.ok) {
    // Fallback: try without ordering by created_at
    const res2 = await fetch(
      `${projectUrl}/rest/v1/${tableName}?select=*&offset=${offset}&limit=${pageSize}`,
      {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          Prefer: "count=exact",
        },
      }
    );
    if (!res2.ok) throw new Error(`Browse failed: ${res2.status}`);
    const rows = await res2.json();
    const range = res2.headers.get("content-range");
    const total = range ? parseInt(range.split("/")[1] || "0", 10) : rows.length;
    return { rows, total };
  }

  const rows = await res.json();
  const contentRange = res.headers.get("content-range");
  const total = contentRange
    ? parseInt(contentRange.split("/")[1] || "0", 10)
    : rows.length;

  return { rows, total };
}
```

**Step 2: Verify imports compile**

Run: `cd level8-web && npx tsc --noEmit`

**Step 3: Commit**

```bash
git add src/lib/hub/connect.ts
git commit -m "feat(hub): add connect module with schema discovery + data browse"
```

---

## Task 4: Hub Server Actions

**Files:**
- Create: `src/lib/hub/actions.ts`

**Step 1: Create server actions**

```typescript
"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/admin";
import { encrypt, decrypt } from "./crypto";
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

  // Validate URL format
  if (!projectUrl.startsWith("https://") || !projectUrl.includes(".supabase.co")) {
    return { success: false, error: "URL \u0442\u0440\u044F\u0431\u0432\u0430 \u0434\u0430 \u0435 Supabase project URL (https://xxx.supabase.co)" };
  }

  // Test connection before saving
  const test = await testConnection(projectUrl, serviceRoleKey);
  if (!test.ok) {
    return { success: false, error: `\u041D\u0435\u0443\u0441\u043F\u0435\u0448\u043D\u0430 \u0432\u0440\u044A\u0437\u043A\u0430: ${test.error}` };
  }

  // Encrypt and save
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

  // Log activity
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

    // Update last sync
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
    const result = await browseTable(
      website.supabase_project_url,
      website.supabase_key_encrypted,
      tableName,
      page,
      pageSize
    );
    return result;
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

  // Get current config
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

  // Get recent event counts per website (last 24h)
  const websiteIds = websites.map((w) => w.id);
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
```

**Step 2: Verify it compiles**

Run: `cd level8-web && npx tsc --noEmit`

**Step 3: Commit**

```bash
git add src/lib/hub/actions.ts
git commit -m "feat(hub): add server actions for connect, discover, browse, configure"
```

---

## Task 5: Webhook Route

**Files:**
- Create: `src/app/api/hub/webhook/route.ts`

**Step 1: Create webhook endpoint**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createNotification } from "@/lib/admin-notifications";
import type { HubTablesConfig, HubTableConfig } from "@/types/crm";

// Use service role for webhook processing (no auth cookies available)
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

/**
 * Supabase Database Webhook payload format:
 * { type: "INSERT"|"UPDATE"|"DELETE", table: string, record: object, schema: string, old_record: object|null }
 */
interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: Record<string, unknown> | null;
  schema: string;
  old_record: Record<string, unknown> | null;
}

export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 401 });
  }

  const db = getServiceClient();

  // Look up website by webhook token
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

  // Parse payload
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
  await db.from("hub_events").insert({
    website_id: website.id,
    event_type: payload.type,
    table_name: payload.table,
    record_data: payload.record,
  });

  // Check if notifications are configured for this table
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

  // Replace {field} placeholders with actual values
  for (const [key, value] of Object.entries(record)) {
    msg = msg.replace(`{${key}}`, String(value ?? "\u2014"));
  }

  const fields = config.notify_fields || [];
  const details = fields
    .map((f) => record[f] !== undefined ? `${f}: ${record[f]}` : null)
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
```

**Step 2: Verify it compiles**

Run: `cd level8-web && npx tsc --noEmit`

**Step 3: Commit**

```bash
git add src/app/api/hub/webhook/route.ts
git commit -m "feat(hub): add webhook endpoint for DB events + Telegram notifications"
```

---

## Task 6: Hub Connection UI Component

**Files:**
- Create: `src/components/admin/crm/hub-connection.tsx`

**Step 1: Create the connection component**

```typescript
"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Database,
  Link2,
  Unlink,
  RefreshCw,
  Copy,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { connectHub, disconnectHub, discoverHubSchema } from "@/lib/hub/actions";
import type { HubConnectionStatus, HubSchemaTable } from "@/types/crm";

interface HubConnectionProps {
  websiteId: string;
  status: HubConnectionStatus | null;
}

export function HubConnection({ websiteId, status }: HubConnectionProps) {
  const [isPending, startTransition] = useTransition();
  const [projectUrl, setProjectUrl] = useState("");
  const [serviceKey, setServiceKey] = useState("");
  const [showConnect, setShowConnect] = useState(false);
  const [schema, setSchema] = useState<HubSchemaTable[] | null>(null);
  const [copied, setCopied] = useState(false);

  const isConnected = status?.connected ?? false;
  const webhookUrl = status?.webhook_token
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/api/hub/webhook?token=${status.webhook_token}`
    : null;

  function handleConnect() {
    if (!projectUrl || !serviceKey) {
      toast.error("\u041C\u043E\u043B\u044F \u043F\u043E\u043F\u044A\u043B\u043D\u0435\u0442\u0435 \u0438 \u0434\u0432\u0435\u0442\u0435 \u043F\u043E\u043B\u0435\u0442\u0430");
      return;
    }
    startTransition(async () => {
      const result = await connectHub(websiteId, projectUrl, serviceKey);
      if (result.success) {
        toast.success("Hub \u0441\u0432\u044A\u0440\u0437\u0430\u043D \u0443\u0441\u043F\u0435\u0448\u043D\u043E");
        setProjectUrl("");
        setServiceKey("");
        setShowConnect(false);
      } else {
        toast.error(result.error || "\u0413\u0440\u0435\u0448\u043A\u0430 \u043F\u0440\u0438 \u0441\u0432\u044A\u0440\u0437\u0432\u0430\u043D\u0435");
      }
    });
  }

  function handleDisconnect() {
    if (!confirm("\u0421\u0438\u0433\u0443\u0440\u043D\u0438 \u043B\u0438 \u0441\u0442\u0435, \u0447\u0435 \u0438\u0441\u043A\u0430\u0442\u0435 \u0434\u0430 \u0440\u0430\u0437\u043A\u0430\u0447\u0438\u0442\u0435 Hub?")) return;
    startTransition(async () => {
      const result = await disconnectHub(websiteId);
      if (result.success) {
        toast.success("Hub \u0440\u0430\u0437\u043A\u0430\u0447\u0435\u043D");
        setSchema(null);
      } else {
        toast.error(result.error || "\u0413\u0440\u0435\u0448\u043A\u0430");
      }
    });
  }

  function handleDiscover() {
    startTransition(async () => {
      const result = await discoverHubSchema(websiteId);
      if (result.error) {
        toast.error(result.error);
      } else {
        setSchema(result.tables);
        toast.success(`\u041D\u0430\u043C\u0435\u0440\u0435\u043D\u0438 ${result.tables.length} \u0442\u0430\u0431\u043B\u0438\u0446\u0438`);
      }
    });
  }

  function copyWebhookUrl() {
    if (!webhookUrl) return;
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    toast.success("Webhook URL \u043A\u043E\u043F\u0438\u0440\u0430\u043D");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden">
      <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
        <div>
          <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
            // HUB
          </span>
          <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
            Supabase Hub
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
                <span className="block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                \u0421\u0432\u044A\u0440\u0437\u0430\u043D
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDiscover}
                disabled={isPending}
                className="text-neon hover:text-neon hover:bg-neon/10"
              >
                <RefreshCw size={14} className={cn("mr-1.5", isPending && "animate-spin")} />
                Discover
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDisconnect}
                disabled={isPending}
                className="text-red-400 hover:text-red-400 hover:bg-red-500/10"
              >
                <Unlink size={14} className="mr-1.5" />
                \u0420\u0430\u0437\u043A\u0430\u0447\u0438
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowConnect(!showConnect)}
              className="text-neon hover:text-neon hover:bg-neon/10"
            >
              <Link2 size={14} className="mr-1.5" />
              \u0421\u0432\u044A\u0440\u0436\u0438
            </Button>
          )}
        </div>
      </div>

      {/* Connect form */}
      {!isConnected && showConnect && (
        <div className="p-5 space-y-4 border-b border-border/30">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground/60">Supabase Project URL</Label>
            <Input
              placeholder="https://xxx.supabase.co"
              value={projectUrl}
              onChange={(e) => setProjectUrl(e.target.value)}
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground/60">Service Role Key</Label>
            <Input
              type="password"
              placeholder="eyJhbGci..."
              value={serviceKey}
              onChange={(e) => setServiceKey(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-[10px] text-muted-foreground/30">
              Settings &rarr; API &rarr; service_role key. \u0428\u0438\u0444\u0440\u0438\u0440\u0430 \u0441\u0435 \u0441 AES-256-GCM.
            </p>
          </div>
          <Button
            onClick={handleConnect}
            disabled={isPending || !projectUrl || !serviceKey}
            className="bg-neon/10 text-neon border border-neon/20 hover:bg-neon/20"
          >
            {isPending ? (
              <Loader2 size={14} className="mr-1.5 animate-spin" />
            ) : (
              <Database size={14} className="mr-1.5" />
            )}
            \u0421\u0432\u044A\u0440\u0436\u0438 \u043F\u0440\u043E\u0435\u043A\u0442\u0430
          </Button>
        </div>
      )}

      {/* Connection info */}
      {isConnected && (
        <div className="p-5 space-y-4">
          {/* Project URL */}
          {status?.project_url && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground/50 shrink-0">Project URL</span>
              <span className="text-sm text-foreground font-mono text-right truncate">
                {status.project_url}
              </span>
            </div>
          )}

          {/* Last sync */}
          {status?.last_sync && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground/50 shrink-0">\u041F\u043E\u0441\u043B\u0435\u0434\u0435\u043D sync</span>
              <span className="text-sm text-foreground font-mono text-right">
                {new Date(status.last_sync).toLocaleString("bg-BG")}
              </span>
            </div>
          )}

          {/* Webhook URL */}
          {webhookUrl && (
            <div className="space-y-1.5">
              <span className="text-xs text-muted-foreground/50">Webhook URL</span>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-[11px] font-mono bg-background rounded-lg border border-border px-3 py-2 text-muted-foreground truncate">
                  {webhookUrl}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyWebhookUrl}
                  className="shrink-0 text-muted-foreground hover:text-neon"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground/30">
                \u0414\u043E\u0431\u0430\u0432\u0435\u0442\u0435 \u0442\u043E\u0437\u0438 URL \u043A\u0430\u0442\u043E Database Webhook \u0432 Supabase Dashboard \u043D\u0430 \u043A\u043B\u0438\u0435\u043D\u0442\u0441\u043A\u0438\u044F \u043F\u0440\u043E\u0435\u043A\u0442.
              </p>
            </div>
          )}

          {/* Configured tables count */}
          {status?.tables_config && Object.keys(status.tables_config).length > 0 && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground/50 shrink-0">\u041A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0438\u0440\u0430\u043D\u0438 \u0442\u0430\u0431\u043B\u0438\u0446\u0438</span>
              <span className="text-sm text-neon font-mono font-bold">
                {Object.keys(status.tables_config).length}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Schema explorer */}
      {schema && schema.length > 0 && (
        <div className="border-t border-border/30">
          <div className="px-5 py-3 border-b border-border/20">
            <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase">
              // SCHEMA ({schema.length} \u0442\u0430\u0431\u043B\u0438\u0446\u0438)
            </span>
          </div>
          <div className="divide-y divide-border/20">
            {schema.map((table) => (
              <SchemaTableRow key={table.name} table={table} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SchemaTableRow({ table }: { table: HubSchemaTable }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-white/[0.02] transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <Database size={14} className="text-neon/40" />
          <span className="text-sm font-mono text-foreground">{table.name}</span>
          <span className="text-[10px] font-mono text-muted-foreground/40">
            {table.columns.length} cols
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-muted-foreground">
            {table.row_count.toLocaleString("bg-BG")} rows
          </span>
          <span className={cn("text-muted-foreground/40 transition-transform", expanded && "rotate-90")}>
            &rsaquo;
          </span>
        </div>
      </button>
      {expanded && (
        <div className="px-5 pb-3">
          <div className="rounded-lg border border-border/30 bg-background overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/20">
                  <th className="px-3 py-1.5 text-left font-mono text-muted-foreground/40 font-normal">Column</th>
                  <th className="px-3 py-1.5 text-left font-mono text-muted-foreground/40 font-normal">Type</th>
                  <th className="px-3 py-1.5 text-center font-mono text-muted-foreground/40 font-normal">Null?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {table.columns.map((col) => (
                  <tr key={col.name} className="hover:bg-white/[0.02]">
                    <td className="px-3 py-1.5 font-mono text-foreground">{col.name}</td>
                    <td className="px-3 py-1.5 font-mono text-muted-foreground">{col.data_type}</td>
                    <td className="px-3 py-1.5 text-center text-muted-foreground/40">
                      {col.is_nullable ? "yes" : "no"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Verify it compiles**

Run: `cd level8-web && npx tsc --noEmit`

**Step 3: Commit**

```bash
git add src/components/admin/crm/hub-connection.tsx
git commit -m "feat(hub): add Hub connection UI with schema explorer"
```

---

## Task 7: Hub Table Viewer Component

**Files:**
- Create: `src/components/admin/crm/hub-table-viewer.tsx`

**Step 1: Create the table viewer**

```typescript
"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Database,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { browseHubTable } from "@/lib/hub/actions";

interface HubTableViewerProps {
  websiteId: string;
  tableName: string;
  onClose: () => void;
}

export function HubTableViewer({
  websiteId,
  tableName,
  onClose,
}: HubTableViewerProps) {
  const [isPending, startTransition] = useTransition();
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const pageSize = 25;

  function loadPage(p: number) {
    startTransition(async () => {
      const result = await browseHubTable(websiteId, tableName, p, pageSize);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setRows(result.rows);
      setTotal(result.total);
      setPage(p);
      setLoaded(true);
    });
  }

  // Auto-load first page
  if (!loaded && !isPending) {
    loadPage(0);
  }

  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden">
      <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database size={14} className="text-neon/40" />
          <span className="font-mono text-sm text-foreground font-bold">{tableName}</span>
          <span className="text-[10px] font-mono text-muted-foreground/40">
            {total.toLocaleString("bg-BG")} rows
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => loadPage(page)}
            disabled={isPending}
            className="text-neon hover:text-neon hover:bg-neon/10"
          >
            {isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              "\u041E\u043F\u0440\u0435\u0441\u043D\u0438"
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            \u0417\u0430\u0442\u0432\u043E\u0440\u0438
          </Button>
        </div>
      </div>

      {isPending && !loaded ? (
        <div className="p-8 text-center">
          <Loader2 size={24} className="mx-auto text-neon/40 animate-spin mb-3" />
          <p className="text-sm text-muted-foreground/50 font-mono">\u0417\u0430\u0440\u0435\u0436\u0434\u0430\u043D\u0435...</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="p-8 text-center">
          <Database size={28} className="mx-auto text-muted-foreground/20 mb-3" />
          <p className="text-sm text-muted-foreground/50 font-mono">\u041F\u0440\u0430\u0437\u043D\u0430 \u0442\u0430\u0431\u043B\u0438\u0446\u0430</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/30">
                  {columns.map((col) => (
                    <th
                      key={col}
                      className="px-3 py-2 text-left font-mono text-muted-foreground/40 font-normal whitespace-nowrap tracking-wider uppercase text-[10px]"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {rows.map((row, i) => (
                  <tr key={i} className="hover:bg-white/[0.02]">
                    {columns.map((col) => (
                      <td
                        key={col}
                        className="px-3 py-2 font-mono text-foreground max-w-[200px] truncate whitespace-nowrap"
                      >
                        {formatCellValue(row[col])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-5 py-3 border-t border-border/30 flex items-center justify-between">
              <span className="text-[10px] font-mono text-muted-foreground/40">
                \u0421\u0442\u0440. {page + 1} / {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => loadPage(page - 1)}
                  disabled={page === 0 || isPending}
                  className="h-7 w-7 p-0"
                >
                  <ChevronLeft size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => loadPage(page + 1)}
                  disabled={page >= totalPages - 1 || isPending}
                  className="h-7 w-7 p-0"
                >
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return "\u2014";
  if (typeof value === "object") return JSON.stringify(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}
```

**Step 2: Commit**

```bash
git add src/components/admin/crm/hub-table-viewer.tsx
git commit -m "feat(hub): add read-only table data viewer with pagination"
```

---

## Task 8: Hub Config Component

**Files:**
- Create: `src/components/admin/crm/hub-config.tsx`

**Step 1: Create the config component**

```typescript
"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Bell,
  BellOff,
  Settings,
  Trash2,
  Loader2,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { updateHubTableConfig, removeHubTableConfig } from "@/lib/hub/actions";
import type { HubTableConfig, HubTablesConfig, HubSchemaTable } from "@/types/crm";

interface HubConfigProps {
  websiteId: string;
  tables: HubSchemaTable[];
  currentConfig: HubTablesConfig;
}

export function HubConfig({ websiteId, tables, currentConfig }: HubConfigProps) {
  const [isPending, startTransition] = useTransition();
  const [editingTable, setEditingTable] = useState<string | null>(null);

  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden">
      <div className="px-5 py-4 border-b border-border/50">
        <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
          // \u041A\u041E\u041D\u0424\u0418\u0413\u0423\u0420\u0410\u0426\u0418\u042F
        </span>
        <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
          \u041D\u043E\u0442\u0438\u0444\u0438\u043A\u0430\u0446\u0438\u0438 \u043F\u043E \u0442\u0430\u0431\u043B\u0438\u0446\u0438
        </h2>
      </div>

      {tables.length === 0 ? (
        <div className="p-5 text-center">
          <p className="text-sm text-muted-foreground/50 font-mono">
            \u041F\u044A\u0440\u0432\u043E \u0438\u0437\u043F\u044A\u043B\u043D\u0435\u0442\u0435 Discover \u0437\u0430 \u0434\u0430 \u0432\u0438\u0434\u0438\u0442\u0435 \u0442\u0430\u0431\u043B\u0438\u0446\u0438\u0442\u0435.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border/20">
          {tables.map((table) => {
            const config = currentConfig[table.name];
            const isEditing = editingTable === table.name;

            return (
              <div key={table.name} className="px-5 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {config?.notify ? (
                      <Bell size={14} className="text-neon" />
                    ) : (
                      <BellOff size={14} className="text-muted-foreground/30" />
                    )}
                    <span className="font-mono text-sm text-foreground">{table.name}</span>
                    {config && (
                      <span className="text-[10px] font-mono text-neon/60 bg-neon/5 px-1.5 py-0.5 rounded">
                        {config.label}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingTable(isEditing ? null : table.name)}
                      className="h-7 text-muted-foreground hover:text-foreground"
                    >
                      <Settings size={14} />
                    </Button>
                    {config && (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isPending}
                        onClick={() => {
                          startTransition(async () => {
                            const result = await removeHubTableConfig(websiteId, table.name);
                            if (result.success) toast.success("\u041A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u044F\u0442\u0430 \u0435 \u043F\u0440\u0435\u043C\u0430\u0445\u043D\u0430\u0442\u0430");
                            else toast.error(result.error || "\u0413\u0440\u0435\u0448\u043A\u0430");
                          });
                        }}
                        className="h-7 text-red-400 hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <TableConfigForm
                    websiteId={websiteId}
                    tableName={table.name}
                    columns={table.columns.map((c) => c.name)}
                    initial={config || null}
                    onSaved={() => setEditingTable(null)}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TableConfigForm({
  websiteId,
  tableName,
  columns,
  initial,
  onSaved,
}: {
  websiteId: string;
  tableName: string;
  columns: string[];
  initial: HubTableConfig | null;
  onSaved: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [label, setLabel] = useState(initial?.label || tableName);
  const [icon, setIcon] = useState(initial?.icon || "bell");
  const [notify, setNotify] = useState(initial?.notify ?? true);
  const [notifyFields, setNotifyFields] = useState(
    initial?.notify_fields?.join(", ") || ""
  );
  const [countField, setCountField] = useState(
    initial?.count_field || "created_at"
  );
  const [template, setTemplate] = useState(
    initial?.message_template || `\u041D\u043E\u0432 ${tableName}`
  );

  function handleSave() {
    startTransition(async () => {
      const config: HubTableConfig = {
        label,
        icon,
        notify,
        notify_fields: notifyFields
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean),
        count_field: countField,
        message_template: template,
      };
      const result = await updateHubTableConfig(websiteId, tableName, config);
      if (result.success) {
        toast.success(`${tableName} \u043A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0438\u0440\u0430\u043D\u0430`);
        onSaved();
      } else {
        toast.error(result.error || "\u0413\u0440\u0435\u0448\u043A\u0430");
      }
    });
  }

  return (
    <div className="mt-3 p-4 rounded-lg border border-border/30 bg-background space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground/50">\u0415\u0442\u0438\u043A\u0435\u0442</Label>
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="h-8 text-sm font-mono"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground/50">Icon (lucide)</Label>
          <Input
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="h-8 text-sm font-mono"
            placeholder="bell, shopping-cart..."
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-[10px] text-muted-foreground/50">
          \u041F\u043E\u043B\u0435\u0442\u0430 \u0437\u0430 \u043D\u043E\u0442\u0438\u0444\u0438\u043A\u0430\u0446\u0438\u044F (comma-separated)
        </Label>
        <Input
          value={notifyFields}
          onChange={(e) => setNotifyFields(e.target.value)}
          className="h-8 text-sm font-mono"
          placeholder={columns.slice(0, 3).join(", ")}
        />
      </div>

      <div className="space-y-1">
        <Label className="text-[10px] text-muted-foreground/50">\u0428\u0430\u0431\u043B\u043E\u043D \u0437\u0430 \u0441\u044A\u043E\u0431\u0449\u0435\u043D\u0438\u0435</Label>
        <Input
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          className="h-8 text-sm font-mono"
          placeholder="\u041D\u043E\u0432\u0430 \u043F\u043E\u0440\u044A\u0447\u043A\u0430 \u2014 {name} \u2014 {email}"
        />
        <p className="text-[10px] text-muted-foreground/30">
          \u0418\u0437\u043F\u043E\u043B\u0437\u0432\u0430\u0439\u0442\u0435 {"{field_name}"} \u0437\u0430 \u0434\u0438\u043D\u0430\u043C\u0438\u0447\u043D\u0438 \u0441\u0442\u043E\u0439\u043D\u043E\u0441\u0442\u0438
        </p>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={notify}
            onChange={(e) => setNotify(e.target.checked)}
            className="accent-neon"
          />
          <span className="text-xs text-muted-foreground">Telegram \u043D\u043E\u0442\u0438\u0444\u0438\u043A\u0430\u0446\u0438\u0438</span>
        </label>
        <Button
          onClick={handleSave}
          disabled={isPending || !label}
          size="sm"
          className="bg-neon/10 text-neon border border-neon/20 hover:bg-neon/20"
        >
          {isPending ? (
            <Loader2 size={14} className="mr-1.5 animate-spin" />
          ) : (
            <Save size={14} className="mr-1.5" />
          )}
          \u0417\u0430\u043F\u0430\u0437\u0438
        </Button>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/admin/crm/hub-config.tsx
git commit -m "feat(hub): add per-table notification config component"
```

---

## Task 9: Hub Overview Component (Dashboard)

**Files:**
- Create: `src/components/admin/crm/hub-overview.tsx`

**Step 1: Create the overview component**

```typescript
import Link from "next/link";
import {
  Database,
  Activity,
  Globe,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { HubOverviewProject } from "@/types/crm";

interface HubOverviewProps {
  projects: HubOverviewProject[];
}

export function HubOverview({ projects }: HubOverviewProps) {
  if (projects.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden">
      <div className="px-5 py-4 border-b border-border/50">
        <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
          // HUB
        </span>
        <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
          \u0421\u0432\u044A\u0440\u0437\u0430\u043D\u0438 \u043F\u0440\u043E\u0435\u043A\u0442\u0438
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border/20">
        {projects.map((project) => (
          <Link
            key={project.website_id}
            href={`/admin/crm/websites/${project.website_id}`}
            className="bg-surface p-4 hover:bg-white/[0.02] transition-colors group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Globe size={14} className="text-neon/60" />
                <span className="text-sm font-mono font-bold text-foreground">
                  {project.domain}
                </span>
              </div>
              <ArrowRight
                size={14}
                className="text-muted-foreground/20 group-hover:text-neon/60 transition-colors"
              />
            </div>
            <p className="text-xs text-muted-foreground/50 mb-3">
              {project.client_name}
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Database size={12} className="text-muted-foreground/30" />
                <span className="text-[10px] font-mono text-muted-foreground">
                  {project.tables_configured} \u0442\u0430\u0431\u043B.
                </span>
              </div>
              {project.recent_events > 0 && (
                <div className="flex items-center gap-1.5">
                  <Activity size={12} className="text-neon/60" />
                  <span className="text-[10px] font-mono text-neon">
                    {project.recent_events} (24h)
                  </span>
                </div>
              )}
            </div>
            {project.last_sync && (
              <p className="text-[10px] text-muted-foreground/20 font-mono mt-2">
                sync: {new Date(project.last_sync).toLocaleDateString("bg-BG")}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/admin/crm/hub-overview.tsx
git commit -m "feat(hub): add Hub overview dashboard component"
```

---

## Task 10: Integration — Wire into Existing Pages

**Files:**
- Modify: `src/app/admin/(dashboard)/crm/websites/[id]/page.tsx`
- Modify: `src/components/admin/crm/website-detail.tsx`
- Modify: `src/app/admin/(dashboard)/crm/page.tsx`

**Step 1: Add Hub data loading to website detail page**

In `src/app/admin/(dashboard)/crm/websites/[id]/page.tsx`, add Hub imports and data loading:

```typescript
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/admin";
import {
  getCrmWebsite,
  getWebsiteCfCache,
  getEntityActivity,
} from "@/lib/crm-actions";
import { getHubConnectionStatus, getHubEvents } from "@/lib/hub/actions";
import { WebsiteDetail } from "@/components/admin/crm/website-detail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function WebsiteDetailPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  const [website, cfCache, activities, hubStatus, hubEvents] = await Promise.all([
    getCrmWebsite(id),
    getWebsiteCfCache(id),
    getEntityActivity("website", id),
    getHubConnectionStatus(id),
    getHubEvents(id, 20),
  ]);

  if (!website) {
    notFound();
  }

  return (
    <WebsiteDetail
      website={website}
      cfCache={cfCache}
      activities={activities}
      hubStatus={hubStatus}
      hubEvents={hubEvents}
    />
  );
}
```

**Step 2: Add Hub section to WebsiteDetail component**

In `src/components/admin/crm/website-detail.tsx`:

1. Add imports at the top:
```typescript
import { HubConnection } from "@/components/admin/crm/hub-connection";
import type { HubConnectionStatus, HubEvent } from "@/types/crm";
```

2. Extend the props interface:
```typescript
interface WebsiteDetailProps {
  website: CrmWebsiteWithClient;
  cfCache: CrmCloudflareCache[];
  activities: CrmActivityLog[];
  hubStatus: HubConnectionStatus | null;
  hubEvents: HubEvent[];
}
```

3. Update the component destructuring:
```typescript
export function WebsiteDetail({
  website,
  cfCache,
  activities,
  hubStatus,
  hubEvents,
}: WebsiteDetailProps) {
```

4. Add the Hub section before the Notes section (before `{/* ============================================================ */}` for `{/* Notes */}`):
```tsx
{/* ============================================================ */}
{/* Hub */}
{/* ============================================================ */}
<HubConnection websiteId={website.id} status={hubStatus} />
```

**Step 3: Add Hub overview to CRM dashboard**

In `src/app/admin/(dashboard)/crm/page.tsx`:

1. Add import at the top:
```typescript
import { getHubOverview } from "@/lib/hub/actions";
import { HubOverview } from "@/components/admin/crm/hub-overview";
```

2. Add to Promise.all (add `getHubOverview()` call):
```typescript
const [stats, expiringDomains, ..., hubProjects] = await Promise.all([
  getCrmDashboardStats(),
  ...existing calls...,
  getHubOverview(),
]);
```

3. Add the Hub overview section after the Billing Pipeline and before the Reminder widget:
```tsx
{/* Hub Overview */}
<HubOverview projects={hubProjects} />
```

**Step 4: Verify the build**

Run: `cd level8-web && npm run build`

**Step 5: Commit**

```bash
git add src/app/admin/(dashboard)/crm/websites/[id]/page.tsx \
        src/components/admin/crm/website-detail.tsx \
        src/app/admin/(dashboard)/crm/page.tsx
git commit -m "feat(hub): integrate Hub into website detail + CRM dashboard"
```

---

## Task 11: Environment Setup + Final Verification

**Step 1: Generate HUB_ENCRYPTION_KEY**

Run: `openssl rand -hex 32`

Add the output as `HUB_ENCRYPTION_KEY` in Vercel environment variables and `.env.local`.

**Step 2: Full build verification**

Run: `cd level8-web && npm run build`

Fix any TypeScript errors.

**Step 3: Manual test checklist**

1. Go to `/admin/crm/websites/[id]` — verify Hub section shows
2. Click "Connect" — enter Supabase URL + service role key
3. After connecting — verify green "Connected" status
4. Click "Discover" — verify tables appear
5. Copy webhook URL — verify it looks correct
6. Go to `/admin/crm` — verify Hub overview shows connected projects

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat(hub): Level 8 Hub complete — connect, discover, browse, notify"
```
