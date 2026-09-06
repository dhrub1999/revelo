-- Auto-create a profiles row whenever someone signs up. Role comes from
-- signup metadata (buyer or seller — see src/lib/supabase/auth.ts), defaulting
-- to 'buyer' if unset. There is no public path that sets role = 'admin' here;
-- the one hardcoded admin account is promoted manually, see
-- supabase/seed/00_admin.sql.

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'role', 'buyer')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
