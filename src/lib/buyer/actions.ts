"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/auth";
import { computeReservationPricing } from "@/lib/checkout/pricing";
import type { Database, Fulfillment, WarrantyTier } from "@/lib/supabase/types";

type MessageRow = Database["public"]["Tables"]["messages"]["Row"];

// Mocked — there is no live second user session for the seller side of
// chat (data-model.md), so a buyer message gets a canned reply instead.
const SELLER_REPLIES = [
  "Hey, thanks for reaching out — yes, it's still available!",
  "Hi! Happy to answer questions or arrange a time to see it in person.",
  "Thanks for the interest — let me know if you'd like to book a test ride.",
  "Hello! The bike's in good shape, feel free to ask anything.",
];

export async function startConversation(bikeId: string) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/bikes/${bikeId}`);
  const supabase = await createClient();

  const { data: bike, error: bikeError } = await supabase
    .from("bikes")
    .select("id, listing_type")
    .eq("id", bikeId)
    .single();
  if (bikeError) throw bikeError;
  if (bike.listing_type !== "self") {
    throw new Error("Certified bikes are handled by Revélo directly — there's no seller to message.");
  }

  const { data: existing, error: findError } = await supabase
    .from("conversations")
    .select("id")
    .eq("bike_id", bikeId)
    .eq("buyer_id", user.id)
    .maybeSingle();
  if (findError) throw findError;

  let conversationId = existing?.id;
  if (!conversationId) {
    const { data: created, error: createError } = await supabase
      .from("conversations")
      .insert({ bike_id: bikeId, buyer_id: user.id })
      .select("id")
      .single();
    if (createError) throw createError;
    conversationId = created.id;
  }

  redirect(`/messages/${conversationId}`);
}

export async function sendMessage(conversationId: string, body: string): Promise<MessageRow> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const supabase = await createClient();

  const { data: conversation, error: convError } = await supabase
    .from("conversations")
    .select("bike_id")
    .eq("id", conversationId)
    .eq("buyer_id", user.id)
    .single();
  if (convError) throw convError;

  const { data: message, error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, sender_role: "buyer", body })
    .select("*")
    .single();
  if (error) throw error;

  const { data: bike } = await supabase
    .from("bikes")
    .select("seller_id, brand, model")
    .eq("id", conversation.bike_id)
    .single();
  if (bike) {
    await supabase.from("notifications").insert({
      recipient_role: "seller",
      recipient_id: bike.seller_id,
      type: "new_message",
      body: `New message about your ${bike.brand} ${bike.model}.`,
    });
  }

  revalidatePath(`/messages/${conversationId}`);
  revalidatePath("/seller/notifications");
  return message;
}

export async function seedSellerReply(conversationId: string): Promise<MessageRow> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const supabase = await createClient();

  const reply = SELLER_REPLIES[Math.floor(Math.random() * SELLER_REPLIES.length)];
  const { data: message, error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, sender_role: "seller_mock", body: reply })
    .select("*")
    .single();
  if (error) throw error;

  revalidatePath(`/messages/${conversationId}`);
  return message;
}

// ── Test-ride booking ────────────────────────────────────────────────────

export interface RequestTestRideResult {
  status: "pending" | "accepted";
}

export async function requestTestRide(
  bikeId: string,
  slotIso: string,
): Promise<RequestTestRideResult> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/bikes/${bikeId}`);
  const supabase = await createClient();

  const { data: bike, error: bikeError } = await supabase
    .from("bikes")
    .select("seller_id, listing_type, brand, model")
    .eq("id", bikeId)
    .single();
  if (bikeError) throw bikeError;

  // Self-listed still needs the seller to hold the bike and respond;
  // certified is confirmed immediately — Revélo already holds the bike.
  const status = bike.listing_type === "certified" ? "accepted" : "pending";

  const { error } = await supabase
    .from("test_rides")
    .insert({ bike_id: bikeId, buyer_id: user.id, requested_slot: slotIso, status });
  if (error) throw error;

  if (bike.listing_type === "self") {
    await supabase.from("notifications").insert({
      recipient_role: "seller",
      recipient_id: bike.seller_id,
      type: "test_ride_requested",
      body: `Test-ride request for your ${bike.brand} ${bike.model}.`,
    });
  }

  revalidatePath("/test-rides");
  revalidatePath(`/bikes/${bikeId}`);
  return { status };
}

// ── Checkout (certified-only) ────────────────────────────────────────────

export interface ReserveBikeInput {
  fulfillment: Fulfillment;
  warrantyTier: WarrantyTier;
  emiOpted: boolean;
}

