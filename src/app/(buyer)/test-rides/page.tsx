import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/auth";
import { listMyTestRides } from "@/lib/buyer/queries";

const STATUS_LABEL: Record<string, string> = {
  pending: "Awaiting the seller",
  accepted: "Confirmed",
  rejected: "Not available",
};

const STATUS_CLASS: Record<string, string> = {
  pending: "text-muted",
  accepted: "text-brand",
  rejected: "text-danger",
};

function formatSlot(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default async function MyTestRidesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const rides = await listMyTestRides(supabase, user.id);

  return (
    <div>
      <h1 className="text-h4 font-semibold tracking-tight">Test rides</h1>
      <p className="mt-1 text-sm text-muted">
        Certified bikes confirm instantly — self-listed sellers accept or suggest another time.
      </p>

      <div className="mt-6 flex flex-col gap-2">
        {rides.map(({ testRide, bike }) => (
          <div key={testRide.id} className="rounded-card border border-line bg-surface p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Link
                  href={`/bikes/${bike.id}`}
                  className="text-sm font-medium text-ink hover:text-brand"
                >
                  {bike.brand} {bike.model}
                </Link>
                <p className="mt-0.5 text-xs text-muted">{formatSlot(testRide.requested_slot)}</p>
              </div>
              <span className={`text-sm font-medium ${STATUS_CLASS[testRide.status]}`}>
                {STATUS_LABEL[testRide.status]}
              </span>
            </div>
            {testRide.status === "rejected" && testRide.rejection_reason && (
              <div className="mt-2 rounded-control bg-paper p-3 text-sm text-ink">
                <p>{testRide.rejection_reason}</p>
                {testRide.alternative_dates && testRide.alternative_dates.length > 0 && (
                  <p className="mt-1 text-xs text-muted">
                    Alternative dates: {testRide.alternative_dates.map(formatSlot).join(", ")}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
        {rides.length === 0 && (
          <div className="rounded-card border border-dashed border-line p-10 text-center text-muted">
            No test rides booked yet. Find a bike and book one from its listing page.
          </div>
        )}
      </div>
    </div>
  );
}
