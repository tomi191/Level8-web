# Hub Flow Pipeline Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Group related webhook events into business flows with pipeline status, sending ONE smart Telegram notification per flow instead of separate notifications per table INSERT.

**Architecture:** Webhook stores events and creates/updates flow_instances. A cron job (every 30s) checks for timed-out flows and sends aggregated Telegram notifications with ✅/❌ per step. Standalone events (support tickets, churn) bypass flows and notify immediately.

**Tech Stack:** Next.js 16 App Router, Supabase, Vercel Cron, Telegram Bot API, existing admin-notifications infrastructure.

---

## Task 1: SQL Migration + Types

**Files:**
- Create: `supabase/migrations/20260321_hub_flows.sql`
- Modify: `src/types/crm.ts`
- Modify: `src/types/database.ts`

**Step 1: Create migration**

```sql
-- Hub Flow Pipeline: smart event grouping

-- Flow config per website (business flow definitions)
ALTER TABLE crm_websites ADD COLUMN IF NOT EXISTS hub_flow_config JSONB DEFAULT '{}';

-- Flow instances (runtime: tracks active flows)
CREATE TABLE IF NOT EXISTS hub_flow_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID NOT NULL REFERENCES crm_websites(id) ON DELETE CASCADE,
  flow_name TEXT NOT NULL,
  correlation_value TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  steps JSONB NOT NULL DEFAULT '{}',
  timeout_at TIMESTAMPTZ NOT NULL,
  notified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_hub_flow_instances_pending
  ON hub_flow_instances(timeout_at) WHERE notified = false;
CREATE INDEX IF NOT EXISTS idx_hub_flow_instances_website
  ON hub_flow_instances(website_id, flow_name);
CREATE INDEX IF NOT EXISTS idx_hub_flow_instances_correlation
  ON hub_flow_instances(website_id, correlation_value) WHERE status = 'pending';

-- RLS
ALTER TABLE hub_flow_instances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read hub_flow_instances"
  ON hub_flow_instances FOR SELECT TO authenticated USING (true);

-- Link events to flow instances
ALTER TABLE hub_events ADD COLUMN IF NOT EXISTS flow_instance_id UUID REFERENCES hub_flow_instances(id);
```

**Step 2: Add types to crm.ts**

```typescript
// ============================================================
// Hub Flow Types
// ============================================================

export interface HubFlowDefinition {
  label: string;
  icon: string;
  trigger_table: string;
  expected_tables: string[];
  optional_tables: string[];
  timeout_seconds: number;
  correlation_field: string;
}

export type HubFlowConfig = Record<string, HubFlowDefinition>;

export interface HubFlowInstance {
  id: string;
  website_id: string;
  flow_name: string;
  correlation_value: string;
  status: "pending" | "completed" | "partial";
  steps: Record<string, "completed" | "pending" | "missing">;
  timeout_at: string;
  notified: boolean;
  created_at: string;
  completed_at: string | null;
}

export interface HubStandaloneUpdateRule {
  table: string;
  field: string;
  values: string[];
  label: string;
  severity: "info" | "warning" | "urgent";
}
```

Also add `hub_flow_config: HubFlowConfig;` to CrmWebsite interface and `flow_instance_id: string | null;` to HubEvent interface.

**Step 3: Update database.ts** — add hub_flow_instances table + hub_flow_config column to crm_websites + flow_instance_id to hub_events.

**Step 4: Commit**

---

## Task 2: Flow Logic Module

**Files:**
- Create: `src/lib/hub/flows.ts`

Core flow matching logic:

