-- Practice Log feature — Supabase table
-- Run this in the Supabase SQL editor for your JEETrack project.

create table if not exists practice_logs (
  id           bigint primary key,
  user_id      uuid not null references auth.users(id) on delete cascade,
  subject      text not null,
  chapter_id   bigint not null,
  chapter_name text not null,
  questions    integer not null check (questions > 0),
  date         date not null,
  logged_at    timestamptz not null default now()
);

create index if not exists practice_logs_user_id_idx on practice_logs(user_id);
create index if not exists practice_logs_user_date_idx on practice_logs(user_id, date);
create index if not exists practice_logs_chapter_idx on practice_logs(user_id, chapter_id);

alter table practice_logs enable row level security;

create policy "Users can view their own practice logs"
  on practice_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert their own practice logs"
  on practice_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own practice logs"
  on practice_logs for update
  using (auth.uid() = user_id);

create policy "Users can delete their own practice logs"
  on practice_logs for delete
  using (auth.uid() = user_id);
