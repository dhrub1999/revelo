-- P5 (certified commerce): checkout + aging-stock offers. A buyer is never
-- the bikes.seller_id nor admin, so 0003_rls.sql's bikes/reservations/offers
-- policies block the direct writes these flows need (claiming a bike on
-- reserve, finalizing an accepted/declined offer). Same narrow
-- SECURITY DEFINER pattern as is_admin() (0003) and book_inspection_slot()
-- (0010): each function does exactly one atomic thing and nothing else.

-- ── Direct checkout: buyer reserves a certified bike at listing price ─────
-- Fee amounts are computed client-side (src/lib/checkout/pricing.ts) for the
-- live-updating summary, then re-passed here — this is a mock checkout with
-- no real payment gateway, so trusting them is fine. The atomic
-- status='live' guard is what actually matters: it stops two buyers from
-- reserving the same bike in a race.
create or replace function public.reserve_certified_bike(
  p_bike_id uuid,
  p_fulfillment text,
  p_warranty_tier text,
  p_buyer_protection_fee numeric,
  p_delivery_fee numeric,
  p_total numeric,
  p_reservation_amount numeric,
  p_emi_opted boolean
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  did_reserve boolean;
  new_reservation_id uuid;
begin
  update public.bikes
  set status = 'reserved'
  where id = p_bike_id and listing_type = 'certified' and status = 'live'
  returning true into did_reserve;

  if not coalesce(did_reserve, false) then
    return null;
  end if;

  insert into public.reservations (
    bike_id, buyer_id, fulfillment, warranty_tier, buyer_protection_fee,
    delivery_fee, total, reservation_amount, emi_opted, status
  ) values (
    p_bike_id, auth.uid(), p_fulfillment, p_warranty_tier, p_buyer_protection_fee,
    p_delivery_fee, p_total, p_reservation_amount, p_emi_opted, 'reserved'
  )
  returning id into new_reservation_id;

  return new_reservation_id;
end;
$$;

grant execute on function public.reserve_certified_bike(
  uuid, text, text, numeric, numeric, numeric, numeric, boolean
) to authenticated;

-- ── Aging-stock offers: accept ─────────────────────────────────────────────
-- Called by admin accepting a fresh offer, or by the buyer accepting a
-- counter — either way there's no live wizard session to collect
-- fulfillment/warranty, so the reservation defaults to pickup/included
-- (per P5-certified-commerce.md, "creates a reservations row" is the whole
-- action, not a redirect into checkout). Pricing is fixed here rather than
-- passed in, since — unlike the checkout wizard — there's no buyer-facing
-- form to trust or distrust; 1.5%/₹2,000 mirror the same constants in
-- src/lib/checkout/pricing.ts.
create or replace function public.accept_offer(p_offer_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_offer public.offers%rowtype;
  v_bike_status text;
  v_final_price numeric;
  v_protection_fee numeric;
  v_total numeric;
  new_reservation_id uuid;
begin
  select * into v_offer from public.offers where id = p_offer_id for update;
  if not found then
    return null;
  end if;

  if not (
    public.is_admin()
    or (auth.uid() = v_offer.buyer_id and v_offer.status = 'countered')
  ) then
    raise exception 'Not authorized to accept this offer';
  end if;

  if v_offer.status not in ('pending', 'countered') then
    return null;
  end if;

  select status into v_bike_status from public.bikes where id = v_offer.bike_id for update;
  if v_bike_status is distinct from 'live' then
    return null;
  end if;

  v_final_price := coalesce(v_offer.counter_price, v_offer.proposed_price);
  v_protection_fee := round(v_final_price * 0.015);
  v_total := v_final_price + v_protection_fee;

  update public.bikes set status = 'reserved' where id = v_offer.bike_id;

  insert into public.reservations (
    bike_id, buyer_id, offer_id, fulfillment, warranty_tier,
    buyer_protection_fee, delivery_fee, total, reservation_amount, emi_opted, status
  ) values (
    v_offer.bike_id, v_offer.buyer_id, v_offer.id, 'pickup', 'included',
    v_protection_fee, 0, v_total, least(2000, v_total), false, 'reserved'
  )
  returning id into new_reservation_id;

  update public.offers set status = 'accepted' where id = p_offer_id;

  return new_reservation_id;
end;
$$;

grant execute on function public.accept_offer(uuid) to authenticated;

-- ── Aging-stock offers: buyer declines a counter ──────────────────────────
create or replace function public.decline_offer(p_offer_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  did_decline boolean;
begin
  update public.offers
  set status = 'rejected'
  where id = p_offer_id and buyer_id = auth.uid() and status = 'countered'
  returning true into did_decline;

  return coalesce(did_decline, false);
end;
$$;

grant execute on function public.decline_offer(uuid) to authenticated;
