"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/guard";
import {
  COMPS_SAMPLE_SIZE,
  COMPS_WINDOW_DAYS,
  STANDARD_INSPECTION_POINTS,
  computeCertifiedPayout,
} from "@/lib/admin/pricing";
import type { BikeType, ConditionNote } from "@/lib/supabase/types";

const PLACEHOLDER_PHOTO = "https://picsum.photos/seed/revelo-untitled/800/600";

async function notifySeller(
  supabase: Awaited<ReturnType<typeof createClient>>,
  sellerId: string,
  type: string,
  body: string,
) {
  await supabase
    .from("notifications")
    .insert({ recipient_role: "seller", recipient_id: sellerId, type, body });
}

// ── Moderation queue (self-listed submissions) ──────────────────────────

export async function approveSubmission(submissionId: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { data: submission, error } = await supabase
    .from("sell_submissions")
    .select("*")
    .eq("id", submissionId)
    .single();
  if (error) throw error;

  const { error: insertError } = await supabase.from("bikes").insert({
    seller_id: submission.seller_id,
    source_submission_id: submission.id,
    brand: submission.brand,
    model: submission.model,
    year: submission.year,
    km: submission.km,
    type: submission.type,
    price: submission.asking_price ?? 0,
    listing_type: "self",
    photos:
      submission.seller_photos && submission.seller_photos.length > 0
        ? submission.seller_photos
        : [PLACEHOLDER_PHOTO],
    status: "live",
  });
  if (insertError) throw insertError;

  const { error: updateError } = await supabase
    .from("sell_submissions")
    .update({ status: "approved" })
    .eq("id", submissionId);
  if (updateError) throw updateError;

  await notifySeller(
    supabase,
    submission.seller_id,
    "listing_approved",
    `Your ${submission.brand} ${submission.model} is live on Revélo.`,
  );

  revalidatePath("/admin/moderation");
  revalidatePath("/admin/inventory");
}

export async function rejectSubmission(submissionId: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { data: submission, error } = await supabase
    .from("sell_submissions")
    .update({ status: "rejected" })
    .eq("id", submissionId)
    .select("*")
    .single();
  if (error) throw error;

  await notifySeller(
    supabase,
    submission.seller_id,
    "listing_rejected",
    `Your ${submission.brand} ${submission.model} listing wasn't approved. Contact support for details.`,
  );

  revalidatePath("/admin/moderation");
}

export async function askSellerAboutSubmission(submissionId: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { data: submission, error } = await supabase
    .from("sell_submissions")
    .select("*")
    .eq("id", submissionId)
    .single();
  if (error) throw error;

  await notifySeller(
    supabase,
    submission.seller_id,
    "moderation_question",
    `We have a question about your ${submission.brand} ${submission.model} listing. Please check your submission details.`,
  );

  revalidatePath("/admin/moderation");
}

export async function flagForDealerReview(submissionId: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("sell_submissions")
    .update({ status: "flagged" })
    .eq("id", submissionId);
  if (error) throw error;

  revalidatePath("/admin/moderation");
}

export async function suggestPrice(submissionId: string, suggestedPrice: number) {
  await requireAdmin();
  const supabase = await createClient();

  const { data: submission, error } = await supabase
    .from("sell_submissions")
    .select("*")
    .eq("id", submissionId)
    .single();
  if (error) throw error;

  await notifySeller(
    supabase,
    submission.seller_id,
    "price_suggestion",
    `We'd suggest listing your ${submission.brand} ${submission.model} closer to ₹${suggestedPrice.toLocaleString("en-IN")} based on recent sales.`,
  );

  revalidatePath("/admin/moderation");
}

// ── Consignment worksheet (certified submissions) ────────────────────────

