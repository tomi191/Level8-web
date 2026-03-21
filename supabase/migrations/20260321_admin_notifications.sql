-- ============================================================
-- Admin Notifications + Billing Pipeline
-- 2026-03-21
-- ============================================================

-- Admin notification types:
-- billing_upcoming   - предстоящо фактуриране (7/3/0 дни)
-- billing_generated  - чернова фактура създадена
-- billing_sent       - фактура изпратена на клиент
-- billing_paid       - плащане получено
-- billing_overdue    - фактура просрочена
-- domain_expiry      - домейн изтича
-- ssl_expiry         - SSL изтича
-- system             - системно известие

CREATE TABLE IF NOT EXISTS admin_notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type          TEXT NOT NULL,
  severity      TEXT NOT NULL DEFAULT 'info'
                  CHECK (severity IN ('info', 'warning', 'urgent')),
  title         TEXT NOT NULL,
  message       TEXT NOT NULL,
  entity_type   TEXT,                      -- 'invoice', 'client', 'website', 'service'
  entity_id     UUID,
  action_url    TEXT,                      -- deep link to admin page e.g. /admin/crm/invoices/xxx
  is_read       BOOLEAN NOT NULL DEFAULT false,
  is_dismissed  BOOLEAN NOT NULL DEFAULT false,
  telegram_sent BOOLEAN NOT NULL DEFAULT false,
  email_sent    BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for fast queries
CREATE INDEX idx_admin_notifications_unread
  ON admin_notifications (is_read, is_dismissed, created_at DESC)
  WHERE is_read = false AND is_dismissed = false;

CREATE INDEX idx_admin_notifications_type
  ON admin_notifications (type, created_at DESC);

CREATE INDEX idx_admin_notifications_entity
  ON admin_notifications (entity_type, entity_id)
  WHERE entity_id IS NOT NULL;

-- RLS: authenticated users full access (admin-only panel)
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users full access on admin_notifications"
  ON admin_notifications
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Cleanup: auto-delete notifications older than 90 days
-- (run via cron or manual: DELETE FROM admin_notifications WHERE created_at < now() - interval '90 days')
