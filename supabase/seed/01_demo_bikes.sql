-- Demo inventory for P1 (marketplace grid + bike detail), per
-- P1-buyer-core.md: "Seed the database directly with a handful of demo
-- bikes (mix of self-listed and certified, some with battery health, some
-- without) so this phase can be built and reviewed without waiting on
-- P2/P3's submission pipeline."
--
-- seller_id uses the one hardcoded admin account (see seed/00_admin.sql) —
-- P1 has no real seller accounts yet; that arrives in P3.
--
-- Photos are placeholder images (picsum.photos, deterministic by seed) —
-- there are no real bike photos yet. Shot order is prescriptive per
-- P1-buyer-core.md: cover, cockpit, battery, drivetrain, wear marks.

with admin as (
  select id from public.profiles where role = 'admin' limit 1
)
insert into public.bikes (
  seller_id, brand, model, year, km, type, frame_size, rider_height_range,
  price, listing_type, photos, condition_notes, battery_health, status,
  certified_live_since
)
select admin.id, v.brand, v.model, v.year, v.km, v.type, v.frame_size,
  v.rider_height_range, v.price, v.listing_type, v.photos,
  v.condition_notes::jsonb, v.battery_health::jsonb, v.status,
  v.certified_live_since
from admin, (values
  ('EMotorad', 'T-Rex+', 2023, 1240, 'hardtail', 'M (18")', '5''6"–5''11"', 34500,
    'certified',
    array['https://picsum.photos/seed/revelo-trex-plus-cover/1200/900','https://picsum.photos/seed/revelo-trex-plus-cockpit/1200/900','https://picsum.photos/seed/revelo-trex-plus-battery/1200/900','https://picsum.photos/seed/revelo-trex-plus-drivetrain/1200/900','https://picsum.photos/seed/revelo-trex-plus-wear/1200/900'],
    '[{"text":"Frame — light scuff on downtube, photo 5","photo_ref":"5"},{"text":"Tyres — 80% tread, original","photo_ref":null}]',
    '{"percent":92,"cycles":480,"tested_on":"2026-08-12"}',
    'live', now() - interval '20 days'),

  ('Motovolt', 'Hum', 2022, 3900, 'city', 'One size', null, 41000,
    'self',
    array['https://picsum.photos/seed/revelo-hum-cover/1200/900','https://picsum.photos/seed/revelo-hum-cockpit/1200/900','https://picsum.photos/seed/revelo-hum-battery/1200/900','https://picsum.photos/seed/revelo-hum-drivetrain/1200/900','https://picsum.photos/seed/revelo-hum-wear/1200/900'],
    '[{"text":"Paint — small chip near headtube, photo 1","photo_ref":"1"},{"text":"Chain — recently replaced","photo_ref":null}]',
    '{"percent":88,"cycles":610,"tested_on":"2026-07-30"}',
    'live', null),

  ('Hero Lectro', 'F6i', 2021, 6150, 'hybrid', 'M (17")', '5''5"–5''10"', 22800,
    'self',
    array['https://picsum.photos/seed/revelo-f6i-cover/1200/900','https://picsum.photos/seed/revelo-f6i-cockpit/1200/900','https://picsum.photos/seed/revelo-f6i-battery/1200/900','https://picsum.photos/seed/revelo-f6i-drivetrain/1200/900','https://picsum.photos/seed/revelo-f6i-wear/1200/900'],
    '[{"text":"Battery — untested, sold as-is","photo_ref":null},{"text":"Tyres — 60% tread","photo_ref":"5"}]',
    null,
    'live', null),

  ('Ninety One', 'Meraki', 2024, 640, 'city', 'One size', null, 38200,
    'certified',
    array['https://picsum.photos/seed/revelo-meraki-cover/1200/900','https://picsum.photos/seed/revelo-meraki-cockpit/1200/900','https://picsum.photos/seed/revelo-meraki-battery/1200/900','https://picsum.photos/seed/revelo-meraki-drivetrain/1200/900','https://picsum.photos/seed/revelo-meraki-wear/1200/900'],
    '[{"text":"Frame — like new, minimal use","photo_ref":null},{"text":"Fenders — original, no scratches","photo_ref":"5"}]',
    '{"percent":95,"cycles":120,"tested_on":"2026-08-28"}',
    'live', now() - interval '5 days'),

  ('Nexzu', 'Roadlark', 2022, 4410, 'hardtail', 'S (16")', '5''1"–5''6"', 26000,
    'self',
    array['https://picsum.photos/seed/revelo-roadlark-cover/1200/900','https://picsum.photos/seed/revelo-roadlark-cockpit/1200/900','https://picsum.photos/seed/revelo-roadlark-battery/1200/900','https://picsum.photos/seed/revelo-roadlark-drivetrain/1200/900','https://picsum.photos/seed/revelo-roadlark-wear/1200/900'],
    '[{"text":"Battery — untested, sold as-is","photo_ref":null},{"text":"Handlebar grips — worn, replace soon, photo 2","photo_ref":"2"}]',
    null,
    'live', null),

  ('Ampere', 'Reo+', 2021, 8020, 'city', 'One size', null, 19500,
    'self',
    array['https://picsum.photos/seed/revelo-reo-cover/1200/900','https://picsum.photos/seed/revelo-reo-cockpit/1200/900','https://picsum.photos/seed/revelo-reo-battery/1200/900','https://picsum.photos/seed/revelo-reo-drivetrain/1200/900','https://picsum.photos/seed/revelo-reo-wear/1200/900'],
    '[{"text":"Battery health lower — priced accordingly","photo_ref":"3"},{"text":"Seat — small tear, photo 5","photo_ref":"5"}]',
    '{"percent":65,"cycles":900,"tested_on":"2026-06-15"}',
    'live', null),

  ('Motovolt', 'Kivo', 2023, 2100, 'folding', 'One size · folds to 70×40×80cm', null, 44900,
    'certified',
    array['https://picsum.photos/seed/revelo-kivo-cover/1200/900','https://picsum.photos/seed/revelo-kivo-cockpit/1200/900','https://picsum.photos/seed/revelo-kivo-battery/1200/900','https://picsum.photos/seed/revelo-kivo-drivetrain/1200/900','https://picsum.photos/seed/revelo-kivo-wear/1200/900'],
    '[{"text":"Hinge — inspected, no play","photo_ref":null},{"text":"Frame — light scuff near fold joint, photo 5","photo_ref":"5"}]',
    '{"percent":90,"cycles":340,"tested_on":"2026-08-20"}',
    'live', now() - interval '12 days'),

  ('EMotorad', 'Doodle', 2023, 1880, 'folding', 'One size', null, 31400,
    'self',
    array['https://picsum.photos/seed/revelo-doodle-cover/1200/900','https://picsum.photos/seed/revelo-doodle-cockpit/1200/900','https://picsum.photos/seed/revelo-doodle-battery/1200/900','https://picsum.photos/seed/revelo-doodle-drivetrain/1200/900','https://picsum.photos/seed/revelo-doodle-wear/1200/900'],
    '[{"text":"Barely used, still has factory stickers","photo_ref":null},{"text":"Tyres — 95% tread, original","photo_ref":"5"}]',
    '{"percent":97,"cycles":150,"tested_on":"2026-08-25"}',
    'live', null),

  ('Hero Lectro', 'C5', 2020, 9800, 'hybrid', 'M (17")', '5''5"–5''10"', 17500,
    'self',
    array['https://picsum.photos/seed/revelo-c5-cover/1200/900','https://picsum.photos/seed/revelo-c5-cockpit/1200/900','https://picsum.photos/seed/revelo-c5-battery/1200/900','https://picsum.photos/seed/revelo-c5-drivetrain/1200/900','https://picsum.photos/seed/revelo-c5-wear/1200/900'],
    '[{"text":"Battery — untested, sold as-is","photo_ref":null},{"text":"Chain — due for replacement, photo 4","photo_ref":"4"}]',
    null,
    'sold', null),

  ('Ninety One', 'Rider+', 2022, 3200, 'mountain', 'L (20")', '5''10"–6''2"', 36700,
    'certified',
    array['https://picsum.photos/seed/revelo-riderplus-cover/1200/900','https://picsum.photos/seed/revelo-riderplus-cockpit/1200/900','https://picsum.photos/seed/revelo-riderplus-battery/1200/900','https://picsum.photos/seed/revelo-riderplus-drivetrain/1200/900','https://picsum.photos/seed/revelo-riderplus-wear/1200/900'],
    '[{"text":"Suspension — serviced, feels smooth","photo_ref":null},{"text":"Frame — light scuff on downtube, photo 5","photo_ref":"5"}]',
    '{"percent":84,"cycles":720,"tested_on":"2026-07-05"}',
    'live', now() - interval '75 days'),

  ('EMotorad', 'X1 Cargo', 2023, 950, 'cargo', 'One size · long-tail', null, 52000,
    'certified',
    array['https://picsum.photos/seed/revelo-x1cargo-cover/1200/900','https://picsum.photos/seed/revelo-x1cargo-cockpit/1200/900','https://picsum.photos/seed/revelo-x1cargo-battery/1200/900','https://picsum.photos/seed/revelo-x1cargo-drivetrain/1200/900','https://picsum.photos/seed/revelo-x1cargo-wear/1200/900'],
    '[{"text":"Cargo deck — original, no cracks","photo_ref":null},{"text":"Kickstand — reinforced for load","photo_ref":null}]',
    '{"percent":91,"cycles":90,"tested_on":"2026-08-30"}',
    'live', now() - interval '8 days'),

  ('Motovolt', 'Urban+', 2021, 5200, 'city', 'One size', null, 28500,
    'self',
    array['https://picsum.photos/seed/revelo-urbanplus-cover/1200/900','https://picsum.photos/seed/revelo-urbanplus-cockpit/1200/900','https://picsum.photos/seed/revelo-urbanplus-battery/1200/900','https://picsum.photos/seed/revelo-urbanplus-drivetrain/1200/900','https://picsum.photos/seed/revelo-urbanplus-wear/1200/900'],
    '[{"text":"Reserved by another buyer — pending handover","photo_ref":null},{"text":"Rear rack — original, sturdy","photo_ref":null}]',
    '{"percent":80,"cycles":860,"tested_on":"2026-05-20"}',
    'reserved', null),

  ('EMotorad', 'T-Rex', 2020, 12000, 'hardtail', 'M (18")', '5''6"–5''11"', 15000,
    'self',
    array['https://picsum.photos/seed/revelo-trex-2020-cover/1200/900','https://picsum.photos/seed/revelo-trex-2020-cockpit/1200/900','https://picsum.photos/seed/revelo-trex-2020-battery/1200/900','https://picsum.photos/seed/revelo-trex-2020-drivetrain/1200/900','https://picsum.photos/seed/revelo-trex-2020-wear/1200/900'],
    '[{"text":"Battery — untested, sold as-is","photo_ref":null},{"text":"Frame — several scuffs from daily use, photo 5","photo_ref":"5"}]',
    null,
    'sold', null)
) as v(brand, model, year, km, type, frame_size, rider_height_range, price,
  listing_type, photos, condition_notes, battery_health, status,
  certified_live_since);

