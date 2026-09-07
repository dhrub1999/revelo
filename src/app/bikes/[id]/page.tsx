import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck } from "@phosphor-icons/react/dist/ssr/ShieldCheck";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/auth";
import { getBikeById } from "@/lib/bikes/query";
import { getMyOfferForBike } from "@/lib/buyer/queries";
import { formatKm, formatPrice, formatShortDate, daysSince } from "@/lib/format";
import { BatteryBadge } from "@/components/badges/battery-badge";
import { TierBadge } from "@/components/badges/tier-badge";
import { Gallery } from "@/components/bike-detail/gallery";
import { Actions } from "@/components/bike-detail/actions";

const OFFER_ELIGIBLE_AFTER_DAYS = 60;

export default async function BikeDetailPage(props: PageProps<"/bikes/[id]">) {
  const { id } = await props.params;

  const supabase = await createClient();
  const [bike, currentUser] = await Promise.all([
    getBikeById(supabase, id),
    getCurrentUser(),
  ]);

  if (!bike) notFound();

  const battery = bike.battery_health;
  const available = bike.status === "live";
  const offerEligible =
    bike.listing_type === "certified" &&
    available &&
    !!bike.certified_live_since &&
    daysSince(bike.certified_live_since) >= OFFER_ELIGIBLE_AFTER_DAYS;

  const myOffer =
    bike.listing_type === "certified" && currentUser
      ? await getMyOfferForBike(supabase, bike.id, currentUser.id)
      : null;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6 sm:pb-10">
      <nav className="mb-4 text-sm text-muted">
        <Link href="/" className="transition-colors hover:text-brand">
          Bikes
        </Link>{" "}
        / Pune /{" "}
        <span className="text-ink">
          {bike.brand} {bike.model} {bike.year}
        </span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        <Gallery photos={bike.photos} alt={`${bike.brand} ${bike.model}`} />

        <div>
          <div className="flex items-center gap-2">
            <TierBadge listingType={bike.listing_type} />
          </div>

          <h1 className="mt-2 text-h4 font-semibold tracking-tight sm:text-h3">
            {bike.brand} {bike.model}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {bike.year} · {bike.type}
            {bike.frame_size ? ` · ${bike.frame_size}` : ""}
          </p>

          <p className="mt-4 font-heading text-h3 font-semibold">
            {formatPrice(bike.price)}
          </p>

          {battery && (
            <div className="mt-4 flex items-center gap-4 rounded-card border border-line p-4">
              <BatteryBadge percent={battery.percent} variant="panel" />
              <div>
                <p className="text-sm font-medium">battery health</p>
                <p className="text-sm text-muted">
                  tested {formatShortDate(battery.tested_on)} · {battery.cycles} cycles
                </p>
              </div>
            </div>
          )}

          <dl className="mt-4 divide-y divide-line border-y border-line text-sm">
            <SpecRow label="Km ridden" value={formatKm(bike.km)} />
            {bike.range_km !== null && (
              <SpecRow label="Range" value={`~${bike.range_km} km/charge`} />
            )}
            {bike.motor_spec && <SpecRow label="Motor" value={bike.motor_spec} />}
            {bike.frame_size && (
              <SpecRow
                label="Frame size"
                value={
                  bike.rider_height_range
                    ? `${bike.frame_size} · rider ${bike.rider_height_range}`
                    : bike.frame_size
                }
              />
            )}
            {bike.serviced_note && (
              <SpecRow label="Serviced" value={bike.serviced_note} />
            )}
          </dl>

          {bike.listing_type === "certified" && (
            <p className="mt-4 inline-flex items-center gap-1.5 rounded-control bg-brand-tint px-3 py-2 text-sm font-medium text-brand-tint-fg">
              <ShieldCheck weight="fill" className="size-4" />
              42-point inspection · 3-month warranty
            </p>
          )}

          <div className="mt-6">
            <Actions
              bikeId={bike.id}
              listingType={bike.listing_type}
              bikeStatus={bike.status}
              available={available}
              offerEligible={offerEligible}
              hasUser={!!currentUser}
              activeOffer={
                myOffer && (myOffer.status === "pending" || myOffer.status === "countered")
                  ? myOffer
                  : null
              }
            />
          </div>
        </div>
      </div>

      <section className="mt-10 border-t border-line pt-6">
        <h2 className="text-h5 font-semibold">Condition notes</h2>
        <div className="mt-3 grid gap-x-8 gap-y-2 sm:grid-cols-2">
          {bike.condition_notes.map((note, index) => (
            <p key={index} className="text-sm text-ink">
              {note.text}
            </p>
          ))}
        </div>
      </section>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2.5">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
