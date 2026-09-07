import { Check } from "@phosphor-icons/react/dist/ssr/Check";
import { X } from "@phosphor-icons/react/dist/ssr/X";
import { clsx } from "clsx";
import { createClient } from "@/lib/supabase/server";
import { listModerationQueue, getDisplayNames } from "@/lib/admin/queries";
import { formatPrice } from "@/lib/format";
import { ModerationActions } from "@/components/admin/moderation-actions";

export default async function ModerationPage() {
  const supabase = await createClient();
  const queue = await listModerationQueue(supabase);
  const displayNames = await getDisplayNames(
    supabase,
    queue.rows.map((r) => r.seller_id),
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-h4 font-semibold tracking-tight">Moderation</h1>
          <Chip label={`${queue.pendingCount} pending`} />
          <Chip label={`${queue.flaggedCount} flagged`} tone="flag" />
          <Chip label={`${queue.liveCount} live`} />
        </div>
        {queue.autoApprovedRate !== null && (
          <p className="text-sm text-muted">Auto-approved: {queue.autoApprovedRate}%</p>
        )}
      </div>

      <div className="mt-5 rounded-card border border-line bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-medium">Listing</th>
              <th className="px-4 py-3 font-medium">Asking</th>
              <th className="px-4 py-3 font-medium">Checks</th>
              <th className="px-4 py-3 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {queue.rows.map((row) => {
              const checks = row.automated_checks;
              const totalListings = row.seller_id
                ? (queue.sellerListingCounts.get(row.seller_id) ?? 1)
                : 1;
              const suggestedPrice =
                checks?.price_in_range === false && row.asking_price
                  ? Math.round((row.asking_price * 0.9) / 100) * 100
                  : null;

              return (
                <tr
                  key={row.id}
                  className={clsx(
                    "border-b border-line last:border-0",
                    row.status === "flagged" && "bg-danger-bg/40",
                  )}
                >
                  <td className="px-4 py-3 align-top">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-ink">
                        {row.model} {row.year}
                      </p>
                      {row.status === "flagged" && (
                        <span className="rounded-control border border-danger px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-danger">
                          Flag
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted">
                      {displayNames.get(row.seller_id) ?? "Seller"} ·{" "}
                      {row.seller_photos?.length ?? 0} photos · ₹99 paid
                    </p>
                  </td>
                  <td className="px-4 py-3 align-top font-medium">
                    {row.asking_price ? formatPrice(row.asking_price) : "—"}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <ul className="flex flex-col gap-0.5 text-xs">
                      <CheckLine ok={checks?.phone_verified !== false} label="phone verified" />
                      <CheckLine
                        ok={checks?.photos_original !== false}
                        label={checks?.photos_original === false ? "photo reused" : "photos original"}
                      />
                      <CheckLine
                        ok={checks?.price_in_range !== false}
                        label={checks?.price_in_range === false ? "price out of range" : "price in range"}
                      />
                      {checks?.repeat_seller && (
                        <li className="text-ink">{ordinal(totalListings)} listing this month</li>
                      )}
                    </ul>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <ModerationActions submission={row} suggestedPrice={suggestedPrice} />
                  </td>
                </tr>
              );
            })}
            {queue.rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-muted">
                  Nothing waiting on moderation.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 rounded-card border border-dashed border-line p-4 text-sm text-muted">
        <p className="font-medium text-ink">We moderate, we don&apos;t inspect</p>
        <p className="mt-1">
          Checks are on the listing, not the bike: real photos, contactable seller, price
          sanity, repeat-seller detection. Nothing here implies we&apos;ve seen it.
        </p>
      </div>
    </div>
  );
}

function Chip({ label, tone = "default" }: { label: string; tone?: "default" | "flag" }) {
  return (
    <span
      className={clsx(
        "rounded-pill border px-3 py-1 text-sm font-medium",
        tone === "flag" ? "border-danger text-danger" : "border-line text-ink",
      )}
    >
      {label}
    </span>
  );
}

function ordinal(n: number): string {
  const rules = new Intl.PluralRules("en", { type: "ordinal" });
  const suffixes: Record<string, string> = { one: "st", two: "nd", few: "rd", other: "th" };
  return `${n}${suffixes[rules.select(n)]}`;
}

function CheckLine({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className={clsx("flex items-center gap-1", ok ? "text-battery" : "text-danger")}>
      {ok ? <Check size={12} weight="bold" /> : <X size={12} weight="bold" />}
      {label}
    </li>
  );
}
