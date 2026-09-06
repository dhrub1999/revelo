# Handoff: Revélo — hybrid used e-bike marketplace + service business

## Overview

Revélo is a used e-bike marketplace and repair workshop operating in Pune, India. The product has three audiences in one app:

1. **Buyers** browse used e-bikes. Every card shows measured battery health as the headline trust signal.
2. **Sellers** list a bike one of two ways — do it themselves for a ₹99 listing fee, or hand it to Revélo for certification and consignment at 8% of the sale price.
3. **Anyone with an e-bike** books service, regardless of where they bought the bike. Service is the larger of the two businesses.

Admin screens cover the two operational jobs this creates: moderating listings Revélo does not own, and pricing bikes Revélo is consigning.

## About the design files

The files in this bundle are **design references created in HTML**. They are prototypes of intended structure and behavior, not production code to lift. `wireframes.html` opens directly in a browser; `screens/` holds a PNG per screen group.

Your job is to **recreate these designs in the target codebase**, using its existing framework, component library, and conventions. If no codebase exists yet, choose an appropriate stack and implement there. Do not port the wireframe HTML, its inline styles, or its class names.

## Fidelity — and how to treat it

These are **low-fidelity wireframes**. They fix *what* is on each screen, *what it is called*, and *what it does*. They do not fix visual design.

**Take structural inspiration from the wireframes. Do not follow them literally.**

- The grey hatched boxes are image placeholders, not UI. The grey bars are placeholder text runs.
- Hand-drawn-looking headings, the 1.5px black outlines, the tight 9–13px type, and the beige background are all wireframe conventions for legibility at small scale. None of it is the intended visual design. Apply the codebase's own design system instead.
- Proportions, widths and paddings in the wireframes are for fitting many frames on one canvas. Treat them as relative hierarchy only, not measurements.

**Do not invent.** Everything in this README and the wireframes is a deliberate product decision. If a screen, field, state, or flow is not shown here, it has not been designed — do not fill the gap with a guess. Build what is specified, leave a clear TODO where something is missing, and list your open questions rather than inventing:

- No new pricing, fees, percentages, or numbers. The commercial model below is exact.
- No new pages, tabs, nav items, or sections.
- No new copy where copy is given. Where copy is given verbatim below, use it verbatim.
- No invented brands, bike models, testimonials, review counts, or stats. Bike names in the wireframes are real Indian e-bike brands used as sample data — keep them as sample data, do not present them as inventory claims.
- Where the wireframes show a grey placeholder bar, the real copy does not exist yet. Leave it as an obvious placeholder, not filler prose.

## Commercial model (exact — do not alter)

The seller pays. Buyers pay a small protection fee at checkout.

| Line | Amount | Applies to |
| --- | --- | --- |
| Seller listing fee | ₹99 one-time | Self-listed bikes |
| Consignment commission | 8% of sale price | Certified bikes |
| Inspection fee | ₹1,499, waived on sale | Certified only, charged if the seller withdraws after inspection |
| Repairs during certification | At cost, deducted from sale price, seller-approved first | Certified only |
| Buyer protection | 1.5% of bike price | Certified checkout |
| Delivery | ₹250 per way, free on annual plan | Optional |
| Reservation deposit | ₹2,000, refundable 48h | Certified checkout |
| Extended warranty | +₹3,499 (6 months) / +₹4,999 (annual care) | 3 months included free |
| Annual care plan | ₹4,999 / year | Two tune-ups, battery report, free pickup |
| Service — tune-up | from ₹899 | Any brand |
| Service — battery diagnostics | from ₹499 | Any brand |
| Service — brake service | from ₹649 | Any brand |
| Service — battery replacement | from ₹7,500 | Any brand |
| Service — motor repair | from ₹2,400 | Any brand |
| Service — firmware & diagnostics | from ₹399 | Any brand |
| Pre-buy inspection | ₹999 | A bike the customer found elsewhere |

Two rules that shape the data model:

- **Inventory is consignment-only.** Revélo never takes ownership. The bike stays the owner's until a buyer pays. Seller is paid within 24h of handover.
- **Two listing tiers coexist in one grid.** `self-listed` (moderated only — Revélo has never seen the bike) and `certified` (inspected, photographed, priced, delivered, warrantied). The distinction must be visible on every card and never blurred.

---

## Screens

Each screen below names its PNG. Desktop and mobile are shown side by side in the same image where both were designed.

### 1 · Marketplace — `screens/01-marketplace.png`

**Purpose:** browse and filter available bikes.

