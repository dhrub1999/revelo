"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Fulfillment } from "@/lib/supabase/types";

export interface ServiceBookingInput {
  bikeBrandModel: string;
  issueCategory: string;
  fulfillment: Fulfillment;
  phone: string;
}

export interface ServiceBookingResult {
  slotDate: string | null;
}

export async function requestServiceBooking(
  input: ServiceBookingInput,
): Promise<ServiceBookingResult> {
  const bikeBrandModel = input.bikeBrandModel.trim();
  const phone = input.phone.trim();
  if (!bikeBrandModel || !phone) {
    throw new Error("Bike and phone are required.");
  }

  const supabase = await createClient();

  // 0013_service_booking_fn.sql — no login in this phase (data-model.md), so
  // this runs as `anon`; the RPC claims the real next-available slot
  // atomically rather than trusting a date picked on the client.
  const { data: claimedDate, error: slotError } = await supabase.rpc(
    "book_next_service_slot",
  );
  if (slotError) throw slotError;

  // Mock booking system — if every seeded slot is exhausted, still take the
  // request rather than blocking it; the workshop follows up by phone either
  // way, and there's no real capacity being oversold here.
  const slotDate = claimedDate ?? new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);

  const { error } = await supabase.from("service_bookings").insert({
    bike_brand_model: bikeBrandModel,
    issue_category: input.issueCategory,
    fulfillment: input.fulfillment,
    phone,
    slot_date: slotDate,
    status: "pending",
  });
  if (error) throw error;

  revalidatePath("/service");
  revalidatePath("/service/book");

  return { slotDate: claimedDate };
}
