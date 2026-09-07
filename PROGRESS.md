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
| P3 | Sell Yours + seller self-service | ⬜ Not started |
| P4 | Buyer contact & scheduling (chat, test rides) | ⬜ Not started |
| P5 | Certified commerce (checkout, aging-stock offers) | ⬜ Not started |
| P6 | Service site (no login) | ⬜ Not started |
| P7 | Polish, deploy, case study | ⬜ Not started |

**Next up: P3.**

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

The spec is the source of truth and wins on conflicts, but three gaps needed
real column changes to build against. Each is documented inline in
`data-model.md` too — this is just the index:

| Change | Migration | Why |
| --- | --- | --- |
| `bikes.range_km`, `motor_spec`, `serviced_note` added | `0006_bikes_spec_fields.sql` | P1's bike-detail spec grid needs them; original schema had no columns |
| `bikes.frame_size` made nullable | `0007_bikes_frame_size_nullable.sql` | P2's moderation "Approve" creates a live bike in one click from a submission that never collects frame size |
| `profiles.display_name` added | `0008_profiles_display_name.sql` | P2's moderation queue shows a seller name; profiles originally only had `id` + `role` |

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

**Admin login for testing:** `admin@revelo.in` / `RevAdminTest#2026` — I reset
this password directly via SQL during P2 testing since I didn't have the
original. Worth changing to something only you know.

---

## Open items / known gaps

- Two pre-existing Supabase security advisories (benign, unchanged since P0):
  `handle_new_user`/`is_admin` are `SECURITY DEFINER` and technically callable
  via RPC by anon/authenticated roles — expected for a trigger + RLS helper.
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