- Header: wordmark, nav (Bikes / Service / About), search field placeholder `Search brand, model or "cargo"`, secondary action `Sell your bike`.
- Page heading (verbatim): `30 inspected e-bikes, battery health on every one.`
- Filter row, seven controls: Price, Battery, Brand, Year, Type, Km, and a Sort select defaulting to `New`.
- Grid of bike cards, 4 across on desktop, 2 across on mobile. Card contents in order: 4:3 photo, battery-health badge overlaid top-right of the photo, model name, price, then `year · km ridden`.
- Battery badge appears only where health is known. Cards without a tested battery omit it — that absence is meaningful, do not default to a value.
- Footer of grid: `— 8 of 27 · load more —`. Pagination is load-more, not pages.
- Mobile: hamburger nav, search + Filters button, a horizontally scrolling quick-filter chip row (`Under ₹30k`, `90%+`, `City`), then the 2-up grid. Battery % moves inline next to the year rather than onto the photo.

**Missing / to decide:** the tier badge (certified vs self-listed) is not drawn on the cards in this wireframe but is required — see the two-tier rule above. Placement is an open question.

### 2 · Bike detail — `screens/02-bike-detail.png`

**Purpose:** evaluate one bike and make contact.

- Breadcrumb: `Bikes / City / EMotorad T-Rex+ 2023`.
- Left column: large main photo (`drive side, full bike`), then a row of four thumbnails — cockpit, battery, drivetrain, wear marks. These four subjects are prescriptive: they are the shots that answer a used-bike buyer's questions.
- Right column, top to bottom: model name, `year · type / frame style · frame size`, price at display scale, then a bordered battery panel — large `92%`, label `battery health`, and beneath it `tested 12 Aug · 480 cycles`.
- Spec list as a two-column label/value grid: Km ridden, Range, Motor, Frame size (with rider-height guidance, e.g. `M (18") · rider 5'6"–5'11"`), Serviced.
- Actions (in-app only — no WhatsApp, phone, or email is ever shown; see PROJECT DECISIONS below): self-listed bikes show `Message seller` (opens an in-app chat thread) + `Book a test ride`; certified bikes show `Book a test ride` + `Reserve this bike`, plus `Make an offer` if the bike has been certified and live 60+ days. All four actions require the buyer to be logged in.
- Trust strip: `✓ 42-point inspection · 3-month warranty` — certified bikes only.
- Full-width section below: **Condition notes.** Two columns of short honest defect notes, each pointing at a photo where relevant (`Frame — light scuff on downtube, photo 4`, `Tyres — 80% tread, original`). Disclosure is the point of this section; it should not be collapsed or hidden.
- Mobile: swipeable gallery with dot indicator (`1/9`), then the same content stacked, and a **sticky bottom bar** with the tier-appropriate primary action (full width) + the secondary action from the pair above — never a `Call` action.

### 3 · Service homepage — `screens/03-service-homepage.png`

**Purpose:** book repair work; secondary path into the marketplace.

- Hero heading (verbatim): `We fix e-bikes, and we sell the good ones on.` Body copy below is placeholder. Actions: primary `Browse 27 used bikes →`, secondary `Book a repair`. Right of the hero: workshop photo (`bike on stand`).
- **Services price list**, two columns, each row a service name and a starting price, dashed rules between rows. Eight rows, in this order: Tune-up (safety + gears + brakes), Battery diagnostics, Brake service, Battery replacement, Motor repair, Firmware & diagnostics, Pickup & delivery, Annual care plan. Prices per the table above. Prices are published openly — this is a differentiator, not a lead-gen gate.
- Bottom band, three equal cells: **Come by the shop** (address placeholder + `Mon–Sat 10–7 · +91 · hello@revelo.in`), a map, and a short request form (bike + issue, phone, `Request a slot`).
- Mobile: search, hero, workshop photo, then a truncated services list showing three rows and a `+ 5 more ›` link, then contact + map + `Request a slot`.

### 4 · Admin — inventory list + add/edit — `screens/04-admin-inventory-and-edit.png`

Desktop only. No mobile admin was designed.

**Inventory list.** Header `Inventory · 27 live`, `2 drafts`, primary `+ Add bike`. Search field + Status filter. Table columns: thumbnail, Bike (`name` over `year · km`), Price, Batt, Status, Actions (`Edit`, `Del`). Statuses seen: Live, Draft, Sold.

**Add / edit — full page, photos first.** The photo uploader is the first thing on the page, above all fields, because photo quality is what sells a used bike.

