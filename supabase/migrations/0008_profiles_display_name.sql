-- P2's moderation queue (Screen 10) shows a seller display name per row
-- ("Rahul S."), but data-model.md's profiles table only ever had id + role.
-- Nullable, so real accounts created via Supabase Auth signup (P1's login
-- form) fall back to a generic label in the UI until a proper profile-edit
-- surface exists.
alter table public.profiles
  add column display_name text;