```typescript
import { createClient } from "@supabase/supabase-js";
import type { HubFlowConfig, HubFlowDefinition } from "@/types/crm";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

/**
 * Check if a table INSERT is a trigger for any flow.
 */
export function findTriggerFlow(
  flowConfig: HubFlowConfig,
  tableName: string
): { flowName: string; flow: HubFlowDefinition } | null {
  for (const [name, flow] of Object.entries(flowConfig)) {
    if (flow.trigger_table === tableName) {
      return { flowName: name, flow };
    }
  }
  return null;
}

/**
 * Check if a table is expected/optional in any flow definition.
 */
export function findExpectedFlows(
  flowConfig: HubFlowConfig,
  tableName: string
): { flowName: string; flow: HubFlowDefinition; isOptional: boolean }[] {
  const matches: { flowName: string; flow: HubFlowDefinition; isOptional: boolean }[] = [];
  for (const [name, flow] of Object.entries(flowConfig)) {
    if (flow.expected_tables.includes(tableName)) {
      matches.push({ flowName: name, flow, isOptional: false });
    } else if (flow.optional_tables.includes(tableName)) {
      matches.push({ flowName: name, flow, isOptional: true });
    }
  }
  return matches;
}

/**
 * Create a new flow instance when a trigger event arrives.
 */
export async function createFlowInstance(
  websiteId: string,
  flowName: string,
  flow: HubFlowDefinition,
  correlationValue: string,
  triggerEventId: string
): Promise<string | null> {
  const db = getServiceClient();

  // Initialize steps: trigger table = completed, others = pending
  const steps: Record<string, string> = {};
  for (const t of flow.expected_tables) {
    steps[t] = t === flow.trigger_table ? "completed" : "pending";
  }
  for (const t of flow.optional_tables) {
    steps[t] = "pending";
  }

  const timeoutAt = new Date(Date.now() + flow.timeout_seconds * 1000).toISOString();

  const { data, error } = await db
    .from("hub_flow_instances")
    .insert({
      website_id: websiteId,
      flow_name: flowName,
      correlation_value: correlationValue,
      status: "pending",
      steps,
      timeout_at: timeoutAt,
    })
    .select("id")
    .single();

  if (error || !data) return null;

  // Link the trigger event to this flow instance
  await db
    .from("hub_events")
    .update({ flow_instance_id: data.id })
    .eq("id", triggerEventId);

  return data.id;
}

/**
 * Try to attach an event to an active flow instance.
 * Returns the flow_instance_id if matched, null if standalone.
 */
export async function attachToActiveFlow(
  websiteId: string,
  flowConfig: HubFlowConfig,
  tableName: string,
  record: Record<string, unknown> | null,
  eventId: string
): Promise<string | null> {
  if (!record) return null;

  const expectedFlows = findExpectedFlows(flowConfig, tableName);
  if (expectedFlows.length === 0) return null;

  const db = getServiceClient();

  for (const { flowName, flow } of expectedFlows) {
    const correlationValue = record[flow.correlation_field];
    if (!correlationValue) continue;

    // Find active (pending) flow instance with matching correlation
    const { data: instance } = await db
      .from("hub_flow_instances")
      .select("id, steps")
      .eq("website_id", websiteId)
      .eq("flow_name", flowName)
      .eq("correlation_value", String(correlationValue))
      .eq("status", "pending")
      .gt("timeout_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (instance) {
      // Update step to completed
      const updatedSteps = { ...(instance.steps as Record<string, string>), [tableName]: "completed" };

      await db
        .from("hub_flow_instances")
        .update({ steps: updatedSteps })
        .eq("id", instance.id);

      // Link event to flow instance
      await db
        .from("hub_events")
        .update({ flow_instance_id: instance.id })
        .eq("id", eventId);

      return instance.id;
    }
  }

  return null;
}

/**
 * Check if a table is part of any flow definition (trigger, expected, or optional).
 * Used to determine if an event should be standalone or might belong to a flow.
 */
export function isPartOfAnyFlow(
  flowConfig: HubFlowConfig,
  tableName: string
): boolean {
  for (const flow of Object.values(flowConfig)) {
    if (
      flow.trigger_table === tableName ||
      flow.expected_tables.includes(tableName) ||
      flow.optional_tables.includes(tableName)
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Evaluate a flow instance: determine final status and build notification message.
 */
export function evaluateFlow(
  flow: HubFlowDefinition,
  steps: Record<string, string>
): {
  status: "completed" | "partial";
  severity: "info" | "warning";
  statusLine: string;
} {
  const expected = flow.expected_tables;
  const optional = flow.optional_tables;

  let allExpectedDone = true;
  const parts: string[] = [];

  for (const t of expected) {
    if (steps[t] === "completed") {
      parts.push(`\u2705 ${t}`);
    } else {
      parts.push(`\u274C ${t}`);
      allExpectedDone = false;
    }
  }

  for (const t of optional) {
    if (steps[t] === "completed") {
      parts.push(`\u2705 ${t}`);
    }
    // Don't show missing optional steps
  }

  return {
    status: allExpectedDone ? "completed" : "partial",
    severity: allExpectedDone ? "info" : "warning",
    statusLine: parts.join(" "),
  };
}
```

**Step 2: Commit**

---

## Task 3: Webhook Handler Changes

**Files:**
- Modify: `src/app/api/hub/webhook/route.ts`

The webhook handler needs to:

1. Accept UPDATE events (not just INSERT)
2. On INSERT: check flow config → create flow_instance OR attach to active flow OR standalone
3. On UPDATE: check standalone update rules (churn, payment status)
4. Flow events: DO NOT send Telegram (cron handles it)
5. Standalone events: send Telegram immediately (current behavior)

Key changes to POST handler:
- After storing event in hub_events, call flow logic
- If event is a flow trigger → createFlowInstance() → no Telegram
- If event attaches to active flow → attachToActiveFlow() → no Telegram
- If event is standalone (not part of any flow) → send Telegram immediately
- If event is UPDATE with churn/payment rule → send Telegram immediately

