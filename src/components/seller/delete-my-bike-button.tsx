"use client";

import { useTransition } from "react";
import { deleteMyBike } from "@/lib/seller/actions";
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

export function DeleteMyBikeButton({ bikeId, label }: { bikeId: string; label: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={<Button variant="link" />}
        className="h-auto p-0 text-sm text-muted hover:text-danger"
      >
        Delete
      </AlertDialogTrigger>
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
            onClick={() => startTransition(() => deleteMyBike(bikeId))}
            className="bg-danger text-white hover:bg-danger/90"
          >
            {pending ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
