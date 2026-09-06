# P7 — Polish, deploy, document

## Mobile pass
Go back through every screen built in P1–P6 mobile-first: nav pattern, how cards
restack, touch target sizes, sticky bars, image weight. This should already be mostly
done as you build each phase (mobile layouts are specified alongside desktop
throughout) — treat this as a verification pass, not the first time mobile is
considered.

Note: admin (P2) is desktop-only by design. No mobile admin is needed anywhere.

## Deploy
Deploy to Vercel. Confirm the full path works end to end: a Sell Yours submission
reaches the right admin queue, an admin approval makes a bike appear in the
marketplace grid, a buyer can message/test-ride/reserve/offer per the bike's listing
type, and the service site booking form writes a real row.

## Case study
Write up the short rationale doc for the original assessment: why the pages are
structured this way, which UI/UX principles were applied, what's prominent vs
secondary and why, the mobile approach, and — worth naming explicitly — the scope
decision to build the full consignment/certification business model rather than a
simple curated-inventory site, and why (see the conversation history / your own notes
for the reasoning: it demonstrates product thinking beyond the literal brief, at the
cost of time that could otherwise have gone entirely into polish on the core browse/
detail hierarchy).

Take screenshots (desktop + mobile) of the key screens as you go, rather than only at
the end — useful both for the case study and as a fallback if the live link has
issues when it's reviewed.
