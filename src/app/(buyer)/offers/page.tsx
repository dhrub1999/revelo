import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/auth";
import { listMyOffers } from "@/lib/buyer/queries";
import { formatPrice, formatShortDate } from "@/lib/format";
import { OfferResponseActions } from "@/components/offers/offer-response-actions";

const STATUS_LABEL: Record<string, string> = {
  pending: "Waiting on Revélo",
  countered: "Revélo countered",
  accepted: "Reserved for you",
  rejected: "Declined",
};

export default async function MyOffersPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const offers = await listMyOffers(supabase, user.id);

  return (
    <div>
      <h1 className="text-h4 font-semibold tracking-tight">Offers</h1>
      <p className="mt-1 text-sm text-muted">
        Your negotiations on certified bikes — Revélo handles these directly.
      </p>

      <div className="mt-6 flex flex-col gap-2">
        {offers.map(({ offer, bike }) => (
          <div key={offer.id} className="rounded-card border border-line bg-surface p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <Link
                  href={`/bikes/${bike.id}`}
                  className="text-sm font-medium text-ink hover:text-brand"
                >
                  {bike.brand} {bike.model} {bike.year}
                </Link>
                <p className="mt-0.5 text-sm text-muted">
                  You offered {formatPrice(offer.proposed_price)}
                  {offer.status === "countered" && offer.counter_price !== null
                    ? ` · Revélo countered at ${formatPrice(offer.counter_price)}`
                    : ""}
                </p>
                <p className="mt-1 text-xs text-muted">{formatShortDate(offer.created_at)}</p>
              </div>
              <span className="shrink-0 rounded-pill border border-line px-2.5 py-1 text-xs font-medium text-ink">
                {STATUS_LABEL[offer.status] ?? offer.status}
              </span>
            </div>

            {offer.status === "countered" && (
              <div className="mt-3 border-t border-line pt-3">
                <OfferResponseActions offerId={offer.id} />
              </div>
            )}
          </div>
        ))}
        {offers.length === 0 && (
          <div className="rounded-card border border-dashed border-line p-10 text-center text-muted">
            No offers yet. Certified bikes show &quot;Make an offer&quot; once they&apos;ve been
            live 60+ days.
          </div>
        )}
      </div>
    </div>
  );
}
