"use client";

import { useState, useTransition } from "react";
import { clsx } from "clsx";
import { acceptOffer, counterOffer, rejectOffer } from "@/lib/admin/actions";
import type { OfferRow } from "@/lib/admin/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function actionButtonClass(primary: boolean) {
  return clsx(
    "h-8 rounded-control text-sm",
    primary
      ? "bg-brand-fill text-white hover:bg-brand-fill-hover"
      : "border-line text-ink hover:border-brand hover:text-brand",
  );
}

export function OfferActions({ offer, bikePrice }: { offer: OfferRow; bikePrice: number }) {
  const [pending, startTransition] = useTransition();
  const [counterOpen, setCounterOpen] = useState(false);
  const [counterPrice, setCounterPrice] = useState(String(bikePrice));

  if (offer.status === "countered") {
    return <p className="text-right text-xs text-muted">Waiting on buyer&apos;s response</p>;
  }

  return (
    <>
      <div className="flex justify-end gap-2">
        <Button
          disabled={pending}
          variant="outline"
          size="sm"
          onClick={() => startTransition(() => rejectOffer(offer.id))}
          className={actionButtonClass(false)}
        >
          Reject
        </Button>
        <Button
          disabled={pending}
          variant="outline"
          size="sm"
          onClick={() => setCounterOpen(true)}
          className={actionButtonClass(false)}
        >
          Counter
        </Button>
        <Button
          disabled={pending}
          size="sm"
          onClick={() => startTransition(() => acceptOffer(offer.id))}
          className={actionButtonClass(true)}
        >
          Accept
        </Button>
      </div>

      <AlertDialog open={counterOpen} onOpenChange={setCounterOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Counter this offer</AlertDialogTitle>
            <AlertDialogDescription>
              Buyer offered ₹{offer.proposed_price.toLocaleString("en-IN")}. Set the price
              Revélo will counter at.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            type="number"
            min={1}
            value={counterPrice}
            onChange={(e) => setCounterPrice(e.target.value)}
            className="h-10"
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCounterOpen(false)}>Cancel</AlertDialogCancel>
            <Button
              disabled={pending || !counterPrice || Number(counterPrice) <= 0}
              onClick={() =>
                startTransition(async () => {
                  await counterOffer(offer.id, Number(counterPrice));
                  setCounterOpen(false);
                })
              }
              className="bg-brand-fill text-white hover:bg-brand-fill-hover"
            >
              Send counter
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
