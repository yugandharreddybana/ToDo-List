SET search_path TO todo_list;

CREATE TYPE habit_frequency AS ENUM ('daily','weekly');

CREATE TABLE health_logs (
    id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    log_date            DATE         NOT NULL,
    mood                SMALLINT     CHECK (mood BETWEEN 1 AND 5),
    sleep_hours         NUMERIC(4,2) CHECK (sleep_hours BETWEEN 0 AND 24),
    sleep_quality       SMALLINT     CHECK (sleep_quality BETWEEN 1 AND 5),
    water_intake_liters NUMERIC(4,2) CHECK (water_intake_liters >= 0),
    weight_kg           NUMERIC(6,2) CHECK (weight_kg > 0),
    notes               TEXT,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, log_date)
);

CREATE TABLE habits (
    id         UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name       VARCHAR(120)    NOT NULL,
    frequency  habit_frequency NOT NULL DEFAULT 'daily',
    streak     INT             NOT NULL DEFAULT 0,
    color      CHAR(7)         NOT NULL DEFAULT '#5B9BD5',
    icon       VARCHAR(40)     NOT NULL DEFAULT 'activity',
    created_at TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TABLE habit_logs (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    habit_id     UUID        NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    log_date     DATE        NOT NULL,
    is_completed BOOLEAN     NOT NULL DEFAULT FALSE,
    UNIQUE (habit_id, log_date)
);
