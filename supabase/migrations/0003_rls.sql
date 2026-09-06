-- Row Level Security — one policy set per role, per data-model.md's rules:
-- buyers can't touch other buyers' reservations, sellers only their own
-- bikes, admin sees/does everything.

create function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ─────────────────────────────────────────────────────────────────────────
-- profiles
-- ─────────────────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;

create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

create policy "profiles_update_admin_only"
  on public.profiles for update
  using (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────
-- sell_submissions
-- ─────────────────────────────────────────────────────────────────────────
alter table public.sell_submissions enable row level security;

create policy "sell_submissions_select_own_or_admin"
  on public.sell_submissions for select
  using (seller_id = auth.uid() or public.is_admin());

create policy "sell_submissions_insert_own"
  on public.sell_submissions for insert
  with check (seller_id = auth.uid());

create policy "sell_submissions_update_admin_only"
  on public.sell_submissions for update
  using (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────
-- bikes — the live catalog is public inventory, browsable by anyone
-- ─────────────────────────────────────────────────────────────────────────
alter table public.bikes enable row level security;

create policy "bikes_select_public"
  on public.bikes for select
  using (true);

create policy "bikes_insert_own_or_admin"
  on public.bikes for insert
  with check (seller_id = auth.uid() or public.is_admin());

create policy "bikes_update_own_or_admin"
  on public.bikes for update
  using (seller_id = auth.uid() or public.is_admin());

create policy "bikes_delete_own_or_admin"
  on public.bikes for delete
  using (seller_id = auth.uid() or public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────
-- certifications — admin's worksheet; a seller can see their own bike's
-- ─────────────────────────────────────────────────────────────────────────
alter table public.certifications enable row level security;

create policy "certifications_select_own_or_admin"
  on public.certifications for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.bikes
      where bikes.id = certifications.bike_id and bikes.seller_id = auth.uid()
    )
  );

create policy "certifications_write_admin_only"
  on public.certifications for insert
  with check (public.is_admin());

create policy "certifications_update_admin_only"
  on public.certifications for update
  using (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────
-- offers — buyer proposes, admin fields it (never the seller directly)
-- ─────────────────────────────────────────────────────────────────────────
alter table public.offers enable row level security;

create policy "offers_select_own_or_admin"
  on public.offers for select
  using (buyer_id = auth.uid() or public.is_admin());

create policy "offers_insert_own"
  on public.offers for insert
  with check (buyer_id = auth.uid());

create policy "offers_update_admin_only"
  on public.offers for update
  using (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────
-- reservations
-- ─────────────────────────────────────────────────────────────────────────
alter table public.reservations enable row level security;

create policy "reservations_select_own_or_admin"
  on public.reservations for select
  using (buyer_id = auth.uid() or public.is_admin());

create policy "reservations_insert_own"
  on public.reservations for insert
  with check (buyer_id = auth.uid());

create policy "reservations_update_admin_only"
  on public.reservations for update
  using (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────
-- test_rides — seller mediates self-listed rides on their own bikes
-- ─────────────────────────────────────────────────────────────────────────
alter table public.test_rides enable row level security;

create policy "test_rides_select_buyer_seller_or_admin"
  on public.test_rides for select
  using (
    buyer_id = auth.uid()
    or public.is_admin()
    or exists (
      select 1 from public.bikes
      where bikes.id = test_rides.bike_id and bikes.seller_id = auth.uid()
    )
  );

create policy "test_rides_insert_own"
  on public.test_rides for insert
  with check (buyer_id = auth.uid());

create policy "test_rides_update_seller_or_admin"
  on public.test_rides for update
  using (
    public.is_admin()
    or exists (
      select 1 from public.bikes
      where bikes.id = test_rides.bike_id and bikes.seller_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────────────────────
-- conversations / messages — self-listed only
-- ─────────────────────────────────────────────────────────────────────────
alter table public.conversations enable row level security;

create policy "conversations_select_buyer_seller_or_admin"
  on public.conversations for select
  using (
    buyer_id = auth.uid()
    or public.is_admin()
    or exists (
      select 1 from public.bikes
      where bikes.id = conversations.bike_id and bikes.seller_id = auth.uid()
    )
  );

create policy "conversations_insert_own"
  on public.conversations for insert
  with check (buyer_id = auth.uid());

alter table public.messages enable row level security;

create policy "messages_select_participant_or_admin"
  on public.messages for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.conversations c
      left join public.bikes b on b.id = c.bike_id
      where c.id = messages.conversation_id
        and (c.buyer_id = auth.uid() or b.seller_id = auth.uid())
    )
  );

create policy "messages_insert_buyer"
  on public.messages for insert
  with check (
    sender_role = 'buyer'
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id and c.buyer_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────────────────────
-- service_bookings / service_slots — no login required anywhere
-- ─────────────────────────────────────────────────────────────────────────
alter table public.service_bookings enable row level security;

create policy "service_bookings_insert_anyone"
  on public.service_bookings for insert
  with check (true);

create policy "service_bookings_select_admin_only"
  on public.service_bookings for select
  using (public.is_admin());

alter table public.service_slots enable row level security;

create policy "service_slots_select_public"
  on public.service_slots for select
  using (true);

create policy "service_slots_write_admin_only"
  on public.service_slots for all
  using (public.is_admin())
  with check (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────
-- notifications
-- ─────────────────────────────────────────────────────────────────────────
alter table public.notifications enable row level security;

create policy "notifications_select_own_or_admin"
  on public.notifications for select
  using (recipient_id = auth.uid() or public.is_admin());

create policy "notifications_insert_authenticated"
  on public.notifications for insert
  with check (auth.role() = 'authenticated');

create policy "notifications_update_own_or_admin"
  on public.notifications for update
  using (recipient_id = auth.uid() or public.is_admin());
