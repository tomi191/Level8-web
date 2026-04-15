-- Lead Attribution: capture source context + session tracking

-- 1. Metadata columns on submissions
ALTER TABLE submissions
  ADD COLUMN IF NOT EXISTS session_id TEXT,
  ADD COLUMN IF NOT EXISTS source_page TEXT,
  ADD COLUMN IF NOT EXISTS utm_source TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
  ADD COLUMN IF NOT EXISTS utm_content TEXT,
  ADD COLUMN IF NOT EXISTS utm_term TEXT,
  ADD COLUMN IF NOT EXISTS referrer TEXT,
  ADD COLUMN IF NOT EXISTS user_agent TEXT,
  ADD COLUMN IF NOT EXISTS chat_history JSONB;

CREATE INDEX IF NOT EXISTS idx_submissions_session_id ON submissions(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_submissions_utm_source ON submissions(utm_source) WHERE utm_source IS NOT NULL;

-- 2. Visitor sessions table
CREATE TABLE IF NOT EXISTS visitor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  first_visit_at TIMESTAMPTZ DEFAULT now(),
  last_activity_at TIMESTAMPTZ DEFAULT now(),
  initial_page TEXT,
  initial_referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  user_agent TEXT,
  country TEXT,
  page_views JSONB NOT NULL DEFAULT '[]',
  page_view_count INT NOT NULL DEFAULT 0,
  total_duration_seconds INT NOT NULL DEFAULT 0,
  has_submission BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_visitor_sessions_session_id ON visitor_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_last_activity ON visitor_sessions(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_utm_source ON visitor_sessions(utm_source) WHERE utm_source IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_has_submission ON visitor_sessions(has_submission) WHERE has_submission = true;

ALTER TABLE visitor_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read visitor_sessions"
  ON visitor_sessions FOR SELECT TO authenticated USING (true);
