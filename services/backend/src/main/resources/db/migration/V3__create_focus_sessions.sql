SET search_path TO todo_list;

CREATE TYPE session_type AS ENUM ('pomodoro','short_break','long_break','custom');

CREATE TABLE focus_sessions (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id          UUID         REFERENCES tasks(id) ON DELETE SET NULL,
    start_time       TIMESTAMPTZ  NOT NULL,
    end_time         TIMESTAMPTZ,
    duration_minutes INT          NOT NULL,
    type             session_type NOT NULL DEFAULT 'pomodoro',
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
