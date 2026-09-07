import { clsx } from "clsx";
import { FilterSelect } from "./filter-select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  BATTERY_MINIMUMS,
  BIKE_TYPES,
  KM_RANGES,
  PRICE_RANGES,
  SORT_OPTIONS,
  type BikeFilters,
} from "@/lib/bikes/types";

export function FilterBar({
  filters,
  onChange,
  brands,
  years,
  stacked = false,
}: {
  filters: BikeFilters;
  onChange: (partial: Partial<BikeFilters>) => void;
  brands: string[];
  years: number[];
  stacked?: boolean;
}) {
  return (
    <div
      className={clsx(
        "gap-3",
        stacked ? "flex flex-col" : "flex flex-wrap items-center",
      )}
    >
      <FilterSelect
        label="Price"
        value={filters.priceRange}
        onChange={(value) => onChange({ priceRange: value })}
        options={PRICE_RANGES}
        className={stacked ? "w-full" : undefined}
      />
      <FilterSelect
        label="Battery"
        value={filters.batteryMin ? String(filters.batteryMin) : ""}
        onChange={(value) => onChange({ batteryMin: value ? Number(value) : null })}
        options={BATTERY_MINIMUMS}
        className={stacked ? "w-full" : undefined}
      />
      <FilterSelect
        label="Brand"
        value={filters.brand}
        onChange={(value) => onChange({ brand: value })}
        options={[
          { value: "", label: "All brands" },
          ...brands.map((brand) => ({ value: brand, label: brand })),
        ]}
        className={stacked ? "w-full" : undefined}
      />
      <FilterSelect
        label="Year"
        value={filters.year ? String(filters.year) : ""}
        onChange={(value) => onChange({ year: value ? Number(value) : null })}
        options={[
          { value: "", label: "All years" },
          ...years.map((year) => ({ value: String(year), label: String(year) })),
        ]}
        className={stacked ? "w-full" : undefined}
      />
      <FilterSelect
        label="Type"
        value={filters.type}
        onChange={(value) => onChange({ type: value as BikeFilters["type"] })}
        options={[{ value: "", label: "All types" }, ...BIKE_TYPES]}
        className={stacked ? "w-full" : undefined}
      />
      <FilterSelect
        label="Km"
        value={filters.kmRange}
        onChange={(value) => onChange({ kmRange: value })}
        options={KM_RANGES}
        className={stacked ? "w-full" : undefined}
      />
      <FilterSelect
        label="Sort"
        value={filters.sort}
        onChange={(value) => onChange({ sort: value as BikeFilters["sort"] })}
        options={SORT_OPTIONS}
        className={stacked ? "w-full" : undefined}
      />

      <Label
        className={clsx(
          "rounded-control border border-line px-3 py-2 text-sm font-normal",
          stacked ? "w-full" : "ml-auto",
        )}
      >
        <Checkbox
          checked={filters.certifiedOnly}
          onCheckedChange={(checked) => onChange({ certifiedOnly: checked === true })}
        />
        Certified only
      </Label>
    </div>
  );
}
