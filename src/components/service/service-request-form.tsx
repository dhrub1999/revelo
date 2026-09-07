"use client";

import { useState, useTransition } from "react";
import { requestServiceBooking } from "@/lib/service/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

/** Screen 3's short bottom-band form: bike + issue, phone, "Request a slot".
 *  No fulfillment selector here — that's Screen 8's fuller booking form —
 *  so this defaults to a free workshop drop-off. */
export function ServiceRequestForm() {
  const [bike, setBike] = useState("");
  const [issue, setIssue] = useState("");
  const [phone, setPhone] = useState("");
  const [pending, startTransition] = useTransition();
  const [confirmedDate, setConfirmedDate] = useState<string | null>(null);

  const canSubmit = bike.trim() && issue.trim() && phone.trim() && !pending;

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    startTransition(async () => {
      const { slotDate } = await requestServiceBooking({
        bikeBrandModel: bike,
        issueCategory: issue,
        fulfillment: "pickup",
        phone,
      });
      setConfirmedDate(slotDate ? dateFormatter.format(new Date(slotDate)) : "soon");
    });
  }

  if (confirmedDate) {
    return (
      <div className="rounded-card border border-line bg-surface p-5">
        <p className="text-sm font-semibold text-ink">Request sent</p>
        <p className="mt-1 text-sm text-muted">
          We&apos;ll call you to confirm your slot around {confirmedDate}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-card border border-line bg-surface p-5">
      <p className="text-sm font-semibold text-ink">Request a slot</p>
      <div className="mt-3 flex flex-col gap-2.5">
        <Input
          placeholder="Bike brand & model"
          value={bike}
          onChange={(e) => setBike(e.target.value)}
          className="h-10"
        />
        <Input
          placeholder="What's wrong?"
          value={issue}
          onChange={(e) => setIssue(e.target.value)}
          className="h-10"
        />
        <Input
          type="tel"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="h-10"
        />
        <Button
          type="submit"
          disabled={!canSubmit}
          className="h-10 bg-brand-fill text-white hover:bg-brand-fill-hover"
        >
          {pending ? "Sending…" : "Request a slot"}
        </Button>
      </div>
    </form>
  );
}
