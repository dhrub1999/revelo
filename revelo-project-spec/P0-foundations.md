# P0 — Foundations

**Goal:** a scaffolded, deployable project with the full schema and auth in place. No
real feature screens yet.

## Tech stack
- Next.js (App Router), TypeScript, Tailwind CSS
- Supabase — Postgres tables per `../data-model.md`, plus Auth (email/password) and
  Storage (bike + submission photos)
- Deploy target: Vercel
- No real payment gateway, no real WhatsApp/SMS integration anywhere in this project

## Auth
Three roles: `buyer`, `seller`, `admin` (see `profiles.role` in the data model).
- Browsing (marketplace grid, bike detail, service site) is open to everyone, no login.
- Messaging, test-ride booking, checkout/reservation, and making an offer all require a
  logged-in buyer.
- Sellers get their own account to manage their own listings (see P3).
- One hardcoded admin account for Revélo staff. No public admin signup.

## Tasks
1. Scaffold the Next.js project.
2. Create every table in `../data-model.md` in Supabase, with RLS policies appropriate
   to each role (buyers can't edit other buyers' reservations, sellers can only edit
   their own bikes, admin can see everything).
3. Set up Supabase Auth for all three roles.
4. Set up Supabase Storage buckets for bike/submission photos.
5. Basic layout shell + design tokens (colors, type scale, spacing) — take structural
   cues from `reference-design-handoff/`, but do not copy its wireframe colors/type
   sizes; those are explicitly wireframe conventions, not the intended visual design.
6. Deploy an empty shell to Vercel to confirm the pipeline works end to end.

## Explicitly out of scope here
No bike data, no pages beyond a placeholder home route. This phase is infrastructure
only — the point is that everything after this can focus purely on features.
