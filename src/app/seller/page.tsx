import Link from "next/link";
import Image from "next/image";
import { clsx } from "clsx";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/auth";
import { listMyBikes, listMyPendingSubmissions, type BikeRow } from "@/lib/seller/queries";
import { formatPrice, formatKm } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { TierBadge } from "@/components/badges/tier-badge";
import { DeleteMyBikeButton } from "@/components/seller/delete-my-bike-button";

const STATUS_LABEL: Record<BikeRow["status"], string> = {
  in_workshop: "In workshop",
  photographed: "Photographed",
  live: "Live",
  reserved: "Reserved",
  sold: "Sold",
  delivered: "Delivered",
  paid_out: "Paid out",
};

const SUBMISSION_STATUS_LABEL: Record<string, string> = {
  pending: "Pending review",
  flagged: "Flagged",
  rejected: "Not approved",
};

export default async function SellerListingsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const [bikes, submissions] = await Promise.all([
    listMyBikes(supabase, user.id),
    listMyPendingSubmissions(supabase, user.id),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-h4 font-semibold tracking-tight">My listings</h1>
        <Button
          render={<Link href="/sell" />}
          nativeButton={false}
          className="h-9 rounded-control bg-brand-fill text-white hover:bg-brand-fill-hover"
        >
          + Sell a bike
        </Button>
      </div>

      {submissions.length > 0 && (
        <div className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted">In review</p>
          <div className="mt-2 flex flex-col gap-2">
            {submissions.map((s) => (
              <div
                key={s.id}
                className={clsx(
                  "flex items-center justify-between rounded-control border p-3",
                  s.status === "flagged"
                    ? "border-danger bg-danger-bg/40"
                    : "border-line bg-surface",
                )}
              >
                <div>
                  <p className="text-sm font-medium text-ink">
                    {s.brand} {s.model} · {s.year}
                  </p>
                  <p className="text-xs text-muted">
                    {s.chosen_path === "certify" ? "Certify & consign" : "List it myself"}
                  </p>
                </div>
                <span
                  className={clsx(
                    "rounded-pill px-2.5 py-1 text-xs font-medium",
                    s.status === "flagged"
                      ? "bg-danger text-white"
                      : s.status === "rejected"
                        ? "bg-line text-muted"
                        : "bg-brand-tint text-brand",
                  )}
                >
                  {SUBMISSION_STATUS_LABEL[s.status] ?? s.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        {bikes.length === 0 && submissions.length === 0 ? (
          <div className="rounded-card border border-dashed border-line p-10 text-center text-muted">
            No listings yet.{" "}
            <Link href="/sell" className="text-brand hover:underline">
              Sell your first bike
            </Link>
            .
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bikes.map((bike) => (
              <div
                key={bike.id}
                className="overflow-hidden rounded-card border border-line bg-surface"
              >
                <div className="relative aspect-[4/3] w-full bg-line">
                  {bike.photos[0] && (
                    <Image
                      src={bike.photos[0]}
                      alt={`${bike.brand} ${bike.model}`}
                      fill
                      sizes="(min-width: 1024px) 30vw, 50vw"
                      className="object-cover"
                    />
                  )}
                  <div className="absolute left-2 top-2">
                    <TierBadge listingType={bike.listing_type} />
                  </div>
                </div>
                <div className="p-3">
                  <p className="font-medium text-ink">
                    {bike.brand} {bike.model}
                  </p>
                  <p className="text-sm text-muted">
                    {formatPrice(bike.price)} · {bike.year} · {formatKm(bike.km)}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <span className="rounded-pill bg-line-subtle px-2 py-0.5 text-xs font-medium text-muted">
                      {STATUS_LABEL[bike.status]}
                    </span>
                    {bike.pending_certification && (
                      <span className="rounded-pill bg-brand-tint px-2 py-0.5 text-xs font-medium text-brand">
                        Certification requested
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-line-subtle pt-2">
                    <Link
                      href={`/seller/${bike.id}/edit`}
                      className="text-sm font-medium text-brand hover:underline"
                    >
                      Edit
                    </Link>
                    <DeleteMyBikeButton bikeId={bike.id} label={`${bike.brand} ${bike.model}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
