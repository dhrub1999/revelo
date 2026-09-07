-- Demo data for P2: seeds sell_submissions rows so the moderation queue
-- (Screen 10) shows all four contextual action states from the reference
-- mockup, and the consign queue (Screen 11) has certify-path submissions
-- waiting to start a worksheet. Requires 02_demo_sellers.sql to have run
-- first (looks sellers up by email rather than hardcoding ids).

with sellers as (
  select id, email from auth.users
  where email in ('rahul.demo@example.com', 'priya.demo@example.com',
                   'samer.demo@example.com', 'anon.demo@example.com')
)
insert into public.sell_submissions
  (seller_id, brand, model, year, km, type, chosen_path, asking_price,
   seller_photos, status, automated_checks, estimated_range_low, estimated_range_high)
select seller_id, brand, model, year, km, type, chosen_path, asking_price,
       seller_photos, status, automated_checks::jsonb, estimated_range_low, estimated_range_high
from (values
  -- Moderation queue: normal, clean row → Approve / Hold
  ('rahul.demo@example.com', 'Nexzu', 'Roadlark', 2022, 3200, 'city', 'self', 26000::numeric,
   array['https://picsum.photos/seed/nexzu-roadlark-1/800/600','https://picsum.photos/seed/nexzu-roadlark-2/800/600','https://picsum.photos/seed/nexzu-roadlark-3/800/600','https://picsum.photos/seed/nexzu-roadlark-4/800/600'],
   'pending', '{"phone_verified":true,"photos_original":true,"price_in_range":true,"repeat_seller":false}',
   null::numeric, null::numeric),

  -- Moderation queue: flagged (reused photo, price far below range) → Reject / Ask seller
  ('anon.demo@example.com', 'Hero Lectro', 'F6i', 2020, 1800, 'city', 'self', 8000::numeric,
   array['https://picsum.photos/seed/hero-lectro-flagged/800/600'],
   'flagged', '{"phone_verified":true,"photos_original":false,"price_in_range":false,"repeat_seller":false}',
   null::numeric, null::numeric),

  -- Moderation queue: repeat seller → Approve / Dealer?
  ('priya.demo@example.com', 'Ampere', 'Reo+', 2021, 8500, 'city', 'self', 19500::numeric,
   array['https://picsum.photos/seed/ampere-reo-1/800/600','https://picsum.photos/seed/ampere-reo-2/800/600','https://picsum.photos/seed/ampere-reo-3/800/600','https://picsum.photos/seed/ampere-reo-4/800/600','https://picsum.photos/seed/ampere-reo-5/800/600','https://picsum.photos/seed/ampere-reo-6/800/600'],
   'pending', '{"phone_verified":true,"photos_original":true,"price_in_range":true,"repeat_seller":true}',
   null::numeric, null::numeric),

  -- Moderation queue: price above range → Approve / Suggest ₹X
  ('samer.demo@example.com', 'Motovolt', 'Kivo', 2023, 2100, 'city', 'self', 44900::numeric,
   array['https://picsum.photos/seed/motovolt-kivo-1/800/600','https://picsum.photos/seed/motovolt-kivo-2/800/600','https://picsum.photos/seed/motovolt-kivo-3/800/600','https://picsum.photos/seed/motovolt-kivo-4/800/600','https://picsum.photos/seed/motovolt-kivo-5/800/600'],
   'pending', '{"phone_verified":true,"photos_original":true,"price_in_range":false,"repeat_seller":false}',
   null::numeric, null::numeric),

  -- History, so "repeat seller" has a real count and the auto-approve rate isn't a dash
  ('priya.demo@example.com', 'Ampere', 'Magnus', 2021, 4200, 'city', 'self', 21000::numeric,
   array['https://picsum.photos/seed/ampere-magnus-1/800/600'], 'approved',
   '{"phone_verified":true,"photos_original":true,"price_in_range":true,"repeat_seller":false}',
   null::numeric, null::numeric),
  ('priya.demo@example.com', 'Okinawa', 'Ridge+', 2022, 2600, 'city', 'self', 33000::numeric,
   array['https://picsum.photos/seed/okinawa-ridge-1/800/600'], 'approved',
   '{"phone_verified":true,"photos_original":true,"price_in_range":true,"repeat_seller":false}',
   null::numeric, null::numeric),
  ('samer.demo@example.com', 'Revolt', 'RV400', 2020, 12000, 'city', 'self', 39000::numeric,
   array['https://picsum.photos/seed/revolt-rv400-1/800/600'], 'rejected',
   '{"phone_verified":false,"photos_original":true,"price_in_range":true,"repeat_seller":false}',
   null::numeric, null::numeric),

  -- Consign queue: certify-path, worksheet not started yet
  ('priya.demo@example.com', 'Ninety One', 'Emerge', 2022, 5200, 'hybrid', 'certify', null::numeric,
   null, 'pending', null, 28000::numeric, 33000::numeric),
  ('samer.demo@example.com', 'EMotorad', 'X1', 2023, 1500, 'mountain', 'certify', null::numeric,
   null, 'pending', null, 52000::numeric, 58000::numeric)
) as t(seller_email, brand, model, year, km, type, chosen_path, asking_price,
       seller_photos, status, automated_checks, estimated_range_low, estimated_range_high)
join sellers on sellers.email = t.seller_email
cross join lateral (select sellers.id as seller_id) s;
