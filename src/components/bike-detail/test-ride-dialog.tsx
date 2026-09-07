"use client";

import { useMemo, useState, useTransition } from "react";
import { clsx } from "clsx";
import { requestTestRide } from "@/lib/buyer/actions";
import type { ListingType } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const TIME_OPTIONS = [
  { hour: 11, label: "11:00 AM" },
  { hour: 15, label: "3:00 PM" },
];

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

interface Slot {
  iso: string;
  dateLabel: string;
  timeLabel: string;
}

function nextSlots(days: number): Slot[] {
  const slots: Slot[] = [];
  for (let d = 1; d <= days; d++) {
    for (const time of TIME_OPTIONS) {
      const slot = new Date();
      slot.setDate(slot.getDate() + d);
      slot.setHours(time.hour, 0, 0, 0);
      slots.push({ iso: slot.toISOString(), dateLabel: dateFormatter.format(slot), timeLabel: time.label });
    }
  }
  return slots;
}

export function TestRideDialog({
  open,
  onOpenChange,
  bikeId,
  listingType,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bikeId: string;
  listingType: ListingType;
}) {
  const slots = useMemo(() => nextSlots(5), []);
  const [selectedIso, setSelectedIso] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<"pending" | "accepted" | null>(null);

  function close(next: boolean) {
    onOpenChange(next);
    if (!next) {
      setSelectedIso(null);
      setResult(null);
    }
  }

  function confirm() {
    if (!selectedIso) return;
    startTransition(async () => {
      const { status } = await requestTestRide(bikeId, selectedIso);
      setResult(status);
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={close}>
      <AlertDialogContent>
        {result ? (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {result === "accepted" ? "Test ride confirmed" : "Request sent"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {result === "accepted"
                  ? "Your slot is booked — Revélo already holds this bike, so it's confirmed."
                  : "The seller will accept or suggest another time. Track the status on your test rides page."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => close(false)}>Done</AlertDialogCancel>
            </AlertDialogFooter>
          </>
        ) : (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Book a test ride</AlertDialogTitle>
              <AlertDialogDescription>
                {listingType === "certified"
                  ? "Pick a time — Revélo already holds this bike, so it's confirmed instantly."
                  : "Pick a time. The seller still holds the bike, so they'll confirm or suggest another slot."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="grid max-h-72 grid-cols-2 gap-1.5 overflow-y-auto py-1">
              {slots.map((slot) => (
                <button
                  key={slot.iso}
                  type="button"
                  onClick={() => setSelectedIso(slot.iso)}
                  className={clsx(
                    "rounded-control border px-3 py-2 text-left text-sm",
                    selectedIso === slot.iso
                      ? "border-brand bg-brand-tint text-brand"
                      : "border-line text-ink hover:border-brand/50",
                  )}
                >
                  <span className="block">{slot.dateLabel}</span>
                  <span className="block text-xs text-muted">{slot.timeLabel}</span>
                </button>
              ))}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => close(false)}>Cancel</AlertDialogCancel>
              <Button
                disabled={!selectedIso || pending}
                onClick={confirm}
                className="bg-brand-fill text-white hover:bg-brand-fill-hover"
              >
                {pending ? "Booking…" : "Confirm slot"}
              </Button>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
