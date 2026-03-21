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
