# Hub Flow Pipeline — Smart Event Grouping

**Date:** 2026-03-21
**Status:** Approved

## Problem

One user action (e.g., registration) creates multiple DB inserts across tables (profiles, subscriptions, newsletter_subscribers). Currently each INSERT fires a separate Telegram notification — noise, not information.

## Solution

Group related events into **business flows** with pipeline status. One flow = one Telegram notification with ✅/❌ per step.

## Architecture

### Flow Definitions (per website, stored in hub_flow_config JSONB on crm_websites)

```json
{
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
}
```

### Standalone Events (no flow grouping, immediate Telegram)

- `support_tickets` INSERT — immediate alert
- `newsletter_subscribers` INSERT — immediate, ONLY if not matched to an active registration flow
- `subscriptions` UPDATE (status → cancelled) — immediate churn alert

### Runtime Flow

```
1. profiles INSERT arrives at webhook
   → Check: is "profiles" a trigger_table for any flow? YES → "registration"
   → Extract correlation value: record.email = "maria@gmail.com"
   → Create hub_flow_instances row (status: pending, timeout_at: now+30s)
   → Store event in hub_events with flow_instance_id
   → DO NOT send Telegram

2. subscriptions INSERT arrives (0.2s later)
   → Check: is "subscriptions" expected in any active flow?
   → Find active flow_instance with matching correlation "maria@gmail.com"
   → Attach event to flow_instance, mark step "subscriptions" as completed
   → DO NOT send Telegram

3. newsletter_subscribers INSERT arrives (0.5s later)
   → Same — attach to active flow, mark optional step completed

4. Cron runs (every 30 seconds via /api/cron/hub-flows)
   → Find flow_instances WHERE timeout_at < now() AND notified = false
   → For "maria@gmail.com" registration:
     → profiles: ✅, subscriptions: ✅, newsletter: ✅
     → Send ONE Telegram: "✅ Регистрация — maria@gmail.com — профил ✅ абонамент ✅ newsletter ✅"
     → Mark flow_instance as notified

5. If subscriptions was MISSING:
   → "⚠️ Регистрация — maria@gmail.com — профил ✅ абонамент ❌"
   → severity: warning (not info)
```

### Standalone Event Flow (support_tickets, churn)

```
1. support_tickets INSERT arrives
   → Check: is it a trigger for any flow? NO
   → Check: is it expected in any active flow? NO
   → STANDALONE → send Telegram immediately (current behavior)

2. subscriptions UPDATE (status: cancelled) arrives
   → Event type is UPDATE → check standalone UPDATE rules
   → Match: subscriptions UPDATE with status=cancelled → churn alert
   → Send Telegram immediately: "⚠️ Отказ от абонамент — maria@gmail.com — premium → cancelled"
```

## Database Changes

### New column on crm_websites
```sql
ALTER TABLE crm_websites ADD COLUMN IF NOT EXISTS hub_flow_config JSONB DEFAULT '{}';
```

### New table: hub_flow_instances
```sql
CREATE TABLE hub_flow_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID NOT NULL REFERENCES crm_websites(id) ON DELETE CASCADE,
  flow_name TEXT NOT NULL,
  correlation_value TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, partial
  steps JSONB NOT NULL DEFAULT '{}', -- {"profiles": "completed", "subscriptions": "pending"}
  timeout_at TIMESTAMPTZ NOT NULL,
  notified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_hub_flow_instances_pending
  ON hub_flow_instances(timeout_at) WHERE notified = false;
CREATE INDEX idx_hub_flow_instances_website
  ON hub_flow_instances(website_id, flow_name);
```

### Update hub_events
```sql
ALTER TABLE hub_events ADD COLUMN IF NOT EXISTS flow_instance_id UUID REFERENCES hub_flow_instances(id);
```

## Webhook Changes

The webhook handler (`/api/hub/webhook/route.ts`) needs to:

1. Accept both INSERT and UPDATE event types
2. On INSERT: check if table is a flow trigger → create flow_instance
3. On INSERT: check if table is expected in an active flow → attach to flow
4. On standalone event: send Telegram immediately
5. On UPDATE: check standalone UPDATE rules (churn detection)
6. Never send Telegram for flow events (cron handles that)

## New Cron Job

`/api/cron/hub-flows/route.ts` — runs every 30 seconds (Vercel Cron)

1. Query hub_flow_instances WHERE timeout_at < now() AND notified = false
2. For each: evaluate steps (completed/missing/optional)
3. Build pipeline status message
4. Send ONE Telegram notification via createNotification()
5. Mark as notified, set status to completed/partial
6. Store in hub_events for Events Feed display

## Events Feed UI Changes

`hub-events-feed.tsx` needs to show:
- **Flow events** grouped: "Регистрация ✅✅✅ maria@gmail.com" with expandable steps
- **Standalone events** as individual rows (current behavior)
- **Churn alerts** with ⚠️ severity styling (amber/red)

## Vrachka Flow Config (Claude configures at connect time)

```json
{
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
}
```

Standalone rules (in hub_tables_config, unchanged):
- support_tickets: INSERT → immediate Telegram
- newsletter_subscribers: INSERT → immediate ONLY if no active registration flow matches

UPDATE rules (new):
- subscriptions: UPDATE where status changes to "cancelled"/"expired" → churn alert
- shop_orders: UPDATE where status changes to "paid"/"completed" → payment confirmation

## Webhook Changes in Vrachka Supabase

Add UPDATE webhooks for:
- subscriptions (UPDATE event)
- shop_orders (UPDATE event)

Same URL + X-Hub-Token as INSERT webhooks.

## Files

New:
- `src/lib/hub/flows.ts` — flow matching logic (is trigger? find active flow? attach event)
- `src/app/api/cron/hub-flows/route.ts` — cron job for flow aggregation + notifications

Modified:
- `src/app/api/hub/webhook/route.ts` — integrate flow logic, handle UPDATE events
- `src/components/admin/crm/hub-events-feed.tsx` — grouped flow display
- `src/types/crm.ts` — flow types
- `supabase/migrations/` — new migration for hub_flow_instances + hub_events.flow_instance_id
- `vercel.json` — add cron schedule for hub-flows
