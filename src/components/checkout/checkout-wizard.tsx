"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { unstable_rethrow } from "next/navigation";
import { clsx } from "clsx";
import { reserveBike } from "@/lib/buyer/actions";
import {
  computeReservationPricing,
  nextDeliverySlotLabel,
  WARRANTY_LABELS,
  DELIVERY_FEE,
} from "@/lib/checkout/pricing";
import { formatPrice } from "@/lib/format";
import type { BikeRow } from "@/lib/bikes/query";
import type { Fulfillment, WarrantyTier } from "@/lib/supabase/types";
import { TierBadge } from "@/components/badges/tier-badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const WARRANTY_TIERS: WarrantyTier[] = ["included", "extended_6mo", "annual_care"];

export function CheckoutWizard({ bike }: { bike: BikeRow }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [fulfillment, setFulfillment] = useState<Fulfillment>("delivery");
  const [warrantyTier, setWarrantyTier] = useState<WarrantyTier>("included");
  const [emiOpted, setEmiOpted] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const deliverySlot = useMemo(() => nextDeliverySlotLabel(), []);
  const pricing = useMemo(
    () => computeReservationPricing(bike.price, fulfillment, warrantyTier),
    [bike.price, fulfillment, warrantyTier],
  );

  function pay() {
    setError(null);
    startTransition(async () => {
      try {
        // Redirects to /checkout/[bikeId]/confirmed/[reservationId] on
        // success — never resolves normally. Server Actions implicitly
        // refresh this page's Server Component tree on completion, which
        // would otherwise clobber any client-side "confirmed" state once
        // the bike stops being 'live'.
        await reserveBike(bike.id, { fulfillment, warrantyTier, emiOpted });
      } catch (e) {
        unstable_rethrow(e);
        setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
      }
    });
  }

  return (
    <div className="rounded-card border border-line bg-surface p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-h5 font-semibold tracking-tight">Reserve this bike</h1>
        <span className="text-sm text-muted">Step {step} of 3</span>
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-control border border-line p-3">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-control bg-paper">
          {bike.photos[0] && (
            <Image
              src={bike.photos[0]}
              alt={`${bike.brand} ${bike.model}`}
              fill
              sizes="64px"
              className="object-cover"
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">
            {bike.brand} {bike.model} · {bike.year}
          </p>
          <p className="mt-0.5 text-xs text-muted">
            {bike.battery_health ? `${bike.battery_health.percent}% battery · ` : ""}
            Certified inspected
          </p>
        </div>
        <TierBadge listingType="certified" />
      </div>

      {step === 1 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-ink">How you want it</h2>
          <div className="mt-2 flex flex-col gap-2">
            <FulfillmentOption
              selected={fulfillment === "delivery"}
              onSelect={() => setFulfillment("delivery")}
              title={`Home delivery — ${deliverySlot}`}
              sub={`${formatPrice(DELIVERY_FEE)} · Pune city`}
            />
            <FulfillmentOption
              selected={fulfillment === "pickup"}
              onSelect={() => setFulfillment("pickup")}
              title="Pick up from the workshop"
              sub="Free · Baner, Mon–Sat 10–7"
            />
          </div>
          <Button
            className="mt-6 h-11 w-full rounded-control bg-brand-fill text-white hover:bg-brand-fill-hover"
            onClick={() => setStep(2)}
          >
            Continue
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-ink">Warranty</h2>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {WARRANTY_TIERS.map((tier) => (
              <button
                key={tier}
                type="button"
                onClick={() => setWarrantyTier(tier)}
                className={clsx(
                  "rounded-control border px-2.5 py-3 text-left text-xs transition-colors",
                  warrantyTier === tier
                    ? "border-brand bg-brand-tint text-brand"
                    : "border-dashed border-line text-ink hover:border-brand/50",
                )}
              >
                <span className="block font-medium">{WARRANTY_LABELS[tier].title}</span>
                <span className="mt-0.5 block text-muted">{WARRANTY_LABELS[tier].sub}</span>
              </button>
            ))}
          </div>
          <div className="mt-6 flex gap-3">
            <Button
              variant="outline"
              className="h-11 flex-1 rounded-control border-line text-ink"
              onClick={() => setStep(1)}
            >
              Back
            </Button>
            <Button
              className="h-11 flex-1 rounded-control bg-brand-fill text-white hover:bg-brand-fill-hover"
              onClick={() => setStep(3)}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-ink">Total</h2>
          <dl className="mt-2 divide-y divide-line rounded-control border border-line px-3 text-sm">
            <TotalRow label="Bike" value={formatPrice(pricing.bikePrice)} />
            <TotalRow
              label="Buyer protection · 1.5%"
              value={formatPrice(pricing.buyerProtectionFee)}
            />
            {pricing.deliveryFee > 0 && (
              <TotalRow label="Delivery" value={formatPrice(pricing.deliveryFee)} />
            )}
            {pricing.warrantyFee > 0 && (
              <TotalRow
                label={`Warranty · ${WARRANTY_LABELS[warrantyTier].title}`}
                value={formatPrice(pricing.warrantyFee)}
              />
            )}
            <TotalRow
              label="Payable now — reserve"
              value={formatPrice(pricing.reservationAmount)}
              emphasis
            />
          </dl>

          <div className="mt-3 flex items-center justify-between gap-3 rounded-control border border-line px-3 py-2.5 text-sm">
            <div>
              <p className="text-ink">
                {emiOpted
                  ? `EMI ${formatPrice(pricing.emiPerMonth)}/mo`
                  : `Balance ${formatPrice(pricing.balance)} on handover`}
              </p>
              <p className="text-xs text-muted">
                {emiOpted ? "18-month estimate, not a real loan" : "or convert to EMI"}
              </p>
            </div>
            <Switch checked={emiOpted} onCheckedChange={setEmiOpted} />
          </div>

          {error && (
            <p className="mt-3 rounded-control border border-danger bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}

          <div className="mt-6 flex gap-3">
            <Button
              variant="outline"
              disabled={pending}
              className="h-11 rounded-control border-line text-ink"
              onClick={() => setStep(2)}
            >
              Back
            </Button>
            <Button
              disabled={pending}
              onClick={pay}
              className="h-11 flex-1 rounded-control bg-brand-fill text-white hover:bg-brand-fill-hover"
            >
              {pending ? "Reserving…" : `Pay ${formatPrice(pricing.reservationAmount)} & reserve`}
            </Button>
          </div>
          <p className="mt-2 text-center text-xs text-muted">
            Refundable for 48h. 7-day return after handover.
          </p>
        </div>
      )}
    </div>
  );
}

function FulfillmentOption({
  selected,
  onSelect,
  title,
  sub,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={clsx(
        "flex items-center gap-3 rounded-control border px-3 py-3 text-left text-sm transition-colors",
        selected ? "border-brand bg-brand-tint" : "border-line hover:border-brand/50",
      )}
    >
      <span
        className={clsx(
          "flex size-4 shrink-0 items-center justify-center rounded-full border",
          selected ? "border-brand" : "border-line",
        )}
      >
        {selected && <span className="size-2 rounded-full bg-brand" />}
      </span>
      <span>
        <span className="block font-medium text-ink">{title}</span>
        <span className="block text-xs text-muted">{sub}</span>
      </span>
    </button>
  );
}

function TotalRow({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <dt className={emphasis ? "font-semibold text-ink" : "text-muted"}>{label}</dt>
      <dd className={emphasis ? "font-heading text-base font-semibold text-ink" : "font-medium text-ink"}>
        {value}
      </dd>
    </div>
  );
}
