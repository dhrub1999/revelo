"use client";

import { useState, useTransition } from "react";
import { clsx } from "clsx";
import { requestServiceBooking } from "@/lib/service/actions";
import { SERVICE_ISSUE_OPTIONS, SERVICE_QUICK_CATEGORIES } from "@/lib/service/pricing";
import type { NextServiceSlot } from "@/lib/service/queries";
import type { Fulfillment } from "@/lib/supabase/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

// "Workshop or pickup" reuses the checkout Fulfillment enum ('delivery' |
// 'pickup') with the same cost meaning, not the same English word: 'pickup'
// is the free option (you bring the bike to us — mirrors checkout's free
// workshop pickup), 'delivery' is the paid one (we collect it — mirrors
// checkout's ₹250 home delivery).
const FULFILLMENT_OPTIONS: { value: Fulfillment; label: string }[] = [
  { value: "pickup", label: "Workshop — I'll drop it off (free)" },
  { value: "delivery", label: "Pickup — you collect it (₹250/way)" },
];

export function ServiceBookingPanel({
  initialNextSlot,
}: {
  initialNextSlot: NextServiceSlot | null;
}) {
  const [bike, setBike] = useState("");
  const [issue, setIssue] = useState<string>(SERVICE_ISSUE_OPTIONS[0]);
  const [fulfillment, setFulfillment] = useState<Fulfillment>("pickup");
  const [phone, setPhone] = useState("");
  const [nextSlot, setNextSlot] = useState(initialNextSlot);
  const [pending, startTransition] = useTransition();
  const [confirmedDate, setConfirmedDate] = useState<string | null>(null);

  const canSubmit = bike.trim() && phone.trim() && !pending;

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    startTransition(async () => {
      const { slotDate } = await requestServiceBooking({
        bikeBrandModel: bike,
        issueCategory: issue,
        fulfillment,
        phone,
      });
      setConfirmedDate(slotDate ? dateFormatter.format(new Date(slotDate)) : "soon");
      setNextSlot((current) => {
        if (!current || current.date !== slotDate) return current;
        const slotsAvailable = current.slotsAvailable - 1;
        return slotsAvailable > 0 ? { ...current, slotsAvailable } : null;
      });
    });
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {SERVICE_QUICK_CATEGORIES.map((category) => (
          <button
            key={category.key}
            type="button"
            onClick={() => setIssue(category.key)}
            className={clsx(
              "rounded-card border p-4 text-left transition-colors",
              issue === category.key
                ? "border-brand bg-brand-tint"
                : "border-line bg-surface hover:border-brand/50",
            )}
          >
            <p
              className={clsx(
                "text-sm font-medium",
                issue === category.key ? "text-brand" : "text-ink",
              )}
            >
              {category.title}
            </p>
            <p className="mt-1 text-xs text-muted">{category.price}</p>
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
        <form
          onSubmit={submit}
          className="rounded-card border border-line bg-surface p-5"
        >
          {confirmedDate ? (
            <div className="py-4 text-center">
              <p className="text-sm font-semibold text-ink">Booking sent</p>
              <p className="mt-1 text-sm text-muted">
                We&apos;ve pencilled you in around {confirmedDate} and will call to confirm.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Input
                placeholder="Bike brand & model"
                value={bike}
                onChange={(e) => setBike(e.target.value)}
                className="h-10"
              />
              <Select value={issue} onValueChange={(v) => v && setIssue(v)}>
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="What's wrong?" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_ISSUE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={fulfillment}
                onValueChange={(v) => v && setFulfillment(v as Fulfillment)}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Workshop or pickup">
                    {(current: Fulfillment) =>
                      FULFILLMENT_OPTIONS.find((option) => option.value === current)?.label
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {FULFILLMENT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                {pending ? "Sending…" : "Send"}
              </Button>
            </div>
          )}
        </form>

        <div className="rounded-card border border-line bg-line-subtle p-5">
          <p className="text-sm font-semibold text-ink">Next available</p>
          {nextSlot ? (
            <p className="mt-2 text-lg font-semibold text-brand">
              {dateFormatter.format(new Date(nextSlot.date))} — {nextSlot.slotsAvailable}{" "}
              slot{nextSlot.slotsAvailable === 1 ? "" : "s"}
            </p>
          ) : (
            <p className="mt-2 text-sm text-muted">Fully booked — we&apos;ll call to schedule.</p>
          )}
          <p className="mt-3 text-xs text-muted">
            Pickup ₹250/way, free on the annual plan.
          </p>
        </div>
      </div>
    </div>
  );
}
