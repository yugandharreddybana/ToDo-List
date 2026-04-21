SET search_path TO todo_list;

-- Users
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- Tasks
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(user_id, status);
CREATE INDEX idx_tasks_priority ON tasks(user_id, priority);
CREATE INDEX idx_tasks_due_date ON tasks(user_id, due_date) WHERE due_date IS NOT NULL;
CREATE INDEX idx_tasks_parent ON tasks(parent_task_id) WHERE parent_task_id IS NOT NULL;
CREATE INDEX idx_tasks_tags ON tasks USING GIN(tags);
CREATE INDEX idx_subtasks_task_id ON subtasks(task_id);
CREATE INDEX idx_task_comments_task_id ON task_comments(task_id);

-- Focus sessions
CREATE INDEX idx_focus_sessions_user_id ON focus_sessions(user_id);
CREATE INDEX idx_focus_sessions_start ON focus_sessions(user_id, start_time);

-- Goals
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_status ON goals(user_id, status);
CREATE INDEX idx_goal_milestones_goal_id ON goal_milestones(goal_id);

-- Career
CREATE INDEX idx_career_apps_user_id ON career_applications(user_id);
CREATE INDEX idx_career_apps_status ON career_applications(user_id, status);
CREATE INDEX idx_career_contacts_user_id ON career_contacts(user_id);

-- Health
CREATE INDEX idx_health_logs_user_date ON health_logs(user_id, log_date);
CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habit_logs_habit_date ON habit_logs(habit_id, log_date);

-- Roster
CREATE INDEX idx_roster_shifts_user_date ON roster_shifts(user_id, shift_date);

-- Notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- AI conversations
CREATE INDEX idx_ai_conversations_user_id ON ai_conversations(user_id);
