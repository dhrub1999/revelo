"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireSeller } from "@/lib/seller/guard";
import { getComps } from "@/lib/comps";
import type { BikeType, ConditionNote } from "@/lib/supabase/types";

// ── Edit an existing listing ─────────────────────────────────────────────

export interface SellerBikeInput {
  id: string;
  brand: string;
  model: string;
  price: number;
  year: number;
  km: number;
  type: BikeType;
  frameSize: string;
  riderHeightRange: string;
  rangeKm: number | null;
  motorSpec: string;
  servicedNote: string;
  photos: string[];
  conditionNotes: string[];
  batteryTested: boolean;
  batteryPercent: number;
  batteryCycles: number;
}

export async function updateMyBike(
  input: SellerBikeInput,
): Promise<{ ok: true; showCertifyUpsell: boolean }> {
  const user = await requireSeller();
  const supabase = await createClient();

  const { data: bike, error: fetchError } = await supabase
    .from("bikes")
    .select("listing_type")
    .eq("id", input.id)
    .eq("seller_id", user.id)
    .single();
  if (fetchError) throw fetchError;

  const conditionNotes: ConditionNote[] = input.conditionNotes.map((text) => ({
    text,
    photo_ref: null,
  }));

  const { error } = await supabase
    .from("bikes")
    .update({
      brand: input.brand,
      model: input.model,
      price: input.price,
      year: input.year,
      km: input.km,
      type: input.type,
      frame_size: input.frameSize || null,
      rider_height_range: input.riderHeightRange || null,
      range_km: input.rangeKm,
      motor_spec: input.motorSpec || null,
      serviced_note: input.servicedNote || null,
      photos: input.photos,
      condition_notes: conditionNotes,
      battery_health: input.batteryTested
        ? {
            percent: input.batteryPercent,
            cycles: input.batteryCycles,
            tested_on: new Date().toISOString(),
          }
        : null,
    })
    .eq("id", input.id)
    .eq("seller_id", user.id);
  if (error) throw error;

  revalidatePath("/seller");
  return { ok: true, showCertifyUpsell: bike.listing_type === "self" };
}

export async function deleteMyBike(bikeId: string) {
  const user = await requireSeller();
  const supabase = await createClient();
  const { error } = await supabase
    .from("bikes")
    .delete()
    .eq("id", bikeId)
    .eq("seller_id", user.id);
  if (error) throw error;
  revalidatePath("/seller");
}

export async function markBikeSold(bikeId: string) {
  const user = await requireSeller();
  const supabase = await createClient();
  const { error } = await supabase
    .from("bikes")
    .update({ status: "sold" })
    .eq("id", bikeId)
    .eq("seller_id", user.id)
    .eq("listing_type", "self");
  if (error) throw error;
  revalidatePath("/seller");
  redirect("/seller");
}

// ── Opt an already-live self-listed bike into certification ─────────────

export async function requestCertification(bikeId: string, slotDate: string) {
  const user = await requireSeller();
  const supabase = await createClient();

  const { data: bike, error: bikeError } = await supabase
    .from("bikes")
    .select("*")
    .eq("id", bikeId)
    .eq("seller_id", user.id)
    .eq("listing_type", "self")
    .single();
  if (bikeError) throw bikeError;

  // service_slots writes are admin-only under RLS (0003_rls.sql); this
  // SECURITY DEFINER function (0010_book_inspection_slot_fn.sql) lets a
  // seller atomically claim exactly one slot, and only if one is free.
  const { data: booked, error: bookError } = await supabase.rpc("book_inspection_slot", {
    p_date: slotDate,
  });
  if (bookError) throw bookError;
  if (!booked) throw new Error("That slot just filled up — pick another.");

  const comp = getComps(bike.brand, bike.model);

  const { error: submissionError } = await supabase.from("sell_submissions").insert({
    seller_id: user.id,
    brand: bike.brand,
    model: bike.model,
    year: bike.year,
    km: bike.km,
    type: bike.type,
    chosen_path: "certify",
    estimated_range_low: comp?.low ?? null,
    estimated_range_high: comp?.high ?? null,
  });
  if (submissionError) throw submissionError;

  const { error: bikeUpdateError } = await supabase
    .from("bikes")
    .update({ pending_certification: true })
    .eq("id", bikeId)
    .eq("seller_id", user.id);
  if (bikeUpdateError) throw bikeUpdateError;

  // Mocked in-app notification (see data-model.md) — recipient_id is left
  // null since there's exactly one admin account and is_admin() already
  // bypasses the recipient_id check in RLS for that role.
  await supabase.from("notifications").insert({
    recipient_role: "admin",
    recipient_id: null,
    type: "certification_requested",
    body: `${bike.brand} ${bike.model} — seller requested certification, inspection booked for ${slotDate}.`,
  });

  revalidatePath("/seller");
  revalidatePath("/admin/consign");
}

// ── Test rides (self-listed bikes only) ──────────────────────────────────

export async function acceptTestRide(testRideId: string) {
  await requireSeller();
  const supabase = await createClient();
  const { error } = await supabase
    .from("test_rides")
    .update({ status: "accepted" })
    .eq("id", testRideId);
  if (error) throw error;
  revalidatePath("/seller/test-rides");
}

export async function rejectTestRide(
  testRideId: string,
  reason: string,
  alternativeDates: string[],
) {
  await requireSeller();
  const supabase = await createClient();
  const { error } = await supabase
    .from("test_rides")
    .update({
      status: "rejected",
      rejection_reason: reason,
      alternative_dates: alternativeDates.length ? alternativeDates : null,
    })
    .eq("id", testRideId);
  if (error) throw error;
  revalidatePath("/seller/test-rides");
}

export async function uploadMyBikePhoto(
  formData: FormData,
): Promise<{ url: string } | { error: string }> {
  const user = await requireSeller();
  const supabase = await createClient();

  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "No file provided." };

  const path = `${user.id}/${crypto.randomUUID()}-${file.name}`;
  const { error } = await supabase.storage.from("bike-photos").upload(path, file);
  if (error) return { error: error.message };

  const { data } = supabase.storage.from("bike-photos").getPublicUrl(path);
  return { url: data.publicUrl };
}

// ── Notifications ─────────────────────────────────────────────────────────

export async function markNotificationsRead() {
  const user = await requireSeller();
  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("recipient_id", user.id)
    .eq("read", false);
  if (error) throw error;
  revalidatePath("/seller/notifications");
}
