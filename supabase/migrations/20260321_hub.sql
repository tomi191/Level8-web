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
