"use client";

import { useTransition } from "react";
import { markNotificationsRead } from "@/lib/seller/actions";
import { Button } from "@/components/ui/button";

export function MarkNotificationsReadButton({ disabled }: { disabled: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      disabled={disabled || pending}
      variant="outline"
      size="sm"
      onClick={() => startTransition(() => markNotificationsRead())}
      className="h-8 rounded-control border-line"
    >
      {pending ? "Marking…" : "Mark all read"}
    </Button>
  );
}
