SET search_path TO todo_list;

CREATE TYPE goal_category AS ENUM ('career','health','personal','financial','learning');
CREATE TYPE goal_status   AS ENUM ('active','completed','paused','archived');

CREATE TABLE goals (
    id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(200)  NOT NULL,
    category    goal_category NOT NULL,
    target_date TIMESTAMPTZ,
    progress    INT           NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
    status      goal_status   NOT NULL DEFAULT 'active',
    notes       TEXT,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE goal_milestones (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id      UUID         NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    title        VARCHAR(200) NOT NULL,
    is_completed BOOLEAN      NOT NULL DEFAULT FALSE,
    target_date  TIMESTAMPTZ
);
