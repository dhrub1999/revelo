import { clsx } from "clsx";
import { Toggle } from "@/components/ui/toggle";
import type { BikeFilters } from "@/lib/bikes/types";

export function QuickFilterChips({
  filters,
  onChange,
}: {
  filters: BikeFilters;
  onChange: (partial: Partial<BikeFilters>) => void;
}) {
  const chips = [
    {
      key: "under30k",
      label: "Under ₹30k",
      active: filters.priceRange === "0-30000",
      toggle: () =>
        onChange({ priceRange: filters.priceRange === "0-30000" ? "" : "0-30000" }),
    },
    {
      key: "battery90",
      label: "90%+",
      active: filters.batteryMin === 90,
      toggle: () => onChange({ batteryMin: filters.batteryMin === 90 ? null : 90 }),
    },
    {
      key: "certified",
      label: "Certified only",
      active: filters.certifiedOnly,
      toggle: () => onChange({ certifiedOnly: !filters.certifiedOnly }),
    },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {chips.map((chip) => (
        <Toggle
          key={chip.key}
          pressed={chip.active}
          onPressedChange={chip.toggle}
          className={clsx(
            "shrink-0 rounded-pill border px-3 text-sm whitespace-nowrap",
            chip.active
              ? "border-brand-fill bg-brand-fill text-white hover:bg-brand-fill-hover hover:text-white"
              : "border-line bg-surface text-ink hover:bg-surface",
          )}
        >
          {chip.label}
        </Toggle>
      ))}
    </div>
  );
}
