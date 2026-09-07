"use client";

import { useTransition } from "react";
import { deleteBike } from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function DeleteBikeButton({
  bikeId,
  label,
  variant = "row",
}: {
  bikeId: string;
  label: string;
  variant?: "row" | "link";
}) {
  const [pending, startTransition] = useTransition();

  return (
    <AlertDialog>
      {variant === "row" ? (
        <AlertDialogTrigger
          render={<Button variant="outline" size="sm" />}
          className="h-8 rounded-control border-line text-sm text-danger hover:bg-danger-bg"
        >
          Del
        </AlertDialogTrigger>
      ) : (
        <AlertDialogTrigger
          render={<Button variant="link" />}
          className="h-auto p-0 text-sm text-muted hover:text-danger"
        >
          Delete
        </AlertDialogTrigger>
      )}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {label}?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes the listing. This can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
            onClick={() => startTransition(() => deleteBike(bikeId))}
            className="bg-danger text-white hover:bg-danger/90"
          >
            {pending ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
