SET search_path TO todo_list;
CREATE INDEX idx_tasks_user_updated ON tasks(user_id, updated_at);
CREATE INDEX idx_focus_sessions_user_task ON focus_sessions(user_id, task_id, start_time);
