-- Dev/demo-only: creates auth.users rows directly (bypassing real signup) so
-- P2's moderation queue and consignment worksheet have distinct sellers to
-- show, instead of every submission being owned by the one admin account.
-- Never run this against a real/production project.

with new_sellers as (
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data,
    confirmation_token, recovery_token, email_change, email_change_token_new
  )
  values
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
     'rahul.demo@example.com', crypt('demo-not-a-real-password', gen_salt('bf')), now(), now(), now(),
     '{"provider":"email","providers":["email"]}', '{"role":"seller"}', '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
     'priya.demo@example.com', crypt('demo-not-a-real-password', gen_salt('bf')), now(), now(), now(),
     '{"provider":"email","providers":["email"]}', '{"role":"seller"}', '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
     'samer.demo@example.com', crypt('demo-not-a-real-password', gen_salt('bf')), now(), now(), now(),
     '{"provider":"email","providers":["email"]}', '{"role":"seller"}', '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
     'anon.demo@example.com', crypt('demo-not-a-real-password', gen_salt('bf')), now(), now(), now(),
     '{"provider":"email","providers":["email"]}', '{"role":"seller"}', '', '', '', '')
  returning id, email
)
select id, email from new_sellers;
-- The on_auth_user_created trigger (0002_profile_trigger.sql) creates the
-- matching profiles row with role='seller'. Run the display_name update
-- below in a second statement once those rows are visible:
--
-- update public.profiles p
-- set display_name = case u.email
--   when 'rahul.demo@example.com' then 'Rahul S.'
--   when 'priya.demo@example.com' then 'Priya M.'
--   when 'samer.demo@example.com' then 'Samer K.'
--   else null
-- end
-- from auth.users u
-- where p.id = u.id
--   and u.email in ('rahul.demo@example.com','priya.demo@example.com','samer.demo@example.com');
