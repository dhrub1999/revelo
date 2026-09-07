import { createClient } from "@/lib/supabase/server";
import { listOffersQueue, getDisplayNames } from "@/lib/admin/queries";
import { formatPrice, formatShortDate, daysSince } from "@/lib/format";
import { OfferActions } from "@/components/admin/offer-actions";

export default async function AdminOffersPage() {
  const supabase = await createClient();
  const queue = await listOffersQueue(supabase);
  const buyerNames = await getDisplayNames(
    supabase,
    queue.map((row) => row.offer.buyer_id),
  );

  return (
    <div>
      <div className="flex items-center gap-3">
        <h1 className="text-h4 font-semibold tracking-tight">Offers</h1>
        <span className="rounded-pill border border-line px-3 py-1 text-sm font-medium text-ink">
          {queue.length} open
        </span>
      </div>
      <p className="mt-1 text-sm text-muted">
        Aging-stock negotiation on certified bikes — Revélo fields these, not the seller.
      </p>

      <div className="mt-5 rounded-card border border-line bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-medium">Bike</th>
              <th className="px-4 py-3 font-medium">Buyer</th>
              <th className="px-4 py-3 font-medium">Offer</th>
              <th className="px-4 py-3 font-medium">Listed</th>
              <th className="px-4 py-3 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {queue.map(({ offer, bike }) => (
              <tr key={offer.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 align-top">
                  <p className="font-medium text-ink">
                    {bike.brand} {bike.model} {bike.year}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    Listed {formatPrice(bike.price)}
                    {bike.certified_live_since &&
                      ` · live ${daysSince(bike.certified_live_since)}d`}
                  </p>
                </td>
                <td className="px-4 py-3 align-top text-ink">
                  {buyerNames.get(offer.buyer_id) ?? "Buyer"}
                </td>
                <td className="px-4 py-3 align-top">
                  <p className="font-medium text-ink">{formatPrice(offer.proposed_price)}</p>
                  {offer.status === "countered" && offer.counter_price !== null && (
                    <p className="mt-0.5 text-xs text-muted">
                      Countered at {formatPrice(offer.counter_price)}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 align-top text-xs text-muted">
                  {formatShortDate(offer.created_at)}
                </td>
                <td className="px-4 py-3 align-top">
                  <OfferActions offer={offer} bikePrice={bike.price} />
                </td>
              </tr>
            ))}
            {queue.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted">
                  No open offers right now.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
