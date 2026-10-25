SET search_path TO todo_list;

ALTER TABLE notifications ADD COLUMN dedupe_key VARCHAR(160);
CREATE UNIQUE INDEX uq_notifications_user_dedupe_key ON notifications (user_id, dedupe_key);
