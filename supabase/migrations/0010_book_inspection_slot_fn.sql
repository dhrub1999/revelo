-- service_slots writes are admin-only (0003_rls.sql), but P3's seller
-- self-service "request certification" flow needs to consume one slot when
-- a seller (not an admin) books an inspection. A narrow SECURITY DEFINER
-- function — same pattern as is_admin() — lets any authenticated user
-- atomically decrement exactly one slot, and only when one is actually
-- available, without granting general write access to the table.
create or replace function public.book_inspection_slot(p_date date)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  did_book boolean;
begin
  update public.service_slots
  set slots_available = slots_available - 1
  where date = p_date and slots_available > 0
  returning true into did_book;
  return coalesce(did_book, false);
end;
$$;

grant execute on function public.book_inspection_slot(date) to authenticated;