export async function reserveBike(bikeId: string, input: ReserveBikeInput): Promise<never> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/checkout/${bikeId}`);
  const supabase = await createClient();

  const { data: bike, error: bikeError } = await supabase
    .from("bikes")
    .select("price, listing_type, status")
    .eq("id", bikeId)
    .single();
  if (bikeError) throw bikeError;
  if (bike.listing_type !== "certified") {
    throw new Error("Only certified bikes can be reserved through checkout.");
  }
  if (bike.status !== "live") {
    throw new Error("This bike is no longer available to reserve.");
  }

  const pricing = computeReservationPricing(bike.price, input.fulfillment, input.warrantyTier);

  // 0012_checkout_offer_fns.sql — bikes/reservations writes need this
  // SECURITY DEFINER function since a buyer is neither the seller_id nor
  // admin under RLS (0003), and the atomic status='live' guard inside it is
  // what actually prevents a double-booking race.
  const { data: reservationId, error } = await supabase.rpc("reserve_certified_bike", {
    p_bike_id: bikeId,
    p_fulfillment: input.fulfillment,
    p_warranty_tier: input.warrantyTier,
    p_buyer_protection_fee: pricing.buyerProtectionFee,
    p_delivery_fee: pricing.deliveryFee,
    p_total: pricing.total,
    p_reservation_amount: pricing.reservationAmount,
    p_emi_opted: input.emiOpted,
  });
  if (error) throw error;
  if (!reservationId) {
    throw new Error("This bike was just reserved by someone else.");
  }

  revalidatePath(`/bikes/${bikeId}`);
  revalidatePath("/");
  revalidatePath("/admin/inventory");
  // Server Actions implicitly refresh the invoking route's Server Components
  // on completion, which would otherwise clobber the wizard's own confirmed
  // state (the bike is no longer 'live', so re-rendering /checkout/[bikeId]
  // would show the "unavailable" fallback). Redirecting to a dedicated
  // confirmation route sidesteps that entirely — it reads the reservation
  // straight from the DB rather than trusting client state.
  redirect(`/checkout/${bikeId}/confirmed/${reservationId}`);
}

// ── Aging-stock offers (certified-only) ──────────────────────────────────

export async function submitOffer(bikeId: string, proposedPrice: number) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/bikes/${bikeId}`);
  const supabase = await createClient();

  const { data: bike, error: bikeError } = await supabase
    .from("bikes")
    .select("seller_id, brand, model, listing_type, status, certified_live_since")
    .eq("id", bikeId)
    .single();
  if (bikeError) throw bikeError;
  if (bike.listing_type !== "certified" || bike.status !== "live") {
    throw new Error("This bike isn't open for offers.");
  }

  const { error } = await supabase.from("offers").insert({
    bike_id: bikeId,
    buyer_id: user.id,
    proposed_price: proposedPrice,
    status: "pending",
  });
  if (error) throw error;

  await supabase.from("notifications").insert({
    recipient_role: "admin",
    recipient_id: null,
    type: "offer_submitted",
    body: `New offer of ₹${proposedPrice.toLocaleString("en-IN")} on ${bike.brand} ${bike.model}.`,
  });
  await supabase.from("notifications").insert({
    recipient_role: "seller",
    recipient_id: bike.seller_id,
    type: "offer_submitted",
    body: `A buyer offered ₹${proposedPrice.toLocaleString("en-IN")} on your ${bike.brand} ${bike.model}. Revélo is reviewing it.`,
  });

  revalidatePath(`/bikes/${bikeId}`);
  revalidatePath("/offers");
}

export async function acceptCounterOffer(offerId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/offers");
  const supabase = await createClient();

  const { data: reservationId, error } = await supabase.rpc("accept_offer", {
    p_offer_id: offerId,
  });
  if (error) throw error;
  if (!reservationId) {
    throw new Error("That offer is no longer available to accept.");
  }

  const { data: offer } = await supabase
    .from("offers")
    .select("bike_id")
    .eq("id", offerId)
    .single();
  if (offer) {
    const { data: bike } = await supabase
      .from("bikes")
      .select("seller_id, brand, model")
      .eq("id", offer.bike_id)
      .single();
    if (bike) {
      await supabase.from("notifications").insert({
        recipient_role: "seller",
        recipient_id: bike.seller_id,
        type: "offer_accepted",
        body: `The buyer accepted your counter on the ${bike.brand} ${bike.model} — it's reserved.`,
      });
    }
    revalidatePath(`/bikes/${offer.bike_id}`);
  }

  revalidatePath("/offers");
  revalidatePath("/");
}

export async function declineCounterOffer(offerId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/offers");
  const supabase = await createClient();

  const { data: offer, error: findError } = await supabase
    .from("offers")
    .select("bike_id")
    .eq("id", offerId)
    .single();
  if (findError) throw findError;

  const { data: declined, error } = await supabase.rpc("decline_offer", {
    p_offer_id: offerId,
  });
  if (error) throw error;
  if (!declined) throw new Error("That offer can no longer be declined.");

  const { data: bike } = await supabase
    .from("bikes")
    .select("seller_id, brand, model")
    .eq("id", offer.bike_id)
    .single();
  if (bike) {
    await supabase.from("notifications").insert({
      recipient_role: "seller",
      recipient_id: bike.seller_id,
      type: "offer_declined",
      body: `The buyer declined Revélo's counter-offer on your ${bike.brand} ${bike.model}.`,
    });
  }

  revalidatePath("/offers");
}
