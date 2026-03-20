-- ============================================================
-- CRM Module: 7 tables + triggers + functions + views
-- Run in Supabase SQL Editor
-- ============================================================

-- Enable pg_trgm for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================
-- 1. crm_clients
-- ============================================================
CREATE TABLE IF NOT EXISTS crm_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  eik text,
  address text,
  city text,
  contact_person text,
  email text,
  phone text,
  status text NOT NULL DEFAULT 'active',
  contract_start_date date,
  billing_email text,
  payment_method text,
  notes text,
  tags text[] DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  is_archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_crm_clients_status ON crm_clients(status) WHERE NOT is_archived;
CREATE INDEX idx_crm_clients_company_trgm ON crm_clients USING gin(company_name gin_trgm_ops);
CREATE INDEX idx_crm_clients_eik ON crm_clients(eik) WHERE eik IS NOT NULL;

-- ============================================================
-- 2. crm_websites
-- ============================================================
CREATE TABLE IF NOT EXISTS crm_websites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES crm_clients(id) ON DELETE CASCADE,
  domain text NOT NULL UNIQUE,
  url text,
  name text,
  platform text,
  platform_version text,
  hosting_provider text,
  hosting_plan text,
  hosting_renewal_date date,
  cloudflare_zone_id text,
  ssl_status text DEFAULT 'active',
  ssl_expiry_date date,
  ssl_provider text,
  domain_registrar text,
  domain_expiry_date date,
  domain_auto_renew boolean DEFAULT true,
  cms_admin_url text,
  cms_credentials_note text,
  ga4_property_id text,
  gsc_property_url text,
  facebook_pixel_id text,
  contact_email text,
  status text NOT NULL DEFAULT 'active',
  notes text,
  tags text[] DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  is_archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_crm_websites_client ON crm_websites(client_id);
CREATE INDEX idx_crm_websites_status ON crm_websites(status) WHERE NOT is_archived;
CREATE INDEX idx_crm_websites_domain_expiry ON crm_websites(domain_expiry_date) WHERE domain_expiry_date IS NOT NULL;
CREATE INDEX idx_crm_websites_ssl_expiry ON crm_websites(ssl_expiry_date) WHERE ssl_expiry_date IS NOT NULL;

-- ============================================================
-- 3. crm_invoices
-- ============================================================
CREATE TABLE IF NOT EXISTS crm_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES crm_clients(id) ON DELETE CASCADE,
  website_id uuid REFERENCES crm_websites(id) ON DELETE SET NULL,
  invoice_number text NOT NULL UNIQUE,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  vat_amount numeric(10,2) NOT NULL DEFAULT 0,
  total_amount numeric(10,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'BGN',
  service_type text,
  description text,
  is_recurring boolean DEFAULT false,
  recurring_interval text,
  period_start date,
  period_end date,
  status text NOT NULL DEFAULT 'draft',
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date NOT NULL,
  paid_date date,
  items jsonb DEFAULT '[]',
  notes text,
  metadata jsonb DEFAULT '{}',
  is_archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_crm_invoices_client ON crm_invoices(client_id);
CREATE INDEX idx_crm_invoices_status ON crm_invoices(status) WHERE NOT is_archived;
CREATE INDEX idx_crm_invoices_due_date ON crm_invoices(due_date) WHERE status IN ('pending', 'overdue');

-- ============================================================
-- 4. crm_reminders
-- ============================================================
CREATE TABLE IF NOT EXISTS crm_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  reminder_type text NOT NULL,
  title text NOT NULL,
  description text,
  due_date timestamptz,
  remind_at timestamptz,
  status text NOT NULL DEFAULT 'pending',
  is_auto boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_crm_reminders_entity ON crm_reminders(entity_type, entity_id);
CREATE INDEX idx_crm_reminders_pending ON crm_reminders(remind_at) WHERE status = 'pending';

-- ============================================================
-- 5. crm_activity_log (append-only)
-- ============================================================
CREATE TABLE IF NOT EXISTS crm_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  action text NOT NULL,
  actor text,
  description text,
  changes jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_crm_activity_entity ON crm_activity_log(entity_type, entity_id);
CREATE INDEX idx_crm_activity_created ON crm_activity_log(created_at DESC);

-- ============================================================
-- 6. crm_cloudflare_cache
-- ============================================================
CREATE TABLE IF NOT EXISTS crm_cloudflare_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id uuid NOT NULL REFERENCES crm_websites(id) ON DELETE CASCADE,
  zone_id text,
  data_type text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}',
  fetched_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  UNIQUE(website_id, data_type)
);

