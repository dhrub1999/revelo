"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { BikeRow } from "@/lib/bikes/query";
import type { ListingType } from "@/lib/supabase/types";
import type { OfferRow } from "@/lib/buyer/queries";
import { startConversation } from "@/lib/buyer/actions";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { TestRideDialog } from "@/components/bike-detail/test-ride-dialog";
import { OfferDialog } from "@/components/bike-detail/offer-dialog";

type ActionKind = "message" | "test-ride" | "reserve";

interface Action {
  label: string;
  kind: ActionKind;
  primary: boolean;
}

const UNAVAILABLE_LABEL: Record<BikeRow["status"], string> = {
  in_workshop: "In the workshop",
  photographed: "Being listed",
  live: "Available",
  reserved: "This bike has been reserved",
  sold: "This bike has been sold",
  delivered: "This bike has been sold",
  paid_out: "This bike has been sold",
};

export function Actions({
  bikeId,
  listingType,
  bikeStatus,
  available,
  offerEligible,
  hasUser,
  activeOffer,
}: {
  bikeId: string;
  listingType: ListingType;
  bikeStatus: BikeRow["status"];
  available: boolean;
  offerEligible: boolean;
  hasUser: boolean;
  activeOffer: OfferRow | null;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [testRideOpen, setTestRideOpen] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);

  const baseActions: Action[] =
    listingType === "self"
      ? [
          { label: "Message seller", kind: "message", primary: true },
          { label: "Book a test ride", kind: "test-ride", primary: false },
        ]
      : [
          { label: "Book a test ride", kind: "test-ride", primary: false },
          { label: "Reserve this bike", kind: "reserve", primary: true },
        ];

  const showOfferAction = offerEligible && !activeOffer;

  function requireLoginThen(fn: () => void) {
    if (!hasUser) {
      router.push(`/login?next=/bikes/${bikeId}`);
      return;
    }
    fn();
  }

  function handleClick(action: Action) {
    requireLoginThen(() => {
      if (action.kind === "message") {
        startTransition(() => startConversation(bikeId));
        return;
      }
      if (action.kind === "test-ride") {
        setTestRideOpen(true);
        return;
      }
      if (action.kind === "reserve") {
        router.push(`/checkout/${bikeId}`);
      }
    });
  }

  if (!available) {
    return (
      <div className="rounded-control border border-line bg-paper px-4 py-3 text-sm text-muted">
        {UNAVAILABLE_LABEL[bikeStatus]}.
      </div>
    );
  }

  const primaryAction = baseActions.find((a) => a.primary) ?? baseActions[0];
  const secondaryAction = baseActions.find((a) => !a.primary) ?? baseActions[1];

  return (
    <div>
      {/* Desktop actions */}
      <div className="hidden gap-3 md:flex">
        {baseActions.map((action) => (
          <Button
            key={action.label}
            size="lg"
            variant={action.primary ? "default" : "outline"}
            onClick={() => handleClick(action)}
            className={
              action.primary
                ? "h-11 rounded-control bg-brand-fill px-4 text-white hover:bg-brand-fill-hover"
                : "h-11 rounded-control border-brand bg-transparent px-4 text-brand hover:bg-brand-tint"
            }
          >
            {action.label}
          </Button>
        ))}
        {showOfferAction && (
          <Button
            size="lg"
            variant="outline"
            onClick={() => requireLoginThen(() => setOfferOpen(true))}
            className="h-11 rounded-control border-line px-4 text-ink hover:border-brand hover:text-brand"
          >
            Make an offer
          </Button>
        )}
      </div>

      {/* Mobile: offer link inline (not part of the sticky pair) */}
      {showOfferAction && (
        <Button
          variant="link"
          onClick={() => requireLoginThen(() => setOfferOpen(true))}
          className="mt-1 h-auto p-0 text-sm text-brand md:hidden"
        >
          Make an offer
        </Button>
      )}

      {activeOffer && (
        <p className="mt-3 rounded-control border border-line bg-surface px-3 py-2 text-sm text-muted">
          {activeOffer.status === "pending" ? (
            <>You offered {formatPrice(activeOffer.proposed_price)} — Revélo is reviewing it.</>
          ) : (
            <>
              Revélo countered at{" "}
              {formatPrice(activeOffer.counter_price ?? activeOffer.proposed_price)} —{" "}
              <Link href="/offers" className="font-medium text-brand hover:underline">
                respond on your offers page
              </Link>
              .
            </>
          )}
        </p>
      )}

      {/* Mobile sticky bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-line bg-surface p-3 md:hidden">
        <Button
          size="lg"
          onClick={() => handleClick(primaryAction)}
          className="h-12 flex-1 rounded-control bg-brand-fill text-white hover:bg-brand-fill-hover"
        >
          {primaryAction.label}
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={() => handleClick(secondaryAction)}
          className="h-12 rounded-control border-brand bg-transparent text-brand hover:bg-brand-tint"
        >
          {secondaryAction.label}
        </Button>
      </div>

      <TestRideDialog
        open={testRideOpen}
        onOpenChange={setTestRideOpen}
        bikeId={bikeId}
        listingType={listingType}
      />
      <OfferDialog open={offerOpen} onOpenChange={setOfferOpen} bikeId={bikeId} />
    </div>
  );
}
