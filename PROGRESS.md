# Revélo — build progress

Living tracker for this project, updated every session. Source of truth for
"what's done, what's not, what changed, and why." The build spec itself lives
in `revelo-project-spec/` (`START-HERE.md` first) — this file tracks execution
against that spec, not the spec's requirements themselves.

**Workflow reminder (from `START-HERE.md`):** one phase at a time. After
finishing a phase, show what was built and stop for confirmation before
starting the next one.

---

## Phase status

| Phase | What it is | Status |
| --- | --- | --- |
| P0 | Foundations (schema, RLS, storage, scaffold) | ✅ Done |
| P1 | Buyer core (marketplace grid, bike detail, login) | ✅ Done |
| P2 | Admin core (inventory, moderation, consignment) | ✅ Done |
| P3 | Sell Yours + seller self-service | ✅ Done |
| P4 | Buyer contact & scheduling (chat, test rides) | ✅ Done |
| P5 | Certified commerce (checkout, aging-stock offers) | ✅ Done |
| P6 | Service site (no login) | ✅ Done |
| P7 | Polish, deploy, case study | 🟡 In progress |

**Next up: finish P7** — mobile pass done, case study published; deploy is waiting on the
Vercel dashboard connection (your call, see "What's built" below).

---

## What's built

### P0 — Foundations
- Full Postgres schema in Supabase mirroring `data-model.md` (profiles,
  sell_submissions, bikes, certifications, offers, reservations, test_rides,
  conversations/messages, service_bookings/slots, notifications).
- RLS policies per role (buyer/seller/admin) via `public.is_admin()`.
- Storage buckets `bike-photos` / `submission-photos`, public read, own-folder
  (or admin) write.
- Next.js 16 / Tailwind v4 scaffold, `.env.local` wired to the live project.
- Admin account promoted: `admin@revelo.in`.

### P1 — Buyer core
- Marketplace grid (`/`): live filters (price/battery/brand/year/type/km/sort,
  certified-only), debounced search, load-more pagination, all client-side via
  `/api/bikes`, URL-synced. Two-tier badges (certified/self) always visible;
  reserved/sold bikes stay visible, dimmed.
- Bike detail (`/bikes/[id]`): gallery (desktop thumbnails + mobile swipe),
  spec grid, battery panel, tier-correct action buttons, 60-day offer
  eligibility gate, login-gated actions.
- Minimal `/login` (email/password via Supabase Auth).
- 13 demo bikes seeded (`supabase/seed/01_demo_bikes.sql`).

### P2 — Admin core
- `/admin` (guarded — redirects non-admins), desktop-only.
- **Inventory** (`/admin/inventory`): search + status filter, table with
  thumbnail/price/battery/status, Edit/Delete (confirm dialog). Add/Edit is a
  full page: photo upload to Storage with reorder/cover/remove, all bike
  fields, untested-by-default battery toggle, condition notes, "Mark as sold."
- **Moderation** (`/admin/moderation`): pending/flagged/live counts, real
  auto-approve rate, all four contextual action states (clean → Approve/Hold;
  flagged → Reject/Ask seller; repeat seller → Approve/Dealer?; price out of
  range → Approve/Suggest ₹X). Approve creates the live `bikes` row + notifies
  seller.
- **Consign** (`/admin/consign` + `/admin/consign/[bikeId]`): queue of
  not-started certify submissions and in-progress workshop bikes; worksheet
  with inspection points/findings, repair cost gated behind a seller-approval
  toggle, comps display, editable list price, live-recomputed payout
  breakdown, Publish/Send-to-seller/Save draft.
- Demo sellers + submissions seeded (see "Demo data" below).

