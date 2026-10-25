SET search_path TO todo_list;

-- Hibernate's EnumType.STRING writes uppercase VARCHAR enum names, whereas
-- the historical PostgreSQL enum labels were lowercase. Preserve old values.
ALTER TABLE tasks ALTER COLUMN status DROP DEFAULT;
ALTER TABLE tasks ALTER COLUMN status TYPE VARCHAR(20) USING upper(status::text);
ALTER TABLE tasks ALTER COLUMN status SET DEFAULT 'TODO';
ALTER TABLE tasks ALTER COLUMN priority DROP DEFAULT;
ALTER TABLE tasks ALTER COLUMN priority TYPE VARCHAR(10) USING upper(priority::text);
ALTER TABLE tasks ALTER COLUMN priority SET DEFAULT 'MEDIUM';
ALTER TABLE tasks ALTER COLUMN recurrence_freq TYPE VARCHAR(10) USING upper(recurrence_freq::text);
ALTER TABLE tasks ALTER COLUMN difficulty DROP DEFAULT;
ALTER TABLE tasks ALTER COLUMN difficulty TYPE VARCHAR(12) USING upper(difficulty::text);
ALTER TABLE tasks ALTER COLUMN difficulty SET DEFAULT 'MEDIUM';
ALTER TABLE tasks ALTER COLUMN energy_requirement DROP DEFAULT;
ALTER TABLE tasks ALTER COLUMN energy_requirement TYPE VARCHAR(12) USING upper(energy_requirement::text);
ALTER TABLE tasks ALTER COLUMN energy_requirement SET DEFAULT 'MEDIUM';
ALTER TABLE tasks ALTER COLUMN confidentiality DROP DEFAULT;
ALTER TABLE tasks ALTER COLUMN confidentiality TYPE VARCHAR(18) USING upper(confidentiality::text);
ALTER TABLE tasks ALTER COLUMN confidentiality SET DEFAULT 'PERSONAL';

ALTER TABLE focus_sessions ALTER COLUMN type DROP DEFAULT;
ALTER TABLE focus_sessions ALTER COLUMN type TYPE VARCHAR(15) USING upper(type::text);
ALTER TABLE focus_sessions ALTER COLUMN type SET DEFAULT 'POMODORO';

ALTER TABLE goals ALTER COLUMN category TYPE VARCHAR(20) USING upper(category::text);
ALTER TABLE goals ALTER COLUMN status DROP DEFAULT;
ALTER TABLE goals ALTER COLUMN status TYPE VARCHAR(20) USING upper(status::text);
ALTER TABLE goals ALTER COLUMN status SET DEFAULT 'ACTIVE';

ALTER TABLE habits ALTER COLUMN frequency DROP DEFAULT;
ALTER TABLE habits ALTER COLUMN frequency TYPE VARCHAR(10) USING upper(frequency::text);
ALTER TABLE habits ALTER COLUMN frequency SET DEFAULT 'DAILY';

ALTER TABLE roster_shifts ALTER COLUMN shift_type DROP DEFAULT;
ALTER TABLE roster_shifts ALTER COLUMN shift_type TYPE VARCHAR(15) USING upper(shift_type::text);
ALTER TABLE roster_shifts ALTER COLUMN shift_type SET DEFAULT 'DAY';
ALTER TABLE notifications ALTER COLUMN type TYPE VARCHAR(20) USING upper(type::text);
ALTER TABLE daily_plans ALTER COLUMN status DROP DEFAULT;
ALTER TABLE daily_plans ALTER COLUMN status TYPE VARCHAR(12) USING upper(status::text);
ALTER TABLE daily_plans ALTER COLUMN status SET DEFAULT 'DRAFT';
