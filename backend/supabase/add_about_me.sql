-- Add about_me column to learning_preferences for student profile info
ALTER TABLE learning_preferences ADD COLUMN IF NOT EXISTS about_me JSONB DEFAULT '{}'::jsonb;
