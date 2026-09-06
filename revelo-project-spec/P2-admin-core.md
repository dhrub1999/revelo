# P2 — Admin core

**Why this comes before P3:** nothing in this project can go live without this phase.
Every self-listed and certified bike, however it's created, passes through one of these
two queues before it's visible to buyers.

Desktop only throughout — no mobile admin was designed, and none is needed.

## Screen 9 — Inventory list
Reference: `reference-design-handoff/screens/04-admin-inventory-and-edit.png`.

- Header: `Inventory · N live`, `N drafts`, primary `+ Add bike`.
- Search + status filter. Table: thumbnail, bike (name over `year · km`), price, batt,
  status, actions (`Edit`, `Del`).
- Add/edit is a full page, photos first: dropzone (max 9, drag-to-reorder, first =
  cover), then brand/model/price/year/km/frame size grid, a battery-health slider
  (labelled as public-facing), condition notes, then `Save changes` / `Mark as sold` /
  a de-emphasised `Delete`.
- This screen lets admin add/edit/delete **any** bike directly — this is the same
  underlying `bikes` table that self-service (P3) and the queues below also write to.

## Screen 10 — Moderation queue (self-listed submissions)
Reference: `reference-design-handoff/screens/07-admin-moderation-and-consignment.png`
(left panel).

- Header `Moderation`, count chips (`N pending`, `N flagged`, `N live`), auto-approve
  rate right-aligned.
- Table: LISTING, ASKING, CHECKS, ACTION. Listing cell = model + year over
  `seller name · N photos · ₹99 paid`. Checks cell = pass/fail lines from
  `sell_submissions.automated_checks` (phone verified, photos original, price in range,
  repeat-seller), stated concretely on failure (e.g. `✗ photo reused`).
- Actions are contextual per row, not fixed: `Approve`/`Hold` normally; `Reject`/
  `Ask seller` on a flagged row; `Approve`/`Dealer?` on a repeat seller;
  `Approve`/`Suggest ₹41k` when price is above range. Flagged rows get a tinted
  background.
- Approving creates the live `bikes` row from the `sell_submissions` row.
- Closing note, verbatim: "We moderate, we don't inspect — Checks are on the listing,
  not the bike: real photos, contactable seller, price sanity, repeat-seller detection.
  Nothing here implies we've seen it."

## Screen 11 — Consignment worksheet (certified submissions)
Reference: same file, right panel.

- Header `Consign · <model>`, reference number.
- Inspection panel: points passed/total, findings, repair cost, **seller-approval gate**
  (not a note — repairs cannot proceed without it).
- Battery panel: labelled "load tested, not claimed", live percentage.
- Comps panel: sample size + window (e.g. "14 sales, 90 days"), range, adjustment logic
  surfaced (e.g. "battery >90% adds ~₹2,400").
- List price: editable, seeded with a suggested value.
- Payout breakdown, every deduction named: list price, commission (8%), repair
  deduction, inspection fee (waived/charged), seller nets X.
- Actions: `Publish certified`, `Send to seller`.
- Status pipeline: `in workshop → photographed → live → reserved → delivered →
  seller paid`.
- Recalculates the seller payout whenever list price or repair cost changes.

## Screen 13 — Offers queue (build in P5, listed here for completeness)
See `P5-certified-commerce.md` — this is where aging-stock buyer offers are
accepted/countered/rejected. Build it alongside checkout in P5, not here.
