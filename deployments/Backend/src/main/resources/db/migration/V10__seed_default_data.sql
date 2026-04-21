SET search_path TO todo_list;

-- Seed a demo user (password: "Demo1234!" hashed with bcrypt cost 12)
-- This row is only inserted in non-production environments via a conditional.
DO $$
BEGIN
  IF current_setting('app.environment', true) IS DISTINCT FROM 'production' THEN
    INSERT INTO users (id, email, password_hash, name, timezone)
    VALUES (
      '00000000-0000-0000-0000-000000000001',
      'demo@productivitysuite.app',
      '$2a$12$Kv3lJ8zMw7Y9xQ2rN5pOuOtEgHjFkL1mA3bCdWeXyZ6sP4nVqR8Iu',
      'Demo User',
      'UTC'
    )
    ON CONFLICT (email) DO NOTHING;

    -- Seed a welcome notification
    INSERT INTO notifications (user_id, type, title, message)
    VALUES (
      '00000000-0000-0000-0000-000000000001',
      'system',
      'Welcome to Productivity Suite',
      'Your workspace is ready. Start by creating your first task or goal.'
    );
  END IF;
END $$;
