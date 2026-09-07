-- Bike-detail spec grid (P1-buyer-core.md) needs range, motor, and a
-- service note, but data-model.md never gave bikes columns for them —
-- confirmed against P2's admin edit fields too, which have the same gap.
-- Adding them here rather than inventing per-bike display copy with no
-- backing data; these stay nullable and become admin-editable in P2.

alter table public.bikes
  add column range_km int,
  add column motor_spec text,
  add column serviced_note text;
