# Smart Billing Pipeline + Admin Notifications

**Date:** 2026-03-21
**Status:** Approved
**Author:** Level 8 + Claude

## Overview

Add a smart billing pipeline to the CRM admin with:
1. Notification bell in admin header (Telegram + Email + Dashboard)
2. Billing pipeline kanban widget on CRM dashboard
3. Auto-distribute invoices after PDF upload
4. Daily cron for billing reminders (7/3/0 days)

## Workflow

```
[7 days before] → Telegram info + Dashboard notification
[3 days before] → Telegram warning + Email + Dashboard
[Due date]      → Telegram urgent + Email (red) + Dashboard badge
[User uploads PDF] → Auto-send email to client + update portal + confirm via Telegram
```

## Database

New table: `admin_notifications`
- id, type, severity (info/warning/urgent), title, message
- entity_type, entity_id, action_url
- is_read, is_dismissed, telegram_sent, email_sent
- created_at

## New Files

1. `supabase/migrations/20260321_admin_notifications.sql`
2. `src/lib/admin-notifications.ts`
3. `src/components/admin/notification-bell.tsx`
4. `src/components/admin/crm/billing-pipeline.tsx`
5. `src/app/api/cron/billing-reminders/route.ts`

## Modified Files

1. `src/components/admin/admin-header.tsx` — add notification bell
2. `src/app/admin/(dashboard)/crm/page.tsx` — add billing pipeline widget
3. `src/lib/crm-actions.ts` — pipeline data + distribute invoice
4. `src/types/crm.ts` — notification types + pipeline types

## Pipeline Stages

1. **Предстоящи** — services with next_billing_date within 30 days, no invoice yet
2. **Чернови** — draft invoices without PDF
3. **За изпращане** — invoices with PDF, not yet sent
4. **Изпратени** — sent invoices awaiting payment

## Notification Channels

- **Telegram**: Personal message to admin via @Level8BlogBot
- **Email**: contact@level8.bg via Resend
- **Dashboard**: Notification bell with badge count + dropdown

## Auto-Distribute on PDF Upload

When PDF is uploaded to an invoice:
1. Send email to client (billing_email) with PDF attachment
2. Update client portal availability
3. Log activity
4. Send Telegram confirmation to admin
5. Update status: draft → sent

Optional: "Само качи, не изпращай" checkbox for manual control.
