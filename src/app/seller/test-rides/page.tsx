import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/auth";
import { listMyTestRides } from "@/lib/seller/queries";
import { TestRideActions } from "@/components/seller/test-ride-actions";

const STATUS_LABEL: Record<string, string> = {
  pending: "Awaiting your response",
  accepted: "Accepted",
  rejected: "Rejected",
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

export default async function SellerTestRidesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const rides = await listMyTestRides(supabase, user.id);

  return (
    <div>
      <h1 className="text-h4 font-semibold tracking-tight">Test rides</h1>
      <p className="mt-1 text-sm text-muted">
        Requests on your self-listed bikes — certified bikes are handled by Revélo directly.
      </p>

      <div className="mt-6 flex flex-col gap-2">
        {rides.map(({ testRide, bike, buyerName }) => (
          <div
            key={testRide.id}
            className="flex flex-col gap-2 rounded-card border border-line bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-sm font-medium text-ink">
                {bike.brand} {bike.model} · {formatSlot(testRide.requested_slot)}
              </p>
              <p className="mt-0.5 text-xs text-muted">
                Requested by {buyerName} · {STATUS_LABEL[testRide.status]}
              </p>
              {testRide.status === "rejected" && testRide.rejection_reason && (
                <p className="mt-1 text-xs text-danger">{testRide.rejection_reason}</p>
              )}
            </div>
            {testRide.status === "pending" && <TestRideActions testRideId={testRide.id} />}
          </div>
        ))}
        {rides.length === 0 && (
          <div className="rounded-card border border-dashed border-line p-10 text-center text-muted">
            No test-ride requests yet.
          </div>
        )}
      </div>
    </div>
  );
}
