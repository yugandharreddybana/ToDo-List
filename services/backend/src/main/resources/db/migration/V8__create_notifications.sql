SET search_path TO todo_list;

CREATE TYPE notification_type AS ENUM ('task_due','goal_deadline','weekly_summary','follow_up','system');

CREATE TABLE notifications (
    id         UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID              NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type       notification_type NOT NULL,
    title      VARCHAR(200)      NOT NULL,
    message    TEXT              NOT NULL,
    is_read    BOOLEAN           NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);
