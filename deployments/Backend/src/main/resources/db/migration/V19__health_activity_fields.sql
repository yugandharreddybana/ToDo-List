SET search_path TO todo_list;
ALTER TABLE health_logs ADD COLUMN steps_count INT CHECK (steps_count >= 0);
ALTER TABLE health_logs ADD COLUMN calories INT CHECK (calories >= 0);
