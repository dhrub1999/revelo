-- Demo data for P3: 01_demo_bikes.sql (P1) put every demo bike under the
-- admin account, since P1 had no real seller accounts yet. Now that
-- 02_demo_sellers.sql (P2) exists, give one demo seller a couple of live
-- self-listed bikes of their own so the seller portal's "My listings" has
-- something real to show instead of being empty for every demo account.

with seller as (
  select id from auth.users where email = 'rahul.demo@example.com'
)
insert into public.bikes (
  seller_id, brand, model, year, km, type, frame_size, rider_height_range,
  price, listing_type, photos, condition_notes, battery_health, status
)
select seller.id, v.brand, v.model, v.year, v.km, v.type, v.frame_size,
  v.rider_height_range, v.price, 'self', v.photos, v.condition_notes::jsonb,
  v.battery_health::jsonb, v.status
from seller, (values
  -- Note: rahul.demo@ may already own a live "Nexzu Roadlark" from
  -- approving that seller's moderation-queue submission during P2 testing
  -- (03_demo_sell_submissions.sql) — this uses a different model on purpose
  -- so the seller's listings page doesn't show two identically-named bikes.
  ('Motovolt', 'Urban+', 2021, 5600, 'city', 'M (18")', '5''4"–5''9"', 24500,
    array['https://picsum.photos/seed/revelo-rahul-urban-cover/1200/900','https://picsum.photos/seed/revelo-rahul-urban-cockpit/1200/900','https://picsum.photos/seed/revelo-rahul-urban-battery/1200/900','https://picsum.photos/seed/revelo-rahul-urban-drivetrain/1200/900','https://picsum.photos/seed/revelo-rahul-urban-wear/1200/900'],
    '[{"text":"Frame — small scratch near seat tube, photo 5","photo_ref":"5"},{"text":"Battery — original, still holds charge well","photo_ref":null}]',
    '{"percent":84,"cycles":390,"tested_on":"2026-08-02"}',
    'live'),
  ('Okinawa', 'Ridge+', 2022, 3100, 'hybrid', 'M (18")', '5''5"–5''10"', 32000,
    array['https://picsum.photos/seed/revelo-rahul-ridge-cover/1200/900','https://picsum.photos/seed/revelo-rahul-ridge-cockpit/1200/900','https://picsum.photos/seed/revelo-rahul-ridge-battery/1200/900','https://picsum.photos/seed/revelo-rahul-ridge-drivetrain/1200/900','https://picsum.photos/seed/revelo-rahul-ridge-wear/1200/900'],
    '[{"text":"Tyres — 70% tread","photo_ref":null}]',
    null, 'live')
) as v(brand, model, year, km, type, frame_size, rider_height_range, price,
       photos, condition_notes, battery_health, status);
