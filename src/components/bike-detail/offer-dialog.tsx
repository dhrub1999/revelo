"use client";

import { useState, useTransition } from "react";
import { submitOffer } from "@/lib/buyer/actions";
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

export function OfferDialog({
  open,
  onOpenChange,
  bikeId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bikeId: string;
}) {
  const [price, setPrice] = useState("");
  const [pending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);

  function close(next: boolean) {
    onOpenChange(next);
    if (!next) {
      setPrice("");
      setSent(false);
    }
  }

  function submit() {
    const value = Number(price);
    if (!value || value <= 0) return;
    startTransition(async () => {
      await submitOffer(bikeId, value);
      setSent(true);
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={close}>
      <AlertDialogContent>
        {sent ? (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Offer sent</AlertDialogTitle>
              <AlertDialogDescription>
                Revélo reviews aging-stock offers directly — track the status on your offers
                page.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => close(false)}>Done</AlertDialogCancel>
            </AlertDialogFooter>
          </>
        ) : (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Make an offer</AlertDialogTitle>
              <AlertDialogDescription>
                Goes to Revélo for review, not directly to the seller — we manage certified
                bikes end-to-end.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Input
              type="number"
              min={1}
              placeholder="Your offer, in ₹"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="h-10"
            />
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => close(false)}>Cancel</AlertDialogCancel>
              <Button
                disabled={!price || Number(price) <= 0 || pending}
                onClick={submit}
                className="bg-brand-fill text-white hover:bg-brand-fill-hover"
              >
                {pending ? "Sending…" : "Send offer"}
              </Button>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
