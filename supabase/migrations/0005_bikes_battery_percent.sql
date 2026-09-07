-- Generated column exposing battery_health->>percent as a plain numeric
-- column. PostgREST can't cleanly filter/sort on a jsonb path from
-- supabase-js, and the marketplace battery filter (P1) needs to do both —
-- "tested battery health only, never defaulted" per data-model.md, so this
-- stays null exactly when battery_health is null.

alter table public.bikes
  add column battery_percent int
  generated always as (((battery_health ->> 'percent'))::int) stored;

create index bikes_battery_percent_idx on public.bikes (battery_percent);