-- ============================================================
-- Trigger: auto update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_crm_clients_updated_at
  BEFORE UPDATE ON crm_clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_crm_websites_updated_at
  BEFORE UPDATE ON crm_websites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_crm_invoices_updated_at
  BEFORE UPDATE ON crm_invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_crm_reminders_updated_at
  BEFORE UPDATE ON crm_reminders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Function: auto-mark overdue invoices
-- ============================================================
CREATE OR REPLACE FUNCTION crm_auto_mark_overdue()
RETURNS integer AS $$
DECLARE
  affected integer;
BEGIN
  UPDATE crm_invoices
  SET status = 'overdue', updated_at = now()
  WHERE status = 'pending'
    AND due_date < CURRENT_DATE
    AND NOT is_archived;
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- Function: next invoice number (L8-YYYY-NNNN)
-- ============================================================
CREATE OR REPLACE FUNCTION crm_next_invoice_number()
RETURNS text AS $$
DECLARE
  current_year text;
  max_seq integer;
  next_num text;
BEGIN
  current_year := to_char(CURRENT_DATE, 'YYYY');
  SELECT COALESCE(MAX(
    CAST(substring(invoice_number FROM 'L8-' || current_year || '-(\d+)') AS integer)
  ), 0)
  INTO max_seq
  FROM crm_invoices
  WHERE invoice_number LIKE 'L8-' || current_year || '-%';

  next_num := 'L8-' || current_year || '-' || lpad((max_seq + 1)::text, 4, '0');
  RETURN next_num;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- View: expiring domains (next 60 days)
-- ============================================================
CREATE OR REPLACE VIEW crm_expiring_domains AS
SELECT
  w.id,
  w.domain,
  w.client_id,
  c.company_name,
  w.domain_expiry_date,
  w.domain_registrar,
  w.domain_auto_renew,
  w.ssl_expiry_date,
  w.ssl_provider,
  w.ssl_status,
  LEAST(w.domain_expiry_date, w.ssl_expiry_date) AS earliest_expiry,
  CASE
    WHEN LEAST(w.domain_expiry_date, w.ssl_expiry_date) < CURRENT_DATE THEN 'expired'
    WHEN LEAST(w.domain_expiry_date, w.ssl_expiry_date) <= CURRENT_DATE + 7 THEN 'critical'
    WHEN LEAST(w.domain_expiry_date, w.ssl_expiry_date) <= CURRENT_DATE + 30 THEN 'warning'
    ELSE 'ok'
  END AS urgency
FROM crm_websites w
JOIN crm_clients c ON c.id = w.client_id
WHERE NOT w.is_archived
  AND (
    w.domain_expiry_date <= CURRENT_DATE + 60
    OR w.ssl_expiry_date <= CURRENT_DATE + 60
  )
ORDER BY earliest_expiry ASC;

-- ============================================================
-- View: overdue invoices
-- ============================================================
CREATE OR REPLACE VIEW crm_overdue_invoices AS
SELECT
  i.id,
  i.invoice_number,
  i.client_id,
  c.company_name,
  i.total_amount,
  i.currency,
  i.due_date,
  CURRENT_DATE - i.due_date AS days_overdue,
  i.service_type,
  i.description
FROM crm_invoices i
JOIN crm_clients c ON c.id = i.client_id
WHERE i.status IN ('pending', 'overdue')
  AND i.due_date < CURRENT_DATE
  AND NOT i.is_archived
ORDER BY i.due_date ASC;

-- ============================================================
-- RLS: Disable for admin-only tables (service role)
-- ============================================================
ALTER TABLE crm_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_cloudflare_cache ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access (admin panel uses auth)
CREATE POLICY "Authenticated users full access" ON crm_clients
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access" ON crm_websites
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access" ON crm_invoices
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access" ON crm_reminders
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access" ON crm_activity_log
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access" ON crm_cloudflare_cache
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