-- range_km / motor_spec / serviced_note (added in
-- 0006_bikes_spec_fields.sql — see that migration's comment for why they
-- exist outside data-model.md) for the bikes just inserted above.
update public.bikes set range_km = 55, motor_spec = '250W rear hub', serviced_note = 'Full tune-up, new brake pads' where brand = 'EMotorad' and model = 'T-Rex+';
update public.bikes set range_km = 60, motor_spec = '250W rear hub', serviced_note = 'Seller-reported: chain replaced recently' where brand = 'Motovolt' and model = 'Hum';
update public.bikes set range_km = 45, motor_spec = '250W rear hub', serviced_note = 'No service record' where brand = 'Hero Lectro' and model = 'F6i';
update public.bikes set range_km = 65, motor_spec = '250W rear hub', serviced_note = 'Pre-delivery inspection, brakes adjusted' where brand = 'Ninety One' and model = 'Meraki';
update public.bikes set range_km = 50, motor_spec = '250W rear hub', serviced_note = 'No service record' where brand = 'Nexzu' and model = 'Roadlark';
update public.bikes set range_km = 40, motor_spec = '250W rear hub', serviced_note = 'Seller-reported: annual service last year' where brand = 'Ampere' and model = 'Reo+';
update public.bikes set range_km = 45, motor_spec = '250W front hub', serviced_note = 'Full tune-up, tyres checked' where brand = 'Motovolt' and model = 'Kivo';
update public.bikes set range_km = 42, motor_spec = '250W front hub', serviced_note = 'Barely used, no service needed yet' where brand = 'EMotorad' and model = 'Doodle';
update public.bikes set range_km = 40, motor_spec = '250W rear hub', serviced_note = 'No service record' where brand = 'Hero Lectro' and model = 'C5';
update public.bikes set range_km = 58, motor_spec = '350W mid-drive', serviced_note = 'Suspension serviced, brakes bled' where brand = 'Ninety One' and model = 'Rider+';
update public.bikes set range_km = 50, motor_spec = '500W mid-drive', serviced_note = 'Full tune-up, load test passed' where brand = 'EMotorad' and model = 'X1 Cargo';
update public.bikes set range_km = 55, motor_spec = '250W rear hub', serviced_note = 'Seller-reported: brake pads replaced' where brand = 'Motovolt' and model = 'Urban+';
update public.bikes set range_km = 45, motor_spec = '250W rear hub', serviced_note = 'No service record' where brand = 'EMotorad' and model = 'T-Rex' and year = 2020;
