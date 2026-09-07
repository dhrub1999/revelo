import { clsx } from "clsx";
import { BatteryChargingVertical } from "@phosphor-icons/react/dist/ssr/BatteryChargingVertical";

export function BatteryBadge({
  percent,
  variant = "overlay",
  className,
}: {
  percent: number;
  variant?: "overlay" | "inline" | "panel";
  className?: string;
}) {
  if (variant === "panel") {
    return (
      <span
        className={clsx(
          "font-heading text-h4 font-semibold text-battery",
          className,
        )}
      >
        {percent}%
      </span>
    );
  }

  if (variant === "inline") {
    return (
      <span
        className={clsx(
          "inline-flex items-center gap-0.5 font-medium text-battery",
          className,
        )}
      >
        <BatteryChargingVertical weight="fill" className="size-4" />
        {percent}%
      </span>
    );
  }

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-control border border-line bg-surface/95 px-2 py-1 text-sm font-semibold text-battery shadow-sm backdrop-blur",
        className,
      )}
    >
      <BatteryChargingVertical weight="fill" className="size-4" />
      {percent}%
    </span>
  );
}
