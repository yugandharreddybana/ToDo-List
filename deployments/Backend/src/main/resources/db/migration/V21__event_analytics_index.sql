SET search_path TO todo_list;

CREATE INDEX IF NOT EXISTS idx_events_user_type_created_at ON productivity_events (user_id, event_type, created_at);
