# P4 — Buyer contact & scheduling

## Contact model (core project rule — do not deviate)
No phone number, email, or external link is ever shown for a seller, self-listed or
certified. All buyer-seller contact happens in-app. This exists to protect the
commission model — if a buyer could reach a seller outside the platform, they could
close the deal and bypass the listing fee or commission entirely.

- **Self-listed bike** → `Message seller` opens an in-app chat thread (`conversations`
  / `messages` tables). Requires buyer login. There is no live second user session for
  the seller side — after a buyer sends a message, seed a canned seller reply after a
  short delay. Plain chat only; there is no structured "quote" message type (that idea
  was superseded by the certified-only `offers` system in P5 — self-listed negotiation
  is just conversation).
- **Certified bike** → no messaging at all. Revélo already mediates certified bikes
  end-to-end (see P2's consignment worksheet and P5's offers queue), so there's no
  seller to message.
- Sellers get an in-app notification (the `notifications` table) on a new message,
  test-ride request, or offer — mocked, not a real WhatsApp/SMS integration.

## Test-ride booking
Reference: the seller-flow and buyer-flow diagrams in `reference-flows/`.

- **Self-listed**: buyer requests a slot (login required) → request goes to the seller
  (mocked) → seller accepts, or rejects with a reason and alternative dates → buyer is
  notified either way. This is a real request/response, not an instant confirmation —
  the seller still physically holds the bike.
- **Certified**: buyer requests a slot (login required) → confirmed immediately, no
  accept/reject step. The company already holds the bike, so there's no one on the
  seller's side who needs to approve it.

## What NOT to build here
- No structured quote/offer mechanism on self-listed bikes — see above.
- No real WhatsApp Business API, no SMS gateway. The `notifications` table plus a
  simple in-app badge/toast covers the same idea for this demo.
