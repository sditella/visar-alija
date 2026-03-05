-- Quiz sessions table: one row per visitor who starts the quiz
CREATE TABLE IF NOT EXISTS quiz_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL DEFAULT 'entruempelung', -- 'entruempelung' | 'sanierung'
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  last_step TEXT NOT NULL DEFAULT 'serviceType',
  -- Final answers (filled as user progresses)
  service_type TEXT,
  property_type TEXT,
  room_count TEXT,
  timing TEXT,
  -- Outcome
  converted BOOLEAN NOT NULL DEFAULT FALSE
);

-- Quiz events table: one row per step the user reaches or answer they give
CREATE TABLE IF NOT EXISTS quiz_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL REFERENCES quiz_sessions(session_id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'step_view' | 'answer' | 'complete' | 'abandon'
  step TEXT NOT NULL,       -- 'serviceType' | 'propertyType' | 'roomCount' | 'timing' | 'contact'
  answer TEXT,              -- the value chosen or typed
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Analytics reports table: snapshots before reset
CREATE TABLE IF NOT EXISTS analytics_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL DEFAULT 'entruempelung',
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  total_sessions INTEGER NOT NULL DEFAULT 0,
  conversions INTEGER NOT NULL DEFAULT 0,
  conversion_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  funnel_data JSONB NOT NULL DEFAULT '[]',
  answers_data JSONB NOT NULL DEFAULT '{}'
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_quiz_events_session_id ON quiz_events(session_id);
CREATE INDEX IF NOT EXISTS idx_quiz_events_step ON quiz_events(step);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_started_at ON quiz_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_category ON quiz_sessions(category);
CREATE INDEX IF NOT EXISTS idx_analytics_reports_category ON analytics_reports(category);
CREATE INDEX IF NOT EXISTS idx_analytics_reports_created_at ON analytics_reports(created_at);

-- RLS
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_reports ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (from quiz tracking via sendBeacon)
CREATE POLICY "allow_anon_insert_quiz_sessions" ON quiz_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_anon_all_quiz_sessions" ON quiz_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_anon_insert_quiz_events" ON quiz_events FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_anon_all_quiz_events" ON quiz_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_analytics_reports" ON analytics_reports FOR ALL USING (true) WITH CHECK (true);
