# Data model — Revélo

This is the final, consolidated schema. It supersedes any field list mentioned inside
`reference-design-handoff/README.md` — that file is visual/structural reference only.

Implement as Supabase (Postgres) tables. Types are indicative, not exact SQL.

## profiles
FK to `auth.users`.
- `id`
- `role`: `'buyer' | 'seller' | 'admin'` — a person holds exactly one role in this build.
  One hardcoded admin account; no public admin signup.
- `display_name` — nullable, added post-P0 (see
  `supabase/migrations/0008_profiles_display_name.sql`): P2's moderation queue
  shows a seller name per row, which this table originally had no column for.

## sell_submissions
The entry point for every bike, self-listed or certified.
- `id`
- `seller_id` — FK profiles
- `brand`, `model`, `year`, `km`, `type`
- `estimated_range_low`, `estimated_range_high` — from the comp table, see P3
- `chosen_path`: `'self' | 'certify'`
- `asking_price`, `seller_photos[]` — self path only
- `status`: `'pending' | 'approved' | 'rejected' | 'flagged'`
- `automated_checks`: `{ phone_verified, photos_original, price_in_range, repeat_seller }`

## bikes
The live catalog. Created when a submission is approved (or directly by admin/seller,
see P2/P3).
- `id`
- `seller_id` — FK profiles
- `source_submission_id` — nullable FK sell_submissions
- `brand`, `model`, `year`, `km`, `type`, `frame_size` (nullable — see note below),
  `rider_height_range`, `price`
- `range_km`, `motor_spec`, `serviced_note` — nullable. Added post-P0 (see
  `supabase/migrations/0006_bikes_spec_fields.sql`): the P1 bike-detail spec
  grid requires Range/Motor/Serviced rows that this file originally had no
  columns for. Admin-editable in P2.
- `frame_size` made nullable post-P0 (see
  `supabase/migrations/0007_bikes_frame_size_nullable.sql`): P2's moderation
  "Approve" creates a live bike in one click straight from a sell_submissions
  row, which never collects frame size (P3's Sell Yours fork doesn't ask for
  it). Admin fills it in afterwards via Edit.
- `listing_type`: `'self' | 'certified'`
- `photos[]` — ordered, cover first
- `condition_notes[]` — `{ text, photo_ref (nullable) }`
- `battery_health` — nullable `{ percent, cycles, tested_on }`. Omit the field entirely
  (not zero, not a default) when untested — this is meaningful absence, per the design
  handoff, and it also drives the battery filter (see P1).
- `status`:
  - self-listed: `'live' | 'reserved' | 'sold'`
  - certified: `'in_workshop' | 'photographed' | 'live' | 'reserved' | 'delivered' | 'paid_out'`
- `certified_live_since` — timestamp, certified only. Drives the 60-day offer eligibility
  (see P5).

## certifications
One per certified bike, produced by the consignment worksheet (P2).
- `id`, `bike_id`, `submission_id`
- `points_passed`, `points_total`, `findings[]`
- `repair_cost`, `seller_approved` (bool) — approval is a gate, not a note
- `comps_range_low`, `comps_range_high`, `comps_sample_size`, `comps_days`
- `list_price` — editable, seeded with a suggested value
- `commission_amount`, `repair_deduction`, `inspection_fee_waived` (bool)
- `seller_payout`

## offers
Certified-only, aging-stock negotiation (P5).
- `id`, `bike_id` (certified only), `buyer_id`
- `proposed_price`, `counter_price` (nullable)
- `status`: `'pending' | 'countered' | 'accepted' | 'rejected'`
- `created_at`

## reservations
Certified-only checkout (P5).
- `id`, `bike_id`, `buyer_id`
- `offer_id` — nullable FK; when present, use the negotiated price instead of listing price
- `fulfillment`: `'delivery' | 'pickup'`
- `warranty_tier`: `'included' | 'extended_6mo' | 'annual_care'`
- `buyer_protection_fee`, `delivery_fee`, `total`, `reservation_amount`, `emi_opted`
- `status`

## test_rides
- `id`, `bike_id`, `buyer_id`, `requested_slot`
- `status`:
  - self-listed: `'pending' | 'accepted' | 'rejected'`
  - certified: always created as `'accepted'` — no seller mediation, company already
    holds the bike
- `rejection_reason`, `alternative_dates` — self-listed only

## conversations / messages
Self-listed only. No structured "quote" type — plain chat.
- `conversations`: `id`, `bike_id` (self-listed only), `buyer_id`
- `messages`: `id`, `conversation_id`, `sender_role` (`'buyer' | 'seller_mock'`), `body`,
  `created_at`. After a buyer sends a message, seed a canned seller reply after a short
  delay — there is no live second user session for the seller side of chat.

## service_bookings / service_slots
No login required — unrelated to the buyer/seller contact restriction.
- `service_bookings`: `id`, `bike_brand_model`, `issue_category`, `fulfillment`, `phone`,
  `slot_date`, `status`
- `service_slots`: `id`, `date`, `slots_available`

## notifications
Mocked in-app notification system — replaces any real WhatsApp/SMS integration.
- `id`, `recipient_role` (`'seller' | 'admin'`), `recipient_id`, `type`, `body`,
  `read` (bool), `created_at`

---

## Explicitly NOT in this build
- No `messages.type` / structured quote field — that idea was superseded by the
  `offers` table (see P5). Self-listed contact is plain chat only.
- No real payment gateway, no real WhatsApp Business API integration.
- No seller-vs-seller or multi-tenant marketplace concepts — one business, one admin.
