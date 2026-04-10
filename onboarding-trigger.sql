-- =====================================================
-- JEETrack — Onboarding Trigger
-- Run this in: Supabase → SQL Editor → Run
-- 
-- What this does:
-- Every time a new user signs up, Supabase automatically
-- creates a row in user_preferences with onboarding_done = false.
-- This guarantees the profile row always exists from signup,
-- so the frontend never gets 'new_user' status again.
-- =====================================================

-- Function that runs on every new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_preferences (
    user_id,
    onboarding_done,
    created_at,
    updated_at
  )
  values (
    new.id,
    false,
    now(),
    now()
  )
  on conflict (user_id) do nothing; -- safety: never overwrite existing row
  return new;
end;
$$ language plpgsql security definer;

-- Trigger: fires after every new row in auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =====================================================
-- Done! New users will now always have a profile row
-- with onboarding_done = false from the moment they sign up.
-- =====================================================
