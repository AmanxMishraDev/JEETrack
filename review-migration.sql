-- Run this in your Supabase SQL editor
-- Adds 'rating' column to feedback table (if it exists)
-- If feedback table doesn't exist yet, creates it

CREATE TABLE IF NOT EXISTS feedback (
  id          bigint generated always as identity primary key,
  user_id     uuid references auth.users(id) on delete set null,
  subject     text,
  message     text,
  rating      smallint check (rating between 1 and 5),
  created_at  timestamptz default now()
);

-- If table already existed without rating column, add it:
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS rating smallint CHECK (rating BETWEEN 1 AND 5);

-- Enable RLS
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Allow logged-in users to insert their own feedback
CREATE POLICY IF NOT EXISTS "Users can insert feedback"
  ON feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