- Header: `Edit · <model>`, with `Preview listing ↗` top right.
- Dropzone: `drop photos here — 9 max, first is cover`, with reorderable thumbnails beneath. First photo is the cover; ordering must be draggable.
- Field grid, two columns: Brand, Model, Price ₹, Year, Km ridden, Frame size.
- **Battery health** is a slider, labelled `Battery health — slider, shows on the card`, with the live percentage beside it. The label tells the admin the field is public.
- Condition notes: multi-line text.
- Actions: `Save changes`, `Mark as sold`, and a de-emphasised `Delete`.

### 5 · Sell yours — the fork — `screens/05-sell-yours-fork.png`

**Purpose:** value the bike, then choose a tier. This is the most commercially important screen in the bundle.

- Heading (verbatim): `What's it worth?` Sub (verbatim): `Four fields, then pick how much work you want to do.`
- Four fields only: Brand, Model, Year, Km ridden.
- Comps panel: label `Bikes like yours sold for`, a price range at display scale (`₹31,000 – ₹36,500`), and provenance `based on 14 sales in Pune, last 90 days`. The provenance line is required — the range must never appear as an unsourced number.
- **The fork — two side-by-side cards.** The certified card carries a heavier border; it is the recommended path but the self-serve path is never hidden or made to feel punitive.

  *List it yourself* — badge `LIST IT YOURSELF`, `₹99` / `one-time listing fee`, then: Your photos, your price / You answer buyers / You handle the handover / Live in 10 minutes. Then net line: `You keep ₹34,401 of ₹34,500`. Action: `List it myself` (secondary).

  *Certify & consign* — badge `CERTIFY & CONSIGN`, `8% when it sells` / `free inspection · nothing upfront`, then: We inspect and test the battery / We shoot it properly / We price it and talk to buyers / We deliver it and warranty it / You keep the bike till it sells. Then net line: `You keep ₹31,740 of ₹34,500 — and certified bikes sell 2× faster`. Action: `Book a free inspection` (primary).

- Footnote (verbatim): `Either way the bike stays yours until a buyer pays. Withdraw a certified listing after inspection and the ₹1,499 inspection fee applies.`
- Both net figures must be computed live from the entered price, not hard-coded.
- Mobile: same content, stacked, certified card first.

### 6 · Certification explainer — `screens/05-sell-yours-fork.png` (right panel)

Heading (verbatim): `What "certified" buys you.` Five numbered steps:

1. **We collect it** — Free pickup within Pune
2. **42-point inspection** — Battery load-tested, cycles read off the BMS, not guessed
3. **We fix what fails** — Cost comes off the sale price, agreed with you first
4. **Photos and price** — Studio shots, price from real comps
5. **We sell and deliver** — You get paid within 24h of handover

Below: a panel headed `The report the buyer sees` with a sample 42-point report (asset does not exist yet).

### 7 · Certified checkout — `screens/06-checkout-and-service-booking.png` (left)

Three-step flow; the wireframe shows step 2. Steps 1 and 3 are not designed.

- Header `Reserve this bike`, step indicator `Step 2 of 3`.
- Bike summary row: cover thumb, `model · year`, `92% battery · 42-point passed`, `CERTIFIED` badge.
- **How you want it** — radio pair: `Home delivery — Thu 11 Sep, 10am–1pm` / `₹250 · Pune city` (selected), and `Pick up from the workshop` / `Free · Baner, Mon–Sat 10–7`.
- **Warranty** — three cells: `Included / 3 months` (active), `Extend to 6 / +₹3,499`, `Annual care / +₹4,999`. The two upsells are drawn with dashed borders (unselected).
- **Total** — itemised: Bike ₹34,500; `Buyer protection · 1.5%` ₹518; Delivery ₹250; then `Payable now — reserve` ₹2,000 at display scale. Beneath: `Balance ₹33,268 on handover, or convert to EMI ₹1,890/mo`.
- Action: `Pay ₹2,000 & reserve`, with reassurance beside it: `Refundable for 48h.` / `7-day return after handover.`
- Checkout is **certified-only**. Self-listed bikes have no checkout — the buyer contacts the seller directly. Do not build a shared checkout.
- The EMI line is a financing referral, not first-party lending.

### 8 · Service booking — `screens/06-checkout-and-service-booking.png` (right)

