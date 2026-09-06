# P5 — Certified commerce: checkout + aging-stock offers

Both features in this phase apply to **certified bikes only**. Self-listed bikes never
get a checkout and never get the offer action — a buyer who wants a self-listed bike
negotiates directly with the seller over chat (P4).

## Screen 7 — Checkout
Reference: `reference-design-handoff/screens/06-checkout-and-service-booking.png`
(left), README section 7. Requires buyer login.

Three steps — the original wireframe only designed step 2, so steps 1 and 3 below are
fully specified here:

1. **Fulfillment.** Radio choice: home delivery (pick a slot, ₹250) or free workshop
   pickup.
2. **Warranty.** Three options: included (3 months, default), extend to 6 months
   (+₹3,499), annual care (+₹4,999). The two upsells are visually secondary to the
   included default, never hidden.
3. **Summary & pay.** Itemised total: bike price (or the negotiated `offers.
   proposed_price`/`counter_price` if this reservation originated from an accepted
   offer — see below) + buyer protection (1.5%) + delivery fee (if chosen) = total.
   Below that, "Payable now — reserve" at a flat ₹2,000 regardless of bike price, then
   "Balance ₹X on handover, or convert to EMI ₹Y/mo" (the EMI figure is a simple
   calculated estimate, not a real financing integration). Action: `Pay ₹2,000 &
   reserve` — transitions straight to a confirmation state. **No real payment
   gateway.** Reservation amount and warranty selection both update the itemised total
   live as they're chosen.

On successful reservation: create a `reservations` row, set the bike's `status` to
`'reserved'` so it can't be double-booked (it stays visible in the grid, just marked).

## Screen 13 — Aging-stock offers
Not in the original wireframe bundle — added based on the project's own buyer/seller
flow diagrams, then corrected during scoping (see the note at the end of this file for
why this replaced an earlier "custom quote in chat" idea).

- A certified bike shows a `Make an offer` action on its detail page once
  `certified_live_since` is 60+ days ago. Bikes younger than that, and all self-listed
  bikes, never show this action. Requires buyer login.
- A submitted offer goes to a new **admin Offers queue** — not to the seller directly.
  Admin can `Accept`, `Counter` (with a different price), or `Reject`.
- The seller is notified of the offer and of the outcome either way (in-app, per P4's
  notification system) — Revélo is negotiating, but the seller is still the legal
  owner of a consigned bike and stays informed throughout.
- An **accepted** offer creates a `reservations` row at the negotiated price for that
  specific buyer (`reservations.offer_id` links back to it) — the publicly listed price
  is unaffected unless admin separately edits it via the inventory screen (P2).

### Why this looks different from a plain "buyer negotiates with seller" feature
An earlier pass at this spec assumed a buyer could send a custom price offer directly
to the seller as a structured chat message. That's wrong for this business model:
Revélo manages certified bikes end-to-end (that's the whole point of certification),
so it's Revélo, not the seller, who should field and negotiate offers on aging
certified stock. Self-listed bikes were never meant to have a structured offer system
at all — they just use plain chat (P4).
