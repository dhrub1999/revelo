import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listConsignQueue, getDisplayNames } from "@/lib/admin/queries";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { StartWorksheetButton } from "@/components/admin/start-worksheet-button";

const STAGE_LABEL: Record<string, string> = {
  in_workshop: "In workshop",
  photographed: "Photographed",
};

export default async function ConsignPage() {
  const supabase = await createClient();
  const queue = await listConsignQueue(supabase);

  const sellerIds = [
    ...queue.notStarted.map((s) => s.seller_id),
    ...queue.inProgress.map((r) => r.bike.seller_id),
  ];
  const displayNames = await getDisplayNames(supabase, sellerIds);

  return (
    <div>
      <h1 className="text-h4 font-semibold tracking-tight">Consign</h1>
      <p className="mt-1 text-sm text-muted">
        Certified-path submissions. Start a worksheet to bring a bike into the workshop
        pipeline, then publish once inspection and pricing are set.
      </p>

      <section className="mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Not started
        </h2>
        <div className="mt-2 rounded-card border border-line bg-surface">
          {queue.notStarted.length === 0 ? (
            <p className="p-4 text-sm text-muted">No new certify submissions waiting.</p>
          ) : (
            <ul className="divide-y divide-line">
              {queue.notStarted.map((submission) => (
                <li key={submission.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium text-ink">
                      {submission.brand} {submission.model} {submission.year}
                    </p>
                    <p className="text-xs text-muted">
                      {displayNames.get(submission.seller_id) ?? "Seller"} ·{" "}
                      {submission.km.toLocaleString("en-IN")} km
                      {submission.estimated_range_low && submission.estimated_range_high
                        ? ` · est. ${formatPrice(submission.estimated_range_low)}–${formatPrice(submission.estimated_range_high)}`
                        : ""}
                    </p>
                  </div>
                  <StartWorksheetButton submissionId={submission.id} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          In progress
        </h2>
        <div className="mt-2 rounded-card border border-line bg-surface">
          {queue.inProgress.length === 0 ? (
            <p className="p-4 text-sm text-muted">Nothing in the workshop right now.</p>
          ) : (
            <ul className="divide-y divide-line">
              {queue.inProgress.map(({ bike, certification }) => (
                <li key={bike.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium text-ink">
                      {bike.brand} {bike.model} {bike.year}
                    </p>
                    <p className="text-xs text-muted">
                      {displayNames.get(bike.seller_id) ?? "Seller"} ·{" "}
                      {STAGE_LABEL[bike.status] ?? bike.status}
                      {certification ? ` · list ${formatPrice(certification.list_price)}` : ""}
                    </p>
                  </div>
                  <Button
                    render={<Link href={`/admin/consign/${bike.id}`} />}
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-control border-line"
                  >
                    Open worksheet
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
