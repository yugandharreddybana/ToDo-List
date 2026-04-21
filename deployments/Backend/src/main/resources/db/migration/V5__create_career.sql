SET search_path TO todo_list;

CREATE TYPE career_stage AS ENUM ('saved','applied','phone_screen','interview','offer','rejected');

CREATE TABLE career_applications (
    id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company          VARCHAR(200)  NOT NULL,
    role             VARCHAR(200)  NOT NULL,
    status           career_stage  NOT NULL DEFAULT 'saved',
    applied_date     TIMESTAMPTZ,
    salary_min       NUMERIC(12,2),
    salary_max       NUMERIC(12,2),
    currency         CHAR(3)       NOT NULL DEFAULT 'USD',
    url              VARCHAR(512),
    notes            TEXT,
    contact_name     VARCHAR(120),
    contact_email    VARCHAR(255),
    next_follow_up   TIMESTAMPTZ,
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE career_contacts (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    application_id  UUID         REFERENCES career_applications(id) ON DELETE SET NULL,
    name            VARCHAR(120) NOT NULL,
    email           VARCHAR(255),
    linkedin_url    VARCHAR(512),
    role            VARCHAR(120),
    notes           TEXT,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
