# CRM Contracts Module — Design Document

**Date:** 2026-03-21
**Status:** Approved
**Author:** Level 8 + Claude

## Overview

Add a contracts module to the CRM with:
- Base contracts + annexes linked to clients and websites
- 3 types: Maintenance (template), Development (semi-template), Audit (upload only)
- Full date tracking: created → sent → signed → active → expired
- PDF upload for signed documents
- HTML template generation for maintenance contracts (auto-fill from CRM)
- Link: Contract → Annex → Service → Invoice (full billing chain)
- Notifications for expiring contracts (90/30/14/7/0 days)

## Data Model

### New table: `crm_contracts`

```sql
crm_contracts (
  id UUID PK,
  client_id UUID FK → crm_clients,
  website_id UUID FK → crm_websites (nullable),
  parent_id UUID FK → crm_contracts (nullable — for annexes),
  contract_number TEXT UNIQUE,     -- L8-D-2026-0001
  type TEXT,                        -- maintenance | development | audit | other
  title TEXT,
  description TEXT,
  status TEXT,                      -- draft | sent | signed | active | expired | terminated
  variant TEXT,                     -- a | b (maintenance Standard/Full)
  monthly_price NUMERIC,
  hourly_rate NUMERIC DEFAULT 40,
  included_hours INTEGER DEFAULT 0,
  total_amount NUMERIC,
  currency TEXT DEFAULT 'EUR',
  payment_due_day INTEGER DEFAULT 10,
  minimum_period_months INTEGER DEFAULT 6,
  auto_renew BOOLEAN DEFAULT true,
  created_date DATE,
  sent_date DATE,
  signed_date DATE,
  effective_date DATE,
  expiry_date DATE,
  terminated_date DATE,
  platform_name TEXT,
  platform_url TEXT,
  tech_stack TEXT[],
  pdf_url TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
)
```

### Modified: `crm_client_services`
```sql
ALTER TABLE crm_client_services ADD COLUMN contract_id UUID REFERENCES crm_contracts(id);
```

### View: `crm_expiring_contracts`
Contracts where expiry_date within 90 days, not archived.

### Function: `crm_next_contract_number()`
Auto-generates L8-D-YYYY-NNNN.

## Relationship Chain

```
crm_clients
  └── crm_contracts (base contract)
        ├── crm_contracts (annex 1, parent_id = base)
        │     └── crm_client_services (contract_id = annex 1)
        │           └── crm_invoices
        ├── crm_contracts (annex 2)
        └── PDF files (crm-contracts bucket)
```

## Contract Types & Templates

| Type | Template? | Notes |
|------|-----------|-------|
| Maintenance | Full HTML template | 10 sections + 3 appendices, auto-fill from CRM |
| Development | Semi-template | Legal framework fixed + free-form scope |
| Audit | Upload only | Too custom for templates |

## UI Routes

- `/admin/crm/contracts` — listing with filters (status, type, client)
- `/admin/crm/contracts/new` — create (form + template selection)
- `/admin/crm/contracts/[id]` — detail (annexes tree, linked services, timeline, PDF)
- `/admin/crm/contracts/[id]/edit` — edit
- `/admin/crm/contracts/[id]/preview` — HTML template preview (print to PDF)

## Template Generation Flow

1. Server action `generateContractHtml(contractId)` — renders HTML with CRM data
2. Preview page shows HTML in print-optimized iframe
3. User prints (Ctrl+P → Save as PDF) — uses existing @page A4 CSS
4. Uploads signed PDF back to contract record

## Contract Status Flow

```
draft → sent → signed → active → expired
                  │                  │
                  └── terminated ←───┘
```

## Notifications (added to billing-reminders cron)

- 90 days before expiry → Dashboard (info)
- 30 days → Telegram + Dashboard (info)
- 14 days → Telegram + Email (warning)
- 7 days → Telegram + Email (warning)
- 0 (expired) → Telegram + Email (urgent)

## Files

### New (12):
1. `supabase/migrations/20260321_crm_contracts.sql`
2. `src/types/crm.ts` (extensions)
3. `src/lib/crm-contracts.ts` (server actions)
4. `src/lib/contract-templates.ts` (HTML generation)
5. `src/components/admin/crm/contract-list.tsx`
6. `src/components/admin/crm/contract-form.tsx`
7. `src/components/admin/crm/contract-detail.tsx`
8. `src/app/admin/(dashboard)/crm/contracts/page.tsx`
9. `src/app/admin/(dashboard)/crm/contracts/new/page.tsx`
10. `src/app/admin/(dashboard)/crm/contracts/[id]/page.tsx`
11. `src/app/admin/(dashboard)/crm/contracts/[id]/edit/page.tsx`
12. `src/app/admin/(dashboard)/crm/contracts/[id]/preview/page.tsx`

### Modified (5):
1. `src/components/admin/admin-sidebar.tsx` — add Contracts link
2. `src/app/admin/(dashboard)/crm/page.tsx` — contracts stats
3. `src/app/api/cron/billing-reminders/route.ts` — contract expiry notifications
4. `src/types/database.ts` — add crm_contracts table type
5. `src/components/admin/crm/client-detail.tsx` — show contracts section