**Step 2: Commit**

---

## Task 4: Cron Job for Flow Aggregation

**Files:**
- Create: `src/app/api/cron/hub-flows/route.ts`

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createNotification } from "@/lib/admin-notifications";
import { evaluateFlow } from "@/lib/hub/flows";
import type { HubFlowConfig, HubFlowDefinition } from "@/types/crm";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getServiceClient();

  // Find all timed-out, un-notified flow instances
  const { data: instances, error } = await db
    .from("hub_flow_instances")
    .select("*, crm_websites(domain, hub_flow_config, crm_clients(company_name))")
    .eq("notified", false)
    .lt("timeout_at", new Date().toISOString())
    .limit(50);

  if (error || !instances || instances.length === 0) {
    return NextResponse.json({ processed: 0 });
  }

  let processed = 0;

  for (const instance of instances) {
    const website = instance.crm_websites as any;
    const flowConfig = (website?.hub_flow_config || {}) as HubFlowConfig;
    const flowDef = flowConfig[instance.flow_name];
    if (!flowDef) continue;

    const steps = instance.steps as Record<string, string>;
    const { status, severity, statusLine } = evaluateFlow(flowDef, steps);

    const clientName = website?.crm_clients?.company_name || "\u2014";
    const emoji = status === "completed" ? "\u2705" : "\u26A0\uFE0F";

    const message = [
      `\uD83C\uDFE2 ${clientName}`,
      `\uD83C\uDF10 ${website?.domain || ""}`,
      `${emoji} ${flowDef.label} \u2014 ${instance.correlation_value}`,
      statusLine,
    ].join("\n");

    await createNotification({
      type: "hub_event" as any,
      severity,
      title: `${emoji} ${flowDef.label} \u2014 ${website?.domain}`,
      message,
      entityType: "website",
      entityId: instance.website_id,
      actionUrl: `/admin/crm/websites/${instance.website_id}`,
      sendTelegram: true,
      sendEmail: severity === "warning",
    });

    // Update flow instance
    await db
      .from("hub_flow_instances")
      .update({
        status,
        notified: true,
        completed_at: new Date().toISOString(),
      })
      .eq("id", instance.id);

    processed++;
  }

  return NextResponse.json({ processed });
}
```

**Step 2: Add to vercel.json cron schedule**

Check if vercel.json exists. Add:
```json
{
  "crons": [
    {
      "path": "/api/cron/hub-flows",
      "schedule": "* * * * *"
    }
  ]
}
```
Note: Vercel cron minimum is 1 minute. For 30-second checks, we can use the existing billing-reminders pattern or accept 1-minute granularity.

**Step 3: Commit**

---

## Task 5: Events Feed UI — Grouped Flow Display

**Files:**
- Modify: `src/components/admin/crm/hub-events-feed.tsx`
- Modify: `src/lib/hub/actions.ts` — add getHubFlowInstances()

Changes to Events Feed:
- Fetch both hub_events (standalone) and hub_flow_instances (grouped)
- Display flows as grouped cards with pipeline steps
- Display standalone events as individual rows (current behavior)
- Flow card shows: flow label, correlation value, step statuses, timestamp
- Expandable to show individual events within a flow

**Step 2: Commit**

---

## Task 6: Vrachka Configuration

**Files:**
- Direct SQL: set hub_flow_config on vrachka's crm_websites record
- Supabase Dashboard: add UPDATE webhooks for subscriptions + shop_orders

Set flow config:
```sql
UPDATE crm_websites
SET hub_flow_config = '{
  "registration": {
    "label": "Регистрация",
    "icon": "user-plus",
    "trigger_table": "profiles",
    "expected_tables": ["profiles", "subscriptions"],
    "optional_tables": ["newsletter_subscribers"],
    "timeout_seconds": 30,
    "correlation_field": "email"
  },
  "order": {
    "label": "Поръчка",
    "icon": "shopping-cart",
    "trigger_table": "shop_orders",
    "expected_tables": ["shop_orders", "shop_order_items"],
    "optional_tables": ["stripe_webhook_events"],
    "timeout_seconds": 30,
    "correlation_field": "customer_email"
  }
}'::jsonb
WHERE domain = 'vrachka.eu';
```

Add UPDATE webhooks in Vrachka Supabase Dashboard:
- subscriptions (UPDATE event) — same URL + token
- shop_orders (UPDATE event) — same URL + token

**Step 2: Commit**

---

## Task 7: Build Verification + Test

- Run `npm run build`
- Test webhook flow: send test POST with flow trigger
- Wait for cron to fire
- Verify: ONE Telegram notification with pipeline status
- Verify: Events Feed shows grouped flow
