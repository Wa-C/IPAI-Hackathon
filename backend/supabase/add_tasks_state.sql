-- Add tasks_state column to chat_sessions (run this if you already created the tables)
ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS tasks_state JSONB DEFAULT NULL;
