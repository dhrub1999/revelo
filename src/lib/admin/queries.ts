import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type Client = SupabaseClient<Database>;
export type BikeRow = Database["public"]["Tables"]["bikes"]["Row"];
export type SubmissionRow = Database["public"]["Tables"]["sell_submissions"]["Row"];
export type CertificationRow = Database["public"]["Tables"]["certifications"]["Row"];

const DRAFT_STATUSES: BikeRow["status"][] = ["in_workshop", "photographed"];
const SOLD_STATUSES: BikeRow["status"][] = ["sold", "delivered", "paid_out"];

export type InventoryStatusFilter = "" | "live" | "draft" | "reserved" | "sold";

export async function listInventory(
  supabase: Client,
  { q, status }: { q: string; status: InventoryStatusFilter },
): Promise<{ bikes: BikeRow[]; liveCount: number; draftCount: number }> {
  let query = supabase.from("bikes").select("*").order("created_at", { ascending: false });

  if (q.trim()) {
    const term = q.trim().replace(/[%,]/g, "");
    query = query.or(`brand.ilike.%${term}%,model.ilike.%${term}%`);
  }
  if (status === "live") query = query.eq("status", "live");
  else if (status === "draft") query = query.in("status", DRAFT_STATUSES);
  else if (status === "reserved") query = query.eq("status", "reserved");
  else if (status === "sold") query = query.in("status", SOLD_STATUSES);

  const { data, error } = await query;
  if (error) throw error;
  const bikes = data ?? [];

  const [{ count: liveCount }, { count: draftCount }] = await Promise.all([
    supabase.from("bikes").select("*", { count: "exact", head: true }).eq("status", "live"),
    supabase
      .from("bikes")
      .select("*", { count: "exact", head: true })
      .in("status", DRAFT_STATUSES),
  ]);

  return { bikes, liveCount: liveCount ?? 0, draftCount: draftCount ?? 0 };
}

export async function getBikeByIdAdmin(
  supabase: Client,
  id: string,
): Promise<BikeRow | null> {
  const { data, error } = await supabase.from("bikes").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export interface ModerationQueue {
  rows: SubmissionRow[];
  pendingCount: number;
  flaggedCount: number;
  liveCount: number;
  autoApprovedRate: number | null;
  /** Total submissions ever filed by each seller in the queue — used to give
   *  the "repeat seller" check a real number instead of just a boolean. */
  sellerListingCounts: Map<string, number>;
}

export async function listModerationQueue(supabase: Client): Promise<ModerationQueue> {
  const [{ data: rows, error }, counts, liveCount, history] = await Promise.all([
    supabase
      .from("sell_submissions")
      .select("*")
      .eq("chosen_path", "self")
      .in("status", ["pending", "flagged"])
      .order("created_at", { ascending: true }),
    supabase
      .from("sell_submissions")
      .select("status")
      .eq("chosen_path", "self")
      .in("status", ["pending", "flagged"]),
    supabase
      .from("bikes")
      .select("*", { count: "exact", head: true })
      .eq("listing_type", "self")
      .eq("status", "live"),
    supabase.from("sell_submissions").select("status").eq("chosen_path", "self").in("status", [
      "approved",
      "rejected",
    ]),
  ]);

  if (error) throw error;

  const pendingCount = (counts.data ?? []).filter((r) => r.status === "pending").length;
  const flaggedCount = (counts.data ?? []).filter((r) => r.status === "flagged").length;

  const historyRows = history.data ?? [];
  const approved = historyRows.filter((r) => r.status === "approved").length;
  const autoApprovedRate =
    historyRows.length > 0 ? Math.round((approved / historyRows.length) * 100) : null;

  const sellerIds = Array.from(new Set((rows ?? []).map((r) => r.seller_id)));
  const sellerListingCounts = new Map<string, number>();
  if (sellerIds.length > 0) {
    const { data: allSellerSubmissions } = await supabase
      .from("sell_submissions")
      .select("seller_id")
      .in("seller_id", sellerIds);
    for (const row of allSellerSubmissions ?? []) {
      sellerListingCounts.set(row.seller_id, (sellerListingCounts.get(row.seller_id) ?? 0) + 1);
    }
  }

  return {
    rows: rows ?? [],
    pendingCount,
    flaggedCount,
    liveCount: liveCount.count ?? 0,
    autoApprovedRate,
    sellerListingCounts,
  };
}

export interface ConsignQueueBike {
  bike: BikeRow;
  submission: SubmissionRow | null;
  certification: CertificationRow | null;
}

export interface ConsignQueue {
  notStarted: SubmissionRow[];
  inProgress: ConsignQueueBike[];
}

export async function listConsignQueue(supabase: Client): Promise<ConsignQueue> {
  const [{ data: pendingSubmissions, error: subError }, { data: bikes, error: bikeError }] =
    await Promise.all([
      supabase
        .from("sell_submissions")
        .select("*")
        .eq("chosen_path", "certify")
        .eq("status", "pending")
        .order("created_at", { ascending: true }),
      supabase
        .from("bikes")
        .select("*")
        .eq("listing_type", "certified")
        .in("status", DRAFT_STATUSES)
        .order("created_at", { ascending: false }),
    ]);

  if (subError) throw subError;
  if (bikeError) throw bikeError;

  const bikeList = bikes ?? [];
  const submissionIds = bikeList
    .map((b) => b.source_submission_id)
    .filter((id): id is string => !!id);

  const [{ data: submissions }, { data: certifications }] = await Promise.all([
    submissionIds.length
      ? supabase.from("sell_submissions").select("*").in("id", submissionIds)
      : Promise.resolve({ data: [] as SubmissionRow[] }),
    supabase
      .from("certifications")
      .select("*")
      .in(
        "bike_id",
        bikeList.map((b) => b.id),
      ),
  ]);

  const submissionsById = new Map((submissions ?? []).map((s) => [s.id, s]));
  const certificationsByBike = new Map((certifications ?? []).map((c) => [c.bike_id, c]));

  const inProgress: ConsignQueueBike[] = bikeList.map((bike) => ({
    bike,
    submission: bike.source_submission_id
      ? (submissionsById.get(bike.source_submission_id) ?? null)
      : null,
    certification: certificationsByBike.get(bike.id) ?? null,
  }));

  return { notStarted: pendingSubmissions ?? [], inProgress };
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

  return new Map((data ?? []).map((p) => [p.id, p.display_name ?? "Seller"]));
}

export async function getCertificationByBikeId(
  supabase: Client,
  bikeId: string,
): Promise<CertificationRow | null> {
  const { data, error } = await supabase
    .from("certifications")
    .select("*")
    .eq("bike_id", bikeId)
    .maybeSingle();
  if (error) throw error;
  return data;
}
