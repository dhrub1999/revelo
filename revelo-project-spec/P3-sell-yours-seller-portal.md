# P3 — Sell Yours + seller self-service

## Screen 5 — Sell yours (the fork)
Reference: `reference-design-handoff/screens/05-sell-yours-fork.png`, README section 5.
The most commercially important screen in the bundle — give it real attention.

- Four fields: brand, model, year, km ridden (also collect `type`, added since the
  original wireframe — see `../data-model.md`).
- Comps panel: "Bikes like yours sold for", a range, and provenance (e.g. "based on 14
  sales in Pune, last 90 days"). **Back this with a small hardcoded comp table** keyed
  by brand/model — if a combination has no comp data, suppress the panel rather than
  fake a number. Recompute live as any of the four fields change.
- The fork, two cards, certified weighted heavier (recommended, never hidden or made to
  feel punitive):
  - **List it yourself** — ₹99 one-time. Also collect asking price + photos here, since
    there's no seller dashboard step before this. Net line computed live. Action:
    `List it myself` (secondary).
  - **Certify & consign** — 8% on sale, free inspection. Net line computed live,
    accounting for the 8% commission. Action: `Book a free inspection` (primary).
- Footnote, verbatim: "Either way the bike stays yours until a buyer pays. Withdraw a
  certified listing after inspection and the ₹1,499 inspection fee applies."
- Submitting either path creates a `sell_submissions` row (`status: pending`) — self
  path feeds the moderation queue, certify path feeds the consignment worksheet (both
  in P2).

## Screen 6 — Certification explainer
Reference: same file, right panel. Five numbered steps (collect → 42-point inspection →
we fix what fails → photos and price → we sell and deliver), plus a sample 42-point
report view (the asset doesn't exist yet — build the layout, use placeholder content).

## Seller self-service (new — not in the original wireframe bundle)
Sellers log in (same Supabase Auth, `profiles.role = 'seller'`) and see:
- Their own listings, notifications, and a calendar of test-ride requests on their
  bikes (self-listed only — certified test rides don't need seller input, see P4).
- From a listing: `Edit` / `Delete` / `Add`.
- Saving an edit checks certification status:
  - Already certified → saves, returns to their listings.
  - Not certified → show a benefits-of-certification modal; if the seller opts in,
    prompt available inspection slots, seller picks one, and the listing returns to
    their list flagged "pending certification" — this feeds the P2 consignment
    worksheet exactly like a fresh Sell Yours submission would.
- New bikes a seller adds still pass through the same automated moderation checks (self
  path) or consignment worksheet (certify path) before going live — self-service
  editing never bypasses P2's queues for anything that isn't already live.
