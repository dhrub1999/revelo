"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { requestCertification } from "@/lib/seller/actions";
import { formatShortDate } from "@/lib/format";
import type { ServiceSlotRow } from "@/lib/seller/queries";
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

export function CertifyUpsellDialog({
  open,
  onOpenChange,
  bikeId,
  slots,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bikeId: string;
  slots: ServiceSlotRow[];
}) {
  const router = useRouter();
  const [step, setStep] = useState<"pitch" | "slots">("pitch");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function close() {
    onOpenChange(false);
    setStep("pitch");
    setSelectedDate(null);
    router.push("/seller");
  }

  function confirmSlot() {
    if (!selectedDate) return;
    startTransition(async () => {
      await requestCertification(bikeId, selectedDate);
      close();
    });
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) close();
      }}
    >
      <AlertDialogContent>
        {step === "pitch" ? (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Certified bikes sell faster</AlertDialogTitle>
              <AlertDialogDescription>
                Free inspection, we handle buyers, and you still net most of the price after
                8% commission — nothing upfront.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={close}>Keep it as-is</AlertDialogCancel>
              <Button
                onClick={() => setStep("slots")}
                className="bg-brand-fill text-white hover:bg-brand-fill-hover"
              >
                Upgrade to certified
              </Button>
            </AlertDialogFooter>
          </>
        ) : (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Pick an inspection slot</AlertDialogTitle>
              <AlertDialogDescription>Free pickup within Pune.</AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex flex-col gap-1.5 py-1">
              {slots.length === 0 && (
                <p className="text-sm text-muted">No slots available right now — check back soon.</p>
              )}
              {slots.map((slot) => (
                <button
                  key={slot.date}
                  type="button"
                  onClick={() => setSelectedDate(slot.date)}
                  className={clsx(
                    "flex items-center justify-between rounded-control border px-3 py-2 text-left text-sm",
                    selectedDate === slot.date
                      ? "border-brand bg-brand-tint text-brand"
                      : "border-line text-ink hover:border-brand/50",
                  )}
                >
                  <span>{formatShortDate(slot.date)}</span>
                  <span className="text-xs text-muted">
                    {slot.slots_available} slot{slot.slots_available === 1 ? "" : "s"}
                  </span>
                </button>
              ))}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={close}>Keep it as-is</AlertDialogCancel>
              <Button
                disabled={!selectedDate || pending}
                onClick={confirmSlot}
                className="bg-brand-fill text-white hover:bg-brand-fill-hover"
              >
                {pending ? "Booking…" : "Request inspection"}
              </Button>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
