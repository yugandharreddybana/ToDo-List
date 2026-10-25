SET search_path TO todo_list;

CREATE TYPE task_difficulty AS ENUM ('easy','medium','hard');
CREATE TYPE energy_requirement AS ENUM ('low','medium','high');
CREATE TYPE task_confidentiality AS ENUM ('public','personal','confidential','highly_confidential');

ALTER TABLE tasks ADD COLUMN estimated_minutes INT NOT NULL DEFAULT 25;
ALTER TABLE tasks ADD COLUMN difficulty task_difficulty NOT NULL DEFAULT 'medium';
ALTER TABLE tasks ADD COLUMN energy_requirement energy_requirement NOT NULL DEFAULT 'medium';
ALTER TABLE tasks ADD COLUMN confidentiality task_confidentiality NOT NULL DEFAULT 'personal';
ALTER TABLE tasks ADD COLUMN environment VARCHAR(120);

CREATE TABLE daily_commitments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  days_of_week SMALLINT[] NOT NULL DEFAULT '{}',
  is_recurring BOOLEAN NOT NULL DEFAULT TRUE,
  date DATE,
  is_flexible BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE productivity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type VARCHAR(80) NOT NULL,
  entity_type VARCHAR(80),
  entity_id UUID,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_productivity_events_user_time ON productivity_events(user_id, created_at DESC);
CREATE INDEX idx_daily_commitments_user ON daily_commitments(user_id, date);
