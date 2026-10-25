SET search_path TO todo_list;

ALTER TABLE focus_sessions ADD COLUMN actual_seconds INT NOT NULL DEFAULT 0 CHECK (actual_seconds >= 0);
ALTER TABLE focus_sessions ADD COLUMN completed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE focus_sessions ADD COLUMN notes TEXT;

UPDATE focus_sessions
SET actual_seconds = LEAST(duration_minutes * 60, GREATEST(0, EXTRACT(EPOCH FROM (end_time - start_time))::INT)),
    completed = TRUE
WHERE end_time IS NOT NULL;