- Heading (verbatim): `Any e-bike, any brand.` Sub (verbatim): `You don't have to have bought it here.`
- Four service cards in a 2×2 grid: Tune-up (`Gears, brakes, safety`, from ₹899); Battery care (`Load test, report, or replace`, from ₹499 — emphasised with a heavier border); Motor & drive (`Repair, firmware`, from ₹2,400); Pre-buy inspection (`42 points, for a bike you found`, ₹999).
- **Book a slot** form: bike brand + model, `What's wrong?` select, `Workshop or pickup` select, phone + `Send`.
- **Next available** panel beside it, showing real remaining capacity: `Fri 5 Sep — 4 slots`, `Sat 6 Sep — 1 slot`. Note: `Pickup ₹250/way, free on the annual plan`.
- Bottom band: `Annual care plan — ₹4,999` / `Two tune-ups, battery report, free pickup` with a `Join` action.

### 9 · Admin — moderation queue — `screens/07-admin-moderation-and-consignment.png` (left)

**Purpose:** approve or reject self-listed bikes. Revélo moderates the *listing*, not the bike.

- Header: `Moderation`, then counts as chips — `12 pending`, `3 flagged`, `41 live` — and `Auto-approved: 86%` right-aligned. Most listings clear automatically; this queue is the exception path.
- Table columns: LISTING, ASKING, CHECKS, ACTION.
- Listing cell: model + year over `seller name · N photos · ₹99 paid`.
- Checks cell: pass/fail lines from the automated checks — phone verified, photos original, price within comp range, repeat-seller detection. Failures are stated concretely, e.g. `✗ photo reused`, `✗ price 62% below range`.
- Actions are contextual per row, not a fixed set: `Approve` / `Hold`; `Reject` / `Ask seller` on a flagged row; `Approve` / `Dealer?` on a third-listing-this-month seller; `Approve` / `Suggest ₹41k` where the price is above range. Flagged rows get a tinted background.
- Closing note (verbatim, and the important part of this screen): `We moderate, we don't inspect` — `Checks are on the listing, not the bike: real photos, contactable seller, price sanity, repeat-seller detection. Nothing here implies we've seen it.`

### 10 · Seller nudge (mobile) — `screens/07-admin-moderation-and-consignment.png` (centre)

The seller-facing counterpart: a live self-listed listing that isn't selling gets an upgrade offer.

- Listing summary: cover, model, `₹26,000 · live 18 days`, `SELF-LISTED` badge.
- Two stat cells: Views `214`, Messages `3`.
- Nudge card: heading `18 days, no sale`, body `Certified bikes like yours sell in 9 days. Free inspection, we handle buyers, you net ₹23,920 after 8%.`, primary `Upgrade to certified`, and a plain-text dismiss `Keep it as-is`.
- The dismiss must stay genuinely available. The net figure is computed, not fixed.

### 11 · Admin — consignment worksheet — `screens/07-admin-moderation-and-consignment.png` (right)

**Purpose:** turn an inspected bike into a priced certified listing, transparently, with the seller.

