SET search_path TO todo_list;

CREATE TYPE shift_type AS ENUM ('morning','day','evening','night','on_call','off');

CREATE TABLE roster_shifts (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shift_date DATE        NOT NULL,
    start_time TIME        NOT NULL,
    end_time   TIME        NOT NULL,
    shift_type shift_type  NOT NULL DEFAULT 'day',
    notes      TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
