-- Revélo — core schema
-- Mirrors revelo-project-spec/data-model.md exactly. That file is the source
-- of truth; if this ever drifts from it, the spec wins.

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────
-- profiles
-- ─────────────────────────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('buyer', 'seller', 'admin')),
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- sell_submissions
-- ─────────────────────────────────────────────────────────────────────────
create table public.sell_submissions (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles (id) on delete cascade,
  brand text not null,
  model text not null,
  year int not null,
  km int not null,
  type text not null,
  estimated_range_low numeric,
  estimated_range_high numeric,
  chosen_path text not null check (chosen_path in ('self', 'certify')),
  asking_price numeric,
  seller_photos text[],
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'flagged')),
  automated_checks jsonb,
  created_at timestamptz not null default now()
);

create index sell_submissions_seller_id_idx on public.sell_submissions (seller_id);
create index sell_submissions_status_idx on public.sell_submissions (status);

-- ─────────────────────────────────────────────────────────────────────────
-- bikes
-- ─────────────────────────────────────────────────────────────────────────
create table public.bikes (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles (id) on delete cascade,
  source_submission_id uuid references public.sell_submissions (id) on delete set null,
  brand text not null,
  model text not null,
  year int not null,
  km int not null,
  type text not null,
  frame_size text not null,
  rider_height_range text,
  price numeric not null,
  listing_type text not null check (listing_type in ('self', 'certified')),
  photos text[] not null default '{}',
  condition_notes jsonb not null default '[]',
  -- Omit entirely (null) when untested — meaningful absence, drives the
  -- battery filter in P1. Never default to 0 or 100.
  battery_health jsonb,
  status text not null,
  certified_live_since timestamptz,
  created_at timestamptz not null default now(),
  constraint bikes_status_matches_listing_type check (
    (listing_type = 'self' and status in ('live', 'reserved', 'sold'))
    or
    (listing_type = 'certified' and status in
      ('in_workshop', 'photographed', 'live', 'reserved', 'delivered', 'paid_out'))
  )
);

create index bikes_seller_id_idx on public.bikes (seller_id);
create index bikes_listing_type_idx on public.bikes (listing_type);
create index bikes_status_idx on public.bikes (status);

-- ─────────────────────────────────────────────────────────────────────────
-- certifications
-- ─────────────────────────────────────────────────────────────────────────
create table public.certifications (
  id uuid primary key default gen_random_uuid(),
  bike_id uuid not null references public.bikes (id) on delete cascade,
  submission_id uuid not null references public.sell_submissions (id) on delete cascade,
  points_passed int not null,
  points_total int not null,
  findings jsonb not null default '[]',
  repair_cost numeric not null default 0,
  seller_approved boolean not null default false,
  comps_range_low numeric not null,
  comps_range_high numeric not null,
  comps_sample_size int not null,
  comps_days int not null,
  list_price numeric not null,
  commission_amount numeric not null,
  repair_deduction numeric not null default 0,
  inspection_fee_waived boolean not null default true,
  seller_payout numeric not null,
  created_at timestamptz not null default now()
);

create index certifications_bike_id_idx on public.certifications (bike_id);

-- ─────────────────────────────────────────────────────────────────────────
-- offers (certified-only, aging-stock)
-- ─────────────────────────────────────────────────────────────────────────
create table public.offers (
  id uuid primary key default gen_random_uuid(),
  bike_id uuid not null references public.bikes (id) on delete cascade,
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  proposed_price numeric not null,
  counter_price numeric,
  status text not null default 'pending'
    check (status in ('pending', 'countered', 'accepted', 'rejected')),
  created_at timestamptz not null default now()
);

create index offers_bike_id_idx on public.offers (bike_id);
create index offers_buyer_id_idx on public.offers (buyer_id);

-- ─────────────────────────────────────────────────────────────────────────
-- reservations (certified-only checkout)
-- ─────────────────────────────────────────────────────────────────────────
create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  bike_id uuid not null references public.bikes (id) on delete cascade,
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  offer_id uuid references public.offers (id) on delete set null,
  fulfillment text not null check (fulfillment in ('delivery', 'pickup')),
  warranty_tier text not null
    check (warranty_tier in ('included', 'extended_6mo', 'annual_care')),
  buyer_protection_fee numeric not null,
  delivery_fee numeric not null default 0,
  total numeric not null,
  reservation_amount numeric not null,
  emi_opted boolean not null default false,
  status text not null default 'reserved',
  created_at timestamptz not null default now()
);

create index reservations_bike_id_idx on public.reservations (bike_id);
create index reservations_buyer_id_idx on public.reservations (buyer_id);

-- ─────────────────────────────────────────────────────────────────────────
-- test_rides
-- ─────────────────────────────────────────────────────────────────────────
create table public.test_rides (
  id uuid primary key default gen_random_uuid(),
  bike_id uuid not null references public.bikes (id) on delete cascade,
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  requested_slot timestamptz not null,
  -- self-listed: pending | accepted | rejected
  -- certified: always created as 'accepted' — no seller mediation
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'rejected')),
  rejection_reason text,
  alternative_dates timestamptz[],
  created_at timestamptz not null default now()
);

create index test_rides_bike_id_idx on public.test_rides (bike_id);
create index test_rides_buyer_id_idx on public.test_rides (buyer_id);

-- ─────────────────────────────────────────────────────────────────────────
-- conversations / messages (self-listed only, plain chat)
-- ─────────────────────────────────────────────────────────────────────────
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  bike_id uuid not null references public.bikes (id) on delete cascade,
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (bike_id, buyer_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_role text not null check (sender_role in ('buyer', 'seller_mock')),
  body text not null,
  created_at timestamptz not null default now()
);

create index messages_conversation_id_idx on public.messages (conversation_id);

-- ─────────────────────────────────────────────────────────────────────────
-- service_bookings / service_slots (no login required)
-- ─────────────────────────────────────────────────────────────────────────
create table public.service_bookings (
  id uuid primary key default gen_random_uuid(),
  bike_brand_model text not null,
  issue_category text not null,
  fulfillment text not null check (fulfillment in ('delivery', 'pickup')),
  phone text not null,
  slot_date date not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table public.service_slots (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  slots_available int not null default 0
);

-- ─────────────────────────────────────────────────────────────────────────
-- notifications (mocked in-app, replaces real WhatsApp/SMS)
-- ─────────────────────────────────────────────────────────────────────────
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_role text not null check (recipient_role in ('seller', 'admin')),
  recipient_id uuid references public.profiles (id) on delete cascade,
  type text not null,
  body text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_recipient_id_idx on public.notifications (recipient_id);
