"use client";

import { useTransition } from "react";
import { startWorksheet } from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";

export function StartWorksheetButton({ submissionId }: { submissionId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      disabled={pending}
      size="sm"
      onClick={() => startTransition(() => startWorksheet(submissionId))}
      className="h-8 rounded-control bg-brand-fill text-white hover:bg-brand-fill-hover"
    >
      {pending ? "Starting…" : "Start worksheet"}
    </Button>
  );
}
