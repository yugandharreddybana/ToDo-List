SET search_path TO todo_list;

ALTER TABLE notifications ADD COLUMN dismissed BOOLEAN NOT NULL DEFAULT FALSE;
