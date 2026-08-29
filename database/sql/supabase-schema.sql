-- =====================================================
-- JEETrack — Supabase Database Schema
-- Paste this entire file in: Supabase → SQL Editor → Run
-- =====================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── TESTS ──
create table if not exists tests (
  id bigint primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  exam text not null,
  session text,
  paper text,
  type text,
  date text,
  total numeric,
  max numeric,
  physics numeric,
  chemistry numeric,
  maths numeric,
  notes text,
  created_at timestamptz default now()
);
alter table tests enable row level security;
create policy "Users can manage own tests" on tests for all using (auth.uid() = user_id);

-- ── HOURS ──
create table if not exists hours (
  id numeric primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date text,
  subject text,
  lecture numeric,
  practice numeric,
  revision numeric,
  total numeric,
  created_at timestamptz default now()
);
alter table hours enable row level security;
create policy "Users can manage own hours" on hours for all using (auth.uid() = user_id);

-- ── BACKLOGS ──
create table if not exists backlogs (
  id numeric primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text,
  subject text,
  priority text,
  due text,
  details text,
  done boolean default false,
  added_date text,
  done_date text,
  created_at timestamptz default now()
);
alter table backlogs enable row level security;
create policy "Users can manage own backlogs" on backlogs for all using (auth.uid() = user_id);

-- ── TODOS ──
create table if not exists todos (
  id numeric primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text,
  subject text,
  priority text,
  due text,
  details text,
  done boolean default false,
  added_date text,
  done_date text,
  created_at timestamptz default now()
);
alter table todos enable row level security;
create policy "Users can manage own todos" on todos for all using (auth.uid() = user_id);

-- ── UPCOMING TESTS ──
create table if not exists upcoming (
  id numeric primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  exam text,
  session text,
  type text,
  date text,
  venue text,
  notes text,
  created_at timestamptz default now()
);
alter table upcoming enable row level security;
create policy "Users can manage own upcoming" on upcoming for all using (auth.uid() = user_id);

-- ── SYLLABUS ──
create table if not exists syllabus (
  id numeric primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  subject text,
  name text,
  section text,
  theory boolean default false,
  practice boolean default false,
  created_at timestamptz default now()
);
alter table syllabus enable row level security;
create policy "Users can manage own syllabus" on syllabus for all using (auth.uid() = user_id);

-- ── STREAKS ──
create table if not exists streaks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  backlog_streak integer default 0,
  best_streak integer default 0,
  last_clear text,
  subj_streaks jsonb default '{"physics":0,"chemistry":0,"maths":0}',
  subj_best_streaks jsonb default '{"physics":0,"chemistry":0,"maths":0}',
  updated_at timestamptz default now()
);
alter table streaks enable row level security;
create policy "Users can manage own streaks" on streaks for all using (auth.uid() = user_id);

-- =====================================================
-- Done! Now go back to the app and add your credentials.
-- =====================================================
