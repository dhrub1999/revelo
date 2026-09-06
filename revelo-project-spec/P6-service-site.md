# P6 — Service site

No login anywhere in this phase — unrelated to the buyer/seller contact restriction.

## Screen 3 — Service homepage
Reference: `reference-design-handoff/screens/03-service-homepage.png`, README section
3.

- Hero: "We fix e-bikes, and we sell the good ones on." Actions: primary `Browse N used
  bikes →` (compute N), secondary `Book a repair`. Workshop photo beside it.
- Full services price list, two columns, eight rows: tune-up, battery diagnostics,
  brake service, battery replacement, motor repair, firmware & diagnostics, pickup &
  delivery, annual care plan — prices per `../commercial-model.md`, published openly,
  not gated behind a form.
- Bottom band, three cells: come-by-the-shop (address placeholder, hours, contact),
  a map, and a short request form (bike + issue, phone, `Request a slot`).
- Mobile: search, hero, workshop photo, a truncated 3-row services list with
  `+ 5 more ›`, then contact + map + request form.

## Screen 8 — Service booking
Reference: `reference-design-handoff/screens/06-checkout-and-service-booking.png`
(right), README section 8.

- Heading: "Any e-bike, any brand." / "You don't have to have bought it here."
- Four highlighted category cards (subset of the full price list, for quick booking):
  tune-up, battery care, motor & drive, pre-buy inspection (₹999 flat, for a bike found
  elsewhere).
- Booking form: bike brand + model, `What's wrong?` select, `Workshop or pickup`
  select, phone, `Send` — writes to `service_bookings`.
- Next-available panel beside it: real remaining capacity from `service_slots` (e.g.
  "Fri 5 Sep — 4 slots"). Note: pickup ₹250/way, free on the annual plan.
- Bottom band: annual care plan (₹4,999/year, two tune-ups + battery report + free
  pickup) with its own `Join` action.
