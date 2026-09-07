-- Demo data for P3: one real buyer account (dev/demo-only, same pattern as
-- 02_demo_sellers.sql), so test-ride requests in 07_demo_test_rides.sql
-- have a real buyer_id instead of reusing a seller account as the requester.
-- Never run this against a real/production project.

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  confirmation_token, recovery_token, email_change, email_change_token_new
)
values
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
   'ananya.demo@example.com', crypt('demo-not-a-real-password', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{"role":"buyer"}', '', '', '', '');
