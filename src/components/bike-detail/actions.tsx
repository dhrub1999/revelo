"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ListingType } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";

interface Action {
  label: string;
  primary: boolean;
}

export function Actions({
  bikeId,
  listingType,
  offerEligible,
  hasUser,
}: {
  bikeId: string;
  listingType: ListingType;
  offerEligible: boolean;
  hasUser: boolean;
}) {
  const router = useRouter();
  const [notice, setNotice] = useState<string | null>(null);

  const baseActions: Action[] =
    listingType === "self"
      ? [
          { label: "Message seller", primary: true },
          { label: "Book a test ride", primary: false },
        ]
      : [
          { label: "Book a test ride", primary: false },
          { label: "Reserve this bike", primary: true },
        ];

  const offerAction: Action | null = offerEligible
    ? { label: "Make an offer", primary: false }
    : null;

  function handleClick(label: string) {
    if (!hasUser) {
      router.push(`/login?next=/bikes/${bikeId}`);
      return;
    }
    setNotice(`${label} is coming soon. Booking launches in a later phase.`);
  }

  const primaryAction = baseActions.find((a) => a.primary) ?? baseActions[0];
  const secondaryAction = baseActions.find((a) => !a.primary) ?? baseActions[1];

  return (
    <div>
      {/* Desktop actions */}
      <div className="hidden gap-3 md:flex">
        {[...baseActions, ...(offerAction ? [offerAction] : [])].map(
          (action) => (
            <Button
              key={action.label}
              size="lg"
              variant={action.primary ? "default" : "outline"}
              onClick={() => handleClick(action.label)}
              className={
                action.primary
                  ? "h-11 rounded-control bg-brand-fill px-4 text-white hover:bg-brand-fill-hover"
                  : "h-11 rounded-control border-brand bg-transparent px-4 text-brand hover:bg-brand-tint"
              }
            >
              {action.label}
            </Button>
          ),
        )}
      </div>

      {/* Mobile: offer link inline (not part of the sticky pair) */}
      {offerAction && (
        <Button
          variant="link"
          onClick={() => handleClick(offerAction.label)}
          className="mt-1 h-auto p-0 text-sm text-brand md:hidden"
        >
          {offerAction.label}
        </Button>
      )}

      {notice && (
        <p className="mt-3 rounded-control border border-line bg-surface px-3 py-2 text-sm text-muted">
          {notice}
        </p>
      )}

      {/* Mobile sticky bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-line bg-surface p-3 md:hidden">
        <Button
          size="lg"
          onClick={() => handleClick(primaryAction.label)}
          className="h-12 flex-1 rounded-control bg-brand-fill text-white hover:bg-brand-fill-hover"
        >
          {primaryAction.label}
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={() => handleClick(secondaryAction.label)}
          className="h-12 rounded-control border-brand bg-transparent text-brand hover:bg-brand-tint"
        >
          {secondaryAction.label}
        </Button>
      </div>
    </div>
  );
}
