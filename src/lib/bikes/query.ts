import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, BikeType } from "@/lib/supabase/types";
import { DEFAULT_FILTERS, parseRange, type BikeFilters } from "./types";

type Client = SupabaseClient<Database>;
export type BikeRow = Database["public"]["Tables"]["bikes"]["Row"];

// Certified bikes in 'in_workshop' / 'photographed' are still being
// processed by admin (P2) and are not public inventory yet.
const PUBLIC_STATUSES: BikeRow["status"][] = [
  "live",
  "reserved",
  "sold",
  "delivered",
  "paid_out",
];

export function searchParamsToFilters(
  sp: URLSearchParams | Record<string, string | string[] | undefined>,
): BikeFilters {
  const get = (key: string): string => {
    if (sp instanceof URLSearchParams) return sp.get(key) ?? "";
    const value = sp[key];
    return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
  };

  const year = get("year");
  const battery = get("battery");

  return {
    q: get("q"),
    brand: get("brand"),
    type: (get("type") as BikeType | "") || "",
    year: year ? Number(year) : null,
    priceRange: get("price"),
    kmRange: get("km"),
    batteryMin: battery ? Number(battery) : null,
    certifiedOnly: get("certified") === "1",
    sort: (get("sort") as BikeFilters["sort"]) || DEFAULT_FILTERS.sort,
  };
}

export function filtersToSearchParams(filters: BikeFilters): URLSearchParams {
  const sp = new URLSearchParams();
  if (filters.q) sp.set("q", filters.q);
  if (filters.brand) sp.set("brand", filters.brand);
  if (filters.type) sp.set("type", filters.type);
  if (filters.year) sp.set("year", String(filters.year));
  if (filters.priceRange) sp.set("price", filters.priceRange);
  if (filters.kmRange) sp.set("km", filters.kmRange);
  if (filters.batteryMin) sp.set("battery", String(filters.batteryMin));
  if (filters.certifiedOnly) sp.set("certified", "1");
  if (filters.sort !== DEFAULT_FILTERS.sort) sp.set("sort", filters.sort);
  return sp;
}

// Supabase's filter-builder generics don't compose well across function
// boundaries, so this shared logic is intentionally loosely typed — every
// caller passes it a fresh `.from("bikes").select(...)` builder and awaits
// the result, so misuse would fail immediately at the call site.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyFilters(query: any, filters: BikeFilters) {
  let q = query.in("status", PUBLIC_STATUSES);

  if (filters.q.trim()) {
    const term = filters.q.trim().replace(/[%,]/g, "");
    q = q.or(
      `brand.ilike.%${term}%,model.ilike.%${term}%,type.ilike.%${term}%`,
    );
  }
  if (filters.brand) q = q.eq("brand", filters.brand);
  if (filters.type) q = q.eq("type", filters.type);
  if (filters.year) q = q.eq("year", filters.year);
  if (filters.certifiedOnly) q = q.eq("listing_type", "certified");

  const price = parseRange(filters.priceRange);
  if (price.min !== undefined) q = q.gte("price", price.min);
  if (price.max !== undefined) q = q.lte("price", price.max);

  const km = parseRange(filters.kmRange);
  if (km.min !== undefined) q = q.gte("km", km.min);
  if (km.max !== undefined) q = q.lte("km", km.max);

  // Tested battery health only — untested bikes are excluded, never
  // treated as 0% or 100%, per data-model.md.
  if (filters.batteryMin) q = q.gte("battery_percent", filters.batteryMin);

  return q;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applySort(query: any, sort: BikeFilters["sort"]) {
  switch (sort) {
    case "price_asc":
      return query.order("price", { ascending: true });
    case "price_desc":
      return query.order("price", { ascending: false });
    case "battery_desc":
      return query.order("battery_percent", {
        ascending: false,
        nullsFirst: false,
      });
    case "new":
    default:
      return query.order("created_at", { ascending: false });
  }
}

export interface ListBikesResult {
  bikes: BikeRow[];
  total: number;
}

export async function listBikes(
  supabase: Client,
  filters: BikeFilters,
  range: { offset: number; limit: number },
): Promise<ListBikesResult> {
  const base = supabase.from("bikes").select("*", { count: "exact" });
  const filtered = applySort(applyFilters(base, filters), filters.sort);

  const { data, error, count } = await filtered.range(
    range.offset,
    range.offset + range.limit - 1,
  );

  if (error) throw error;

  return { bikes: (data as BikeRow[]) ?? [], total: count ?? 0 };
}

export async function getMarketplaceTotalCount(
  supabase: Client,
): Promise<number> {
  const { count, error } = await supabase
    .from("bikes")
    .select("*", { count: "exact", head: true })
    .in("status", PUBLIC_STATUSES);

  if (error) throw error;
  return count ?? 0;
}

export async function getFilterOptions(
  supabase: Client,
): Promise<{ brands: string[]; years: number[] }> {
  const { data, error } = await supabase
    .from("bikes")
    .select("brand, year")
    .in("status", PUBLIC_STATUSES);

  if (error) throw error;

  const brands = Array.from(new Set((data ?? []).map((b) => b.brand))).sort();
  const years = Array.from(new Set((data ?? []).map((b) => b.year))).sort(
    (a, b) => b - a,
  );

  return { brands, years };
}

export async function getBikeById(
  supabase: Client,
  id: string,
): Promise<BikeRow | null> {
  const { data, error } = await supabase
    .from("bikes")
    .select("*")
    .eq("id", id)
    .in("status", PUBLIC_STATUSES)
    .maybeSingle();

  if (error) throw error;
  return data;
}
