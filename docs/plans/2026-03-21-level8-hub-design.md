# Level 8 Hub — Centralized Project Management

**Date:** 2026-03-21
**Status:** Approved

## Overview

Add a Hub to the CRM that connects to client Supabase projects, discovers their DB schema, shows real-time metrics, and sends Telegram notifications for key events (new orders, inquiries, errors).

## Architecture

1. **Connect:** Store encrypted Supabase credentials per website in crm_websites
2. **Discover:** Read information_schema to list tables, columns, row counts
3. **Configure:** Per-table classification (orders/submissions/users) with notification templates
4. **Monitor:** Webhook endpoint receives events from client DBs
5. **Notify:** Telegram messages to admin for configured events
6. **Dashboard:** Hub overview cards on CRM dashboard with aggregated stats

## Security

- Service Role Keys encrypted with AES-256-GCM
- HUB_ENCRYPTION_KEY stored as Vercel env var
- Decrypted only in server actions, never sent to browser
- Single admin (Supabase Auth)

## Database Changes

New fields on crm_websites:
- supabase_project_url TEXT
- supabase_key_encrypted TEXT
- hub_tables_config JSONB
- hub_connected BOOLEAN
- hub_last_sync TIMESTAMPTZ

New table: hub_events (id, website_id, event_type, table_name, record_data JSONB, created_at)

## hub_tables_config Format

```json
{
  "table_name": {
    "label": "Display Name",
    "icon": "lucide-icon-name",
    "notify": true,
    "notify_fields": ["field1", "field2"],
    "count_field": "created_at",
    "message_template": "Icon New event — {field1} — {field2}"
  }
}
```

## UI Components

1. hub-connection.tsx — Connect + schema discovery on website detail page
2. hub-table-viewer.tsx — Read-only data browser with pagination
3. hub-config.tsx — Per-table notification configuration
4. hub-overview.tsx — Dashboard cards showing all connected projects
5. Webhook endpoint: /api/hub/webhook

## Files

New:
- supabase/migrations/20260321_hub.sql
- src/lib/hub/crypto.ts
- src/lib/hub/connect.ts
- src/lib/hub/actions.ts
- src/components/admin/crm/hub-connection.tsx
- src/components/admin/crm/hub-table-viewer.tsx
- src/components/admin/crm/hub-config.tsx
- src/components/admin/crm/hub-overview.tsx
- src/app/api/hub/webhook/route.ts

Modified:
- src/app/admin/(dashboard)/crm/websites/[id]/page.tsx — add Hub section
- src/app/admin/(dashboard)/crm/page.tsx — add Hub overview
- src/types/crm.ts — Hub types
