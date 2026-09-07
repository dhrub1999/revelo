import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type Client = SupabaseClient<Database>;
export type BikeRow = Database["public"]["Tables"]["bikes"]["Row"];
export type SubmissionRow = Database["public"]["Tables"]["sell_submissions"]["Row"];
export type TestRideRow = Database["public"]["Tables"]["test_rides"]["Row"];
export type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"];
export type ServiceSlotRow = Database["public"]["Tables"]["service_slots"]["Row"];

export async function listMyBikes(supabase: Client, sellerId: string): Promise<BikeRow[]> {
  const { data, error } = await supabase
    .from("bikes")
    .select("*")
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** Submissions not yet live — the seller's own view of the P2 queues. */
export async function listMyPendingSubmissions(
  supabase: Client,
  sellerId: string,
): Promise<SubmissionRow[]> {
  const { data, error } = await supabase
    .from("sell_submissions")
    .select("*")
    .eq("seller_id", sellerId)
    .in("status", ["pending", "flagged", "rejected"])
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function listMyNotifications(
  supabase: Client,
  sellerId: string,
): Promise<NotificationRow[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("recipient_id", sellerId)
    .eq("recipient_role", "seller")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data ?? [];
}

export interface MyTestRide {
  testRide: TestRideRow;
  bike: BikeRow;
  buyerName: string;
}

/** Self-listed bikes only — certified test rides don't need seller input (see P4). */
export async function listMyTestRides(supabase: Client, sellerId: string): Promise<MyTestRide[]> {
  const { data: bikes, error: bikesError } = await supabase
    .from("bikes")
    .select("*")
    .eq("seller_id", sellerId)
    .eq("listing_type", "self");
  if (bikesError) throw bikesError;

  const bikeIds = (bikes ?? []).map((b) => b.id);
  if (bikeIds.length === 0) return [];

  const { data: rides, error: ridesError } = await supabase
    .from("test_rides")
    .select("*")
    .in("bike_id", bikeIds)
    .order("requested_slot", { ascending: true });
  if (ridesError) throw ridesError;

  const bikesById = new Map((bikes ?? []).map((b) => [b.id, b]));
  const buyerIds = Array.from(new Set((rides ?? []).map((r) => r.buyer_id)));
  const names = await getDisplayNames(supabase, buyerIds);

  return (rides ?? []).flatMap((testRide) => {
    const bike = bikesById.get(testRide.bike_id);
    if (!bike) return [];
    return [{ testRide, bike, buyerName: names.get(testRide.buyer_id) ?? "Buyer" }];
  });
}

export async function getDisplayNames(
  supabase: Client,
  ids: string[],
): Promise<Map<string, string>> {
  const uniqueIds = Array.from(new Set(ids));
  if (uniqueIds.length === 0) return new Map();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name")
    .in("id", uniqueIds);
  if (error) throw error;

  return new Map((data ?? []).map((p) => [p.id, p.display_name ?? "Buyer"]));
}

export async function getMyBikeById(
  supabase: Client,
  sellerId: string,
  bikeId: string,
): Promise<BikeRow | null> {
  const { data, error } = await supabase
    .from("bikes")
    .select("*")
    .eq("id", bikeId)
    .eq("seller_id", sellerId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function listInspectionSlots(supabase: Client): Promise<ServiceSlotRow[]> {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("service_slots")
    .select("*")
    .gt("slots_available", 0)
    .gte("date", today)
    .order("date", { ascending: true });
  if (error) throw error;
  return data ?? [];
}
