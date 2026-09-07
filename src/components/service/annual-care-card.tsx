"use client";

import { useState } from "react";
import { Check } from "@phosphor-icons/react/dist/ssr/Check";
import { ANNUAL_CARE_PLAN } from "@/lib/service/pricing";
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

// No annual_plan table exists in data-model.md and P6 doesn't ask for one —
// this is an upsell CTA, mocked the same way as checkout's payment step.
export function AnnualCareCard() {
  const [open, setOpen] = useState(false);
  const [joined, setJoined] = useState(false);

  return (
    <div className="flex flex-col justify-between gap-4 rounded-card border border-brand/30 bg-brand-tint p-6 sm:flex-row sm:items-center">
      <div>
        <p className="text-sm font-semibold text-brand">Annual care plan — {ANNUAL_CARE_PLAN.price}</p>
        <ul className="mt-2 flex flex-col gap-1 text-sm text-ink">
          {ANNUAL_CARE_PLAN.perks.map((perk) => (
            <li key={perk} className="flex items-center gap-1.5">
              <Check size={14} weight="bold" className="text-brand" />
              {perk}
            </li>
          ))}
        </ul>
      </div>

      <AlertDialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) setJoined(false); }}>
        <Button
          onClick={() => setOpen(true)}
          className="h-10 shrink-0 bg-brand-fill px-5 text-white hover:bg-brand-fill-hover"
        >
          Join
        </Button>
        <AlertDialogContent>
          {joined ? (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>You&apos;re in</AlertDialogTitle>
                <AlertDialogDescription>
                  We&apos;ll be in touch to schedule your first tune-up.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setOpen(false)}>Done</AlertDialogCancel>
              </AlertDialogFooter>
            </>
          ) : (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>Join the annual care plan</AlertDialogTitle>
                <AlertDialogDescription>
                  {ANNUAL_CARE_PLAN.price} — two tune-ups, a battery report, and free pickup all
                  year. No real payment here — this is a demo confirmation.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setOpen(false)}>Cancel</AlertDialogCancel>
                <Button
                  onClick={() => setJoined(true)}
                  className="bg-brand-fill text-white hover:bg-brand-fill-hover"
                >
                  Confirm
                </Button>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
