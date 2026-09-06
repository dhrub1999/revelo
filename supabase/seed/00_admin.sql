-- One hardcoded admin account. No public admin signup exists anywhere in
-- this app, so the account has to be created and promoted by hand:
--
-- 1. In the Supabase dashboard: Authentication → Users → Add user, create
--    the admin's email/password directly (this also fires the
--    handle_new_user trigger, which inserts a 'buyer' profiles row).
-- 2. Run the statement below, swapping in that user's email, to promote it.

update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'admin@revelo.in');
