import Image from "next/image";
import Link from "next/link";
import { clsx } from "clsx";
import type { BikeRow } from "@/lib/bikes/query";
import { formatKm, formatPrice } from "@/lib/format";
import { BatteryBadge } from "@/components/badges/battery-badge";
import { TierBadge } from "@/components/badges/tier-badge";

const STATUS_LABEL: Partial<Record<BikeRow["status"], string>> = {
  reserved: "Reserved",
  sold: "Sold",
  delivered: "Sold",
  paid_out: "Sold",
};

export function BikeCard({ bike }: { bike: BikeRow }) {
  const statusLabel = STATUS_LABEL[bike.status];
  const battery = bike.battery_health?.percent;

  return (
    <Link
      href={`/bikes/${bike.id}`}
      className="group block overflow-hidden rounded-card border border-line bg-surface transition-all hover:border-brand/40 hover:shadow-[0_8px_24px_-8px_rgba(11,111,104,0.25)]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-line">
        <Image
          src={bike.photos[0]}
          alt={`${bike.brand} ${bike.model}`}
          fill
          sizes="(min-width: 1024px) 24vw, 50vw"
          className={clsx(
            "object-cover transition-transform group-hover:scale-[1.02]",
            statusLabel && "opacity-60",
          )}
        />

        <div className="absolute left-2 top-2">
          <TierBadge listingType={bike.listing_type} />
        </div>

        {battery !== undefined && (
          <div className="absolute right-2 top-2 hidden sm:block">
            <BatteryBadge percent={battery} />
          </div>
        )}

        {statusLabel && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/40">
            <span className="rounded-pill bg-ink px-3 py-1 text-xs font-semibold uppercase tracking-wide text-paper">
              {statusLabel}
            </span>
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4">
        <p className="truncate font-medium">
          {bike.brand} {bike.model}
        </p>
        <p className="mt-0.5 font-semibold">{formatPrice(bike.price)}</p>
        <p className="mt-0.5 text-sm text-muted">
          {bike.year} · {formatKm(bike.km)}
          {battery !== undefined && (
            <span className="sm:hidden">
              {" "}
              · <BatteryBadge percent={battery} variant="inline" />
            </span>
          )}
        </p>
      </div>
    </Link>
  );
}
