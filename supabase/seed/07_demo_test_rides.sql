-- Demo data for P3: pending test-ride requests on a self-listed seller's
-- bikes, so the seller portal's test-ride calendar isn't empty. The actual
-- booking flow (buyer-facing "Book a test ride") is P4 scope — this seeds
-- the request side directly so the seller-facing accept/reject UI, built
-- now per P3-sell-yours-seller-portal.md, has something real to act on.
-- Requires 05_demo_seller_bikes.sql and 06_demo_buyer.sql to have run first.

with buyer as (
  select id from auth.users where email = 'ananya.demo@example.com'
),
seller_bikes as (
  -- Matched by model, not row order: rahul.demo@ may also own a live
  -- "Nexzu Roadlark" from P2 moderation testing — model match keeps this
  -- pointed at the two bikes 05_demo_seller_bikes.sql actually seeded.
  select b.id, b.model
  from public.bikes b
  join auth.users u on u.id = b.seller_id
  where u.email = 'rahul.demo@example.com'
    and b.listing_type = 'self'
    and b.model in ('Urban+', 'Ridge+')
)
insert into public.test_rides (bike_id, buyer_id, requested_slot, status)
select seller_bikes.id, buyer.id, slot.requested_slot, 'pending'
from buyer, seller_bikes
join (values
  ('Urban+', now() + interval '2 days' + interval '11 hours'),
  ('Ridge+', now() + interval '4 days' + interval '15 hours')
) as slot(model, requested_slot) on slot.model = seller_bikes.model;
