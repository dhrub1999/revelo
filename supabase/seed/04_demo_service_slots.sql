-- Demo data for P3: workshop slot capacity. README's "State & data" section
-- calls out "workshop slot capacity (4 slots, 1 slot) is real availability"
-- as a state that must not be dropped. This is the same service_slots table
-- P6's service booking will use — reused here for P3's seller self-service
-- "request certification" flow, which needs a real slot to pick from
-- (P3-sell-yours-seller-portal.md: "prompt available inspection slots,
-- seller picks one").

insert into public.service_slots (date, slots_available)
values
  (current_date + 2, 4),
  (current_date + 3, 2),
  (current_date + 4, 0),
  (current_date + 5, 3),
  (current_date + 7, 1),
  (current_date + 8, 4)
on conflict (date) do nothing;
