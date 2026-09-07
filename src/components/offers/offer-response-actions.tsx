"use client";

import { useTransition } from "react";
import { acceptCounterOffer, declineCounterOffer } from "@/lib/buyer/actions";
import { Button } from "@/components/ui/button";

export function OfferResponseActions({ offerId }: { offerId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex gap-2">
      <Button
        disabled={pending}
        variant="outline"
        size="sm"
        onClick={() => startTransition(() => declineCounterOffer(offerId))}
        className="h-8 rounded-control border-line text-sm text-ink hover:border-danger hover:text-danger"
      >
        Decline
      </Button>
      <Button
        disabled={pending}
        size="sm"
        onClick={() => startTransition(() => acceptCounterOffer(offerId))}
        className="h-8 rounded-control bg-brand-fill text-sm text-white hover:bg-brand-fill-hover"
      >
        Accept counter
      </Button>
    </div>
  );
}