export async function startWorksheet(submissionId: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { data: submission, error } = await supabase
    .from("sell_submissions")
    .select("*")
    .eq("id", submissionId)
    .single();
  if (error) throw error;

  const low = submission.estimated_range_low ?? submission.asking_price ?? 20000;
  const high = submission.estimated_range_high ?? low * 1.15;
  const listPrice = Math.round((low + high) / 2 / 100) * 100;

  const { data: bike, error: bikeError } = await supabase
    .from("bikes")
    .insert({
      seller_id: submission.seller_id,
      source_submission_id: submission.id,
      brand: submission.brand,
      model: submission.model,
      year: submission.year,
      km: submission.km,
      type: submission.type,
      price: listPrice,
      listing_type: "certified",
      // certify-path submissions never collect photos (that's the whole
      // point — Revélo shoots them during the worksheet) — placeholder
      // until real studio shots are added via the worksheet/edit screen.
      photos:
        submission.seller_photos && submission.seller_photos.length > 0
          ? submission.seller_photos
          : [PLACEHOLDER_PHOTO],
      status: "in_workshop",
    })
    .select("id")
    .single();
  if (bikeError) throw bikeError;

  const payout = computeCertifiedPayout({
    listPrice,
    repairCost: 0,
    sellerApproved: false,
  });

  const { error: certError } = await supabase.from("certifications").insert({
    bike_id: bike.id,
    submission_id: submission.id,
    points_passed: STANDARD_INSPECTION_POINTS,
    points_total: STANDARD_INSPECTION_POINTS,
    findings: [],
    repair_cost: 0,
    seller_approved: false,
    comps_range_low: low,
    comps_range_high: high,
    comps_sample_size: COMPS_SAMPLE_SIZE,
    comps_days: COMPS_WINDOW_DAYS,
    list_price: listPrice,
    commission_amount: payout.commissionAmount,
    repair_deduction: payout.repairDeduction,
    inspection_fee_waived: true,
    seller_payout: payout.sellerPayout,
  });
  if (certError) throw certError;

  const { error: updateError } = await supabase
    .from("sell_submissions")
    .update({ status: "approved" })
    .eq("id", submissionId);
  if (updateError) throw updateError;

  revalidatePath("/admin/consign");
  redirect(`/admin/consign/${bike.id}`);
}

export interface CertificationInput {
  certificationId: string;
  bikeId: string;
  pointsPassed: number;
  pointsTotal: number;
  findings: string[];
  repairCost: number;
  sellerApproved: boolean;
  listPrice: number;
}

async function saveCertificationRow(input: CertificationInput) {
  const supabase = await createClient();
  const payout = computeCertifiedPayout({
    listPrice: input.listPrice,
    repairCost: input.repairCost,
    sellerApproved: input.sellerApproved,
  });

  const findings: ConditionNote[] = input.findings.map((text) => ({
    text,
    photo_ref: null,
  }));

  const { error } = await supabase
    .from("certifications")
    .update({
      points_passed: input.pointsPassed,
      points_total: input.pointsTotal,
      findings,
      repair_cost: input.repairCost,
      seller_approved: input.sellerApproved,
      list_price: input.listPrice,
      commission_amount: payout.commissionAmount,
      repair_deduction: payout.repairDeduction,
      seller_payout: payout.sellerPayout,
    })
    .eq("id", input.certificationId);
  if (error) throw error;

  const { error: priceError } = await supabase
    .from("bikes")
    .update({ price: input.listPrice })
    .eq("id", input.bikeId);
  if (priceError) throw priceError;

  return supabase;
}

export async function saveCertificationDraft(input: CertificationInput) {
  await requireAdmin();
  await saveCertificationRow(input);
  revalidatePath(`/admin/consign/${input.bikeId}`);
}

export async function sendCertificationToSeller(input: CertificationInput) {
  await requireAdmin();
  const supabase = await saveCertificationRow(input);

  const { data: bike, error } = await supabase
    .from("bikes")
    .select("seller_id, brand, model")
    .eq("id", input.bikeId)
    .single();
  if (error) throw error;

  await notifySeller(
    supabase,
    bike.seller_id,
    "consignment_update",
    `Updated payout breakdown for your ${bike.brand} ${bike.model}. Please review and approve any repairs.`,
  );

  revalidatePath(`/admin/consign/${input.bikeId}`);
}

export async function publishCertified(input: CertificationInput) {
  await requireAdmin();
  const supabase = await saveCertificationRow(input);

  const { error } = await supabase
    .from("bikes")
    .update({ status: "live", certified_live_since: new Date().toISOString() })
    .eq("id", input.bikeId);
  if (error) throw error;

  revalidatePath("/admin/consign");
  revalidatePath("/admin/inventory");
  redirect("/admin/consign");
}

