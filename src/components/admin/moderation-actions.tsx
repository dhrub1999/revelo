"use client";

import { useTransition } from "react";
import { clsx } from "clsx";
import {
  approveSubmission,
  askSellerAboutSubmission,
  flagForDealerReview,
  rejectSubmission,
  suggestPrice,
} from "@/lib/admin/actions";
import type { SubmissionRow } from "@/lib/admin/queries";
import { Button } from "@/components/ui/button";

function actionButtonClass(primary: boolean) {
  return clsx(
    "h-8 rounded-control text-sm",
    primary
      ? "bg-brand-fill text-white hover:bg-brand-fill-hover"
      : "border-line text-ink hover:border-brand hover:text-brand",
  );
}

export function ModerationActions({
  submission,
  suggestedPrice,
}: {
  submission: SubmissionRow;
  suggestedPrice: number | null;
}) {
  const [pending, startTransition] = useTransition();
  const checks = submission.automated_checks;

  const isFlagged = submission.status === "flagged";
  const isRepeatSeller = checks?.repeat_seller === true;
  const isPriceOutOfRange = checks?.price_in_range === false && suggestedPrice !== null;

  if (isFlagged) {
    return (
      <div className="flex justify-end gap-2">
        <Button
          disabled={pending}
          variant="outline"
          size="sm"
          onClick={() => startTransition(() => rejectSubmission(submission.id))}
          className={actionButtonClass(false)}
        >
          Reject
        </Button>
        <Button
          disabled={pending}
          size="sm"
          onClick={() => startTransition(() => askSellerAboutSubmission(submission.id))}
          className={actionButtonClass(true)}
        >
          Ask seller
        </Button>
      </div>
    );
  }

  if (isRepeatSeller) {
    return (
      <div className="flex justify-end gap-2">
        <Button
          disabled={pending}
          size="sm"
          onClick={() => startTransition(() => approveSubmission(submission.id))}
          className={actionButtonClass(true)}
        >
          Approve
        </Button>
        <Button
          disabled={pending}
          variant="outline"
          size="sm"
          onClick={() => startTransition(() => flagForDealerReview(submission.id))}
          className={actionButtonClass(false)}
        >
          Dealer?
        </Button>
      </div>
    );
  }

  if (isPriceOutOfRange && suggestedPrice !== null) {
    return (
      <div className="flex justify-end gap-2">
        <Button
          disabled={pending}
          size="sm"
          onClick={() => startTransition(() => approveSubmission(submission.id))}
          className={actionButtonClass(true)}
        >
          Approve
        </Button>
        <Button
          disabled={pending}
          variant="outline"
          size="sm"
          onClick={() => startTransition(() => suggestPrice(submission.id, suggestedPrice))}
          className={actionButtonClass(false)}
        >
          Suggest ₹{Math.round(suggestedPrice / 1000)}k
        </Button>
      </div>
    );
  }

  return (
    <div className="flex justify-end gap-2">
      <Button
        disabled={pending}
        size="sm"
        onClick={() => startTransition(() => approveSubmission(submission.id))}
        className={actionButtonClass(true)}
      >
        Approve
      </Button>
      <Button
        disabled={pending}
        variant="outline"
        size="sm"
        className={actionButtonClass(false)}
      >
        Hold
      </Button>
    </div>
  );
}
