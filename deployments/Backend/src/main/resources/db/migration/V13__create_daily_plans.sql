SET search_path TO todo_list;

CREATE TYPE plan_status AS ENUM ('draft','approved','superseded','completed');

CREATE TABLE daily_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_date DATE NOT NULL,
  version INT NOT NULL DEFAULT 1,
  status plan_status NOT NULL DEFAULT 'draft',
  window_start TIME NOT NULL,
  window_end TIME NOT NULL,
  source VARCHAR(30) NOT NULL DEFAULT 'ai',
  assumptions JSONB NOT NULL DEFAULT '[]'::jsonb,
  summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, plan_date, version)
);

CREATE TABLE plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES daily_plans(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  title VARCHAR(200) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  buffer_minutes INT NOT NULL DEFAULT 5,
  energy_level VARCHAR(12) NOT NULL DEFAULT 'medium',
  item_type VARCHAR(20) NOT NULL DEFAULT 'task',
  status VARCHAR(20) NOT NULL DEFAULT 'planned',
  notes TEXT,
  item_order INT NOT NULL DEFAULT 0
);

CREATE TABLE energy_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  energy SMALLINT NOT NULL CHECK (energy BETWEEN 1 AND 5),
  mood SMALLINT CHECK (mood BETWEEN 1 AND 5),
  source VARCHAR(20) NOT NULL DEFAULT 'manual',
  notes TEXT
);

CREATE INDEX idx_daily_plans_user_date ON daily_plans(user_id, plan_date DESC);
CREATE INDEX idx_plan_items_plan_order ON plan_items(plan_id, item_order);
CREATE INDEX idx_energy_logs_user_time ON energy_logs(user_id, logged_at DESC);
