SET search_path TO todo_list;

CREATE TYPE task_status   AS ENUM ('todo','in_progress','blocked','done','archived');
CREATE TYPE task_priority AS ENUM ('urgent','high','medium','low');
CREATE TYPE recurrence_freq AS ENUM ('daily','weekly','monthly');

CREATE TABLE tasks (
    id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title             VARCHAR(200)  NOT NULL,
    description       TEXT,
    status            task_status   NOT NULL DEFAULT 'todo',
    priority          task_priority NOT NULL DEFAULT 'medium',
    due_date          TIMESTAMPTZ,
    tags              TEXT[]        NOT NULL DEFAULT '{}',
    parent_task_id    UUID          REFERENCES tasks(id) ON DELETE SET NULL,
    "order"           INT           NOT NULL DEFAULT 0,
    is_recurring      BOOLEAN       NOT NULL DEFAULT FALSE,
    recurrence_freq   recurrence_freq,
    recurrence_interval INT,
    recurrence_end    TIMESTAMPTZ,
    created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE subtasks (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id      UUID         NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    title        VARCHAR(200) NOT NULL,
    is_completed BOOLEAN      NOT NULL DEFAULT FALSE,
    "order"      INT          NOT NULL DEFAULT 0
);

CREATE TABLE task_comments (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id    UUID        NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content    TEXT        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
