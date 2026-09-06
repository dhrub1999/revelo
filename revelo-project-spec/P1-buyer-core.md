# P1 — Buyer core: browse + detail

**This is the part of the project being evaluated most directly. Give it the most
polish and the most iteration time.** Everything else in this project supports this
phase; this phase is the point.

Seed the database directly with a handful of demo bikes (mix of self-listed and
certified, some with battery health, some without) so this phase can be built and
reviewed without waiting on P2/P3's submission pipeline.

## Screen 1 — Marketplace grid
Reference: `reference-design-handoff/screens/01-marketplace.png`, README section 1.

- Header: wordmark, nav (Bikes / Service / About), search (`Search brand, model or
  "cargo"`), secondary action `Sell your bike`.
- Page heading: a live count, e.g. "X inspected e-bikes, battery health on every one" —
  compute the count, don't hard-code it.
- Filters: Price, Battery, Brand, Year, Type, Km, Sort (default `New`) — **plus** a
  "Certified only" toggle (not in the original wireframe, added because the tier
  distinction is core to the business model).
- Battery filter operates only on tested battery health — bikes without a tested value
  are excluded from a battery filter, not treated as 0 or 100.
- Grid: 4 across desktop, 2 across mobile. Card: 4:3 photo, battery-health badge
  overlaid top-right of the photo (omit entirely if untested — don't default a value),
  a certified/self-listed tier badge (visually distinct, unmissable — placement is your
  call, e.g. top-left of the photo, opposite the battery badge), model name, price,
  then `year · km ridden`.
- Reserved/sold bikes stay visible with their status shown, not removed from the grid.
- Footer: "— N of M · load more —". Load-more, not pagination.
- Mobile: hamburger nav, search + Filters button, horizontal quick-filter chips (e.g.
  `Under ₹30k`, `90%+`), then the 2-up grid. Battery % moves inline next to the year
  instead of onto the photo.
- Filters apply without a page reload; result count updates live.

## Screen 2 — Bike detail
Reference: `reference-design-handoff/screens/02-bike-detail.png`, README section 2.

- Breadcrumb: `Bikes / City / Brand Model Year`.
- Left: large main photo (drive side, full bike), then four thumbnails — cockpit,
  battery, drivetrain, wear marks. This shot list is prescriptive.
- Right: model name, `year · type/frame style · frame size`, price, a bordered battery
  panel (large %, "battery health", `tested <date> · <cycles> cycles`) — omit the whole
  panel if untested.
- Spec grid: km ridden, range, motor, frame size (with rider-height guidance, e.g.
  `M (18") · rider 5'6"–5'11"`), serviced.
- **Actions depend on listing type** (see `P4-contact-scheduling.md` and
  `P5-certified-commerce.md` for what each button does):
  - Self-listed: `Message seller` + `Book a test ride`
  - Certified: `Book a test ride` + `Reserve this bike`, plus `Make an offer` if
    `certified_live_since` is 60+ days ago
  - All of the above require login. No phone/email/WhatsApp is ever shown.
- Trust strip (certified only): "✓ 42-point inspection · 3-month warranty".
- Condition notes: two columns, short honest defect notes, each pointing at a photo
  where relevant (e.g. "Frame — light scuff on downtube, photo 4"). Never collapsed.
- Mobile: swipeable gallery with dot indicator, stacked content, sticky bottom bar with
  the tier-appropriate primary action + one secondary action from the pair above.
- Desktop gallery: click a thumbnail to swap the main photo. Mobile: horizontal swipe.
