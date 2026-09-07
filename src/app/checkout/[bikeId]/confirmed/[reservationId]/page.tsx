import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/auth";
import { formatPrice } from "@/lib/format";
import { WARRANTY_LABELS } from "@/lib/checkout/pricing";
import { Button } from "@/components/ui/button";

export default async function CheckoutConfirmedPage(
  props: PageProps<"/checkout/[bikeId]/confirmed/[reservationId]">,
) {
  const { bikeId, reservationId } = await props.params;

  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/checkout/${bikeId}`);

  const supabase = await createClient();
  const { data: reservation, error } = await supabase
    .from("reservations")
    .select("*")
    .eq("id", reservationId)
    .eq("buyer_id", user.id)
    .eq("bike_id", bikeId)
    .maybeSingle();
  if (error) throw error;
  if (!reservation) notFound();

  const { data: bike } = await supabase
    .from("bikes")
    .select("brand, model")
    .eq("id", bikeId)
    .single();

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
      <div className="rounded-card border border-line bg-surface p-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">
          Reservation confirmed
        </p>
        <h1 className="mt-2 text-h5 font-semibold tracking-tight">
          {bike ? `${bike.brand} ${bike.model} is yours` : "Your bike is reserved"}
        </h1>
        <p className="mt-2 text-sm text-muted">
          You paid {formatPrice(reservation.reservation_amount)} to reserve —{" "}
          {reservation.fulfillment === "delivery"
            ? "we'll be in touch to confirm your home-delivery window."
            : "pick it up from the workshop in Baner, Mon–Sat 10–7."}
        </p>
        <dl className="mt-5 divide-y divide-line rounded-control border border-line px-3 text-left text-sm">
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-muted">Warranty</dt>
            <dd className="font-medium text-ink">
              {WARRANTY_LABELS[reservation.warranty_tier].title}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-muted">Total</dt>
            <dd className="font-medium text-ink">{formatPrice(reservation.total)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-muted">Balance on handover</dt>
            <dd className="font-medium text-ink">
              {formatPrice(reservation.total - reservation.reservation_amount)}
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-muted">Refundable for 48h. 7-day return after handover.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button
            render={<Link href={`/bikes/${bikeId}`} />}
            nativeButton={false}
            variant="outline"
            className="h-10 rounded-control border-line text-ink"
          >
            View bike
          </Button>
          <Button
            render={<Link href="/" />}
            nativeButton={false}
            className="h-10 rounded-control bg-brand-fill text-white hover:bg-brand-fill-hover"
          >
            Back to bikes
          </Button>
        </div>
      </div>
    </div>
  );
}
