CREATE TABLE IF NOT EXISTS feedback (
  id          bigint generated always as identity primary key,
  user_id     uuid references auth.users(id) on delete set null,
  subject     text,
  message     text,
  rating      smallint check (rating between 1 and 5),
  created_at  timestamptz default now()
);

ALTER TABLE feedback ADD COLUMN IF NOT EXISTS rating smallint CHECK (rating BETWEEN 1 AND 5);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'feedback' 
    AND policyname = 'Users can insert feedback'
  ) THEN
    CREATE POLICY "Users can insert feedback"
      ON feedback FOR INSERT
      WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
  END IF;
END $$;