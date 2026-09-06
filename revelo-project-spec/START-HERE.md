# Revélo — build spec, start here

This folder is the complete spec for a portfolio project: **Revélo**, a used e-bike
marketplace with a certified consignment model, plus a repair/maintenance service
business.

## Read order

1. **This file** — overview, build order, ground rules.
2. `commercial-model.md` — every fee and price in the product. Exact, do not alter.
3. `data-model.md` — the full, final database schema. This supersedes any field list
   inside `reference-design-handoff/README.md`.
4. `P0-foundations.md` through `P7-polish-deploy.md`, **in order**. Each phase depends
   on the ones before it.

## How to work through this

Execute one phase at a time. After finishing a phase:
- Show what was built.
- Stop and wait for confirmation before starting the next phase.

Do not skip ahead to a later phase's screens "for efficiency" — the build order is
deliberate (see each phase file for why), and P1 in particular is the part of this
project being evaluated most directly, so it needs full attention before anything
else gets built around it.

## Ground rules that apply across every phase

- **No real payment gateway, no real WhatsApp/SMS integration, anywhere.** Where a
  screen implies one (checkout payment, seller notifications), mock it — a confirmation
  state, an in-app notification row. This is a portfolio demo with no real backend
  requirement.
- **No external buyer-seller contact of any kind** — no phone, email, or WhatsApp
  shown to a buyer, ever. All contact is in-app. This is a deliberate business rule,
  not an oversight to "fix" — see `P4-contact-scheduling.md` for why.
- **Terminology:** "seller" = the person selling a bike (self-listed or consigned).
  "Admin" = Revélo staff, the business operator. Never use "owner" for the admin role.
  The `reference-design-handoff/README.md` file has already been corrected to this
  terminology throughout.
- If anything in `reference-design-handoff/` (the original wireframe bundle) conflicts
  with a phase file here, **the phase file wins** — that folder is earlier, structural/
  visual reference only, not the final word. Its own README says so at the bottom.
- Take structural and layout inspiration from `reference-design-handoff/screens/*.png`,
  but not its visual design (colors, type, wireframe borders) — use your own or the
  codebase's design system for the actual look.

## Folder contents

```
START-HERE.md                          — this file
commercial-model.md                    — the exact fee/pricing table
data-model.md                          — the final database schema
P0-foundations.md                      — scaffold, schema, auth, deploy pipeline
P1-buyer-core.md                       — marketplace grid + bike detail (the graded part)
P2-admin-core.md                       — inventory, moderation queue, consignment worksheet
P3-sell-yours-seller-portal.md         — Sell Yours flow + seller self-service
P4-contact-scheduling.md               — chat, test-ride booking, notifications
P5-certified-commerce.md               — checkout + aging-stock offers
P6-service-site.md                     — service homepage + booking
P7-polish-deploy.md                    — mobile pass, deploy, case study

reference-design-handoff/              — original wireframe bundle (corrected terminology)
  README.md                            — screen-by-screen spec, read as reference only
  screens/*.png                        — one image per screen group, 2× resolution
  wireframes.html                      — same content, all screens on one canvas

reference-flows/                       — hand-drawn user-flow diagrams
  seller-flow.png                      — seller login → manage listings → certification upsell
  buyer-flow.png                       — buyer browse → inquire/test-ride → outcome
  original-revenue-model-sketch-1.png  — earliest pricing sketch (superseded by commercial-model.md)
  original-revenue-model-sketch-2.png  — same
```

Start with `P0-foundations.md`.