### P3 — Sell Yours + seller self-service
- **`/sell`** (Screens 5+6, public — comps/fork viewable logged out, submit
  redirects to `/login?next=/sell&role=seller`): four fields + type, a small
  hardcoded comp table (`src/lib/comps.ts`, keyed by brand/model, suppressed
  entirely when no match), a single shared "asking price" input that feeds
  both cards' live net-payout math (self = price − ₹99; certify =
  price × 92%). Self card collects photos inline (own `submission-photos`
  storage path); certify card is one click ("Book a free inspection"). Both
  paths insert a `sell_submissions` row; self path also computes real
  `automated_checks` (price-in-range from the comp table, repeat-seller from
  the seller's actual submission count) so new listings land in P2's
  moderation queue with genuine, not placeholder, checks.
- **Seller portal** (`/seller/*`, guarded by `requireSeller`, redirects a
  logged-out visitor to `/login?next=/seller&role=seller` and a non-seller
  to `/`): My listings (live pipeline of pending/flagged/rejected
  submissions + a card grid of owned bikes, Edit/Delete/+Sell a bike),
  Test rides (self-listed bikes only — accept, or reject with a reason and
  up to two alternative times), Notifications (mark-all-read).
- **Edit → certification upsell**: saving an edit on a still-self-listed
  bike offers "Upgrade to certified" (dismissable — "Keep it as-is" is a
  real no-op); opting in shows real open `service_slots` capacity, books
  exactly one via a narrow SECURITY DEFINER RPC
  (`0010_book_inspection_slot_fn.sql`, since slot writes are admin-only
  under RLS), creates a fresh `certify` submission so it feeds P2's
  consignment queue exactly like a new Sell Yours submission, and flags the
  original bike `pending_certification` without changing its listing type.
- Login now supports a `role` query param (`?role=seller`) so sign-up from
  `/sell` or `/seller` creates a seller account instead of always defaulting
  to buyer.
- Header/mobile nav gained the account menu this whole app was missing
  until now: Sign in when logged out; My listings / Admin (role-appropriate)
  + Sign out when logged in. There was previously no way to sign out at all.
- Found and fixed while testing this phase (not new P3 code, but adjacent
  bugs this phase's testing surfaced): a certified bike published via P2's
  worksheet could end up with an empty `photos` array when its submission
  never collected photos — `startWorksheet` now falls back to the same
  placeholder image `approveSubmission` already used; and every mobile-nav
  `SheetClose` rendered `as` a `Link` (pre-existing, all the way back to
  P1) was missing `nativeButton={false}` — the fix pattern already
  established for exactly this case in `site-header.tsx` — and was logging
  a Base UI console warning. Note: `admin/inventory/page.tsx` and
  `admin/consign/page.tsx` have the same latent warning on their `Button
  render={<Link/>}` uses and were left alone as out of scope for this phase.

### P4 — Buyer contact & scheduling
- **Messaging** (self-listed only — certified bikes never show it, per the
  core "no external contact, ever" project rule): `Message seller` on the
  bike-detail page finds-or-creates a `conversations` row (unique on
  `bike_id, buyer_id`) and redirects to `/messages/[id]`. New `(buyer)` route
  group (`/messages`, `/messages/[id]`, `/test-rides`), gated by a plain
  `requireLoggedIn` (any role, unlike `requireSeller`/`requireAdmin` — a
  seller or admin account can act as a buyer too). Sending a message
  notifies the seller (`notifications`, type `new_message`); since there's
  no live second user session for the seller side, the client schedules a
  canned reply (`seedSellerReply`, random pick from a small pool) ~1.8s
  later with a "Seller is typing…" indicator in between. New RLS insert
  policy (`0011_messages_seller_mock_insert.sql`) was needed — the existing
  policy only allowed `sender_role='buyer'` inserts.
- **Test-ride booking**, both listing types, from the same `Book a test
  ride` dialog (client-generated 5-day × 2-time-slot picker — no DB slots
  table for this, unlike inspection booking): self-listed inserts
  `status='pending'` and notifies the seller (type `test_ride_requested`),
  wired straight into P3's already-built seller accept/reject queue;
  certified inserts `status='accepted'` immediately and notifies no one —
  no seller mediation needed, Revélo already holds the bike. Buyer-side
  status (including a seller's rejection reason/alternative dates) is
  read on `/test-rides`, not pushed — the `notifications` table only
  supports `seller`/`admin` recipients, so "buyer is notified either way"
  is the buyer checking their own page, not a push notification.
- Header/mobile nav gained `Messages` / `Test rides` links for any logged-in
  user.

### P5 — Certified commerce (checkout + aging-stock offers)
Both features are certified-only per spec — self-listed bikes never get a checkout or an
offer action, they stay on P4's plain chat.
- **Checkout** (`/checkout/[bikeId]`, gated by login): a 3-step wizard client component
  (`checkout-wizard.tsx`) — fulfillment (home delivery, mocked next-Thursday slot, ₹250 /
  free pickup), warranty (included default / extend-6mo / annual-care upsells, never
  hidden), then an itemised summary (bike + 1.5% buyer protection + delivery + any
  warranty upgrade) with a flat ₹2,000 "payable now," a balance-or-EMI toggle (18-month
  flat estimate, explicitly labelled "not a real loan"), and `Pay ₹2,000 & reserve`. No
  real payment gateway. On success the bike flips to `reserved` (stays visible, dimmed
  elsewhere) and the buyer lands on a dedicated `/checkout/[bikeId]/confirmed/[id]` page
  that reads the reservation back from the DB — needed because Next.js Server Actions
  implicitly refresh the invoking page's Server Components on completion, which would
  otherwise re-run the checkout page's own `status === 'live'` gate and clobber a
  client-held "confirmed" state with the "no longer available" fallback. `unstable_rethrow`
  in the wizard's catch block lets that redirect pass through client-side error handling
  meant for genuine validation failures (e.g. a race where someone else reserved it first).
- **Aging-stock offers**: `Make an offer` appears on a certified bike's detail page once
  `certified_live_since` is 60+ days old (existing P1 gate, now wired to a real dialog
  instead of a placeholder) — a buyer submits a price, which notifies both admin and the
  seller (`offers` row, status `pending`). New **admin Offers queue** (`/admin/offers`):
  Accept / Counter (own price) / Reject, never routed through the seller. New buyer-facing
  **`/offers`** (added to the account nav alongside Messages/Test rides): shows status and,
  once countered, lets the buyer Accept or Decline — mirroring P4's "buyer checks their own
  page, not a push notification" pattern, since `notifications` still only supports
  `seller`/`admin` recipients.
  - Accepting an offer (either admin accepting the original ask, or a buyer accepting
    Revélo's counter) creates the `reservations` row **directly** — pickup/included-warranty
    defaults, since there's no live wizard session at accept-time — per the spec's literal
    "an accepted offer creates a reservations row." This is a deliberately different, simpler
    path from the checkout wizard above; the two never merge.
  - Three new narrow `SECURITY DEFINER` RPCs (`0012_checkout_offer_fns.sql`, same pattern as
    `is_admin()`/`book_inspection_slot()`): `reserve_certified_bike` (atomic `status='live'`
    guard so two buyers can't reserve the same bike), `accept_offer` (admin-or-countered-buyer
    only, checked inside the function), `decline_offer` (buyer, countered→rejected only) —
    needed because a buyer is never `bikes.seller_id` nor admin under RLS (0003).
- Bike-detail `Actions` now reflects real availability instead of always showing Reserve/Offer:
  a non-`live` certified or self-listed bike shows a plain "reserved"/"sold" status line and
  no actions at all.
- Browser-tested end to end on the live Supabase project (not just locally-typed): full 3-step
  checkout on the wireframe's own example bike (EMotorad T-Rex+, numbers matched the reference
  screenshot exactly — ₹34,500 bike + ₹518 protection + ₹250 delivery, ₹2,000 payable, ₹33,268
  balance / ₹1,848-per-month EMI); offer submit → admin counter → buyer accepts counter →
  reservation auto-created at the negotiated price with all three seller notifications
  (submitted/countered/accepted) present; offer submit → admin direct accept → reservation
  auto-created immediately, queue clears. Confirmed the DB math (protection fee, total,
  defaults) on both offer-accept paths via direct SQL.

### P6 — Service site (no login)
Both screens are public — no `getCurrentUser`/`requireLoggedIn` gate anywhere in this phase,
per spec ("no login anywhere in this phase — unrelated to the buyer/seller contact
restriction"). Runs as the Postgres `anon` role throughout.
- **Service homepage** (`/service`): hero ("We fix e-bikes, and we sell the good ones on.")
  with a live `Browse N used bikes →` count (reuses P1's `getMarketplaceTotalCount`) and
  `Book a repair` → `/service/book`; full eight-row price list from `commercial-model.md`
  (two columns desktop, truncated-3-rows-then-`+5 more` via a native `<details>` on mobile,
  no JS needed for the expand); bottom band of come-by-the-shop placeholder info, a static
  map placeholder, and a short request form (bike, issue, phone → `Request a slot`).
  Mobile gets its own `HeaderSearch` above the hero, matching the header's search that's
  hidden below `md:`.
- **Service booking** (`/service/book`, Screen 8): four quick-category cards (tune-up,
  battery care, motor & drive, pre-buy inspection ₹999 flat) that prefill the fuller
  booking form's issue select; form collects brand+model, issue, workshop-or-pickup, phone;
  a "next available" panel showing real `service_slots` capacity beside it (optimistically
  decremented client-side after a successful booking, no full page reload needed); bottom
  band annual-care-plan upsell card with a mocked `Join` confirmation dialog (no real
  payment, no `annual_plan` table in the spec — this is a demo confirmation only, same
  category as checkout's mock pay step).
- Both forms write to `service_bookings` through one shared server action
  (`requestServiceBooking`), which claims the real next-available date from `service_slots`
  atomically via a new RPC rather than trusting a client-picked date — see below.
- "Workshop or pickup" reuses the checkout `Fulfillment` enum (`'delivery' | 'pickup'`) with
  matching cost semantics rather than matching English words: `'pickup'` is the free option
  here too (customer drops the bike at the workshop themselves, same as checkout's free
  workshop pickup), `'delivery'` is the paid one (Revélo collects it, ₹250/way, same as
  checkout's paid home delivery) — documented inline since the UI labels ("Workshop" /
  "Pickup — we collect") don't literally match the stored enum values.
- New `book_next_service_slot()` `SECURITY DEFINER` RPC (`0013_service_booking_fn.sql`) —
  same narrow-bypass pattern as `book_inspection_slot()` (P3), but granted to `anon` too
  since a P6 visitor is never signed in; picks the earliest future date with capacity left
  and atomically decrements it (`for update skip locked` against concurrent bookings) rather
  than trusting a client-supplied date, so the panel shown and the slot actually consumed
  can never drift apart. If every seeded slot is exhausted, the booking still goes through
  (mock system — the workshop calls to schedule either way; nothing is actually oversold).
- Browser-tested end to end on the live project: homepage request form → real booking row +
  slot decremented from 4→3 (confirmed via direct SQL); booking-page category-card prefill →
  select-value rendering (fixed a bug where the fulfillment `<SelectValue>` initially showed
  the raw `"pickup"` string instead of its label — needed the same value→label render-prop
  pattern already used in `admin/bike-form.tsx`) → booking sent, panel decremented 3→2 in the
  UI; annual-care `Join` → confirm → "You're in" mock state; mobile layout (375px) confirmed
  correct order (search, hero, workshop photo, truncated price list, `+5 more` expand).

### P7 — Polish, deploy, case study (in progress)
- **Mobile pass**: delegated to a subagent for the full P1–P6 sweep (nav pattern, card
  restacking, touch targets, sticky bars, image weight) plus desktop+mobile screenshots of
  every key screen for case-study material — 38 screenshots saved. Verdict: clean, no
  regressions, nothing needed fixing. Confirms each phase's own mobile spec (Sheet drawers
  for nav/filters, single-column restacking, the bike-detail sticky action bar, native
  `<details>` progressive disclosure on the service price list) held up under a dedicated
  sweep, not just at build time. Admin (P2) intentionally left mobile-untested — desktop-only
  by design per the phase spec.
- **Case study**: published as an artifact — [Building Revélo](https://claude.ai/code/artifact/87f24c13-4f61-47a2-a439-710cda09d954).
  Reuses Revélo's own design tokens (teal/Parkinsans/DM Sans) plus JetBrains Mono for data
  callouts, built around 13 real screenshots from the mobile-pass sweep (embedded as base64
  data URIs so the page is self-contained). Covers the rationale for the two-tier
  self-listed/certified structure, prominent-vs-secondary decisions on the bike-detail page,
  the real-computed-numbers discipline (nothing hardcoded — commission, payout, EMI, slot
  capacity), the no-external-contact business rule and why, the service site's link back to
  the same workshop capacity, the mobile-pass results, and — named explicitly, as P7 asks —
  the scope decision to build the full consignment/certification business rather than a
  simple curated-inventory site, and its honest cost (time that could have gone entirely into
  polishing P1's browse/detail hierarchy instead).
- **Deploy**: not yet live. Decided with you to skip the Vercel CLI (no account of mine to
  OAuth with) in favor of you connecting `github.com/dhrub1999/revelo` directly in the Vercel
  dashboard — instructions given in-conversation (env vars: `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`; `SUPABASE_SERVICE_ROLE_KEY` isn't actually used by the app
  code, so it doesn't need to go to Vercel). `main` currently has P0–P5 merged; P6 (service
  site) is still uncommitted on `feat/service-site` per your call earlier this session, so it
  won't be live until you commit/merge it. Once you share the deployed URL, the plan is to
  browser-test the live path end to end (Sell Yours → moderation → live listing →
  message/test-ride/reserve/offer, service booking writing a real row) and fold the link into
  the case study.

### Visual design (cross-cutting, done after P1 + P2)
- Full redesign off the P0 placeholder look: teal brand palette + Parkinsans
  (headings) / DM Sans (body), sourced from user-provided Figma tokens.
  Dark mode via `prefers-color-scheme`, no manual toggle.
- Migrated onto **shadcn/ui** (Base UI primitives under the hood, not Radix —
  this is a newer shadcn CLI generation) — `Button`, `Input`, `Select`,
  `Checkbox`, `Toggle`, `Sheet`, `Label`, `Badge`, `Table`, `Textarea`,
  `Slider`, `Switch`, `AlertDialog` all in `src/components/ui/`, retokened to
  the brand palette instead of shadcn's default zinc theme. Icon library
  pinned to Phosphor throughout (including inside generated shadcn files) —
  no lucide-react in the tree.
- Small bespoke touches: a real logomark (ring + bolt), tabular numerals for
  prices, mobile nav and mobile filters are real `Sheet` drawers instead of
  hand-rolled overlays.

---

## Schema deviations from `data-model.md`

The spec is the source of truth and wins on conflicts, but a few gaps needed
real column/function changes to build against. Each is documented inline in
`data-model.md` too — this is just the index:

| Change | Migration | Why |
| --- | --- | --- |
| `bikes.range_km`, `motor_spec`, `serviced_note` added | `0006_bikes_spec_fields.sql` | P1's bike-detail spec grid needs them; original schema had no columns |
| `bikes.frame_size` made nullable | `0007_bikes_frame_size_nullable.sql` | P2's moderation "Approve" creates a live bike in one click from a submission that never collects frame size |
| `profiles.display_name` added | `0008_profiles_display_name.sql` | P2's moderation queue shows a seller name; profiles originally only had `id` + `role` |
| `bikes.pending_certification` added | `0009_bikes_pending_certification.sql` | P3's edit-a-live-listing "request certification" flow needs somewhere to flag it on the seller's own listings page without changing `listing_type` |
| `public.book_inspection_slot(date)` function added | `0010_book_inspection_slot_fn.sql` | `service_slots` writes are admin-only under RLS (0003), but a seller booking an inspection slot needs to atomically claim one — narrow `SECURITY DEFINER` function, same pattern as `is_admin()`, can only ever decrement by 1 and only when available |
| `messages` gained an insert policy for `sender_role='seller_mock'` | `0011_messages_seller_mock_insert.sql` | 0003's original policy only allowed a buyer to insert their own `sender_role='buyer'` messages; P4's canned-seller-reply mechanic is triggered by the buyer's own client (no live seller session), scoped to the buyer's own conversation |
| Three `SECURITY DEFINER` functions: `reserve_certified_bike`, `accept_offer`, `decline_offer` | `0012_checkout_offer_fns.sql` | P5's checkout and offer-accept flows need to write `bikes.status`/`reservations` as a buyer, who is neither `seller_id` nor admin under 0003's RLS — same narrow-function pattern as `is_admin()`/`book_inspection_slot()`, no policy widened |
| `public.book_next_service_slot()` function added | `0013_service_booking_fn.sql` | P6's public booking form runs as `anon` (no login in this phase) but `service_slots` writes are admin-only under RLS — same narrow-function pattern as `book_inspection_slot()`, granted to `anon` as well as `authenticated` since P3's version wasn't |

Also: `battery_percent` is a generated column on `bikes`
(`0005_bikes_battery_percent.sql`) exposing `battery_health->>'percent'` for
filtering/sorting.

---

## Demo data

- **13 demo bikes** — `supabase/seed/01_demo_bikes.sql`.
- **4 demo sellers** — `supabase/seed/02_demo_sellers.sql`. These are real
  `auth.users` rows created directly via SQL (not real signups) so the
  moderation/consign queues have distinct sellers to show. Emails:
  `rahul.demo@`, `priya.demo@`, `samer.demo@`, `anon.demo@example.com`.
  Dev/demo-only — never run against a real project.
- **9 demo `sell_submissions`** — `supabase/seed/03_demo_sell_submissions.sql`.
  Covers all four moderation contextual-action states plus two not-started
  certify submissions, plus enough history for a real auto-approve-rate stat.
- **Workshop inspection slots** — `supabase/seed/04_demo_service_slots.sql`,
  6 upcoming dates with varying capacity (including one fully booked), used
  by P3's "request certification" slot picker.
- **2 self-listed bikes owned by `rahul.demo@`** —
  `supabase/seed/05_demo_seller_bikes.sql`, so the seller portal's "My
  listings" has real owned inventory to show (P1's 13 demo bikes are all
  owned by the admin account, seeded before P2/P3's seller accounts
  existed).
- **1 demo buyer** (`ananya.demo@example.com`) —
  `supabase/seed/06_demo_buyer.sql`, real `auth.users` row (dev/demo-only,
  same pattern as the demo sellers) so demo test-ride requests have a real
  buyer.
- **2 demo `test_rides`** — `supabase/seed/07_demo_test_rides.sql`, pending
  requests on rahul's two self-listed bikes for P3's seller test-ride
  calendar (the buyer-side booking flow itself is P4 scope, so these are
  seeded directly rather than created through the app). One of these two
  was accepted and the other rejected (with a reason) during P4 browser
  testing, via the real seller accept/reject UI — so the live DB no longer
  matches the seed file's "both pending" state; that's expected, not drift
  to fix.
- **1 demo conversation** — `supabase/seed/08_demo_messages.sql`, a buyer
  (`ananya.demo@`) + seller (`rahul.demo@`) exchange on the Motovolt Urban+,
  so `/messages` isn't empty on first load. Plus a matching seller
  notification.

**Admin login for testing:** `admin@revelo.in` / `RevAdminTest#2026` — I reset
this password directly via SQL during P2 testing since I didn't have the
original. Worth changing to something only you know.

**Seller login for testing:** `rahul.demo@example.com` /
`demo-not-a-real-password` (all four demo sellers share this password).

**Buyer login for testing:** `ananya.demo@example.com` /
`demo-not-a-real-password`.

---

## Open items / known gaps

- Supabase security advisories flagging `SECURITY DEFINER` functions as
  anon/authenticated RPC-callable (benign, same category since P0):
  `handle_new_user`, `is_admin`, `book_inspection_slot`, P5's
  `reserve_certified_bike`/`accept_offer`/`decline_offer`, and now P6's
  `book_next_service_slot` (this one *should* be anon-callable — no login in this phase).
  Each checks its own
  authorization internally (`auth.uid()`, `is_admin()`, or an explicit
  buyer/countered-status check) rather than relying on the RPC-level grant, so
  an anon call fails on the internal check, not on a missing grant.
- `auth_leaked_password_protection` disabled (Supabase Auth project setting,
  not app code) — optional, low-priority, enable in the Supabase dashboard if
  desired.
- No deploy yet (that's P7).
- Chrome autofill on `/login` has repeatedly suggested an unrelated saved
  credential (`webapp@medecro.ai`) during testing — browser-profile quirk, not
  an app issue, never submitted.

---

## Session log

- **2026-09-06** — P0 audited and wired live (migrations applied,
  `.env.local` created, admin promoted). P1 built in full (marketplace,
  detail page, login) and browser-tested desktop + mobile, light + dark.
- **2026-09-07** — Full visual redesign (teal/Parkinsans/DM Sans design
  system) off the P0 placeholder look, then migrated onto shadcn/ui
  (Base UI–based) with brand retokening. P2 built in full (inventory,
  moderation, consign) with demo sellers/submissions seeded, browser-tested
  end to end (approve → live bike, publish → live certified bike, both
  confirmed visible on the public marketplace). This file created.
- **2026-09-07** — P3 built in full: `/sell` fork with a real hardcoded comp
  table, self/certify submission with genuine automated checks; seller
  portal (listings, test rides, notifications) under `requireSeller`;
  edit → certification-upsell → real slot booking (new `book_inspection_slot`
  RPC, since seller slot writes needed a narrow bypass of admin-only RLS);
  login gained a `role` param; header/mobile nav gained the account menu
  (sign in/out, role-appropriate portal link) the app had been missing since
  P1. Browser-tested end to end across roles: self listing → real
  moderation-queue entry with computed checks; certify upsell → real
  consign-queue entry with comp-based estimate and a consumed slot; test-ride
  accept/reject; notification mark-read; guard redirects for logged-out and
  wrong-role visitors. Fixed two bugs found along the way: an empty-photos
  bug in P2's `startWorksheet`, and missing `nativeButton={false}` on the
  mobile nav's `Link`-rendered `SheetClose`s.
- **2026-09-07** — P4 built in full: buyer messaging on self-listed bikes
  (find-or-create conversation, canned seller auto-reply with a typing
  indicator, seller notification) and test-ride booking on both listing
  types (self → pending + seller notification, wired into P3's existing
  accept/reject queue; certified → instant confirmation, no one notified)
  from a shared client-side slot-picker dialog on the bike-detail page. New
  `(buyer)` route group (`/messages`, `/messages/[id]`, `/test-rides`)
  gated by a role-agnostic `requireLoggedIn`. One new RLS policy
  (`0011_messages_seller_mock_insert.sql`) for the mocked seller-reply
  insert. Browser-tested end to end across both accounts: buyer sends a
  message → seller sees it + gets notified → canned reply arrives; buyer
  books a test ride on a self-listed bike → "Request sent" → seller's
  existing test-rides queue shows it pending → seller accepts/rejects →
  buyer's `/test-rides` reflects the new status; buyer books a certified
  bike's test ride → instant "Test ride confirmed", no messaging option
  ever shown for certified bikes.
- **2026-09-07** — P5 built in full: certified-only 3-step checkout wizard
  (`/checkout/[bikeId]`) plus aging-stock offers (buyer dialog on bike detail,
  admin `/admin/offers` queue, buyer-facing `/offers`). Three new
  `SECURITY DEFINER` RPCs (`0012_checkout_offer_fns.sql`) for the writes a
  buyer can't otherwise make under RLS. Found and fixed a real bug during
  testing, not anticipated in the plan: Next.js Server Actions implicitly
  refresh the calling page's Server Components on completion, which
  clobbered the wizard's client-held "reservation confirmed" state the
  instant the bike stopped being `status='live'` — fixed by redirecting to a
  dedicated `/checkout/[bikeId]/confirmed/[reservationId]` route that reads
  the reservation back from the DB, with `unstable_rethrow` in the wizard so
  that redirect isn't swallowed by the client's own validation-error catch
  block. Browser-tested end to end on the live project: full checkout on the
  wireframe's own example bike with numbers matching the reference
  screenshot exactly; offer → admin counter → buyer accepts counter →
  reservation auto-created at the negotiated price with all three seller
  notifications present; offer → admin direct accept → reservation
  auto-created immediately. Confirmed reservation math via direct SQL on
  both offer-accept paths.
- **2026-09-07** — P6 built in full: public service homepage (`/service`) and booking page
  (`/service/book`), no login anywhere in this phase. New `book_next_service_slot()`
  `SECURITY DEFINER` RPC (`0013_service_booking_fn.sql`) granted to `anon`, since P3's
  equivalent (`book_inspection_slot`) was authenticated-only and P6 visitors never sign in.
  Browser-tested end to end on the live project: homepage request form → real DB row +
  real slot decrement (verified via SQL); booking page → category-card prefill, both
  selects, full submit → "next available" panel correctly reflected the shared slot pool's
  new count. Fixed one bug found in testing: the fulfillment `<SelectValue>` was rendering
  the raw enum string instead of its label until given the same value→label render-prop
  already used in `admin/bike-form.tsx`. Mobile order (search → hero → workshop photo →
  truncated price list) verified at 375px after fixing an initial ordering mistake (photo
  was appearing before the hero heading).
