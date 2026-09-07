-- P6 (service site): "no login anywhere in this phase" (data-model.md), so
-- the public booking form runs as the `anon` Postgres role. service_slots
-- writes are admin-only (0003_rls.sql) — same SECURITY DEFINER shape as
-- book_inspection_slot() (0010), but that one is granted to `authenticated`
-- only, and a P6 visitor is never signed in.
--
-- Claims the earliest future date with capacity left rather than trusting a
-- client-picked date, so the "next available" panel shown to the visitor and
-- the slot actually consumed by their booking can never drift apart.
-- `for update skip locked` keeps two concurrent bookings from claiming the
-- same date's last slot.
create or replace function public.book_next_service_slot()
returns date
language plpgsql
security definer
set search_path = public
as $$
declare
  claimed_date date;
begin
  update public.service_slots
  set slots_available = slots_available - 1
  where date = (
    select date from public.service_slots
    where date >= current_date and slots_available > 0
    order by date asc
    limit 1
    for update skip locked
  )
  returning date into claimed_date;

  return claimed_date;
end;
$$;

grant execute on function public.book_next_service_slot() to anon, authenticated;