// ── Inventory (add / edit / delete any bike) ─────────────────────────────

export interface BikeFormInput {
  id?: string;
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

export async function upsertBike(input: BikeFormInput) {
  const admin = await requireAdmin();
  const supabase = await createClient();

  const conditionNotes: ConditionNote[] = input.conditionNotes.map((text) => ({
    text,
    photo_ref: null,
  }));

  const payload = {
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
  };

  if (input.id) {
    const { error } = await supabase.from("bikes").update(payload).eq("id", input.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("bikes").insert({
      ...payload,
      seller_id: admin.id,
      listing_type: "self",
      status: "live",
    });
    if (error) throw error;
  }

  revalidatePath("/admin/inventory");
  redirect("/admin/inventory");
}

export async function markBikeSold(bikeId: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("bikes").update({ status: "sold" }).eq("id", bikeId);
  if (error) throw error;
  revalidatePath("/admin/inventory");
  redirect("/admin/inventory");
}

export async function deleteBike(bikeId: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("bikes").delete().eq("id", bikeId);
  if (error) throw error;
  revalidatePath("/admin/inventory");
}

// ── Aging-stock offers (certified-only, P5) ──────────────────────────────

async function notifySellerOfOffer(
  supabase: Awaited<ReturnType<typeof createClient>>,
  offerId: string,
  type: string,
  bodyFor: (brand: string, model: string) => string,
) {
  const { data: offer, error } = await supabase
    .from("offers")
    .select("bike_id")
    .eq("id", offerId)
    .single();
  if (error) throw error;

  const { data: bike, error: bikeError } = await supabase
    .from("bikes")
    .select("seller_id, brand, model")
    .eq("id", offer.bike_id)
    .single();
  if (bikeError) throw bikeError;

  await notifySeller(supabase, bike.seller_id, type, bodyFor(bike.brand, bike.model));
  return offer.bike_id;
}

export async function acceptOffer(offerId: string) {
  await requireAdmin();
  const supabase = await createClient();

  // 0012_checkout_offer_fns.sql — creates the reservations row directly
  // (pickup/included defaults, no wizard session) and flips the bike to
  // 'reserved', per P5-certified-commerce.md.
  const { data: reservationId, error } = await supabase.rpc("accept_offer", {
    p_offer_id: offerId,
  });
  if (error) throw error;
  if (!reservationId) throw new Error("That offer can no longer be accepted.");

  const bikeId = await notifySellerOfOffer(
    supabase,
    offerId,
    "offer_accepted",
    (brand, model) => `Revélo accepted an offer on your ${brand} ${model} — it's reserved.`,
  );

  revalidatePath("/admin/offers");
  revalidatePath("/admin/inventory");
  revalidatePath(`/bikes/${bikeId}`);
  revalidatePath("/");
}

export async function counterOffer(offerId: string, counterPrice: number) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("offers")
    .update({ status: "countered", counter_price: counterPrice })
    .eq("id", offerId)
    .in("status", ["pending", "countered"]);
  if (error) throw error;

  await notifySellerOfOffer(
    supabase,
    offerId,
    "offer_countered",
    (brand, model) =>
      `Revélo countered a buyer's offer on your ${brand} ${model} at ₹${counterPrice.toLocaleString("en-IN")}.`,
  );

  revalidatePath("/admin/offers");
}

export async function rejectOffer(offerId: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("offers")
    .update({ status: "rejected" })
    .eq("id", offerId)
    .in("status", ["pending", "countered"]);
  if (error) throw error;

  await notifySellerOfOffer(
    supabase,
    offerId,
    "offer_rejected",
    (brand, model) => `Revélo declined a buyer's offer on your ${brand} ${model}.`,
  );

  revalidatePath("/admin/offers");
}

// ── Photo upload ──────────────────────────────────────────────────────────

export async function uploadBikePhoto(
  formData: FormData,
): Promise<{ url: string } | { error: string }> {
  await requireAdmin();
  const supabase = await createClient();

  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "No file provided." };

  const path = `admin/${crypto.randomUUID()}-${file.name}`;
  const { error } = await supabase.storage.from("bike-photos").upload(path, file);
  if (error) return { error: error.message };

  const { data } = supabase.storage.from("bike-photos").getPublicUrl(path);
  return { url: data.publicUrl };
}