- Header: `Consign · EMotorad T-Rex+`, reference `#C-0142`.
- **Inspection** panel: `Passed 40 / 42`, then findings and cost — `Brake pads worn · rear bearing play`, `Repairs ₹1,150 — seller approved`. Seller approval is a gate, not a note.
- **Battery** — labelled `Battery — load tested, not claimed`, slider showing `92%`.
- **Comps** panel: `Comps · 14 sales, 90 days`, range `₹31,000 – ₹36,500`, and the adjustment logic surfaced: `battery >90% adds ~₹2,400`.
- **List price** — editable select, labelled `List price — set with the seller`, showing `₹34,500` marked `suggested`.
- **Payout breakdown**: List price ₹34,500; Commission 8% −₹2,760; Repairs −₹1,150; Inspection `waived`; `Seller nets ₹30,590`. This breakdown is what gets sent to the seller — every deduction is named.
- Actions: `Publish certified`, `Send to seller`.
- **Status pipeline** (verbatim, and the certified bike's state machine): `in workshop → photographed → live → reserved → delivered → seller paid`.

---

## Interactions & behavior

Only what the wireframes establish. Anything not listed is undesigned.

- **Marketplace filters** apply without a page reload; results count updates. Load-more appends.
- **Battery filter** operates on tested battery health. Self-listed bikes without a tested battery are excluded from a battery filter, not treated as 0 or 100.
- **Bike detail gallery**: desktop = click thumbnail to swap main photo. Mobile = horizontal swipe with dot indicator.
- **Mobile bike detail** has a sticky bottom action bar, always visible on scroll.
- **Sell-yours quote** recomputes the comp range and both net-payout figures whenever any of the four fields change. The comp range needs a real backing dataset — if none exists, the panel must be suppressed, not faked.
- **Checkout** is a 3-step flow. Delivery choice and warranty choice both update the itemised total live. Reserve amount is fixed at ₹2,000 regardless of bike price.
- **Photo upload** (admin) supports drag-drop, max 9, drag-to-reorder, first = cover.
- **Moderation actions** are per-row and immediate. `Suggest ₹41k` and `Ask seller` send a message to the seller rather than changing the listing.
- **Consignment worksheet** recalculates the seller payout whenever list price or repair cost changes.
- Responsive: mobile layouts are designed for marketplace, bike detail, service homepage, sell-yours, and the seller nudge. **Admin is desktop-only** — moderation queue, inventory, add/edit, and the consignment worksheet have no mobile design and do not need one.

## State & data

Entities implied by these screens:

- **Bike** — brand, model, year, km, frame size, type, price, photos (ordered, cover first), condition notes, `tier: self-listed | certified`, `status`, optional `batteryHealth { percent, cycles, testedOn }`, optional `inspection { pointsPassed, pointsTotal, findings[], repairCost, sellerApproved }`.
- **Listing (seller)** — seller, listing fee paid, moderation checks + result, views, messages, days live.
- **Consignment** — reference, seller, comps snapshot, agreed list price, commission, repair deduction, inspection fee waived/charged, payout, pipeline status.
- **Service job** — bike (any brand, not necessarily in inventory), issue, workshop-or-pickup, slot, phone, price band.
- **Order (certified only)** — bike, fulfilment choice, warranty choice, buyer protection, deposit, balance, return window.

Two states shown that must not be dropped: workshop **slot capacity** (`4 slots`, `1 slot`) is real availability, and the moderation **auto-approve rate** implies automated checks run before anything reaches the queue.

## Design tokens

**None supplied deliberately.** The wireframe colors (`#1a1a1a` ink, `#f0eee9` ground, `#1f6b45` battery green, hatched grey placeholders) and its 9–13px type are wireframe conventions for canvas legibility. Do not extract them.

Use the target codebase's existing design system for color, type, spacing, radius, and elevation. The only visual instructions that carry product meaning:

- Battery health is the primary trust signal on every card and on bike detail. It needs to be the most confident element in the card after the price.
- Certified and self-listed need visually distinct, unmissable badges.
- The certified option in the sell-yours fork is weighted heavier than the self-serve option, without hiding it.
- Prices are stated openly on the service page rather than gated.
- Condition notes are prominent, not collapsed.

## Assets

None included. All imagery in the wireframes is placeholder. Real assets required:

- Bike photography per listing — cover 4:3, plus the four prescribed detail shots (cockpit, battery, drivetrain, wear marks).
- Workshop photo for the service hero.
- A sample 42-point inspection report (buyer-facing) — does not exist yet.
- Map for the shop location.
- Wordmark. The wireframes set "Revélo" in a handwriting face purely as a wireframe stand-in — there is no logo yet.

## Files

- `wireframes.html` — all screens on one canvas, opens in any browser. Scroll: turn 3 (sell/checkout/service booking, then admin moderation/consignment) sits above turn 1 (marketplace, bike detail, service homepage, admin inventory).
- `screens/*.png` — one image per screen group, 2× resolution.

## Open questions — resolved in the phase docs

This wireframe bundle originally left five questions open. All five are decided; see
`../data-model.md` and the numbered phase files for the resulting spec, not this file:

1. Certified / self-listed badge placement on a card → decided in `P1-buyer-core.md`.
2. Checkout steps 1 and 3 → fully specified in `P5-certified-commerce.md`.
3. Comps dataset behind the sell-yours price range → a small hardcoded comp table, specified
   in `P3-sell-yours-seller-portal.md`.
4. Buyer contact channel → in-app only, never WhatsApp/phone/email. See PROJECT DECISIONS
   below and `P4-contact-scheduling.md`.
5. Auth/account surface → yes, three roles (buyer/seller/admin). Specified in
   `P0-foundations.md`.

## Project decisions made after this bundle was drawn (read before building)

This README and its screens are the earliest artifact in this project and are kept as
visual/structural reference only. Several decisions were made afterward that revise or
extend it. Where this file and a phase doc disagree, **the phase doc wins**:

- No WhatsApp, phone, or email is ever shown to a buyer. All contact is in-app.
- "Owner" throughout this file means the bike's seller — already corrected in the text
  above. Do not reintroduce "owner" as a term for Revélo staff; that role is "admin".
- Sellers get their own login and self-service listing management (add/edit/delete,
  request certification) — this bundle's screens 4/9/11 show the admin-only view of the
  same data; both surfaces exist.
- Test-ride booking, buyer/seller login, and the aging-stock offer system did not exist
  when these wireframes were drawn. They're fully specified in the phase docs.
