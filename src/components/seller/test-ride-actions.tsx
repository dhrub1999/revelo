"use client";

import { useState, useTransition } from "react";
import { acceptTestRide, rejectTestRide } from "@/lib/seller/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function TestRideActions({ testRideId }: { testRideId: string }) {
  const [pending, startTransition] = useTransition();
  const [reason, setReason] = useState("");
  const [alt1, setAlt1] = useState("");
  const [alt2, setAlt2] = useState("");

  function reject() {
    const alternativeDates = [alt1, alt2]
      .filter(Boolean)
      .map((v) => new Date(v).toISOString());
    startTransition(() => rejectTestRide(testRideId, reason, alternativeDates));
  }

  return (
    <div className="flex gap-2">
      <Button
        disabled={pending}
        size="sm"
        onClick={() => startTransition(() => acceptTestRide(testRideId))}
        className="h-8 rounded-control bg-brand-fill text-white hover:bg-brand-fill-hover"
      >
        Accept
      </Button>
      <AlertDialog>
        <AlertDialogTrigger
          render={<Button variant="outline" size="sm" />}
          className="h-8 rounded-control border-line"
        >
          Reject
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Can&apos;t make this slot?</AlertDialogTitle>
            <AlertDialogDescription>
              Let the buyer know why, and suggest alternative times if you can.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-3 py-1">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="reject-reason" className="text-xs text-muted">
                Reason
              </Label>
              <Textarea
                id="reject-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="alt1" className="text-xs text-muted">
                  Alternative 1
                </Label>
                <Input
                  id="alt1"
                  type="datetime-local"
                  value={alt1}
                  onChange={(e) => setAlt1(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="alt2" className="text-xs text-muted">
                  Alternative 2
                </Label>
                <Input
                  id="alt2"
                  type="datetime-local"
                  value={alt2}
                  onChange={(e) => setAlt2(e.target.value)}
                  className="h-9"
                />
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              disabled={pending || !reason.trim()}
              onClick={reject}
              className="bg-danger text-white hover:bg-danger/90"
            >
              {pending ? "Sending…" : "Send"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
