import type { BikeType } from "@/lib/supabase/types";

export type SortOption = "new" | "price_asc" | "price_desc" | "battery_desc";

export interface BikeFilters {
  q: string;
  brand: string;
  type: BikeType | "";
  year: number | null;
  /** Encoded as "min-max", "min-" (min and up), or "" (any). */
  priceRange: string;
  kmRange: string;
  /** Minimum tested battery %, or null for "any" (untested bikes always excluded once set). */
  batteryMin: number | null;
  certifiedOnly: boolean;
  sort: SortOption;
}

export const DEFAULT_FILTERS: BikeFilters = {
  q: "",
  brand: "",
  type: "",
  year: null,
  priceRange: "",
  kmRange: "",
  batteryMin: null,
  certifiedOnly: false,
  sort: "new",
};

export const PAGE_SIZE = 8;

export const PRICE_RANGES: { value: string; label: string }[] = [
  { value: "", label: "Any price" },
  { value: "0-20000", label: "Under ₹20,000" },
  { value: "20000-30000", label: "₹20,000 – ₹30,000" },
  { value: "30000-40000", label: "₹30,000 – ₹40,000" },
  { value: "40000-50000", label: "₹40,000 – ₹50,000" },
  { value: "50000-", label: "₹50,000+" },
];

export const KM_RANGES: { value: string; label: string }[] = [
  { value: "", label: "Any km" },
  { value: "0-2000", label: "Under 2,000 km" },
  { value: "2000-5000", label: "2,000 – 5,000 km" },
  { value: "5000-10000", label: "5,000 – 10,000 km" },
  { value: "10000-", label: "10,000+ km" },
];

export const BATTERY_MINIMUMS: { value: string; label: string }[] = [
  { value: "", label: "Any battery" },
  { value: "90", label: "90%+" },
  { value: "80", label: "80%+" },
  { value: "70", label: "70%+" },
  { value: "60", label: "60%+" },
];

export const BIKE_TYPES: { value: BikeType; label: string }[] = [
  { value: "hardtail", label: "Hardtail" },
  { value: "cargo", label: "Cargo" },
  { value: "city", label: "City" },
  { value: "folding", label: "Folding" },
  { value: "mountain", label: "Mountain" },
  { value: "hybrid", label: "Hybrid" },
];

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "new", label: "Sort: New" },
  { value: "price_asc", label: "Price: Low to high" },
  { value: "price_desc", label: "Price: High to low" },
  { value: "battery_desc", label: "Battery: High to low" },
];

export function parseRange(value: string): { min?: number; max?: number } {
  if (!value) return {};
  const [minRaw, maxRaw] = value.split("-");
  const min = minRaw ? Number(minRaw) : undefined;
  const max = maxRaw ? Number(maxRaw) : undefined;
  return { min, max };
}
